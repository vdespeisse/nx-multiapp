const path = require('path')
const fse = require('fs-extra')
const chokidar = require('chokidar')
const { readConfig } = require('../utils')

export default async function ({ project, app }) {
  console.log('OK', project, app)
  console.log(this.options.content)
  const buildDir = path.join(this.options.rootDir, '.build', app || '')
  const projectDir = path.join(this.options.rootDir, 'clients', project)
  const config = await _get_config(projectDir, app)
  console.log('cfg', config.extends)
  let extendDirs = config.extends.map(d => path.join(this.options.rootDir, d))
  if (app) {
    const appPath = app ? `${project}/apps/${app}` : `${project}/main`
    const appDir = path.join(this.options.rootDir, `./clients/${appPath}`)
    extendDirs = extendDirs.concat(appDir)
  }
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
  // TODO: do it automatically if /apps folder ?
  if (config.apps) {
    await _save_apps_content(projectDir, buildDir, config)
  }

  init = true
}

// Merge project config and app config file
async function _get_config (projectDir, app) {
  // Default to empty object if file does not exist

  const baseConfig = await readConfig(path.join(projectDir, 'config.yml'))
  const appConfig = await readConfig(path.join(projectDir, 'apps', app, 'config.yml'))
  return { ...baseConfig, ...appConfig }
}
async function _save_apps_content(projectDir, buildDir, config) {
  const appsContent = await _create_apps_content(projectDir, config)
  console.log('appsContent', appsContent)
  // const json = JSON.stringify({
  //   body: appsContent
  // })
  return await fse.writeFile(path.join(buildDir, 'static', '_apps.json'), JSON.stringify(appsContent), 'utf8')
}
async function _create_apps_content(projectDir, { apps }) {
  const appList = await _get_app_list(projectDir, apps)
  console.log('app list', appList)
  return await Promise.all(appList.map(app => {
    // const appConfig = await readConfig(path.join(projectDir, 'apps', app, 'config.yml'))
    return { name: app }
  }))
}

async function _get_app_list(projectDir, apps) {
  if (Array.isArray(apps)) return apps
  const appsDir = path.join(projectDir, 'apps')
  const files = await fse.readdir(appsDir)
  const isDir = file => fse.lstatSync(path.join(appsDir, file))
    .isDirectory()
  return files.filter(isDir)
}
