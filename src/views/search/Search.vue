<template>
  <loading v-if="load" />
  <div class="search__wrapper">
    <div class="back">
      <a class="iconfont back__icon" @click="handleBackClick">&#xe600;</a>
    </div>
    <div class="search__input">
      <el-input
        v-model="searchText"
        placeholder="搜索笔记/用户"
        class="input-with-select"
        @input="inputText"
        @keyup.enter="handleSearchClick"
      >
        <template #prepend>
          <el-select v-model="type">
            <el-option label="全部" value="全部"/>
            <el-option label="美食笔记" value="美食笔记" />
            <el-option label="探店笔记" value="探店笔记" />
            <el-option label="用户" value="用户"/>
          </el-select>
        </template>
      </el-input>
    </div>
    <span :class="{'hasText': hasText, 'search__btn': true}" @click="handleSearchClick">搜索</span>
  </div>
  <div class="main" ref="mainDiv">
    <el-empty description="没有搜索到相关内容" v-if="isEmpty" />
    <div v-else-if="noteList.length > 0">
      <div class="wrapper">
        <div
          v-for="item in noteList"
          :key="item.note.id"
          class="content__wrapper"
        >
          <contents :noteData="item" @changeLiked="changeLiked" />
        </div>
      </div>
      <load-more v-if="loadMore" />
      <div class="noMore" v-show="!loadMore && noMore">哎呀 已经到底啦~</div>
    </div>
    <div v-else>
      <div class="list__wrapper">
        <div
          v-for="item in userList"
          :key="item.id"
          class="user__wrapper"
          @click="handleUserClick(item.id)"
        >
          <div class="avatar">
            <el-avatar style="--el-avatar-size: .4rem;" :src="item.avatar" />
          </div>
          <div class="nickname__wrapper">
            <span class="nickname">{{ item.nickname }}</span>
            <!-- 0-未知 1-男 2-女 -->
            <span class="iconfont unknown__icon" style="font-size: .2rem" v-if="item.sex === 0">&#xfb29;</span>
            <span class="iconfont male__icon" style="font-size: .15rem" v-else-if="item.sex === 1">&#xe643;</span>
            <span class="iconfont female__icon" style="font-size: .15rem" v-else >&#xe647;</span>
          </div>
          <div v-if="item.id != holderId">
            <!-- 当前持有者是否关注用户 -->
            <el-button
              round
              class="follow__button"
              style="width: .6rem"
              @click.stop="handleFollowClick(item, false)"
              v-if="item.hasFollowed"
            >
              已关注
            </el-button>
            <el-button
              type="primary"
              round
              class="follow__button"
              style="width: .6rem"
              @click.stop="handleFollowClick(item, true)"
              v-else
            >
              + 关注
            </el-button>
          </div>
        </div>
      </div>
      <div class="noMore" v-show="userList.length">哎呀 已经到底啦~</div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { post, get } from '../../utils/request'
