<template>
  <div class="box">
    <div class="above">
      <div class="header">
        <el-row :gutter="20" class="header__wrapper">
          <el-col :span="3" :offset="21">
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
            <el-button round class="button" @click="handleEditClick">
              <span class="button__text">编辑资料</span>
            </el-button>
          </el-col>
        </el-row>
        <el-row style="margin: .08rem 0; text-align: left;">
          <el-col :span="16">
            <span class="button__text" style="font-size: .2rem; padding: 0 .1rem;">{{ userInfo.user?.nickname }}</span>
            <!-- 0-未知 1-男 2-女 -->
            <span class="iconfont unknown__icon" v-if="userInfo.user?.sex === 0">&#xfb29;</span>
            <span class="iconfont male__icon" v-else-if="userInfo.user?.sex === 1">&#xe643;</span>
            <span class="iconfont female__icon" v-else >&#xe647;</span>
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
    <docker :currentIndex="4" />
    <el-drawer v-model="followDrawer" title="followList" :with-header="false" size="75%">
      <div class="title">我的关注</div>
      <div class="list__wrapper" v-for="item in followList" :key="item.user.id">
        <div class="avatar">
          <el-avatar style="--el-avatar-size: .4rem;" :src="item.user.avatar" />
        </div>
        <div class="nickname__wrapper">
          <span class="nickname">{{ item.user.nickname }}</span>
          <!-- 0-未知 1-男 2-女 -->
          <span class="iconfont unknown__icon" style="font-size: .2rem" v-if="item.user.sex === 0">&#xfb29;</span>
          <span class="iconfont male__icon" style="font-size: .15rem" v-else-if="item.user.sex === 1">&#xe643;</span>
          <span class="iconfont female__icon" style="font-size: .15rem" v-else >&#xe647;</span>
        </div>
        <!-- 性别图标 [考虑添加] -->
        <!-- 当前持有者是否关注用户 -->
        <el-button
          round
          class="follow__button"
          style="width: .6rem"
          @click="handleFollowClick(item, false, -1)"
          v-if="item.hasFollowed"
        >
          已关注
        </el-button>
        <el-button
          type="primary"
          round
          class="follow__button"
          style="width: .6rem"
          @click="handleFollowClick(item, true, 1)"
          v-else
        >
          + 关注
        </el-button>
      </div>
    </el-drawer>
    <el-drawer v-model="fansDrawer" title="fansList" :with-header="false" size="75%">
      <div class="title">我的粉丝</div>
      <div class="list__wrapper" v-for="item in fansList" :key="item.user.id">
        <div class="avatar">
          <el-avatar style="--el-avatar-size: .4rem;" :src="item.user.avatar" />
        </div>
        <div class="nickname__wrapper">
          <span class="nickname">{{ item.user.nickname }}</span>
          <!-- 性别图标 [考虑添加] -->
          <span class="iconfont unknown__icon" style="font-size: .2rem" v-if="item.user.sex === 0">&#xfb29;</span>
          <span class="iconfont male__icon" style="font-size: .15rem" v-else-if="item.user.sex === 1">&#xe643;</span>
          <span class="iconfont female__icon" style="font-size: .15rem" v-else >&#xe647;</span>
        </div>
        <!-- 当前持有者是否关注用户 -->
        <el-button
          round
          class="follow__button"
          style="width: .6rem"
          @click="handleFollowClick(item, false, -1)"
          v-if="item.hasFollowed"
        >
          已关注
        </el-button>
        <el-button
          type="primary"
          round
          class="follow__button"
          style="width: .6rem"
          @click="handleFollowClick(item, true, 1)"
          v-else
        >
          + 关注
        </el-button>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import { get, post } from '../../utils/request'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { handleCountShow } from '../../effects/useHandleCountEffect'
import Contents from '../home/Contents'
import LoadMore from '../../components/loadMore'
import Docker from '../../components/Docker.vue'

