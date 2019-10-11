/** *
 * bing网站 https://www.pexels.com
 */
import fetch from 'electron-fetch'
import cheerio from 'cheerio'

let source = null

export const getImage = function (data) {
    return new Promise((resolve, reject) => {
        if (!data) {
            resolve([])
            return
        }
        const request = fetch(`https://bing.ioliu.cn/?p=${data.page + 1}`)
        source = request
            .then((res) => res.text())
            .then((html) => {
                const $ = cheerio.load(html)
                const images = $('.progressive__img')
                let urls = []
                if (images.length) {
                    urls = [].slice.call(images, 0).map((item) => ({
                        url: item.attribs['data-progressive'],
                        downloadUrl: item.attribs['data-progressive'],
                        width: '1920',
                        height: '1080'
                    }))
                    resolve(urls)
                } else {
                    resolve([])
                }
            }).catch((err) => {
                source = null
                console.log('------------请求失败bing:', err)
                reject()
            })
    })
}


export const cancelImage = function () {
    if (source) {
        source.cancel()
    }
}
