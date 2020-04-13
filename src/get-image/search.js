/* eslint-disable no-new-func */
import cheerio from 'cheerio'
import fetch from './fetch'
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
  const _evalregex = /\{\{([\S\s]*?)\}\}/g
  // operator {{page * 10}}
  url = url.replace(_evalregex, function(str, ekey) {
    let ukey = ekey
    Object.keys(data).forEach(item => {
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
    lastafter: (str, last, ins) => {
      const index = str.lastIndexOf(last)
      return (
        str.substring(0, index + 1) + ins + str.substring(index + 1, str.length)
      )
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
let pageoffset = ''
let req
const getImage = async (protocol, data) => {
  if (protocol.categoryparam) {
    // category param
    data[protocol.categoryparam] = data.category
  }
  if (data.searchKey) {
    // alias
    data.keyword = data.searchKey
  }
  if (data.page === 0 && protocol.pageoffset) {
    pageoffset = ''
  }
  const url =
    protocol.search && data.keyword
      ? formatUrl(protocol.searchurl, data)
      : formatUrl(protocol.pageurl, data)
  const option = {}
  if (protocol.useragent) {
    option.headers = {
      'User-Agent': protocol.useragent,
      ...option.headers
    }
  }
  if (protocol.pagemethod) {
    option.method = protocol.pagemethod
  }
  if (protocol.headers) {
    option.headers = {
      ...option.headers,
      ...protocol.headers
    }
  }
  const res = await fetch(url, option)
  let result
  let urls = []
  if (protocol.type === 'json') {
    result = await res.json()
    const images = jsonDeep(
      result,
      data.keyword && protocol.searchmatch
        ? protocol.searchmatch
        : protocol.pagematch
    )
    if (images && images.length) {
      urls = [].slice.call(images, 0).map(item => ({
        url: parseJsonChild(item, protocol.pageitem.url),
        downloadUrl: parseJsonChild(item, protocol.pageitem.downloadurl),
        width: parseJsonChild(item, protocol.pageitem.width),
        height: parseJsonChild(item, protocol.pageitem.height)
      }))
    }
  } else if (protocol.type === 'html') {
    result = await res.text()
    // console.log(result)
    const $ = cheerio.load(result)
    const images = $(
      data.keyword && protocol.searchmatch
        ? protocol.searchmatch
        : protocol.pagematch
    )
    if (images && images.length) {
      urls = [].slice.call(images, 0).map(item => ({
        url: parseHtmlChild($(item), protocol.pageitem.url),
        downloadUrl: parseHtmlChild($(item), protocol.pageitem.downloadurl),
        width: parseHtmlChild($(item), protocol.pageitem.width),
        height: parseHtmlChild($(item), protocol.pageitem.height)
      }))
      if (protocol.pageoffsetmatch) {
        const pageo = $(protocol.pageoffsetmatch)[0]
        pageoffset = parseHtmlChild($(pageo), protocol.pageoffset)
      }
    } else {
      console.log(result)
    }
  }
  return urls
}

const getCategory2 = async (protocol, data) => {
  if (protocol.categorydata) {
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

export const cancelUrls = function() {}
