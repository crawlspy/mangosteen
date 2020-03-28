const os = require('os')

const state = {
  config: {
    imageSource: 'bing', // 图片来源
    isOpenStatr: false, // 开机启动
    wallpaperAutoUp: false, // 壁纸自动更新
    updataTime: '3600', // 自动更新时间
    timingWipeData: true, // 定时清空已下载图库
    downloadImagePath: `${os.homedir()}/Downloads/wallpaper`
  },
  osInfo: {
    username: '', // 用户名
    version: '', // 软件版本
    uid: '' // 软件唯一ID,
  }
}

const mutations = {
  changeOsInfoStore(statea, data) {
    statea.osInfo = data
  },

  changeConfigStore(statea, data) {
    statea.config = data
  }
}

// 因为使用了vuex-electron 所以需要采用actions
const actions = {
  changeOsInfoStore(store, data) {
    store.commit('changeOsInfoStore', data)
  },
  changeConfigStore(store, data) {
    store.commit('changeConfigStore', data)
  }
}

export default {
  state,
  mutations,
  actions
}
