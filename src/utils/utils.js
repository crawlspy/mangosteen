/* eslint-disable no-undef */
const elog = require('electron-log')
const fs = require('fs')
const path = require('path')
const { app } = require('electron')

let apppath
if (process.env.NODE_ENV === 'development') {
  apppath = path.resolve(__dirname, '..')
} else {
  apppath = __dirname
}

const modulesFiles = {}
fs.readdirSync(path.join(apppath, './protocol')).forEach(file => {
  // eslint-disable-next-line no-undef
  let model = fs.readFileSync(path.join(apppath, './protocol', file))
  model = JSON.parse(model)
  modulesFiles[model.value] = model
})

elog.transports.file.level = 'debug'

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */

if (process.env.NODE_ENV !== 'development') {
  // eslint-disable-next-line no-underscore-dangle
  global.__static = require('path')
    .join(__dirname, '/static')
    .replace(/\\/g, '\\\\')
}

export const log = elog

const os = require('os')

export const baseUrl =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:9080'
    : `file://${__dirname}/index.html`

const OSTYPES = {
  Darwin: 'mac',
  Windows_NT: 'win'
}

export const osType = OSTYPES[os.type()] || 'win'
export function isMac() {
  return osType === 'mac'
}

export function isWin() {
  return osType === 'win'
}

export function isDev() {
  return process.env.NODE_ENV === 'development'
}

export const protocols = Object.values(modulesFiles)

export const imageSourceType = protocols.map(item => {
  const { name, value, search } = item
  return {
    name,
    value,
    search,
    category: item.category || false,
    isSupportChinaSearch: item.chinesesearch
  }
})
