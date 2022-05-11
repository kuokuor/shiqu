<template>
  <div class="docker">
    <div :class="{'docker__item': true, 'docker__item--active': currentIndex === 1}">
      <router-link :to="{ name: 'Home'}">
        <a class="iconfont">&#xe60c;</a>
        <div class="docker__title">首页</div>
      </router-link>
    </div>
    <div :class="{'docker__item': true, 'docker__item--active': currentIndex === 2}">
      <router-link :to="{ name: 'Classify'}">
        <a class="iconfont">&#xf085;</a>
        <div class="docker__title">分类</div>
      </router-link>
    </div>
    <div class="docker__item">
      <router-link class="iconfont createNote" :to="{ name: 'CreateNote'}">
        &#xe64f;
      </router-link>
    </div>
    <div :class="{'docker__item': true, 'docker__item--active': currentIndex === 3}">
      <router-link :to="{ name: 'Message'}">
        <a class="iconfont">&#xe631;</a>
        <div class="docker__title">消息</div>
        <el-badge :value="unreadTotal" :max="99" :hidden="unreadTotal === 0" />
      </router-link>
    </div>
    <div :class="{'docker__item': true, 'docker__item--active': currentIndex === 4}">
      <router-link :to="{ name: 'My'}">
        <a class="iconfont">&#xe625;</a>
        <div class="docker__title">我的</div>
      </router-link>
    </div>
  </div>
</template>

<script>
import { onMounted, ref } from 'vue'
import { get } from '../utils/request'
export default {
  name: 'Docker',
  props: ['currentIndex'],
  setup () {
    const unreadTotal = ref(0) // 未读消息总数
    const getUnreadTotal = async () => {
      try {
        const result = await get('/message/getUnreadCount') // 未读消息总数
        unreadTotal.value = result.data
      } catch (e) {
        console.log('获取未读消息总数出错')
      }
    }
    onMounted(() => {
      getUnreadTotal()
    })
    return {
      unreadTotal
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../style/viriables.scss';
  .docker{
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    height: .5rem;
    z-index: 2;
    background: $bgColor;
    border-top: .01rem solid $content-bgColor;
    display: flex;
    align-items: center;
    &__item{
      flex: 1;
      height: .49rem;
      color: $textColor;
      a{
        text-decoration: none;
        color: $textColor;
      }
      .iconfont{
        font-size: .26rem;
      }
      .createNote{
        font-size: .4rem;
        color: $themeColor;
        position: relative;
        top: -.04rem;
      }
      &--active{
        a{
          color: $themeColor;
        }
      }
    }
    &__title{
      margin-top: -.08rem;
      font-size: .24rem;
      transform: scale(.5, .5); //缩小一半
      transform-origin: center top; //以中心和顶部为原点
    }
    :deep(sup) {
      top: -0.65rem;
      left: 0.2rem;
    }
  }
</style>
