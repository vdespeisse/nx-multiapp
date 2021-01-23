const path = require('path')
const fse = require('fs-extra')
const chokidar = require('chokidar')
const yaml = require('js-yaml')

export default async function ({ project, app }) {
  console.log('OK', project, app)
  const projectDir = path.join(this.options.rootDir, 'clients', project)
  const config = await _get_config(projectDir, app)
  console.log('cfg', config.extends)
  const appPath = app ? `${project}/apps/${app}` : `${project}/main`
  const appDir = path.join(this.options.rootDir, `./clients/${appPath}`)
  const extendDirs = config.extends.map(d => path.join(this.options.rootDir, d))
    .concat(appDir)
  const buildDir = path.join(this.options.rootDir, '.build', app || '')
  await fse.emptyDir(buildDir)
  await fse.mkdirp(buildDir)
  this.options.srcDir = buildDir

  const copyFiles = async () => {
    // Do it sequentially else error
    for (const dir of extendDirs) {
      await fse.copy(dir, buildDir)
    }
  }
  const toTargetPath = (filePath, baseDir) => {
    return filePath
      .replace(baseDir, buildDir)
  }
  let init = false
  extendDirs.map((baseDir) => {
    return chokidar.watch(baseDir).on('all', async (event, filePath) => {
      // Chokidar fires a 'add' event on init but we don't want to copy on init
      if (!init) { return }
      if (event === 'add' || event === 'change') {
        console.log(event)
        await fse.copy(filePath, toTargetPath(filePath, baseDir))
      }
      if (event === 'unlink') {
        console.log(event)
        await fse.remove(toTargetPath(filePath))
      }
    })
  })
  await copyFiles()
  init = true
}

// Merge project config and app config file
async function _get_config (projectDir, app) {
  // Default to empty object if file does not exist
  const safe_yaml = async (filePath) => {
    const file = await fse.readFile(filePath).catch((e) => {
      if (e.code === 'ENOENT') { return null }
    })
    if (!file) { return {} }
    return yaml.load(file)
  }
  const base_config = await safe_yaml(path.join(projectDir, 'config.yml'))
  const app_config = await safe_yaml(path.join(projectDir, 'apps', app, 'config.yml'))
  return { ...base_config, ...app_config }
}
