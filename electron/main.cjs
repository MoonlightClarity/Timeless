const { app, BrowserWindow, dialog, shell, utilityProcess } = require('electron')
const fs = require('fs')
const http = require('http')
const net = require('net')
const path = require('path')

const APP_HOST = '127.0.0.1'
const APP_PORT = 5174
const METADATA_HOST = '127.0.0.1'
const METADATA_PORT = 1969

let mainWindow = null
let appServer = null
let metadataProcess = null

function isPortOpen(host, port, timeoutMs = 250) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host, port })
    let settled = false

    const finish = (open) => {
      if (settled) return
      settled = true
      socket.destroy()
      resolve(open)
    }

    socket.setTimeout(timeoutMs)
    socket.once('connect', () => finish(true))
    socket.once('timeout', () => finish(false))
    socket.once('error', () => finish(false))
  })
}

async function waitForPort(host, port, attempts = 150, delayMs = 200) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    if (await isPortOpen(host, port)) return true
    await new Promise((resolve) => setTimeout(resolve, delayMs))
  }
  return false
}

function translationRoot() {
  return app.isPackaged
    ? path.join(process.resourcesPath, 'translation-server')
    : path.join(__dirname, '..', 'vendor', 'translation-server')
}

async function startMetadataService() {
  if (await isPortOpen(METADATA_HOST, METADATA_PORT)) return

  const root = translationRoot()
  const serverScript = path.join(root, 'src', 'server.js')

  if (!fs.existsSync(serverScript)) {
    throw new Error(`Bundled metadata service is missing: ${serverScript}`)
  }

  metadataProcess = utilityProcess.fork(serverScript, [], {
    cwd: root,
    env: {
      ...process.env,
      NODE_ENV: 'production',
    },
    stdio: 'ignore',
    serviceName: 'Timeless Metadata',
  })

  metadataProcess.once('exit', () => {
    metadataProcess = null
  })

  if (!(await waitForPort(METADATA_HOST, METADATA_PORT))) {
    if (metadataProcess) metadataProcess.kill()
    throw new Error('Metadata translation service did not start.')
  }
}

function mimeType(filePath) {
  switch (path.extname(filePath).toLowerCase()) {
    case '.html': return 'text/html; charset=utf-8'
    case '.js': return 'text/javascript; charset=utf-8'
    case '.css': return 'text/css; charset=utf-8'
    case '.json': return 'application/json; charset=utf-8'
    case '.svg': return 'image/svg+xml'
    case '.png': return 'image/png'
    case '.ico': return 'image/x-icon'
    case '.webmanifest': return 'application/manifest+json'
    case '.woff': return 'font/woff'
    case '.woff2': return 'font/woff2'
    default: return 'application/octet-stream'
  }
}

function proxyMetadata(req, res, requestUrl) {
  const upstreamPath = requestUrl.pathname.replace(/^\/metadata-translate/, '') || '/'
  const headers = {
    ...req.headers,
    host: `${METADATA_HOST}:${METADATA_PORT}`,
    origin: `http://${APP_HOST}:${APP_PORT}`,
  }

  const proxy = http.request({
    hostname: METADATA_HOST,
    port: METADATA_PORT,
    method: req.method,
    path: upstreamPath + requestUrl.search,
    headers,
  }, (upstream) => {
    res.writeHead(upstream.statusCode || 502, upstream.headers)
    upstream.pipe(res)
  })

  proxy.on('error', () => {
    if (!res.headersSent) {
      res.writeHead(502, { 'Content-Type': 'text/plain; charset=utf-8' })
    }
    res.end('Metadata service unavailable.')
  })

  req.pipe(proxy)
}

function startAppServer() {
  const distRoot = path.resolve(__dirname, '..', 'dist')

  if (!fs.existsSync(path.join(distRoot, 'index.html'))) {
    throw new Error('Production UI bundle is missing.')
  }

  return new Promise((resolve, reject) => {
    appServer = http.createServer((req, res) => {
      const requestUrl = new URL(req.url || '/', `http://${APP_HOST}:${APP_PORT}`)

      if (requestUrl.pathname.startsWith('/metadata-translate')) {
        proxyMetadata(req, res, requestUrl)
        return
      }

      let relativePath
      try {
        relativePath = decodeURIComponent(requestUrl.pathname).replace(/^\/+/, '')
      } catch {
        res.writeHead(400)
        res.end('Bad request')
        return
      }

      if (!relativePath) relativePath = 'index.html'

      let filePath = path.resolve(distRoot, relativePath)
      if (!filePath.startsWith(distRoot + path.sep) && filePath !== distRoot) {
        res.writeHead(403)
        res.end('Forbidden')
        return
      }

      if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        filePath = path.join(distRoot, 'index.html')
      }

      fs.readFile(filePath, (error, content) => {
        if (error) {
          res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' })
          res.end('Could not load Timeless.')
          return
        }

        res.writeHead(200, {
          'Content-Type': mimeType(filePath),
          'Cache-Control': filePath.endsWith('index.html')
            ? 'no-cache'
            : 'public, max-age=31536000, immutable',
        })
        res.end(content)
      })
    })

    appServer.once('error', reject)
    appServer.listen(APP_PORT, APP_HOST, () => resolve())
  })
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 960,
    minHeight: 640,
    show: false,
    backgroundColor: '#f5f5f5',
    icon: path.join(__dirname, '..', 'public', 'icon-512.png'),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  })

  const appUrl = `http://${APP_HOST}:${APP_PORT}`

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (!url.startsWith(appUrl)) void shell.openExternal(url)
    return { action: 'deny' }
  })

  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith(appUrl)) {
      event.preventDefault()
      void shell.openExternal(url)
    }
  })

  mainWindow.once('ready-to-show', () => mainWindow.show())
  void mainWindow.loadURL(appUrl)
}

function cleanup() {
  if (appServer) {
    appServer.close()
    appServer = null
  }
  if (metadataProcess) {
    metadataProcess.kill()
    metadataProcess = null
  }
}

const hasLock = app.requestSingleInstanceLock()

if (!hasLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    if (!mainWindow) return
    if (mainWindow.isMinimized()) mainWindow.restore()
    mainWindow.focus()
  })

  app.whenReady().then(async () => {
    try {
      await startMetadataService()
      await startAppServer()
      createWindow()
    } catch (error) {
      dialog.showErrorBox(
        'Timeless could not start',
        error instanceof Error ? error.message : String(error),
      )
      cleanup()
      app.quit()
    }
  })

  app.on('before-quit', cleanup)

  app.on('window-all-closed', () => {
    app.quit()
  })
}
