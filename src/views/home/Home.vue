<template>
  <loading v-if="load" />
  <div class="header">
    <ul class="nav">
      <li class="nav__item" @click="handleTabClick(0)">
        <a :class="{'nav-link': true, 'active': activeIndex === 0}" :tab="activeIndex">关注</a>
        <div :class="{'line': activeIndex === 0}"></div>
      </li>
      <li class="nav__item" @click="handleTabClick(1)">
        <a :class="{'nav-link': true, 'active': activeIndex === 1}" :tab="activeIndex">热门</a>
        <div :class="{'line': activeIndex === 1}"></div>
      </li>
      <li class="nav__item" @click="handleTabClick(2)">
        <a :class="{'nav-link': true, 'active': activeIndex === 2}" :tab="activeIndex">最新</a>
        <div :class="{'line': activeIndex === 2}"></div>
      </li>
    </ul>
    <div class="search">
      <a class="iconfont search__icon" @click="handleSearch">&#xe802;</a>
    </div>
  </div>
  <div class="main" ref="mainDiv">
    <div class="wrapper">
      <div
        v-for="item in noteList[activeIndex]"
        :key="item.note.id"
        class="content__wrapper"
      >
        <contents :noteData="item" @changeLiked="changeLiked" />
      </div>
    </div>
    <load-more v-if="loadMore" />
    <div class="noMore" v-if="!loadMore">哎呀 已经到底啦~</div>
  </div>
  <docker :currentIndex="1" />
</template>

<script>
import Loading from '../../components/Loading.vue'
import Contents from './Contents.vue'
import LoadMore from '../../components/loadMore.vue'
import Docker from '../../components/Docker.vue'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { get } from '../../utils/request'
import { ElMessage } from 'element-plus'
import { handleCountShow } from '../../effects/useHandleCountEffect'

const useTabEffect = (load, activeIndex, noteList) => {
  // 模块切换逻辑
  const handleTabClick = (index) => {
    if (!noteList.value[index].length || activeIndex.value === index) {
      load.value = true
      getNoteList(index, true) // 已经在index对应模块下了，重新获取数据(刷新)
      // 返回顶部
      const mainDiv = document.getElementsByClassName('main')[0]
      mainDiv.scrollTop = 0
    }
    activeIndex.value = index
  }

  const startCount = ref(0)
  const noMore = ref(false)
  // 获取笔记列表
  const getNoteList = async (index, refresh) => {
    try {
      const formData = new FormData()
      formData.append('userId', 0)
      formData.append('activeIndex', index)
      formData.append('limit', 10)
      formData.append('offset', startCount)

      const result = await get('/note/getNoteList', formData)
      if (result.code === 200 && result.data) {
        const list = result.data
        list.forEach((column) => {
          const likeCount = handleCountShow(column.note.likeCount) // 格式化点赞数量
          column.note.likeCount = likeCount
        })
        // 刷新笔记列表
        if (refresh) {
          noteList.value[index] = [...list]
          setTimeout(() => {
            load.value = false // 获取数据成功，关闭loading效果
          }, 1000)
        } else { // 不刷新，加载更多笔记
          noteList.value[index].push(...list)
          // 新加载的笔记数量小于每次加载限制数量，表示已经全部加载完
          if (list.length < 10) {
            noMore.value = true
          }
          startCount.value += list.length
        }
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
    handleTabClick,
    noMore,
    getNoteList
  }
}

export default {
  name: 'Home',
  components: {
    Loading,
    Contents,
    LoadMore,
    Docker
  },
  setup () {
    const load = ref(true) // 控制loading展示与否
    const activeIndex = ref(1) // 被选中的模块
    const noteList = ref([[], [], []]) // 存放关注、热门、最新的笔记列表
    const { handleTabClick, noMore, getNoteList } = useTabEffect(load, activeIndex, noteList)

    onMounted(() => {
      if (load.value) {
        getNoteList(1, true) // 进入首页，自动加载热门笔记
      }
      mainDiv.value.addEventListener('scroll', scrollToBottom)
    })

    // 点赞与取消
    const changeLiked = (id, liked, count) => {
      noteList.value[activeIndex.value] = noteList.value[activeIndex.value].map((noteData) => {
        if (noteData.note.id === id) {
          noteData.note.liked = liked
          if (typeof noteData.note.likeCount === 'number') {
            noteData.note.likeCount += count
          }
        }
        return noteData
      })
    }

    const loadMore = ref(false)
    const mainDiv = ref(null)
    const scrollToBottom = () => {
      const scrollTop = mainDiv.value.scrollTop
      const scrollHeight = mainDiv.value.firstChild.scrollHeight
      const clientHeight = mainDiv.value.clientHeight
      if (scrollTop + clientHeight >= scrollHeight - 1) {
        if (!noMore.value) {
          loadMore.value = true
          getNoteList(activeIndex.value, false) // 加载更多笔记
        } else {
          // 没有更多数据了
          loadMore.value = false
        }
      }
    }

    // 点击搜索图标进入搜索页
    const router = useRouter()
    const handleSearch = () => {
      router.push('/search')
    }
    return {
      load,
      activeIndex,
      handleTabClick,
      noteList,
      getNoteList,
      changeLiked,
      loadMore,
      mainDiv,
      handleSearch
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../style/viriables.scss';
  .header{
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
    //flex-wrap: nowrap;
    width: calc(100vw - 1rem);
    margin-left: 0.5rem;
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
  a{
    text-decoration: none;
  }
  .main{
    position: relative;
    top: .5rem;
    height: calc(100vh - 1rem);
    overflow: auto;
    background: $content-bgColor;
  }
  .noMore{
    width: 100%;
    height: .4rem;
    line-height: .4rem;
  }
</style>
