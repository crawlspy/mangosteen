/**
 * pexels网站 https://500px.com/
 */


// 搜索
// https: //api.500px.com/v1/photos/search?type=photos&term=cat&image_size%5B%5D=1&image_size%5B%5D=2&image_size%5B%5D=32&image_size%5B%5D=31&image_size%5B%5D=33&image_size%5B%5D=34&image_size%5B%5D=35&image_size%5B%5D=36&image_size%5B%5D=2048&image_size%5B%5D=4&image_size%5B%5D=14&include_states=true&formats=jpeg%2Clytro&include_tags=true&exclude_nude=true&page=1&rpp=50


// 热门
// https: //api.500px.com/v1/photos?rpp=50&feature=popular&image_size%5B%5D=1&image_size%5B%5D=2&image_size%5B%5D=32&image_size%5B%5D=31&image_size%5B%5D=33&image_size%5B%5D=34&image_size%5B%5D=35&image_size%5B%5D=36&image_size%5B%5D=2048&image_size%5B%5D=4&image_size%5B%5D=14&sort=&include_states=true&include_licensing=true&formats=jpeg%2Clytro&only=&exclude=&personalized_categories=&page=1&rpp=50

import fetch from 'electron-fetch'
import queryString from 'query-string'

const { imageMinWidth } = require('../utils/config')

let source = null

const categories = [
    { id: 'all', name: '全部类别' },
    { id: 'Night', name: 'Night' },
    { id: 'Film', name: '电影' },
    { id: 'Transportation', name: '交通' },
    { id: 'Food', name: '美食' },
    { id: 'People', name: '人物' },
    { id: 'Nature', name: '自然' },
    { id: 'Animals', name: '动物' },
    { id: 'Aerial', name: '航空' },
    { id: 'Celebrities', name: '名人' },
    { id: 'Fine+Art', name: '艺术' },
    { id: 'Commercial', name: '商业' },
    { id: 'Street', name: '街景' },
    { id: 'City+&+Architecture', name: '城市与建筑' },
    { id: 'Performing+Arts', name: '表演艺术' },
    { id: 'Wedding', name: '婚礼' },
    { id: 'Sport', name: '运动' },
    { id: 'Family', name: '家庭' },
    { id: 'Urban+Exploration', name: '都市探奇' },
    { id: 'Macro', name: '微距' },
    { id: 'Still+Life', name: '静物' },
    { id: 'Abstract', name: '抽象' },
    { id: 'Concert', name: '音乐会' },
    { id: 'Journalism', name: '新闻' },
    { id: 'Landscapes', name: '风景' },
    { id: 'Travel', name: '旅行' },
    { id: 'Black+and+White', name: '黑白' },
    { id: 'Fashion', name: '时尚' },
    { id: 'Uncategorized', name: '未分类' },
    { id: 'Underwater', name: '水下' }
]

export const getCategories = function () {
    return new Promise((resolve, reject) => {
        resolve(categories)
    })
}

export const getImage = async function (data) {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
        if (!data) {
            resolve([])
        }
        let baseUrl = 'https://api.500px.com/v1/photos'
        const params = {
            // 'image_size[]': 2048,
            'image_size[]': [100, 200, 400, 600, 2048],
            page: data.page + 1,
            rpp: 50, // 单页条数
            formats: 'jpeg,lytro',
            sort: '',
            exclude: '',
            personalized_categories: ''
        }
        if (data.category && !data.searchKey) {
            params.only = data.category
        }

        if (data.searchKey) {
            baseUrl = 'https://api.500px.com/v1/photos/search'
            params.type = 'photos'
            params.term = data.searchKey
            params.include_tags = true
            params.exclude_nude = true
        } else {
            baseUrl = 'https://api.500px.com/v1/photos'
            params.feature = 'popular'
            params.include_licensing = true
            params.include_states = true
        }

        const str = queryString.stringify(params)
        const request = fetch(`${baseUrl}?${str}`)
        source = request
            .then((res) => res.json())
            .then((json) => {
                const urls = []
                if (json.photos) {
                    json.photos.forEach((item) => {
                        const obj = {
                            width: item.width,
                            height: item.height,
                            url: item.image_url[0],
                            downloadUrl: item.images[0].url,
                        }
                        const { images } = item
                        let maxSize = 0
                        for (let i = 0; i < images.length; i++) {
                            if (images[i].size >= 200 && images[i].size <= 700) {
                                obj.url = images[i].https_url
                            }
                            if (images[i].size > maxSize) {
                                obj.downloadUrl = images[i].https_url
                            }
                            maxSize = images[i].size
                        }
                        // obj.height = parseInt(maxSize / obj.width * obj.height, 10)
                        // obj.width = maxSize
                        if (parseInt(obj.width, 10) > imageMinWidth) {
                            urls.push(obj)
                        }
                    })
                    resolve(urls)
                }
            }).catch((err) => {
                source = null
                console.log('------------请求失败500px:', err)
                reject()
            })
    })
}

export const cancelImage = function () {
    if (source) {
        // source.cancel()
    }
}
