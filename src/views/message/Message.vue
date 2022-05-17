<template>
  <div class="header">消息</div>
  <!-- 未登录 -->
  <div class="main" v-if="isLogin === false">
    <div class="login__tips">
      <div class="text">登录之后才可查看消息哦</div>
      <button class="login__btn" @click="handleLoginClick">登录</button>
    </div>
    <docker :currentIndex="3" />
  </div>
  <!-- 登录了 -->
  <div class="main" v-if="isLogin === true">
    <div class="notice">
      <div class="notice__header">
        <div class="icon__wrapper">
          <span class="iconfont like__icon" @click="toLikeNotice">&#xe610;</span>
          <span>点赞</span>
          <el-badge :value="unreadLikeCount" :max="99" :hidden="unreadLikeCount === 0" />
        </div>
        <div class="icon__wrapper">
          <span class="iconfont collect__icon" @click="toCollectNotice">&#xe60b;</span>
          <span>收藏</span>
          <el-badge :value="unreadCollectCount" :max="99" :hidden="unreadCollectCount === 0" />
        </div>
        <div class="icon__wrapper">
          <span class="iconfont share__icon" @click="toCommentNotice">&#xe62c;</span>
          <span>评论和回复</span>
          <el-badge :value="unreadCommentCount" :max="99" :hidden="unreadCommentCount === 0" />
        </div>
        <div class="icon__wrapper">
          <span class="iconfont fans__icon" @click="toFansNotice">&#xe6d8;</span>
          <span>粉丝</span>
          <el-badge :value="unreadFollowCount" :max="99" :hidden="unreadFollowCount === 0" />
        </div>
      </div>
    </div>
    <div style="width: 100%; height: 8px; background-color: #dbdbdb69;"></div>
    <div class="letter__bar">聊天列表</div>
    <div class="letter">
      <el-empty description="网络一线牵，主动才有缘~" v-if="!letterList || !letterList.length" />
      <div v-for="item in letterList" :key="item.id" class="letter__item" @click="toChat(item.from.id)">
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
    <span class="noMore" v-if="letterList.length">没有更多啦~</span>
  </div>
  <docker :currentIndex="3"/>
</template>

<script>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { get } from '../../utils/request'
import { ElMessage } from 'element-plus'
import moment from 'moment'
import Docker from '../../components/Docker.vue'

