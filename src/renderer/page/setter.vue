<template>
  <el-collapse-transition>
    <div class="setter" v-show="show">
      <div class="setter-sanjiao"></div>
      <div class="setter-content">
        <div class="setter-row-one">
          <div>
            {{ version1 }}
            <span
              :style="{ fontSize: '12px' }"
              class="about-pro"
              @click.stop="check_newVersion"
            >
              检查更新
            </span>
          </div>
          <div @click.stop="quit" class="about-pro">
            <!-- <i class="iconfont icon-tuichu"></i> -->
            退出
          </div>
        </div>

        <div class="setter-row">
          <el-checkbox v-model="isOpenStatr" @change="setOpenStart">
            <span class="checkbox-text">开机自动启动</span>
          </el-checkbox>
        </div>

        <div class="setter-row">
          <el-checkbox v-model="wallpaperAutoUp" @change="wallpaperAutoChange">
            <span class="checkbox-text">壁纸自动更新</span>
          </el-checkbox>
        </div>

        <div class="setter-row">
          <el-radio-group v-model="updataTime" @change="updataTimeChange">
            <el-radio label="3600" :disabled="wallpaperAutoUp == false">
              <span class="checkbox-text">每小时</span>
            </el-radio>
            <el-radio label="86400" :disabled="wallpaperAutoUp == false">
              <span class="checkbox-text">每天</span>
            </el-radio>
            <!-- <el-radio label="604800" :disabled="wallpaperAutoUp==false">
                            <span class="checkbox-text">每周</span>
                        </el-radio> -->
          </el-radio-group>
          <el-input
            :disabled="wallpaperAutoUp == false"
            class="myselef-time"
            @input="updataTimeInputChange"
            @change="updataTimeChange"
            placeholder="自定义"
            size="small"
            :value="updataTime"
          >
            <span slot="suffix">秒</span>
          </el-input>
        </div>

        <div class="setter-row">
          <span class="nowrap">设置保存地址:</span>
          <span class="about-pro" @click="setDefalutDownloadPath">{{
            downloadImagePath
          }}</span>
        </div>

        <!-- <div class="setter-row">
        <el-checkbox v-model="timingWipeData" @change="timingWipeDataChange">
          <span class="checkbox-text">定时清空图片</span>
        </el-checkbox>
      </div> -->

        <div class="setter-row image-sourece">图片来源: {{ imageSource }}</div>

        <div class="setter-row image-sourece-options">
          <el-radio-group v-model="imageSource" @change="imageSourceChange">
            <template v-for="item in imageSourceType">
              <el-radio :label="item.value" :key="item.value">
                <span class="checkbox-text">{{ item.name }}</span>
              </el-radio>
            </template>
          </el-radio-group>
        </div>
      </div>
    </div>
  </el-collapse-transition>
</template>

<script>
import { ipcRenderer, remote } from 'electron'
import { mapActions } from 'vuex'
import { version } from '../../../package'
import { imageSourceType } from '../../utils/utils'

const os = require('os')

const { dialog } = remote

