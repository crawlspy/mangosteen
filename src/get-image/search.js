/* eslint-disable no-new-func */
import fetch from 'electron-fetch'
import cheerio from 'cheerio'
import { apiTranslation } from '../api/api'
import { imageSourceType, protocols } from '../utils/utils'
import { parseFilters } from './filter-parser'

const formatUrl = function(url, data) {
  const replaceFn = function(str, key) {
    const keys = key.split('.')
    let value = data[keys.shift()]
    keys.forEach(function() {
      value = value[this]
    })
    return value === null || value === undefined ? '' : value
  }
  const _evalregex = /\{\{([\w.*/+-\s]*)\}\}/g
  // operator {{page * 10}}
  url = url.replace(_evalregex, function(str, ekey) {
    let ukey = ekey
    Object.keys(data).forEach((item)=> {
      ukey = ukey.replace(item, data[item])
    })
    try {
      // eslint-disable-next-line no-eval
      const value = eval(ukey)
      return value === null || value === undefined ? '' : value
    } catch (e) {
      return ''
    }
  })

  // replace {page}
  const _regex = /\{([\w.]*)\}/g
  return url.replace(_regex, replaceFn)
}

const v = {
  resolveFilter(id) {
    return v.filters[id]
  },
  filters: {
    // filter
    attribs: (el, attr)=> {
      return el.attribs[attr]
    },
    get: (a, b) => {
      return a[b]
    },
    split: (str, split) => {
      return str.split(split)
    },
    replace: (str, a, b) => {
      return str.replace(a, b)
    }
  }
}

// "$.data-progressive | replace('_640x480.jpg?imageslim','?force=download') "
// "_f("replace")(item.attribs[“data-progressive"],'_640x480.jpg?imageslim','?force=download')"
const parseHtmlChild = (item, exp) => {
  exp = exp.trim()
  // attribs
  const str = new Function('_f, $', `with($){ return ${parseFilters(exp)}}`)(
    v.resolveFilter,
    item
  )
  return str
}

const parseJsonChild = (item, exp) => {
  const str = new Function('_f, $', `with($){ return ${parseFilters(exp)}}`)(
    v.resolveFilter,
    item
  )
  return str
}

const jsonDeep = (s, target) => {
  const tarr = target.split('.')
  let json = s
  let cur = null
  // eslint-disable-next-line no-cond-assign
  while ((cur = tarr.shift())) {
    json = json[cur]
    if (tarr.length === 0) {
      return json
    }
  }
  return json
}
let pageoffset = '';
const getImage = async (protocol, data) => {
  if (protocol.categoryparam) {
    // category param
    data[protocol.categoryparam] = data.category
  }
  if(data.searchKey) {
    // alias
    data.keyword = data.searchKey
  }
  if(data.page == 0 && protocol.pageoffset) {
    pageoffset = '';
  }
  let url = protocol.search && data.searchKey ? formatUrl(protocol.searchurl, data) : formatUrl(protocol.pageurl, data);
  let option
  if(protocol.useragent) {
    option = {
      headers: {
        agent: protocol.useragent
      }
    }
  }
  const res = await fetch(url, option)
  let result
  let urls = []
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
    if (images.length) {
      urls = [].slice.call(images, 0).map(item => ({
        url: parseHtmlChild(item, protocol.pageitem.url),
        downloadUrl: parseHtmlChild(item, protocol.pageitem.downloadurl),
        width: parseHtmlChild(item, protocol.pageitem.width),
        height: parseHtmlChild(item, protocol.pageitem.height)
      }))
      if(protocol.pageoffsetmatch) {
        let pageo = $(protocol.pageoffsetmatch)[0]
        pageoffset = parseHtmlChild(pageo, protocol.pageoffset)
      }
    } else {
      console.log(result)
    }

  }
  return urls
}

const getCategory2 = async (protocol, data) => {
  if(protocol.categorydata) {
    return protocol.categorydata
  }
  const res = await fetch(formatUrl(protocol.categoryurl, data))
  let result
  let urls = []
  if (protocol.type === 'json') {
    result = await res.json()
    const cats = jsonDeep(result, protocol.categorymatch)
    if (cats.length) {
      urls = [].slice.call(cats, 0).map(item => ({
        id: parseJsonChild(item, protocol.categoryitem.id),
        name: parseJsonChild(item, protocol.categoryitem.name)
      }))
    }
  } else if (protocol.type === 'html') {
    result = await res.text()
    const $ = cheerio.load(result)
    const cats = $(protocol.categorymatch)
    if (cats.length) {
      urls = [].slice.call(cats, 0).map(item => ({
        id: parseHtmlChild(item, protocol.categoryitem.id),
        name: parseHtmlChild(item, protocol.categoryitem.name)
      }))
    }
  }
  return urls
}

export const getCategories = function(data) {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    const s = data.imageSource
    const protocol = protocols.find(i => i.value === s)
    if (protocol.category) {
      const urls = await getCategory2(protocol, data)
      resolve(urls)
    }
  })
}

export const getUrls = function(data) {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    const type = data.imageSource
    const currentImageSource = imageSourceType.find(i => i.value === type)
    data.searchKey = currentImageSource.isSupportChinaSearch
      ? data.searchKey
      : await apiTranslation(data.searchKey)
    const protocol = protocols.find(i => i.value === type)
    const urls = await getImage(protocol, data)
    resolve(urls)
  })
}

export const cancelUrls = function() {
  // if (type !== '') {
  //   cancelFn[type]()
  // }
}
