<template>
  <div class="docker">
    <div :class="{'docker__item': true, 'docker__item--active': currentIndex === 1}">
      <router-link :to="{ name: 'Home'}">
        <a class="iconfont">&#xe60c;</a>
        <div class="docker__title">首页</div>
      </router-link>
    </div>
    <div :class="{'docker__item': true, 'docker__item--active': currentIndex === 2}">
      <router-link :to="{ name: 'Home'}">
        <a class="iconfont">&#xe612;</a>
        <div class="docker__title">食友</div>
      </router-link>
    </div>
    <div class="docker__item">
      <router-link class="iconfont createNote" :to="{ name: 'Home'}">
        &#xe64f;
      </router-link>
    </div>
    <div :class="{'docker__item': true, 'docker__item--active': currentIndex === 3}">
      <router-link :to="{ name: 'Home'}">
        <a class="iconfont">&#xe631;</a>
        <div class="docker__title">消息</div>
      </router-link>
    </div>
    <div :class="{'docker__item': true, 'docker__item--active': currentIndex === 4}">
      <router-link :to="{ name: 'Home'}">
        <a class="iconfont">&#xe625;</a>
        <div class="docker__title">我的</div>
      </router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Docker',
  props: ['currentIndex']
}
</script>

<style lang="scss" scoped>
@import '../style/viriables.scss';
  .docker{
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    height: .49rem;
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
  }
</style>
