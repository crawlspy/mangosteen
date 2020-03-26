import fetch from 'electron-fetch'
import cheerio from 'cheerio'
import { apiTranslation } from '../api/api'
import { imageSourceType } from '../utils/utils'

let type = ''
const fs = require('fs')
const path = require('path')
const pexels = require('./pexels')
const fiveHundred = require('./500px')
const paper = require('./paper')
const unsplash = require('./unsplash')
const wallhaven = require('./wallhaven')
const nasa = require('./nasa')
const themoviedb = require('./themoviedb')
const bing = require('./bing')
const qh360 = require('./qh360')

const modulesFiles = require.context(
  path.resolve(__dirname, '../protocol'),
  true,
  /\.json$/
)
const protocols = modulesFiles.keys().reduce((mols, modPath) => {
  const value = modulesFiles(modPath)
  mols[value.name] = value
  return mols
}, {})

const formatUrl = function(url, data) {
  var _regex = /\{([\w\.]*)\}/g;
  return url.replace(_regex, function (str, key) {
    var keys = key.split('.'), value = data[keys.shift()];
    keys.forEach(function() { value = value[this]; });
    return (value === null || value === undefined) ? '' : value;
  });
}

const parseHtmlChild = ()=> {

}

const parseJsonChild = ()=> {

}

const jsonDeep = (json, target)=> {

}

const getImage = async (protocol, data) => {
  const res = await fetch(formatUrl(protocol.pageurl, data))
  let result
  if (protocol.type === 'json') {
    result = await res.json()
    const images = jsonDeep(result, protocol.pagematch)
    if (images.length) {
      urls = [].slice.call(images, 0).map(item => ({
        url: parseJsonChild(item, protocol.pageitem.url),
        downloadUrl: parseJsonChild(item, protocol.pageitem.downloadurl),
        width: parseJsonChild(item, protocol.pageitem.width),
        height: parseJsonChild(item, protocol.pageitem.height)
      }))
    }
  } else if (protocol.type === 'html') {
    result = await res.text()
    const $ = cheerio.load(result)
    const images = $(protocol.pagematch)
    let urls = []
    if (images.length) {
      urls = [].slice.call(images, 0).map(item => ({
        url: parseHtmlChild(item, protocol.pageitem.url),
        downloadUrl: parseHtmlChild(item, protocol.pageitem.downloadurl),
        width: parseHtmlChild(item, protocol.pageitem.width),
        height: parseHtmlChild(item, protocol.pageitem.height)
      }))
    }
    return urls
}







const cancelFn = {
  pexels: pexels.cancelImage,
  '500px': fiveHundred.cancelImage,
  paper: paper.cancelImage,
  unsplash: unsplash.cancelImage,
  wallhaven: unsplash.cancelImage,
  nasa: nasa.cancelImage,
  themoviedb: themoviedb.cancelImage,
  bing: bing.cancelImage,
  360: qh360.cancelImage
}

const getUrl = {
  pexels: pexels.getImage,
  '500px': fiveHundred.getImage,
  paper: paper.getImage,
  unsplash: unsplash.getImage,
  wallhaven: wallhaven.getImage,
  nasa: nasa.getImage,
  themoviedb: themoviedb.getImage,
  bing: bing.getImage,
  360: qh360.getImage
}

const getCategory = {
  // pexels: pexels.getImage,
  '500px': fiveHundred.getCategories,
  paper: paper.getCategories,
  // unsplash: unsplash.getImage,
  // wallhaven: wallhaven.getImage,
  // nasa: nasa.getImage,
  // themoviedb: themoviedb.getImage,
  // bing: bing.getImage,
  360: qh360.getCategories
}

export const getCategories = function(data) {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    const s = data.imageSource
    if (getCategory[s]) {
      getCategory[s](data)
        .then(urls => {
          resolve(urls)
        })
        .catch(error => {
          reject(error)
        })
        .finally(() => {})
    }
  })
}

export const getUrls = function(data) {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    type = data.imageSource
    const currentImageSource = imageSourceType.find(i => i.value === type)
    data.searchKey = currentImageSource.isSupportChinaSearch
      ? data.searchKey
      : await apiTranslation(data.searchKey)
    getUrl[type](data)
      .then(urls => {
        resolve(urls)
      })
      .catch(error => {
        reject(error)
      })
      .finally(() => {
        type = ''
      })
  })
}

export const cancelUrls = function() {
  if (type !== '') {
    cancelFn[type]()
  }
}
