<template>
  <el-container style="height: 100%;">
    <el-aside width="200px" style="background-color: rgb(238, 241, 246)">
      <el-menu default-active="1" class="el-menu-vertical-demo" @select="handleSelect">
        <el-menu-item index="/config/base">
          <i class="el-icon-menu"></i>
          <span slot="title">基础设置</span>
        </el-menu-item>
        <el-menu-item index="/config/source">
          <i class="el-icon-menu"></i>
          <span slot="title">订阅设置</span>
        </el-menu-item>
        <el-menu-item index="/config/suggestion">
          <i class="el-icon-menu"></i>
          <span slot="title">意见反馈</span>
        </el-menu-item>
        <el-menu-item index="/config/about">
          <i class="el-icon-menu"></i>
          <span slot="title">关于项目</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-main>
        <keep-alive>
          <router-view></router-view>
        </keep-alive>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data() {
    return {};
  },
  methods: {
    handleSelect(key, keyPath) {
      this.$router.push(key);
      console.log(key, keyPath);
    }
  }
};
</script>
<style></style>
