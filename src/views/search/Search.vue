<template>
  <loading v-if="load" />
  <div class="search__wrapper">
    <div class="back">
      <a class="iconfont back__icon" @click="handleBackClick">&#xe600;</a>
    </div>
    <div class="search__input">
      <el-input
        v-model="searchText"
        placeholder="搜索笔记"
        class="input-with-select"
        @input="inputText"
        @keyup.enter="handleSearchClick"
      >
        <template #prepend>
          <el-select v-model="type">
            <el-option label="美食笔记" value="1" />
            <el-option label="探店笔记" value="2" />
            <el-option label="全部" value="0" />
          </el-select>
        </template>
      </el-input>
    </div>
    <span :class="{'hasText': hasText, 'search__btn': true}" @click="handleSearchClick">搜索</span>
  </div>
  <div class="main" ref="mainDiv">
    <el-empty description="没有搜索到相关内容" v-if="isEmpty" />
    <div v-else>
      <div class="wrapper">
        <div
          v-for="item in noteList"
          :key="item.note.id"
          class="content__wrapper"
        >
          <contents :notes="item" @changeLiked="changeLiked" />
        </div>
      </div>
      <load-more v-if="loadMore" />
      <div class="noMore" v-if="!loadMore && noMore">哎呀 已经到底啦~</div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { get } from '../../utils/request'
import { ElMessage } from 'element-plus'
import { handleCountShow } from '../../effects/useHandleCountEffect'
import { useBackRouterEffect } from '../../effects/useBackRouterEffect'
import Loading from '../../components/Loading.vue'
import Contents from '../home/Contents.vue'
import LoadMore from '../../components/loadMore.vue'

export default {
  name: 'Search',
  components: {
    Loading,
    Contents,
    LoadMore
  },
  setup () {
    const searchText = ref('') // 搜索内容
    const type = ref('全部') // 笔记类型

    const { handleBackClick } = useBackRouterEffect()

    const hasText = ref(false) // 搜索框内有无内容
    // 正在输入（用来处理搜索按钮颜色显示的逻辑）
    const inputText = () => {
      if (searchText.value !== '') {
        hasText.value = true
      } else {
        hasText.value = false
      }
    }

    const currentPage = ref(1) // 当前加载页
    const noMore = ref(false) // 没有更多内容
    const noteList = ref([]) // 搜索出来的笔记
    const load = ref(false) // 加载中

    // 获取笔记列表
    const getNoteList = async (refresh) => {
      try {
        const result = await get('/note/search', {
          keyword: searchText,
          type: type.value,
          current: currentPage.value,
          limit: 20
        })
        if (result.code === 200 && result.data) {
          const list = result.data
          list.forEach((column) => {
            const likeCount = handleCountShow(column.note.likeCount) // 格式化点赞数量
            column.note.likeCount = likeCount
          })
          // 刷新笔记列表
          if (refresh) {
            noteList.value = [...list]
            setTimeout(() => {
              load.value = false // 获取数据成功，关闭loading效果
            }, 1000)
          } else { // 不刷新，加载更多笔记
            noteList.value.push(...list)
            // 新加载的笔记数量小于每次加载限制数量，表示已经全部加载完
            if (list.length < 10) {
              noMore.value = true
            }
            currentPage.value++
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

    const isEmpty = ref(false) // 没有匹配内容
    // 点击进行搜索
    const handleSearchClick = () => {
      // 没有输入内容或内容为空时，不可搜索
      if (searchText.value === '') {
        return
      }
      load.value = true // 开启loading动画效果
      getNoteList(true)
      // 笔记列表为空，设置空状态；否则展示笔记列表
      if (!noteList.value.length) {
        isEmpty.value = true
      } else {
        isEmpty.value = false
      }
      mainDiv.value.scrollTop = 0
      mainDiv.value.addEventListener('scroll', scrollToBottom)
    }

    // 点赞与取消
    const changeLiked = (id, liked, count) => {
      noteList.value = noteList.value.map((noteData) => {
        if (noteData.note.id === id) {
          noteData.note.liked = liked
          if (typeof noteData.note.likeCount === 'number') {
            noteData.note.likeCount += count
          }
        }
        return noteData
      })
    }

    const loadMore = ref(false) // 加载更多
    const mainDiv = ref(null)
    // 滚动到底部加载更多(延时加载)
    const scrollToBottom = () => {
      const scrollTop = mainDiv.value.scrollTop
      const scrollHeight = mainDiv.value.firstChild.scrollHeight
      const clientHeight = mainDiv.value.clientHeight
      if (scrollTop + clientHeight >= scrollHeight - 1) {
        if (!noMore.value) {
          loadMore.value = true
          getNoteList(false) // 加载更多笔记
        } else {
          // 没有更多数据了
          loadMore.value = false
        }
      }
    }

    return {
      searchText,
      type,
      handleBackClick,
      hasText,
      inputText,
      noteList,
      mainDiv,
      load,
      loadMore,
      noMore,
      isEmpty,
      handleSearchClick,
      changeLiked
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../style/viriables.scss';
  .search__wrapper{
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: .5rem;
    padding: 0 .12rem;
    z-index: 2;
    background: $bgColor;
    border-top: .01rem solid $content-bgColor;
    display: flex;
    align-items: center;
    .back{
      width: .3rem;
      height: 100%;
      &__icon{
        color: $textColor;
      }
    }
    .search__input{
      width: 2.62rem;
      line-height: .3rem;
      border-radius: .15rem;
      border: .01rem solid $themeColor;
      padding: 0 .1rem;
      :deep(.el-input-group__prepend){
        box-shadow: none;
        background-color: $bgColor;
        padding: 0 .3rem 0 .2rem;
        .el-select{
          width: .7rem !important;
        }
      }
      :deep(.el-input__inner){
        box-shadow: none;
        font-size: .14rem;
        height: 0.32rem;
        padding: 0;
        line-height: .32rem;
      }
      :deep(.el-input__inner:hover){
        box-shadow: none;
      }
      :deep(.el-input__suffix){
        right: 0;
      }
    }
    .hasText{
      border-color: $themeColor !important;
      background-color: $themeColor !important;
    }
    .search__btn{
      display: inline-block;
      width: .5rem;
      height: .32rem;
      line-height: .32rem;
      margin-left: .1rem;
      border-radius: .15rem;
      font-size: .14rem;
      background: #c2dbd4;
      color: $bgColor;
    }
  }
  :deep(.el-input-group--prepend .el-input-group__prepend .el-select .el-input.is-focus .el-input__inner){
    box-shadow: none !important;
  }
  :deep(.el-input-group--prepend .el-input-group__prepend .el-select:hover .el-input__inner){
    box-shadow: none !important;
  }
  :deep(.el-input-group--prepend .el-input-group__prepend .el-select .el-input .el-input__inner:focus){
    box-shadow: none !important;
  }
  .el-select-dropdown__item{
    padding: 0 .2rem;
  }
  .el-select-dropdown__item.selected{
    color: $themeColor;
  }
  .main{
    position: relative;
    top: .5rem;
    height: calc(100vh - .5rem);
    overflow: auto;
    background: $content-bgColor;
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
  .noMore{
    width: 100%;
    height: .4rem;
    line-height: .4rem;
  }
</style>
