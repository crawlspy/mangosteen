/** *
 * bing网站 https://www.360.com
 */
import fetch from 'electron-fetch'
import queryString from 'query-string'

const { imageMinWidth, browserHeader } = require('../utils/config')

let source = null

export const getCategories = function () {
    return new Promise((resolve, reject) => {
        const url = 'http://wallpaper.apc.360.cn/index.php?c=WallPaper&a=getAllCategoriesV2'
        const request = fetch(url)
        source = request
            .then((res) => res.json())
            .then((json) => {
                const cates = json.data.map((item) => ({ id: item.id, name: item.name }))
                resolve(cates)
            })
            .catch((err) => {
                reject()
            })
    })
}


export const getImage = function (data) {
    return new Promise((resolve, reject) => {
        if (!data) {
            resolve([])
            return
        }
        const baseUrl = 'http://wallpaper.apc.360.cn/index.php'

        // http://bz.hellohao.cn/GetWallpapers?start=0&count=10&category=36
        // http://wallpaper.apc.360.cn/index.php?c=WallPaper&a=getAppsByCategory&cid=36&start=0&count=10&from=360chrome

        const params = {
            a: 'getAppsByCategory',
            from: '360chrome',
            c: 'WallPaper',
            // page: data.page + 1,
            cid: data.category || 36,
            count: 10,
            start: data.page * 10
        }
        const str = queryString.stringify(params)

        const request = fetch(`${baseUrl}?${str}`)
        source = request
            .then((res) => res.json())
            .then((json) => {
                // eslint-disable-next-line eqeqeq
                if (json.errno == 0) {
                    const urls = json.data.map((item) => ({
                        url: item.url_thumb,
                        downloadUrl: item.url,
                        width: item.resolution.split('x')[0],
                        height: item.resolution.split('x')[1]
                    }))
                    resolve(urls)
                } else {
                    resolve([])
                }
            }).catch((err) => {
                source = null
                console.log('------------请求失败360:', err)
                reject()
            })
    })
}


export const cancelImage = function () {
    if (source) {
        source.cancel()
    }
}
