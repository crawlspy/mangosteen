/** *
 * bing网站 https://www.pexels.com
 */
import fetch from 'electron-fetch'

let source = null

export const getImage = function (data) {
    console.log(data)
    return new Promise((resolve, reject) => {
        if (!data) {
            resolve([])
            return
        }
        if (data.page > 0) {
            resolve([])
            return
        }
        const request = fetch('https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=8')
        source = request
            .then(res => res.json())
            .then((json) => {
                let urls = []
                urls = json.images.map((item) => {
                    return {
                        url: `https://www.bing.com${item.url}`,
                        downloadUrl: `https://www.bing.com${item.url}`,
                        width: '1920',
                        height: '1080'
                    }
                })
                resolve(urls)
            }).catch((err) => {
                source = null
                console.log('------------请求失败bing:')
                reject()
            })
    })
}


export const cancelImage = function () {
    if (source) {
        source.cancel()
    }
}