export default {
  name: 'setter',
  props: {
    get_data_flag: {
      type: Boolean,
      default: false
    },
    show: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      version1: version,
      imageSource: 'pexels',
      updataTime: '3600',
      isOpenStatr: false, // 开机启动
      wallpaperAutoUp: false, // 壁纸自动更新
      timingWipeData: true, // 定时清空已下载图库
      downloadImagePath: `${os.homedir()}/Downloads/wallpaper`,
      imageSourceType
    }
  },
  mounted() {
    const data = this.$localStorage.getStore('userConfig')
    if (data) {
      const newData = {}
      for (const index in data) {
        if (Object.prototype.hasOwnProperty.bind(data, index)) {
          newData[index] = data[index] || this[index]
          this[index] = newData[index]
        }
      }
      this.changeConfigStore(newData)
    } else {
      this.setLocation()
    }
    this.$ipcRenderer.on('defaultPath', (event, arg) => {
      this.downloadImagePath = arg
      this.setLocation()
    })
  },
  methods: {
    ...mapActions(['changeConfigStore']),

    setOpenStart() {
      this.$ipcRenderer.send('btn', {
        type: 'openStart',
        data: this.isOpenStatr
      })
      this.setLocation()
    },
    quit() {
      this.$parent.setterShow = false
      this.$ipcRenderer.send('btn', {
        type: 'quit',
        data: ''
      })
    },
    /** *将配置信息存到localstorage中 */
    setLocation() {
      const data = {
        imageSource: this.imageSource,
        updataTime: this.updataTime,
        isOpenStatr: this.isOpenStatr, // 开机启动
        wallpaperAutoUp: this.wallpaperAutoUp, // 壁纸自动更新
        timingWipeData: this.timingWipeData,
        downloadImagePath: this.downloadImagePath
      }
      this.$localStorage.setStore('userConfig', data)
      this.changeConfigStore(data)
    },

    wallpaperAutoChange() {
      if (!this.wallpaperAutoUp) {
        this.updataTime = -1
      } else {
        this.updataTime = '3600'
      }
      this.setLocation()
    },

    timingWipeDataChange() {
      this.setLocation()
    },

    updataTimeChange() {
      this.setLocation()
      this.$localStorage.setStore(
        'lastUpdataTime',
        parseInt(new Date().getTime() / 1000, 10)
      )
    },
    updataTimeInputChange(val) {
      const value = parseInt(val, 10)
      if (Number.isNaN(value)) {
        this.updataTime = 3600
      } else {
        this.updataTime = Math.min(Math.max(value, 120), 864000)
      }
    },
    /**
     * 更改图片来源
     */
    imageSourceChange(val) {
      this.$emit('imageSourceChange', val)
      this.setLocation()
    },
    /**
     * 检测更新
     */
    check_newVersion() {
      this.$ipcRenderer.send('btn', {
        type: 'check_newVersion',
        data: true
      })
    },

    /**
     * 设置默认下载图片路径
     */
    setDefalutDownloadPath() {
      this.$ipcRenderer.send('btn', {
        type: 'setDefaultDownPath',
        data: this.downloadImagePath
      })
    }
  },
  watch: {}
}
</script>

<style lang="less" scoped>
.setter {
  display: flex;
  min-height: 270px;
  height: auto;
  .setter-row {
    display: flex;
    width: 100%;
    height: 34px;
    align-items: center;
  }

  .image-sourece {
    height: 30px;
    font-weight: 500px;
  }
  .image-sourece-options {
    height: auto;
    padding: 5px 0;
  }

  .setter-row-one {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 14px;

    .icon-tuichu {
      font-size: 20px;
    }
  }

  .setter-last-btn {
    width: 100%;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .setter-content {
    width: 100%;
    height: auto;
    padding: 20px;
    padding-bottom: 0px;
    color: #fff;
    user-select: none;
    cursor: default;
    font-size: 12px;
    padding-top: 10px;
  }

  .checkbox-text {
    color: #fff;
  }

  .myselef-time {
    width: 100px;
    margin-left: 20px;
  }

  .nowrap {
    white-space: nowrap;
  }

  .about-pro {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .about-pro:hover {
    text-decoration: underline;
  }
}

.setter-sanjiao {
  content: '';
  display: block;
  width: 0;
  height: 0;
  position: absolute;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-bottom: 8px solid rgba(43, 42, 42, 0.8);
  top: -8px;
  right: 20px;
}
</style>

<style lang="less">
.setter {
  .el-checkbox__label {
    color: #fff;
  }

  .el-radio__label {
    color: #fff;
  }

  .el-checkbox__inner {
    background-color: rgba(52, 52, 53, 0.2) !important;
    border-color: #f3f3f3 !important;
  }

  .el-radio__inner {
    background-color: rgba(52, 52, 53, 0.2) !important;
    border-color: #f3f3f3 !important;
  }

  .el-radio {
    margin-right: 10px !important;
  }
  .el-input__suffix {
    line-height: 30px;
  }
  .el-input__inner {
    padding-left: 5px;
    padding-right: 15px;
    height: 30px;
    line-height: 30px;
  }
  .el-input.is-disabled .el-input__inner {
    background-color: #383838;
  }
}
</style>