const useHolderUserEffect = () => {
  const holderId = ref('') // 当前使用者id
  // 获取使用者id
  const getHolderId = async () => {
    try {
      const result = await get('/user/getHolderUserId')
      if (result.code === 200 && result.data) {
        holderId.value = result.data
        console.log('获取到的', holderId.value)
      } else {
        ElMessage({
          showClose: true,
          message: '还没有登录哦',
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
    holderId,
    getHolderId
  }
}

const useUserInfoEffect = (holderId) => {
  console.log('传进来的', holderId.value)
  const userInfo = ref({}) // 用户资料
  // 获取用户信息
  const getUserInfo = async () => {
    try {
      console.log('传进来的', holderId.value)
      const formData = new FormData()
      formData.append('userId', holderId.value)

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
    getUserInfo
  }
}

const useNoteListEffect = (holderId, noMore, noteList) => {
  const loading = ref(true) // 加载中

  const startCount = ref([0, 0])
  // 获取笔记列表
  const getNoteList = async (refresh) => {
    if (refresh) {
      startCount.value[0] = 0
    }
    try {
      const formData = new FormData()
      formData.append('userId', holderId.value)
      formData.append('limit', 10)
      formData.append('offset', startCount.value[0])
      formData.append('index', 2)

      const result = await post('/note/getNoteList', formData)
      if (result.code === 200 && result.data) {
        const list = result.data
        console.log(list)
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
      formData.append('userId', holderId.value)
      formData.append('limit', 10)
      formData.append('offset', startCount.value[1])

      const result = await post('/user/getCollectedNoteList', formData)
      if (result.code === 200 && result.data) {
        const list = result.data
        console.log(list)
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
  name: 'My',
  components: {
    Contents,
    LoadMore,
    Docker
  },
  setup () {
    const { holderId, getHolderId } = useHolderUserEffect() // 处理当前使用者相关逻辑

    const { userInfo, getUserInfo } = useUserInfoEffect(holderId) // 处理用户信息相关逻辑

    // 编辑资料
    const router = useRouter()
    const handleEditClick = () => {
      router.push('/editInfo')
    }

    // 关注
    const handleFollowClick = async (userData, followed, count) => {
      try {
        const formData = new FormData()
        formData.append('userId', userData.user.id)
        // 发送修改关注状态的请求
        const result = await post('/user/changeFollowed', formData)
        if (result.code === 200) {
          userData.hasFollowed = followed
          if (typeof userInfo.value.followCount === 'number') {
            userInfo.value.followCount += count
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

    const noteList = ref([[], []])

    const loadMore = ref([false, false]) // 控制加载更多图标的显示
    const noMore = ref([false, false]) // 控制没有更多组件的显示

    const { loading, getNoteList, getCollectedNoteList, throttle } = useNoteListEffect(holderId, noMore, noteList)

    onMounted(async () => {
      await getHolderId() // 获取持有者id
      getUserInfo() // 获取(持有者)用户信息
      getNoteList(true) // 加载笔记
      console.log('笔记', noteList.value)
      console.log('underRef', underRef.value)
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
      // 判断是否滑到底部
      if (scrollTop + clientHeight >= scrollHeight - 1) {
        if (!noMore.value[activeTab.value]) { // 未加载完
          loadMore.value[activeTab.value] = true
          console.log('还有笔记，loadMore', loadMore.value)
          if (activeTab.value === 0 || activeTab.value === '0') {
            throttle(() => getNoteList(false), 2000)
          } else {
            throttle(() => getCollectedNoteList(false), 2000)
          }
        } else { // 没有更多数据了
          loadMore.value[activeTab.value] = false
          console.log('加载完了，loadMore', loadMore.value)
        }
      }
    }

    return {
      holderId,
      userInfo,
      loading,
      handleEditClick,
      handleFollowClick,
      showFollow,
      showFans,
      changeLiked,
      followDrawer,
      followList,
      fansDrawer,
      fansList,
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
  .set__icon{
    font-size: .25rem;
    position: relative;
    top: -.04rem;
    right: -.08rem;
  }
  .unknown__icon {
    font-size: .22rem;
    color: #666;
  }
  .male__icon {
    font-size: .2rem;
    color: #25a0e8;
  }
  .female__icon {
    font-size: .2rem;
    color: #e93170;
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
    height: calc(65% - .5rem);
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
  .demo-tabs > .el-tabs__content {
    padding: .32rem;
    color: #6b778c;
    font-size: .32rem;
    font-weight: 600;
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
        max-width: 80%;
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
