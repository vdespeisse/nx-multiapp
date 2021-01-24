const yaml = require('js-yaml')
const fse = require('fs-extra')

async function readConfig(filePath) {
  const file = await fse.readFile(filePath).catch((e) => {
    if (e.code === 'ENOENT') { return null }
  })
  if (!file) { return {} }
  return yaml.load(file)
}

module.exports = {
  readConfig
}
