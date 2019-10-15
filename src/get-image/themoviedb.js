/* eslint-disable max-len */

import fetch from 'electron-fetch'
import queryString from 'query-string'
import userConfig from '../../.user-config'

const { themoviedbAppKey } = userConfig
const APIKEY = themoviedbAppKey
const MOVELISTAPI = 'https://api.themoviedb.org/3/discover/movie'
const ALLSEARCHAPI = 'https://api.themoviedb.org/3/search/multi'
const MOVELISTPARAMS = {
    api_key: APIKEY,
    language: 'zh-CN',
    sort_by: 'popularity.desc',
    include_adult: false,
    include_video: false,
    page: 1
}

const BASEIMAGEDOWNURL = 'https://image.tmdb.org/t/p/original'
const BASEIMAGEURL = 'https://image.tmdb.org/t/p/w500'

// const GETMOVEIMAGEURL='https://api.themoviedb.org/3/movie/${moveid}/images?api_key='

const { imageMinWidth } = require('../utils/config')


let source = null

const getImages = function (movieId, type){
    return new Promise((resolve) => {
        const params = {
            api_key: APIKEY
        }

        const baseUrl = `https://api.themoviedb.org/3/${type}/${movieId}/images`

        const str = queryString.stringify(params)
        const request = fetch(`${baseUrl}?${str}`)
        request
            .then((res) => res.json())
            .then((result) => {
                const { backdrops } = result
                const urls = []
                backdrops.forEach((item) => {
                    const { width, height, file_path: filePath } = item
                    if (parseInt(width, 10) > imageMinWidth){
                        urls.push({
                            width,
                            height,
                            url: `${BASEIMAGEURL}${filePath}`,
                            downloadUrl: `${BASEIMAGEDOWNURL}${filePath}`,
                        })
                    }
                })
                resolve(urls)
            }).catch((err) => {
                resolve([])
            })
    })
}

export const getImage = function (data) {
    return new Promise((resolve, reject) => {
        if (!data) {
            resolve([])
            return
        }

        let url = MOVELISTAPI
        let params = {
            ...MOVELISTPARAMS,
            page: data.page + 1
        }
        if (data.searchKey){
            url = ALLSEARCHAPI
            params = {
                api_key: APIKEY,
                // language: 'zh-CN',
                page: data.page + 1,
                include_adult: false,
                query: data.searchKey
            }
        }

        const str = queryString.stringify(params)
        const request = fetch(`${url}?${str}`)
        request
            .then((res) => res.json())
            .then(async (result) => {
                const { results } = result
                let urls = []
                await Promise.all(results.map(async (item) => {
                    const { id, media_type: mediaType = 'movie' } = item
                    const movieImages = await getImages(id, mediaType)
                    urls = [...movieImages, ...urls]
                    return Promise.resolve
                }))
                resolve(urls)
            }).catch((error) => {
                source = null
                console.log('------------请求失败tmdb:', error)
                reject()
            })
    })
}

export const cancelImage = function () {
    if (source) {
        // source.cancel()
    }
}
