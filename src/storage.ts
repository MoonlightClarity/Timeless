const DB_NAME = 'timeless'
const DB_VERSION = 1
const STORE = 'document'
const PROJECT_KEY = 'project-xml'
const FALLBACK_PROJECT_KEY = 'timeless.project.xml.v1'

function openDb() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE)
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function readDbValue(key: string) {
  const db = await openDb()
  try {
    return await new Promise<string | undefined>((resolve, reject) => {
      const transaction = db.transaction(STORE, 'readonly')
      const request = transaction.objectStore(STORE).get(key)
      request.onsuccess = () => resolve(typeof request.result === 'string' ? request.result : undefined)
      request.onerror = () => reject(request.error)
    })
  } finally {
    db.close()
  }
}

async function writeDbValue(key: string, value: string) {
  const db = await openDb()
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE, 'readwrite')
      transaction.objectStore(STORE).put(value, key)
      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
      transaction.onabort = () => reject(transaction.error)
    })
  } finally {
    db.close()
  }
}

async function deleteDbValue(key: string) {
  const db = await openDb()
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE, 'readwrite')
      transaction.objectStore(STORE).delete(key)
      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
      transaction.onabort = () => reject(transaction.error)
    })
  } finally {
    db.close()
  }
}

export async function loadProjectXml() {
  try {
    const value = await readDbValue(PROJECT_KEY)
    if (value) return value
  } catch {
    // Fall through to the smaller localStorage fallback.
  }

  return localStorage.getItem(FALLBACK_PROJECT_KEY)
}

export async function saveProjectXml(xml: string) {
  try {
    await writeDbValue(PROJECT_KEY, xml)
    try {
      localStorage.removeItem(FALLBACK_PROJECT_KEY)
    } catch {
      // IndexedDB is canonical when it succeeds.
    }
    return true
  } catch {
    try {
      localStorage.setItem(FALLBACK_PROJECT_KEY, xml)
      return true
    } catch {
      return false
    }
  }
}

export async function clearProjectXml() {
  try {
    await deleteDbValue(PROJECT_KEY)
  } catch {
    // The fallback is cleared below even if IndexedDB is unavailable.
  }

  try {
    localStorage.removeItem(FALLBACK_PROJECT_KEY)
  } catch {
    // Clearing best-effort persistence should not block starting a new document.
  }
}
