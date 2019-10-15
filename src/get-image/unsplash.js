/** *
 * pexels网站 https://unsplash.com/t/wallpapers
 * 
 * 
 * 获取壁纸
 * https://unsplash.com/napi/collections/1065976/photos?
 * page=6
 * per_page=10
 * order_by=latest
 * share_key=a4a197fc196734b74c9d87e48cc86838
 * 
 * 主图片
 * https://unsplash.com/napi/photos?page=3&per_page=12
 * 
 * 
 * 
 * 搜索
 * https://unsplash.com/napi/search?query=cat&xp=&per_page=20
 * 
 */

import fetch from 'electron-fetch'
import queryString from 'query-string'


const { imageMinWidth } = require('../utils/config')


let source = null


export const getImage = function (data) {
    return new Promise((resolve, reject) => {
        if (!data) {
            resolve([])
        }
        let baseUrl = 'https://unsplash.com/napi/collections/1065976/photos'
        let searchFalg = false
        let params = {
            page: data.page,
            order_by: 'latest',
            per_page: 50,
            share_key: 'a4a197fc196734b74c9d87e48cc86838'
        }
        if (data.searchKey) {
            baseUrl = 'https://unsplash.com/napi/search/photos'
            searchFalg = true
            params = {
                query: data.searchKey,
                xp: '',
                per_page: 50,
                page: data.page,
            }
        }

        const str = queryString.stringify(params)
        const request = fetch(`${baseUrl}?${str}`)

        request
            .then((res) => res.json())
            .then((result) => {
                source = null
                const urls = []
                let newRes = result
                if (searchFalg){
                    newRes = result.results
                }
                newRes.forEach((item) => {
                    const obj = {
                        width: item.width,
                        height: item.height,
                        url: item.urls.small,
                        downloadUrl: item.urls.full,
                    }
                    if (parseInt(obj.width, 10) > imageMinWidth){
                        urls.push(obj)
                    }
                })
                resolve(urls)
            }).catch(() => {
                source = null
                console.log('------------请求失败unsplash:', baseUrl)
                reject()
            })
    })
}

export const cancelImage = function () {
    if (source) {
        // source.cancel()
    }
}
