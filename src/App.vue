<template>
  <router-view v-slot="{ Component }">
    <keep-alive v-if="$route.meta.keepAlive">
      <component :is="Component" />
    </keep-alive>
  </router-view>
  <!-- :key="$route.fullPath" 路由参数变化也会刷新 -->
  <router-view :key="$route.fullPath" v-if="!$route.meta.keepAlive && isRouterAlive"></router-view>
</template>

<script>
import { ref, nextTick, provide } from 'vue'
export default {
  name: 'App',
  setup () {
    // 局部组件刷新（provide/inject）
    const isRouterAlive = ref(true)
    const reload = () => {
      isRouterAlive.value = false
      nextTick(() => {
        isRouterAlive.value = true
      })
    }
    provide('reload', reload)
    return {
      isRouterAlive
    }
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