export default {
  name: 'Message',
  components: {
    Docker
  },
  setup () {
    const isLogin = ref(null) // 是否登录

    // 进入登录页
    const handleLoginClick = () => {
      router.push('/registerAndLogin')
    }

    const unreadLikeCount = ref(0) // 未读点赞通知数
    const unreadCollectCount = ref(0) // 未读收藏通知数
    const unreadCommentCount = ref(0) // 未读评论回复通知数
    const unreadFollowCount = ref(0) // 未读关注通知数

    const getUnreadNoticeCount = async () => {
      try {
        const result = await get('/message/getUnreadNoticeCount') // 各类未读通知数量
        if (result.code === 200) {
          unreadLikeCount.value = result.data.like
          unreadCollectCount.value = result.data.collect
          unreadCommentCount.value = result.data.comment
          unreadFollowCount.value = result.data.follow

          isLogin.value = true // 已登录
        } else if (result.code === 401) {
          isLogin.value = false // 未登录
        }
      } catch (e) {
        console.log('获取未读通知数量出错')
      }
    }

    const router = useRouter()

    const toLikeNotice = () => {
      router.push('/likeNotice')
    }

    const toCollectNotice = () => {
      router.push('/collectNotice')
    }

    const toCommentNotice = () => {
      router.push('/commentNotice')
    }

    const toFansNotice = () => {
      router.push('/followNotice')
    }

    const letterList = ref([]) // 私信列表
    // 获取私信列表
    const getLetterList = async () => {
      try {
        console.log('请求了私信')
        const result = await get('/message/getLetterList')
        if (result.code === 200 && result.data) {
          let list = result.data
          list = list.map((item) => {
            const currentTime = moment()
            const isCurrentDay = currentTime.get('date') === moment(item.letter.lastTime).get('date') // 日期是否为今天
            const isCurrentMonth = currentTime.get('month') === moment(item.letter.lastTime).get('month') // 日期是否为本月
            const isCurrentYear = currentTime.get('year') === moment(item.letter.lastTime).get('year') // 日期是否为今年
            if (isCurrentDay && isCurrentMonth && isCurrentYear) { // 今天内的私信，显示时间
              item.letter.lastTime = moment(item.letter.lastTime).format('HH:mm')
            } else if (isCurrentYear) { // 今年内，显示具体月日
              item.letter.lastTime = moment(item.letter.lastTime).format('MM-DD')
            } else { // 不是本年，显示年月日
              item.letter.lastTime = moment(item.letter.lastTime).format('YY-MM-DD')
            }
            return item
          })
          letterList.value = [...list]
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
      getUnreadNoticeCount()
      getLetterList()
    })

    const manageIcon = ref('&#xe70c;')
    const handleManageClick = () => {
      if (manageIcon.value === '&#xe70c;') {
        manageIcon.value = '&#xe70b;' // 打开管理
      } else {
        manageIcon.value = '&#xe70c;' // 关闭管理
      }
    }

    const toChat = (targetId) => {
      router.push(`/chat/${targetId}`)
    }

    return {
      isLogin,
      handleLoginClick,
      unreadLikeCount,
      unreadCollectCount,
      unreadCommentCount,
      unreadFollowCount,
      toLikeNotice,
      toCollectNotice,
      toCommentNotice,
      toFansNotice,
      letterList,
      manageIcon,
      handleManageClick,
      toChat
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../style/viriables.scss';
@import '../../style/mixins.scss';
  .header{
    width: 100%;
    height: .5rem;
    line-height: .5rem;
    position: fixed;
    top: 0;
    z-index: 2;
    margin: 0;
    padding: 0;
    font-size: .16rem;
    border-bottom: 0.01rem solid $content-bgColor;
    background: $bgColor;
  }
  .login__tips{
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  .text{
    font-size: .14rem;
    color: $darkgray;
    letter-spacing:2px;
  }
  .login__btn{
    margin-top: .1rem;
    padding: .05rem .15rem;
    height: .3rem;
    border: none;
    border-radius: .15rem;
    color: $bgColor;
    font-size: .14rem;
    background-color: $themeColor;
  }

  .main{
    width: 100%;
    height: calc(100vh - 1rem);
    overflow: auto;
    position: relative;
    top: .5rem;
    .notice{
      height: .7rem;
      margin-bottom: .1rem;
      &__header{
        display: flex;
        align-items: center;
        font-size: .14rem;
        .icon__wrapper{
          flex: 1;
          display: flex;
          flex-direction: column;
          .like__icon{
            font-size: .35rem;
            color: #ff2f00;
          }
          .collect__icon{
            font-size: .35rem;
            color: #ffa500;
          }
          .share__icon{
            font-size: .35rem;
            color: #00ccff;
          }
          .fans__icon{
            font-size: .35rem;
            color: #17d776;
          }
        }
      }
    }
    :deep(sup) {
      position: absolute;
      top: -0.7rem;
      left: 0.55rem;
    }
    .letter__bar{
      width: 100%;
      height: .25rem;
      line-height: .25rem;
      padding-left: .15rem;
      text-align: left;
      font-size: .13rem;
      font-weight: bolder;
      border-top: 1px solid #f1f1f1;
      border-bottom: 1px solid #f1f1f1;
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
              margin-right: 0.15rem;
              max-width: 0.2rem;
              .el-badge{
                --el-badge-radius: .10rem;
                --el-badge-font-size: .12rem;
                --el-badge-padding: .06rem;
                --el-badge-size: .18rem;
              }
              :deep(sup){
                position: relative;
                top: 0;
                left: 0;
              }
            }
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
