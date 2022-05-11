<template>
  <div class="header">
    <div class="back">
      <span class="iconfont back__icon" @click="handleBackClick">&#xe600;</span>
    </div>
    <span class="title">新增关注</span>
  </div>
  <div class="content__wrapper" v-loading="loading">
    <el-empty description="还没有任何通知哟~" v-if="isEmpty" />
    <div v-for="item in followNoticeList" :key="item.id" class="notice__item">
      <span class="notice__avatar">
        <el-badge is-dot :hidden="item.isUnread === false">
          <el-avatar style="--el-avatar-size: .4rem" :src="item.from.avatar" @click="handleAvatarClick(item.from.id)" />
        </el-badge>
      </span>
      <div class="notice__wrapper">
        <div class="notice__middle">
          <div>
            <span class="notice__nickname">{{ item.from.nickname }}</span>
            <span class="notice__type">关注了你</span>
          </div>
          <span class="notice__content">{{ item.from.description }}</span>
          <span class="notice__time">{{item.time}}</span>
        </div>
        <div class="notice__right">
          <span class="notice__target">{{item.followed}}</span>
        </div>
      </div>
    </div>
    <span class="noMore" v-if="followNoticeList.length">没有更多啦~</span>
  </div>
</template>

<script>
import { onMounted, ref } from 'vue'
import { get } from '../../utils/request'
import { ElMessage } from 'element-plus'
import { useBackRouterEffect } from '../../effects/useBackRouterEffect'
import moment from 'moment'
import { useRouter } from 'vue-router'

export default {
  name: 'FollowNotice',
  setup () {
    const { handleBackClick } = useBackRouterEffect()

    const followNoticeList = ref([]) // 粉丝通知列表

    const loading = ref(true) // 加载中

    const isEmpty = ref(false) // 有无通知

    // 获取粉丝通知列表
    const getFollowNoticeList = async () => {
      try {
        console.log('请求了通知')
        const result = await get('/message/getFollowNoticeList')
        if (result.code === 200 && result.data) {
          let list = result.data
          if (!list.length) {
            isEmpty.value = true
          }
          list = list.map(item => {
            const currentTime = new Date()
            const isCurrentDay = currentTime.getDay() === moment(item.time).day() // 日期是否为今天
            const isCurrentMonth = currentTime.getMonth() === moment(item.time).month() // 日期是否为本月
            const isCurrentYear = currentTime.getFullYear() === moment(item.time).year() // 日期是否为今年
            if (isCurrentDay && isCurrentMonth && isCurrentYear) { // 今天内的通知，显示时间
              item.time = moment(item.time).format('HH:mm')
            } else if (isCurrentYear) { // 今年内，显示具体月日
              item.time = moment(item.time).format('MM-DD')
            } else { // 不是本年，显示年月日
              item.time = moment(item.time).format('YY-MM-DD')
            }
            return item
          })
          console.log('格式化时间后的关注列表', list)
          followNoticeList.value = [...list]
          loading.value = false // 关闭加载
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
      getFollowNoticeList()
    })

    const router = useRouter()
    const handleAvatarClick = (userId) => {
      router.push(`/user/${userId}`)
    }

    return {
      handleBackClick,
      loading,
      isEmpty,
      followNoticeList,
      handleAvatarClick
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
    .back{
      position: absolute;
      width: .5rem;
      height: .5rem;
      &__icon{
        top: 0;
        color: $textColor;
      }
    }
    .title{
      font-size: .16rem;
      background: $bgColor;
      color: $textColor;
    }
  }
  .content__wrapper{
    height: calc(100vh - .5rem);
    position: relative;
    top: .5rem;
  }
  .el-empty{
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  .notice__item{
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
        .tips__icon{
          display: block;
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
  .noMore{
    display: inline-block;
    margin: 0.15rem 0;
    font-size: .12rem;
    color: $titleColor;
  }
</style>
