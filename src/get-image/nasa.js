/* eslint-disable max-len */

import fetch from 'electron-fetch'
import queryString from 'query-string'

const { imageMinWidth } = require('../utils/config')

const BASEPARAMS = {
    size: 50,
    from: 0,
    sort: 'promo-date-time:desc',
    q: '((ubernode-type:image) AND (routes:1446))',
    _source_include: 'promo-date-time,master-image,nid,title,topics,missions,collections,other-tags,ubernode-type,primary-tag,secondary-tag,cardfeed-title,type,collection-asset-link,link-or-attachment,pr-leader-sentence,image-feature-caption,attachments,uri'
}

const BASEURL = 'https://www.nasa.gov/api/2/ubernode/_search'

const PUBLICURL = 'https://www.nasa.gov/sites/default/files/styles/image_card_4x3_ratio/public/'
const DOWNLOADPUBLICURL = 'https://www.nasa.gov/sites/default/files/'


let source = null

export const getImage = function (data) {
    return new Promise((resolve, reject) => {
        if (!data) {
            resolve([])
            return
        }
        const baseUrl = BASEURL

        const params = {
            ...BASEPARAMS,
            from: (data.page * BASEPARAMS.size)
        }
        const str = queryString.stringify(params)
        const request = fetch(`${baseUrl}?${str}`)

        request
            .then((res) => res.json())
            .then((result) => {
                source = null

                const { hits: { hits } } = result
                const urls = []

                hits.forEach((item) => {
                    const { _source: { 'master-image': imageData } } = item
                    const { width, height, uri } = imageData
                    const obj = {
                        width,
                        height,
                        url: uri.replace('public://', PUBLICURL),
                        downloadUrl: uri.replace('public://', DOWNLOADPUBLICURL),
                    }
                    if (parseInt(obj.width, 10) > imageMinWidth){
                        urls.push(obj)
                    }
                })
                resolve(urls)
            }).catch((error) => {
                source = null
                console.log('------------请求失败nasa:', error)
                reject()
            })
    })
}


export const cancelImage = function () {
    if (source) {
        // source.cancel()
    }
}
