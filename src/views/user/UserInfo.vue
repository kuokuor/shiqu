<template>
  <div class="box">
    <div class="above">
      <div class="header">
        <el-row :gutter="20" class="header__wrapper">
          <el-col :span="3">
            <i class="iconfont back__icon" @click="handleBackClick">&#xe600;</i>
          </el-col>
          <el-col :span="3" :offset="18">
            <i class="iconfont set__icon">&#xe65e;</i>
          </el-col>
        </el-row>
      </div>
      <div class="user__info">
        <el-row>
          <el-col :span="5">
            <el-avatar style="--el-avatar-size: .65rem; border: .03rem solid #fff;" :src="userInfo.user?.avatar" />
          </el-col>
          <el-col :span="11" :offset="8" style="text-align: center;">
            <!-- 如果是用户本人就显示[编辑资料], 否则显示[关注 私信] -->
            <el-button round class="button" @click="handleEditClick" v-if="userInfo.user?.id === holderUserId">
              <span class="button__text">编辑资料</span>
            </el-button>
            <div v-else>
              <el-button round class="button" @click="handleChatClick">
                <span class="button__text">私信</span>
              </el-button>
              <el-button round class="button" @click="handleFollowClick(userInfo, false, -1)" v-if="userInfo.followed">
                <span class="button__text" style="color: #333333b3;">已关注</span>
              </el-button>
              <el-button round class="button" @click="handleFollowClick(userInfo, true, 1)" v-else>
                <span class="button__text">+关注</span>
              </el-button>
            </div>
          </el-col>
        </el-row>
        <el-row style="margin: .08rem 0; text-align: left;">
          <el-col :span="16" style="overflow: hidden; height: 0.3rem;">
            <span class="button__text" style="display: inline-block; max-width: 77%; width: auto; font-size: .2rem; padding: 0 .1rem;">{{ userInfo.user?.nickname }}</span>
            <!-- 0-未知 1-男 2-女 -->
            <span class="iconfont unknown__icon" style="top: -0.07rem;" v-if="userInfo.user?.sex === 0">&#xfb29;</span>
            <span class="iconfont male__icon" style="top: -0.07rem;" v-else-if="userInfo.user?.sex === 1">&#xe643;</span>
            <span class="iconfont female__icon" style="top: -0.07rem;" v-else >&#xe647;</span>
            <span class="iconfont official__icon" style="top: -0.07rem; left: 0.07rem;" v-if="userInfo.user?.type === 999">&#xe608;</span>
          </el-col>
        </el-row>
        <div class="description">
          <span class="iconfont edit__icon">&#xe60e;</span><span class="button__text" style="font-size: .2rem; display: inline-block; width: 93%">{{ userInfo.user?.description }}</span>
        </div>
      </div>
      <!-- 显示被赞数量 关注数 粉丝数 -->
      <el-row class="count">
        <el-col :span="5">
          <div class="count__wrapper">
            <span class="button__text" style="font-size: .2rem;">{{ userInfo.likeCount }}</span>
            <span class="button__text">获赞</span>
          </div>
        </el-col>
        <el-col :span="5" @click="showFollow">
          <div class="count__wrapper">
            <span class="button__text" style="font-size: .2rem;">{{ userInfo.followCount }}</span>
            <span class="button__text">关注</span>
          </div>
        </el-col>
        <el-col :span="5" @click="showFans">
          <div class="count__wrapper">
            <span class="button__text" style="font-size: .2rem;">{{ userInfo.fansCount }}</span>
            <span class="button__text">粉丝</span>
          </div>
        </el-col>
      </el-row>
    </div>
    <div class="under" ref="underRef">
      <el-tabs v-model="activeTab" class="demo-tabs" @tab-click="handleTabClick">
        <el-tab-pane label="笔记" name="0">
          <load-more element-loading-background="#fff" v-if="loading" />
          <el-empty description="空空如也~" v-if="!noteList[0].length && noMore[0]"/>
          <div class="wrapper" v-else>
            <div
              v-for="item in noteList[0]"
              :key="item.note.id"
              class="content__wrapper"
            >
              <contents :noteData="item" @changeLiked="changeLiked" />
            </div>
          </div>
          <div v-if="noteList[0].length > 0">
            <load-more element-loading-background="#fff" v-if="loadMore[0]" />
            <div class="noMore" v-if="noMore[0]">哎呀 没有更多数据啦~</div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="收藏" name="1">
          <load-more element-loading-background="#fff" v-if="loading" />
          <el-empty description="空空如也~" v-if="!noteList[1].length && noMore[1]"/>
          <div class="wrapper" v-else>
            <div
              v-for="item in noteList[1]"
              :key="item.note.id"
              class="content__wrapper"
            >
              <contents :noteData="item" @changeLiked="changeLiked" />
            </div>
          </div>
          <div v-if="noteList[1].length > 0">
            <load-more element-loading-background="#fff" v-if="loadMore[1]" />
            <div class="noMore" v-if="noMore[1]">哎呀 没有更多数据啦~</div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
    <el-drawer v-model="followDrawer" title="followList" :with-header="false" size="75%">
      <div class="title" v-if="userInfo.user?.id != holderUserId">TA关注的人</div>
      <div class="title" v-else>我的关注</div>
      <div class="list__wrapper" v-for="item in followList" :key="item.user.id">
        <div class="avatar">
          <el-avatar style="--el-avatar-size: .4rem;" :src="item.user.avatar" @click="handleAvatarClick(item.user.id)" />
        </div>
        <div class="nickname__wrapper">
          <span class="nickname">{{ item.user.nickname }}</span>
          <!-- 0-未知 1-男 2-女 -->
          <span class="iconfont unknown__icon" style="font-size: .2rem" v-if="item.user.sex === 0">&#xfb29;</span>
          <span class="iconfont male__icon" style="font-size: .15rem" v-else-if="item.user.sex === 1">&#xe643;</span>
          <span class="iconfont female__icon" style="font-size: .15rem" v-else >&#xe647;</span>
          <span class="iconfont official__icon" style="left: .05rem; font-size: .18rem;" v-if="item.user.type === 999">&#xe608;</span>
        </div>
        <div v-if="item.user.id != holderUserId">
          <!-- 当前持有者是否关注用户 -->
          <el-button
            round
            class="follow__button"
            style="width: .6rem"
            @click="handleFollowClick(item, false, userInfo.user?.id === holderUserId ? -1 : undefined)"
            v-if="item.hasFollowed"
          >
            已关注
          </el-button>
          <el-button
            type="primary"
            round
            class="follow__button"
            style="width: .6rem"
            @click="handleFollowClick(item, true, userInfo.user?.id === holderUserId ? 1 : undefined)"
            v-else
          >
            + 关注
          </el-button>
        </div>
      </div>
    </el-drawer>
    <el-drawer v-model="fansDrawer" title="fansList" :with-header="false" size="75%">
      <div class="title" v-if="userInfo.user?.id != holderUserId">关注TA的人</div>
      <div class="title" v-else>我的粉丝</div>
      <div class="list__wrapper" v-for="item in fansList" :key="item.user.id">
        <div class="avatar">
          <el-avatar style="--el-avatar-size: .4rem;" :src="item.user.avatar" @click="handleAvatarClick(item.user.id)" />
        </div>
        <div class="nickname__wrapper">
          <span class="nickname">{{ item.user.nickname }}</span>
          <!-- 性别图标 [考虑添加] -->
          <span class="iconfont unknown__icon" style="font-size: .2rem" v-if="item.user.sex === 0">&#xfb29;</span>
          <span class="iconfont male__icon" style="font-size: .15rem" v-else-if="item.user.sex === 1">&#xe643;</span>
          <span class="iconfont female__icon" style="font-size: .15rem" v-else >&#xe647;</span>
          <span class="iconfont official__icon" style="left: .05rem; font-size: .18rem;" v-if="item.user.type === 999">&#xe608;</span>
        </div>
        <div v-if="item.user.id != holderUserId">
          <!-- 当前持有者是否关注用户 -->
          <el-button
            round
            class="follow__button"
            style="width: .6rem"
            @click="handleFollowClick(item, false, userInfo.user?.id === holderUserId ? -1 : undefined)"
            v-if="item.hasFollowed"
          >
            已关注
          </el-button>
          <el-button
            type="primary"
            round
            class="follow__button"
            style="width: .6rem"
            @click="handleFollowClick(item, true, userInfo.user?.id === holderUserId ? 1 : undefined)"
            v-else
          >
            + 关注
          </el-button>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import { get, post } from '../../utils/request'
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useBackRouterEffect } from '../../effects/useBackRouterEffect'
import { handleCountShow } from '../../effects/useHandleCountEffect'
import Contents from '../home/Contents'
import LoadMore from '../../components/loadMore'

