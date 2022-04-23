<template>
  <div class="header">
    <ul class="nav">
      <li class="nav__item" @click="handleTabClick(0)">
        <el-badge :value="unreadNotice" :max="99" :hidden="unreadNotice === 0">
          <span :class="{'nav-link': true, 'active': activeIndex === 0}" :tab="activeIndex">通知</span>
        </el-badge>
        <div :class="{'line': activeIndex === 0}"></div>
      </li>
      <li class="nav__item" @click="handleTabClick(1)">
        <el-badge :value="unreadLetter" :max="99" :hidden="unreadLetter === 0">
          <span :class="{'nav-link': true, 'active': activeIndex === 1}" :tab="activeIndex">私信</span>
        </el-badge>
        <div :class="{'line': activeIndex === 1}"></div>
      </li>
      <li class="nav__item" @click="handleTabClick(2)">
        <el-badge :value="unreadOfficial" :max="99" :hidden="unreadOfficial === 0">
          <span :class="{'nav-link': true, 'active': activeIndex === 2}" :tab="activeIndex">官方</span>
        </el-badge>
        <div :class="{'line': activeIndex === 2}"></div>
      </li>
    </ul>
    <div class="manage">
      <span class="iconfont manage__icon" @click="handleManageClick" v-html="manageIcon"></span>
    </div>
  </div>
  <div class="main">
    <div class="notice" v-show="activeIndex === 0">
      <el-empty description="还没有任何通知哟~" v-if="!noticeList && !noticeList.length" />
      <div v-for="item in noticeList" :key="item.id" class="notice__item">
        <span class="notice__avatar">
          <el-badge is-dot :hidden="item.isUnread === false">
            <el-avatar style="--el-avatar-size: .4rem" :src="item.from.avatar" />
          </el-badge>
        </span>
        <div class="notice__wrapper">
          <div class="notice__middle">
            <div>
              <span class="notice__nickname">{{ item.from.nickname }}</span>
              <span class="notice__type" v-if="item.type === 0">赞了你</span>
              <span class="notice__type" v-else-if="item.type === 1">评论：</span>
              <span class="notice__type" v-else-if="item.type === 2">回复：</span>
              <span class="notice__type" v-else-if="item.type === 3">收藏了你的笔记</span>
              <span class="notice__type" v-else-if="item.type === 4">分享了你的笔记</span>
            </div>
            <span class="notice__content">{{ item.notice.content }}</span>
            <span class="notice__time">{{item.notice.time}}</span>
          </div>
          <div class="notice__right">
            <span class="notice__target">{{item.notice.target}}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="letter" v-show="activeIndex === 1">
      <el-empty description="网络一线牵，主动才有缘~" v-if="letterList && !letterList.length" />
      <div v-for="item in letterList" :key="item.id" class="letter__item">
        <span class="letter__avatar">
          <el-avatar style="--el-avatar-size: .4rem" :src="item.from.avatar" />
        </span>
        <div class="letter__right">
          <div class="right__content">
            <!-- 增加一个div用来做自适应宽度超出部分省略 -->
            <div style="flex: 1; overflow: hidden; text-align: left;">
              <span class="letter__nickname">{{ item.from.nickname }}</span>
            </div>
            <span class="letter__time">{{item.letter.lastTime}}</span>
          </div>
          <div class="right__content">
            <!-- 增加一个div用来做自适应宽度超出部分省略 -->
            <div style="flex: 1; overflow: hidden; text-align: left;">
              <span class="letter__content">{{ item.letter.lastLetter }}</span>
            </div>
            <span class="letter__unreadCount"><el-badge :value="item.letter.unreadCount" :max="99" :hidden="item.letter.unreadCount === 0" /></span>
          </div>
          <el-divider style="margin-bottom: 0; margin-top: .1rem; border-top: 1px solid #f1f1f1;" />
        </div>
      </div>
    </div>
    <div class="official" v-show="activeIndex === 2">
      <el-empty description="空空如也~" v-if="officialList && !officialList.length" />
      <div v-for="item in officialList" :key="item.id" class="official__item">
        <span class="official__avatar">
          <el-badge is-dot :hidden="item.isUnread === false">
            <el-avatar style="--el-avatar-size: .4rem" :src="item.avatar" />
          </el-badge>
        </span>
        <div class="official__right">
          <div class="title__wrapper">
            <span class="official__type" v-if="item.type === 0">【公告】</span>
            <span class="official__type" v-else-if="item.type === 1">【审核】</span>
            <span class="official__title">{{ item.title }}</span>
          </div>
          <span class="official__time">{{ item.time }}</span>
          <el-divider style="margin-bottom: 0; margin-top: .1rem; border-top: 1px solid #f1f1f1;" />
        </div>
      </div>
    </div>
    <span class="noMore">没有更多啦~</span>
  </div>
  <docker :currentIndex="3" :unreadTotal="unreadTotal"/>
