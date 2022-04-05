<template>
  <loading v-if="load" />
  <div class="container">
    <div class="classify">
      <a class="iconfont classify__icon">&#xe649;</a>
    </div>
    <ul class="nav">
      <li class="nav__item" @click="handleTabClick(1)">
        <a :class="{'nav-link': true, 'active': activeIndex === 1}" :tab="activeIndex">关注</a>
        <div :class="{'line': activeIndex === 1}"></div>
      </li>
      <li class="nav__item" @click="handleTabClick(2)">
        <a :class="{'nav-link': true, 'active': activeIndex === 2}" :tab="activeIndex">热门</a>
        <div :class="{'line': activeIndex === 2}"></div>
      </li>
      <li class="nav__item" @click="handleTabClick(3)">
        <a :class="{'nav-link': true, 'active': activeIndex === 3}" :tab="activeIndex">最新</a>
        <div :class="{'line': activeIndex === 3}"></div>
      </li>
    </ul>
    <div class="search">
      <a class="iconfont search__icon">&#xe802;</a>
    </div>
  </div>
  <div class="main">
    <div class="wrapper">
      <div v-for="item in noteList" :key="item.note.id" class="content__wrapper">
        <contents :notes="item" />
      </div>
    </div>
  </div>
  <docker :currentIndex="1" />
</template>

<script>
import Loading from '../../components/Loading.vue'
import Contents from './Contents.vue'
import Docker from '../../components/Docker.vue'
import { ref, onMounted } from 'vue'
import { get } from '../../utils/request'
import { ElMessage } from 'element-plus'

export default {
  name: 'Home',
  components: {
    Loading,
    Contents,
    Docker
  },
  setup () {
    const load = ref(true)
    const activeIndex = ref(2)
    onMounted(() => {
      if (load.value) {
        getNoteList() // 加载数据
      }
    })
    const handleTabClick = (index) => {
      activeIndex.value = index
    }
    const noteList = ref([])
    const getNoteList = async () => {
      try {
        const result = await get('/note/getNoteList')
        if (result.code === 200 && result.data) {
          const list = result.data
          list.forEach((column) => {
            const likeCount = column.note.likeCount
            if (likeCount / 10000 >= 1) {
              let format = (likeCount / 10000).toFixed(1)
              if (format > 10) {
                format = parseInt(format)
              }
              column.note.likeCount = `${format}万`
            }
          })
          noteList.value.push(...list)
          console.log(noteList.value)
          setTimeout(() => {
            load.value = false // 获取数据成功，关闭loading效果
          }, 1000)
        } else {
          ElMessage({
            showClose: true,
            message: '发生错误',
            type: 'error',
            center: true,
            duration: 1000
          })
        }
      } catch (e) {
        ElMessage({
          showClose: true,
          message: '发生错误',
          type: 'error',
          center: true,
          duration: 1000
        })
      }
    }
    return {
      load,
      activeIndex,
      handleTabClick,
      noteList,
      getNoteList
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../style/viriables.scss';
  .container{
    display: flex;
    width: 100%;
    height: .5rem;
    position: fixed;
    top: 0;
    z-index: 2;
    margin: 0;
    padding: 0;
    background: $bgColor;
    .classify{
      width: .5rem;
      &__icon{
        position: relative;
        top: .08rem;
        left: .04rem;
        font-size: .24rem;
        text-decoration: none;
        color: $textColor;
      }
    }
    .search{
      width: .5rem;
      &__icon{
        position: relative;
        top: .08rem;
        right: .04rem;
        font-size: .24rem;
        text-decoration: none;
        color: $textColor;
      }
    }
  }
  .nav{
    flex: 1;
    flex-wrap: nowrap;
    &__item{
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      .nav-link{
        line-height: .4rem;
        //margin-top: .04rem;
        padding: 0;
        font-size: .16rem;
        color: $textColor;
      }
      .active{
        font-size: .22rem;
        font-weight: bolder;
        color: $themeColor;
        margin: 0;
      }
      .line{
        width: .4rem;
        height: .04rem;
        margin-top: -.04rem;
        background: $themeColor;
        border-radius: .05rem;
      }
    }
  }
  .wrapper{
    padding: 0 .02rem;
    overflow: auto;
    column-count: 2;
    column-gap: .01rem;
  }
  .content__wrapper{
    margin-bottom: .02rem;
    break-inside: avoid;
  }
  .main{
    position: relative;
    top: .5rem;
    height: calc(100vh - 1rem);
    overflow: auto;
  }
</style>