import { ElMessage } from 'element-plus'
import { handleCountShow } from '../../effects/useHandleCountEffect'
import { useBackRouterEffect } from '../../effects/useBackRouterEffect'
import Loading from '../../components/Loading.vue'
import Contents from '../home/Contents.vue'
import LoadMore from '../../components/loadMore.vue'
import { useRouter } from 'vue-router'

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

    const currentPage = ref(0) // 当前加载页
    const noMore = ref(false) // 没有更多内容
    const noteList = ref([]) // 搜索出来的笔记
    const load = ref(false) // 加载中

    // 获取笔记列表
    const getNoteList = async (refresh) => {
      if (refresh) {
        currentPage.value = 0
      }
      try {
        const formData = new FormData()
        formData.append('keyword', searchText.value)
        if (type.value === '全部') {
          formData.append('type', 0)
        } else if (type.value === '美食笔记') {
          formData.append('type', 1)
        } else if (type.value === '探店笔记') {
          formData.append('type', 2)
        }
        formData.append('current', currentPage.value)
        formData.append('limit', 10)
        const result = await post('/note/search', formData)
        if (result.code === 200 && result.data) {
          const list = result.data
          list.forEach((column) => {
            const likeCount = handleCountShow(column.note.likeCount) // 格式化点赞数量
            column.note.likeCount = likeCount
          })
          console.log(list)
          if (list.length < 10) { // 新加载的笔记数量小于每次加载限制数量，表示已经全部加载完
            noMore.value = true
          } else { // 还有笔记
            noMore.value = false
            currentPage.value += 1
          }
          // 刷新笔记列表
          if (refresh) {
            noteList.value = [...list]
            load.value = false // 获取数据成功，关闭loading效果
          } else { // 不刷新，加载更多笔记
            noteList.value.push(...list)
          }
          console.log(noteList.value)
          console.log('noMore', noMore.value)
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

    const holderId = ref('') // 持有者id
    const getHolderId = async () => {
      try {
        const result = await get('/user/getHolderUserId')
        if (result.code === 200 && result.data) {
          holderId.value = result.data
          console.log('持有者id', holderId.value)
        } else {
          ElMessage({
            showClose: true,
            message: '错误',
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

    const userList = ref([]) // 搜索出来的用户
    // 获取用户列表
    const getUserList = async () => {
      try {
        const formData = new FormData()
        formData.append('key', searchText.value)
        const result = await post('/user/searchByNickname', formData)
        if (result.code === 200 && result.data) {
          userList.value = result.data
          load.value = false // 获取数据成功，关闭loading效果
          console.log('搜索到的用户', userList.value)
        } else {
          ElMessage({
            showClose: true,
            message: '错误',
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

    // 节流函数
    let pre = 0 // 前一次任务触发时间
    const throttle = (func, delay) => {
      const now = new Date() // 当前任务触发时间
      if (now - pre > delay) { // 间隔时间超过设定的时间，执行任务，更新pre
        console.log('在节流函数中,执行获取笔记方法')
        func()
        pre = now
      }
    }

    const isEmpty = ref(false) // 没有匹配内容
    // 点击进行搜索
    const handleSearchClick = async () => {
      // 没有输入内容或内容为空时，不可搜索
      if (searchText.value === '') {
        return
      }
      load.value = true // 开启loading动画效果
      if (type.value === '用户') {
        getHolderId()
        await getUserList()
        if (!userList.value.length) {
          isEmpty.value = true
        } else {
          isEmpty.value = false
        }
        noteList.value = [] // 清空笔记列表
      } else {
        await getNoteList(true)
        // 笔记列表为空，设置空状态；否则展示笔记列表
        console.log(noteList.value.length)
        if (!noteList.value.length) {
          isEmpty.value = true
        } else {
          isEmpty.value = false
        }
        userList.value = [] // 清空用户列表
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
      // 判断是否滑到底部
      if (scrollTop + clientHeight >= scrollHeight - 1) {
        console.log('滑到底部了')
        if (!noMore.value) { // 未加载完
          loadMore.value = true
          console.log('还有笔记，loadMore', loadMore.value)
          throttle(() => getNoteList(false), 2000) // 加载更多笔记
        } else { // 全部加载完了
          loadMore.value = false
          console.log('加载完了，loadMore', loadMore.value)
        }
      }
    }

    // 进入用户资料页
    const router = useRouter()
    const handleUserClick = (userId) => {
      router.push(`/user/${userId}`)
    }

    // 关注用户
    const handleFollowClick = async (user, followed) => {
      console.log(user, followed)
      try {
        const formData = new FormData()
        formData.append('userId', user.id)
        // 发送修改关注状态的请求
        const result = await post('/user/changeFollowed', formData)
        if (result.code === 200) {
          user.hasFollowed = followed
        } else {
          ElMessage({
            showClose: true,
            message: '错误',
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
      searchText,
      type,
      handleBackClick,
      hasText,
      inputText,
      noteList,
      userList,
      holderId,
      mainDiv,
      load,
      loadMore,
      noMore,
      isEmpty,
      handleSearchClick,
      changeLiked,
      handleUserClick,
      handleFollowClick
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../style/viriables.scss';
@import '../../style/mixins.scss';
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
  .el-empty{
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
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
  .list__wrapper{
    padding: 0 .2rem;
    background: $bgColor;
  }
  .user__wrapper{
    width: 100%;
    display: flex;
    align-items: center;
    flex-wrap: nowrap;
    .avatar{
      width: .4rem;
      :deep(.el-avatar){
        position: relative;
        top: 0.02rem;
      }
    }
    .nickname__wrapper{
      width: 2.35rem;
      padding: 0 0.1rem;
      text-align: left;
      font-size: .15rem;
      .nickname{
        position: relative;
        bottom: -0.04rem;
        display: inline-block;
        margin-right: .05rem;
        max-width: 90%;
        @include ellipsis;
      }
    }
    .follow__button{
      :deep(.el-button){
        height: .32rem;
        font-size: .12rem;
      }
      :deep(.el-button.is-round){
        border-radius: .16rem;
      }
      :deep(.el-button:focus, .el-button:hover, el-button:active){
        color: var(--el-button-text-color);
        border-color: var(--el-button-border-color);
        background-color: var(--el-button-bg-color);
      }
    }
  }
</style>
