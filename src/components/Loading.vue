<!-- loading动画效果 -->
<template>
  <div class="loader">
    <div class="spinner"></div>
    <div class="text">loading</div>
  </div>
</template>

<script>
export default {
  name: 'Loading'
}
</script>

<style lang="scss" scoped>
@import '../style/viriables.scss';
  .loader{
    /* 禁止选取 */
    user-select: none;
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: $content-bgColor;
    .spinner{
      position: relative;
      transform: translate(-50%,-50%);
      width: .8rem;
      height: .8rem;
    };
    .spinner::before,
    .spinner::after{
      content: "";
      position: absolute;
    };
    /* 图形 */
    .spinner::before{
      width: 100%;
      height: 100%;
      background-color: #a08fd5;
      /* 执行动画：动画名 时长 贝塞尔曲线 无限次播放 */
      animation: spinner 2.5s cubic-bezier(0.75,0,0.5,1) infinite;
    };
    /* 投影 */
    .spinner::after{
      width: 100%;
      height: .04rem;
      border-radius: 50%;
      background-color: #333;
      bottom: -.3rem;
      animation: shadow 2.5s cubic-bezier(0.75,0,0.5,1) infinite;
    };
    /* loading文字 */
    .text{
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%,-50%);
      color: $content-bgColor;
      font-size: .16rem;
      text-transform: uppercase;
      font-weight: 100;
      animation: text 2.5s cubic-bezier(0.75,0,0.5,1) infinite;
    }
  }

  /* 定义动画 */
  @keyframes spinner {
    50%{
      border-radius: 50%;
      background-color: #f5e866;
      transform: rotate(360deg) scale(0.5);
    }
    100%{
      background-color: #a08fd5;
      transform: rotate(720deg);
    }
  }
  @keyframes shadow {
    50%{
      transform: scale(0.5);
    }
  }
  @keyframes text {
    0%,100%{
      transform: translate(-50%,-50%) scale(1, 1);
    }
    50%{
      transform: translate(-50%,-50%) scale(0.5, 0.5);
      color: #000;
    }
  }
</style>