</template>

<script>
import { onMounted, ref } from 'vue'
import { get } from '../../utils/request'
import { ElMessage } from 'element-plus'
import Docker from '../../components/Docker.vue'

export default {
  name: 'Message',
  components: {
    Docker
  },
  setup () {
    const activeIndex = ref(1) // 被选中的模块
    const unreadTotal = ref(0) // 未读消息总数

    const letterList = ref([]) // 私信列表
    const unreadLetter = ref(0) // 未读私信总数
    // 获取私信列表
    const getLetterList = async () => {
      try {
        console.log('请求了私信')
        const result = await get('/message/getLetterList')
        if (result.code === 200 && result.data) {
          const list = result.data
          console.log('私信列表', list)
          // 统计未读私信数量
          // unreadLetter.value = 0 // 重置
          list.forEach(item => {
            unreadLetter.value += item.letter.unreadCount
          })
          unreadTotal.value += unreadLetter.value
          letterList.value = [...list]
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

    const noticeList = ref([]) // 通知列表
    const unreadNotice = ref(0) // 未读通知总数
    // 获取通知列表
    const getNoticeList = async () => {
      try {
        console.log('请求了通知')
        const result = await get('/message/getNoticeList')
        if (result.code === 200 && result.data) {
          const list = result.data
          console.log('通知列表', list)
          // 统计未读通知数量
          // unreadNotice.value = 0
          list.forEach(item => {
            if (item.isUnread) {
              unreadNotice.value += 1
            }
          })
          unreadTotal.value += unreadNotice.value
          noticeList.value = [...list]
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

    const officialList = ref([]) // 通知列表
    const unreadOfficial = ref(0) // 未读通知总数
    // 获取私信列表
    const getOfficialList = async () => {
      try {
        console.log('请求了官方')
        const result = await get('/message/getOfficialList')
        if (result.code === 200 && result.data) {
          const list = result.data
          console.log('官方通知列表', list)
          // 统计未读官方通知数量
          // unreadOfficial.value = 0
          list.forEach(item => {
            if (item.isUnread) {
              unreadOfficial.value += 1
            }
          })
          unreadTotal.value += unreadOfficial.value
          officialList.value = [...list]
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

    onMounted(() => {
      getLetterList()
      getNoticeList()
      getOfficialList()
    })

    // 模块切换逻辑
    const handleTabClick = (index) => {
      // // 切换到通知模块
      // if (index === 0) {
      //  getNoticeList()
      // } else if (index === 1) { // 切换到私信模块
      //  getLetterList()
      // } else { // 切换到官方模块
      //  getOfficialList()
      // }
      activeIndex.value = index
    }

    const manageIcon = ref('&#xe70c;')
    const handleManageClick = () => {
      if (manageIcon.value === '&#xe70c;') {
        manageIcon.value = '&#xe70b;' // 打开管理
      } else {
        manageIcon.value = '&#xe70c;' // 关闭管理
      }
    }

    return {
      activeIndex,
      unreadTotal,
      letterList,
      unreadLetter,
      noticeList,
      unreadNotice,
      officialList,
      unreadOfficial,
      handleTabClick,
      manageIcon,
      handleManageClick
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../style/viriables.scss';
@import '../../style/mixins.scss';
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
    .manage{
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
    margin-left: .5rem;
    &__item{
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      :deep(sup){
        top: .1rem;
        right: .05rem;
      }
      .nav-link{
        line-height: .4rem;
        //margin-top: .04rem;
        padding: 0;
        font-size: .16rem;
        color: $textColor;
      }
      .active{
        font-weight: bolder;
        color: $themeColor;
        margin: 0;
      }
      .line{
        width: .2rem;
        height: .04rem;
        margin-top: -.04rem;
        background: $themeColor;
        border-radius: .05rem;
      }
    }
  }
  .main{
    width: 100%;
    height: calc(100vh - 1rem);
    overflow: auto;
    position: relative;
    top: .5rem;
    .notice{
      &__item{
        display: flex;
        padding-top: 0.1rem;
        .notice__avatar{
          margin: 0 .15rem;
          :deep(sup){
            right: .5rem;
          }
        }
        .notice__wrapper{
          flex: 1;
          display: flex;
          margin-right: .1rem;
          padding-bottom: .05rem;
          border-bottom: 1px solid $content-bgColor;
          overflow: hidden;
          .notice__middle{
            flex: 1;
            text-align: left;
            overflow: hidden;
            .notice__nickname{
              font-size: .14rem;
              color: $textColor;
              margin-right: .03rem;
            }
            .notice__type{
              font-size: .14rem;
              color: $darkgray;
            }
            .notice__content{
              margin: .02rem 0;
              font-size: .12rem;
              color: $darkgray;
              display: inline-block;
              max-width: 100%;
              @include two-ellipsis;
            }
            .notice__time{
              font-size: .12rem;
              color: $darkgray;
            }
          }
          .notice__right{
            width: .55rem;
            height: .55rem;
            margin-left: .1rem;
            color: $darkgray;
            background: $content-bgColor;
            @include three-ellipsis;
          }
        }
      }
    }
    .letter{
      &__item{
        display: flex;
        padding-top: 0.1rem;
        .letter__avatar{
          margin: 0 .15rem;
        }
        .letter__right{
          flex: 1;
          overflow: hidden;
          .right__content{
            //width: 100%;
            display: flex;
            justify-content: space-between;
            line-height: .22rem;
            height: 0.22rem;
            .letter__nickname{
              font-size: .14rem;
              color: $textColor;
              display: inline-block;
              max-width: 100%;
              @include ellipsis;
            }
            .letter__time{
              max-width: 20%;
              margin-right: .15rem;
              color: $darkgray;
            }
            .letter__content{
              font-size: .12rem;
              color: $darkgray;
              display: inline-block;
              max-width: 100%;
              @include ellipsis;
            }
            .letter__unreadCount{
              margin-right: .15rem;
              .el-badge{
                --el-badge-radius: .10rem;
                --el-badge-font-size: .12rem;
                --el-badge-padding: .06rem;
                --el-badge-size: .18rem;
              }
              :deep(sup){
                top: 0;
              }
            }
          }
        }
      }
    }
    .official{
      &__item{
        display: flex;
        padding-top: 0.1rem;
        .official__avatar{
          margin: 0 .15rem;
          :deep(sup){
            right: .5rem;
          }
        }
        .official__right{
          flex: 1;
          overflow: hidden;
          text-align: left;
          .title__wrapper{
            @include ellipsis;
            .official__type{
              font-size: .14rem;
              color: $textColor;
            }
            .official__title{
              font-size: .14rem;
              color: $darkgray;
            }
          }
          .official__time{
            font-size: .12rem;
            color: $darkgray;
          }
        }
      }
    }
    .noMore{
      display: inline-block;
      margin: 0.15rem 0;
      font-size: .12rem;
      color: $titleColor;
    }
  }
</style>