const useHolderUserEffect = () => {
  const holderUserId = ref('') // 当前使用者id
  // 获取使用者id
  const getHolderUserId = async () => {
    try {
      const result = await get('/user/getHolderUserId')
      if (result.code === 200) {
        holderUserId.value = result.data
        console.log(holderUserId.value)
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
    holderUserId,
    getHolderUserId
  }
}

const useUserInfoEffect = () => {
  const userInfo = ref({}) // 用户资料
  // 获取用户信息
  const route = useRoute()
  const getUserInfo = async () => {
    try {
      const formData = new FormData()
      formData.append('userId', route.params.userId)
      const result = await post('/user/getUserInfo', formData)
      if (result.code === 200 && result.data) {
        const userData = result.data
        userData.likeCount = handleCountShow(userData.likeCount)
        userData.followCount = handleCountShow(userData.followCount)
        userData.fansCount = handleCountShow(userData.fansCount)
        userInfo.value = userData
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
    userInfo,
    route,
    getUserInfo
  }
}

const useNoteListEffect = (route, noMore, noteList) => {
  const loading = ref(true) // 加载中

  const startCount = ref([0, 0])
  // 获取笔记列表
  const getNoteList = async (refresh) => {
    if (refresh) {
      startCount.value[0] = 0
    }
    try {
      const formData = new FormData()
      formData.append('userId', route.params.userId)
      formData.append('limit', 10)
      formData.append('offset', startCount.value[0])
      formData.append('index', 2)

      const result = await post('/note/getNoteList', formData)
      if (result.code === 200 && result.data) {
        const list = result.data
        list.forEach((column) => {
          const likeCount = handleCountShow(column.note.likeCount) // 格式化点赞数量
          column.note.likeCount = likeCount
        })
        if (list.length < 10) { // 新加载的笔记数量小于每次加载限制数量，表示已经全部加载完
          noMore.value[0] = true
        } else { // 还有笔记
          noMore.value[0] = false
          startCount.value[0] += list.length
        }
        // 刷新笔记列表
        if (refresh) {
          noteList.value[0] = [...list]
        } else { // 不刷新，加载更多笔记
          noteList.value[0].push(...list)
        }
        loading.value = false // 关闭加载组件
        console.log('笔记列表', noteList.value[0])
        console.log('noMore', noMore.value[0])
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

  // 获取收藏列表
  const getCollectedNoteList = async (refresh) => {
    if (refresh) {
      startCount.value[1] = 0
    }
    try {
      const formData = new FormData()
      formData.append('userId', route.params.userId)
      formData.append('limit', 10)
      formData.append('offset', startCount.value[1])
      const result = await post('/user/getCollectedNoteList', formData)
      if (result.code === 200 && result.data) {
        const list = result.data
        list.forEach((column) => {
          const likeCount = handleCountShow(column.note.likeCount) // 格式化点赞数量
          column.note.likeCount = likeCount
        })
        if (list.length < 10) { // 新加载的笔记数量小于每次加载限制数量，表示已经全部加载完
          noMore.value[1] = true
        } else { // 还有笔记
          noMore.value[1] = false
          startCount.value[1] += list.length
        }
        // 刷新笔记列表
        if (refresh) {
          noteList.value[1] = [...list]
        } else { // 不刷新，加载更多笔记
          noteList.value[1].push(...list)
        }
        loading.value = false // 关闭加载组件
        console.log('收藏列表', noteList.value[1])
        console.log('noMore', noMore.value[1])
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

  return {
    loading,
    getNoteList,
    getCollectedNoteList,
    throttle
  }
}

export default {
  name: 'UserInfo',
  components: {
    Contents,
    LoadMore
  },
  setup () {
    const { holderUserId, getHolderUserId } = useHolderUserEffect() // 处理当前使用者相关逻辑

    const { userInfo, route, getUserInfo } = useUserInfoEffect() // 处理用户信息相关逻辑

    const { handleBackClick } = useBackRouterEffect() // 返回上一页

    // 私信
    const handleChatClick = () => {
      if (holderUserId.value === null) {
        ElMessage({
          showClose: true,
          message: '暂未登录，请登录!',
          type: 'error',
          center: true,
          duration: 1000
        })
      } else {
        router.push(`/chat/${route.params.userId}`)
      }
    }

    // 编辑资料
    const router = useRouter()
    const handleEditClick = () => {
      router.push('/editInfo')
    }

    // 关注
    const handleFollowClick = async (userData, followed, count) => {
      console.log(userData, followed, count)
      try {
        const formData = new FormData()
        formData.append('userId', userData.user.id)
        // 发送修改关注状态的请求
        const result = await post('/user/changeFollowed', formData)
        if (result.code === 200) {
          // 判断当前用户是否为持有者，如果是，则修改关注数
          if (userInfo.value.user.id === holderUserId.value) {
            userData.hasFollowed = followed
            if (typeof userInfo.value.followCount === 'number') {
              userInfo.value.followCount += count
            }
          } else { // 不是持有者
            if (count !== undefined) { // 对当前用户进行(取消)关注
              userData.followed = followed
              // 更新当前用户的粉丝数
              if (typeof userData.fansCount === 'number') {
                userData.fansCount += count
              }
            } else { // 对当前用户的关注/粉丝列表中的用户进行(取消)关注
              userData.hasFollowed = followed
            }
          }
        } else if (result.code === 401) {
          ElMessage({
            showClose: true,
            message: '暂未登录，请登录!',
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

    const followDrawer = ref(false)
    const followList = ref([])
    const showFollow = async () => {
      console.log('显示关注列表')
      followDrawer.value = true
      try {
        const formData = new FormData()
        formData.append('userId', userInfo.value.user.id)
        const result = await post('/user/getFollowList', formData)
        if (result.code === 200) {
          console.log('关注列表', result.data)
          followList.value = result.data
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

    const fansDrawer = ref(false)
    const fansList = ref([])
    const showFans = async () => {
      console.log('显示粉丝列表')
      fansDrawer.value = true
      try {
        const formData = new FormData()
        formData.append('userId', userInfo.value.user.id)
        const result = await post('/user/getFansList', formData)
        if (result.code === 200) {
          console.log('粉丝列表', result.data)
          fansList.value = result.data
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

    const handleAvatarClick = (userId) => {
      router.push(`/user/${userId}`)
    }

    const noteList = ref([[], []])

    const loadMore = ref([false, false]) // 控制加载更多图标的显示
    const noMore = ref([false, false]) // 控制没有更多组件的显示

    const { loading, getNoteList, getCollectedNoteList, throttle } = useNoteListEffect(route, noMore, noteList)

    onMounted(() => {
      getHolderUserId()
      getUserInfo()
      getNoteList(true) // 进入用户资料，自动加载笔记
      underRef.value.addEventListener('scroll', scrollToBottom)
    })

    // 点赞与取消
    const changeLiked = (id, liked, count) => {
      noteList.value[activeTab.value] = noteList.value[activeTab.value].map((noteData) => {
        if (noteData.note.id === id) {
          noteData.note.liked = liked
          if (typeof noteData.note.likeCount === 'number') {
            noteData.note.likeCount += count
          }
        }
        return noteData
      })
    }

    // 当前选择的模块
    const activeTab = ref(0)
    // 切换模块
    const handleTabClick = (tab) => {
      console.log('tab值', tab.index)
      if (tab.index === '0') {
        getNoteList(true)
        console.log('笔记列表', noteList.value[0])
      } else {
        getCollectedNoteList(true)
        console.log('收藏列表', noteList.value[1])
      }
      console.log('总列表', noteList.value)
    }

    const underRef = ref(null)
    const scrollToBottom = () => {
      const scrollTop = underRef.value.scrollTop
      const scrollHeight = underRef.value.scrollHeight
      const clientHeight = underRef.value.clientHeight
      // 判断是否滑到底部（还要判断当前笔记列表中有无内容，有内容才能加载更多）
      if (scrollTop + clientHeight >= scrollHeight - 1 && noteList.value[activeTab.value].length) {
        if (!noMore.value[activeTab.value]) { // 未加载完
          loadMore.value[activeTab.value] = true
          console.log('还有笔记，loadMore', loadMore.value)
          if (activeTab.value === 0 || activeTab.value === '0') {
            throttle(() => getNoteList(false), 3000)
          } else {
            throttle(() => getCollectedNoteList(false), 3000)
          }
        } else { // 没有更多数据了
          loadMore.value[activeTab.value] = false
          console.log('加载完了，loadMore', loadMore.value)
        }
      }
    }

    return {
      holderUserId,
      userInfo,
      loading,
      handleBackClick,
      handleChatClick,
      handleEditClick,
      handleFollowClick,
      showFollow,
      showFans,
      changeLiked,
      followDrawer,
      followList,
      fansDrawer,
      fansList,
      handleAvatarClick,
      noteList,
      activeTab,
      loadMore,
      noMore,
      underRef,
      handleTabClick
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../style/viriables.scss';
@import '../../style/mixins.scss';
  .box {
    width:100vw;
    height:100vh;
  }
  .above {
    height: 35%;
    padding: .1rem;
    background: url('../../assets/user-bgImg.jpg') no-repeat, linear-gradient(rgba(255,255,255,0.1), rgba(0,0,0,0.4));
    background-size: cover;
    background-blend-mode: color; // 将背景色和背景图片混合
    position: relative;
    .header {
      height: 15%;
      &__wrapper {
        text-align: center;
        margin: 0 !important;
      }
    }
    .user__info{
      margin-top: .25rem;
      .description{
        text-align: left;
        padding: 0 .15rem;
        line-height: .2rem;
        .edit__icon{
          font-size: .2rem;
          color: $bgColor;
        }
      }
    }
  }
  .back__icon{
    top: -.04rem;
    left: -.1rem;
  }
  .set__icon{
    font-size: .25rem;
    position: relative;
    top: -.04rem;
    right: -.08rem;
  }
  .unknown__icon {
    position: relative;
    font-size: .22rem;
    color: #666;
  }
  .male__icon {
    position: relative;
    font-size: .2rem;
    color: #25a0e8;
  }
  .female__icon {
    position: relative;
    font-size: .2rem;
    color: #e93170;
  }
  .official__icon{
    position: relative;
    font-size: .2rem;
    color: #ffb400;
  }
  .button {
    margin-top: .2rem;
    padding: .15rem !important;
    background: #626262cf;
    &__text {
      font-family:黑体;
      font-size: .16rem;
      font-weight:bolder;
      color: white;
      @include ellipsis;
      width: 100%;
    }
  }
  .count {
    width: 100%;
    margin-top: .05rem;
    &__wrapper{
      display: flex;
      flex-direction: column;
    }
  }
  .under {
    height: 65%;
    overflow: auto;
    background: $bgColor;
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
  :deep(.el-tabs__header){
    position: fixed;
    top: 35%;
    right: 0;
    left: 0;
    z-index: 1000;
    margin: 0 0 5px;
    background: #fff;
  }
  :deep(.el-tabs__nav){
    float: none;
  }
  :deep(.el-tabs__item){
    font-size: .16rem;
  }
  :deep(.el-tabs__item:hover){
    color: $themeColor !important;
  }
  :deep(.el-tabs__item.is-active){
    color: $themeColor !important;
  }
  :deep(.el-tabs__active-bar){
    background-color: $themeColor;
  }
  :deep(.el-tabs__content){
    top: .42rem;
  }
  .title{
    line-height: .3rem;
    font-size: .18rem;
  }
  .list__wrapper{
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
      width: 1.44rem;
      padding: 0 0.1rem;
      text-align: left;
      font-size: .15rem;
      .nickname{
        position: relative;
        bottom: -0.04rem;
        display: inline-block;
        margin-right: .05rem;
        max-width: 65%;
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
