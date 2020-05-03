<template>
  <div>
    <setter
      :class="['setter-content', osType == 'mac' ? 'setter-content-mac' : '']"
      :show.sync="setterShow"
      @imageSourceChange="imageSourceChange"
      :getDataFlag="getDataFlag"
    ></setter>
  </div>
</template>
<script>
import { mapState, mapActions } from 'vuex'
import { osType, imageSourceType } from '../../../utils/utils'
import setter from '../setter'

export default {
  components: {
    setter
  },
  data() {
    return {
      osType, // 系统类型
      setterShow: true,
      getDataFlag: false // 标记页面是否正在请求数据
    }
  },
  methods: {
    /**
     * 改变图片来源
     * @function imageSourceChange
     */
    imageSourceChange(val) {
      this.$ipcRenderer.send('imageSourceChange', val)
    }
  }
}
</script>
<style></style>
