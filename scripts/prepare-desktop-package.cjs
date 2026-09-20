const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
const stage = path.join(root, '.desktop-package')
const sourcePackage = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'))

fs.rmSync(stage, { recursive: true, force: true })
fs.mkdirSync(stage, { recursive: true })

for (const dir of ['dist', 'electron']) {
  fs.cpSync(path.join(root, dir), path.join(stage, dir), { recursive: true })
}

fs.mkdirSync(path.join(stage, 'public'), { recursive: true })
fs.copyFileSync(
  path.join(root, 'public', 'icon-512.png'),
  path.join(stage, 'public', 'icon-512.png'),
)

for (const file of ['LICENSE', 'THIRD_PARTY_NOTICES.md']) {
  fs.copyFileSync(path.join(root, file), path.join(stage, file))
}

const appPackage = {
  name: sourcePackage.name,
  version: sourcePackage.version,
  private: true,
  description: sourcePackage.description,
  license: sourcePackage.license,
  main: 'electron/main.cjs',
}

fs.writeFileSync(
  path.join(stage, 'package.json'),
  JSON.stringify(appPackage, null, 2) + '\n',
)
