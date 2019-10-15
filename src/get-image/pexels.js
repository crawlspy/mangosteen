/** *
 * pexels网站 https://www.pexels.com
 */
import fetch from 'electron-fetch'

const cheerio = require('cheerio')
const { imageMinWidth } = require('../utils/config')

let source = null

// 下一页的时间参数
let nextPageSeed = ''
export const getImage = function (data) {
    return new Promise((resolve, reject) => {
        if (!data) {
            resolve([])
        }
        if (data.page === 0){
            nextPageSeed = ''
        }
        let baseUrl = 'https://www.pexels.com'
        if (data.searchKey) {
            baseUrl = `https://www.pexels.com/search/${data.searchKey}`
        }
        const url = baseUrl + nextPageSeed
        const request = fetch(url)
        request
            .then((res) => res.text())
            .then((html) => {
                // console.log(html)
                const urls = []
                const $ = cheerio.load(html)
                if ($('.next_page').length){
                    nextPageSeed = $('.next_page')[0].attribs.href
                }
                const imageItems = $('.photo-item__img')
                // 是否存在
                if (nextPageSeed.length){
                    const imageItemsLength = imageItems.length
                    for (let i = 0; i < imageItemsLength; i++){
                        const { attribs } = imageItems[i]
                        if (attribs['data-big-src']) {
                            const obj = {
                                width: attribs['data-image-width'],
                                height: attribs['data-image-height'],
                                url: attribs['data-large-src'],
                                downloadUrl: attribs['data-big-src'].split('?')[0]
                            }
                            // 剔除重复的地址
                            if (parseInt(obj.width, 10) > imageMinWidth) {
                                urls.push(obj)
                            }
                        }
                    }
                }
                resolve(urls)
            }).catch((err) => {
                source = null
                console.log('------------请求失败pexels:', err)
                reject()
            })
    })
}


export const cancelImage = function () {
    if (source) {
        // source.cancel()
    }
}
