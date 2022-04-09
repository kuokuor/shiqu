<template>
  <loading v-if="load" />
  <div class="header">
    <div class="back">
      <a class="iconfont back__icon" @click="handleBackClick">&#xe600;</a>
    </div>
    <div class="author">
      <div class="avatar">
        <el-avatar style="--el-avatar-size: .4rem" :src="noteDetail.author?.avatar" />
      </div>
      <span class="nickname">{{noteDetail.author?.nickname}}</span>
      <!-- 少一个笔记发布时间 -->
      <el-button v-show="noteDetail.author" :type="buttonType" round @click="handleFollowClick(noteDetail.author.followed)">{{followButtonText}}</el-button>
    </div>
    <div class="more">
      <a class="iconfont more__icon">&#xe6ad;</a>
    </div>
  </div>
  <div class="main">
    <div class="detail">
      <div class="imgGroup">
        <swiper
          class="swiper"
          :modules="modules"
          :slides-per-view="1"
          pagination
          ref="mySwiper"
        >
          <swiper-slide class="image__wrapper" v-for="(item, index) in noteDetail.images" :key="index">
            <img  class="image" :src="item">
          </swiper-slide>
        </swiper>
      </div>
      <div class="text">
        <div class="title">{{noteDetail.note?.title}}</div>
        <p class="content">{{noteDetail.note?.content}}</p>
      </div>
    </div>
    <div class="comments">
      <div class="comments__total">{{`共${noteDetail.commentCount}条评论`}}</div>
      <!-- 评论列表 -->
      <div v-for="item in noteDetail.comments" :key="item.user.id">
        <comment :comment="item" @changeCommentLiked="changeCommentLiked"/>
      </div>
    </div>
  </div>
  <div class="footer">
    <div class="comment__input">
      <input placeholder="说亿点好听的" @focus="handleInputComment"/>
    </div>
    <div class="like">
      <span
        :class="{'iconfont': true, 'like__icon': true, 'like__icon--active': noteDetail.note?.liked}"
        v-html="likedIcon"
        @click="handleLikeClick(noteDetail.note?.liked)"
      >
      </span>
      <span class="like__count">{{noteDetail.note?.likeCount}}</span>
    </div>
    <div class="collect">
      <span
        :class="{'iconfont': true, 'collect__icon': true, 'collect__icon--active': noteDetail.note?.collected}"
        v-html="collectedIcon"
        @click="handleCollectClick(noteDetail.note?.collected)"
      >
      </span>
      <span class="collect__count">{{noteDetail.note?.collectCount}}</span>
    </div>
    <div class="comment">
      <span class="iconfont comment__icon" @click="handleCommentClick()">&#xe8b4;</span>
      <span class="comment__count">{{noteDetail.commentCount}}</span>
    </div>
  </div>
</template>

<script>
import { useBackRouterEffect } from '../../effects/useBackRouterEffect'
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { post, get } from '../../utils/request'
import { ElMessage } from 'element-plus'
import Loading from '../../components/Loading.vue'
import Comment from '../../components/Comment.vue'

import { Navigation, Pagination, Scrollbar, A11y } from 'swiper'

import { Swiper, SwiperSlide } from 'swiper/vue/swiper-vue.js'

import 'swiper/swiper.min.css'
import 'swiper/modules/navigation/navigation.min.css'
import 'swiper/modules/pagination/pagination.min.css'
import 'swiper/modules/scrollbar/scrollbar.min.css'

export default {
  name: 'NoteDetail',
  components: {
    Loading,
    Comment,
    Swiper,
    SwiperSlide
  },
  setup () {
    const load = ref(true)
    const { handleBackClick } = useBackRouterEffect()

    const buttonType = ref('primary')
    const followButtonText = ref('+关注')

    const mySwiper = ref(null)

    const likedIcon = ref('&#xe6a9;')
    const collectedIcon = ref('&#xe605;')

    const noteDetail = ref({})
    const route = useRoute()
    const getNoteDetail = async () => {
      try {
        const result = await get(`/getNoteDetail/${route.params.id}`)
        if (result.code === 200 && result.data) {
          const detail = result.data
          console.log('笔记详情', detail)
          const likeCount = detail.note.likeCount
          if (likeCount / 10000 >= 1) {
            let format = (likeCount / 10000).toFixed(1)
            if (format > 10) {
              format = Math.floor(format)
            }
            detail.note.likeCount = `${format}万`
          }
          const collectCount = detail.note.collectCount
          if (collectCount / 10000 >= 1) {
            let format = (collectCount / 10000).toFixed(1)
            if (format > 10) {
              format = Math.floor(format)
            }
            detail.note.collectCount = `${format}万`
          }
          detail.commentCount = 0
          if (detail.comments) {
            detail.commentCount += detail.comments.length
            detail.comments.forEach(comment => {
              if (comment.reply) {
                detail.commentCount += comment.reply.length
              }
            })
          }
          noteDetail.value = detail
          console.log('最终笔记详情', noteDetail.value)
          // 初始化关注按钮状态
          if (noteDetail.value.author.followed) {
            buttonType.value = ''
            followButtonText.value = '已关注'
          }
          // 初始化点赞图标状态
          if (noteDetail.value.note.liked) {
            likedIcon.value = '&#xe6aa;'
          }
          // 初始化收藏图标状态
          if (noteDetail.value.note.collected) {
            collectedIcon.value = '&#xe64d;'
          }
          setTimeout(() => {
            load.value = false
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
    onMounted(() => {
      getNoteDetail()
    })

    const handleFollowClick = async (followed) => {
      if (!followed) {
        buttonType.value = ''
        followButtonText.value = '已关注'
        noteDetail.value.author.followed = true
        /* 暂未修改作者的粉丝数量 */
      } else {
        buttonType.value = 'primary'
        followButtonText.value = '+关注'
        noteDetail.value.author.followed = false
        /* 暂未修改作者的粉丝数量 */
      }
      try {
        // 发送修改关注状态的请求
        const result = await post('/note/changeFollowed', { noteId: noteDetail.value.author.id })
        if (result.code !== 200) {
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

    // 对笔记进行点赞取消
    const handleLikeClick = async (liked) => {
      if (!liked) {
        likedIcon.value = '&#xe6aa;'
        noteDetail.value.note.liked = true
        if (typeof noteDetail.value.note.likeCount === 'number') {
          ++noteDetail.value.note.likeCount
        }
      } else {
        likedIcon.value = '&#xe6a9;'
        noteDetail.value.note.liked = false
        if (typeof noteDetail.value.note.likeCount === 'number') {
          --noteDetail.value.note.likeCount
        }
      }
      try {
        // 发送修改点赞状态的请求
        const result = await post('/note/changeLiked', { noteId: noteDetail.value.note.id })
        if (result.code !== 200) {
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

    // 对笔记进行收藏取消
    const handleCollectClick = async (collected) => {
      if (!collected) {
        collectedIcon.value = '&#xe64d;'
        noteDetail.value.note.collected = true
        if (typeof noteDetail.value.note.collectCount === 'number') {
          ++noteDetail.value.note.collectCount
        }
      } else {
        collectedIcon.value = '&#xe605;'
        noteDetail.value.note.collected = false
        if (typeof noteDetail.value.note.collectCount === 'number') {
          --noteDetail.value.note.collectCount
        }
      }
      try {
        // 发送修改收藏状态的请求
        const result = await post('/note/changeCollected', { noteId: noteDetail.value.note.id })
        if (result.code !== 200) {
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

    const handleCommentClick = () => {
      const detailHeight = document.getElementsByClassName('detail')[0].offsetHeight
      const mainDiv = document.getElementsByClassName('main')[0]
      mainDiv.scrollTop = detailHeight
    }

    // 对评论或回复点赞取消
    const changeCommentLiked = (contentUserId, replyId, liked, count) => {
      noteDetail.value.comments = noteDetail.value.comments.map((comment) => {
        if (comment.user.id === contentUserId) {
          if (replyId) { // 对回复进行点赞取消操作
            comment.reply = comment.reply.map((item) => {
              if (item.id === replyId) {
                item.liked = liked
                if (typeof item.likeCount === 'number') {
                  item.likeCount += count
                }
              }
              return item
            })
          } else { // 对评论进行点赞取消操作
            comment.liked = liked
            if (typeof comment.likeCount === 'number') {
              comment.likeCount += count
            }
          }
        }
        return comment
      })
    }

    const handleInputComment = () => {
      console.log('唤起评论') // 输入框能跟随输入法浮动
    }
    return {
      load,
      handleBackClick,
      mySwiper,
      modules: [Navigation, Pagination, Scrollbar, A11y],
      buttonType,
      followButtonText,
      likedIcon,
      collectedIcon,
      handleLikeClick,
      handleCollectClick,
      handleCommentClick,
      handleFollowClick,
      noteDetail,
      changeCommentLiked,
      handleInputComment
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
    border-bottom: .01rem solid $content-bgColor;
    position: fixed;
    top: 0;
    z-index: 2;
    margin: 0;
    padding: 0;
    background: $bgColor;
    .back{
      width: .5rem;
      &__icon{
        color: $textColor;
      }
    }
    .author{
      flex: 1;
      line-height: .5rem;
      display: flex;
      align-items: center;
      .avatar{
        width: .4rem;
        margin: 0 .08rem;
      }
      .nickname{
        font-size: .17rem;
      }
    }
    .more{
      width: .5rem;
      &__icon{
        position: relative;
        top: .04rem;
        right: .08rem;
        font-size: .3rem;
        text-decoration: none;
        color: $textColor;
      }
    }
  }
  .main{
    position: relative;
    top: .5rem;
    height: calc(100vh - 1rem);
    overflow: auto;
    background: $bgColor;
    .detail{
      width: 100%;
      //height: 6rem; // 根据内容高度来
      padding-bottom: .15rem;
      border-bottom: .01rem solid $content-bgColor;
      .imgGroup{
        height: calc(4 / 3 * 100vw);
        .swiper{
          height: 100%;
          .image__wrapper{
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            .image{
              width: 100%;
              z-index: 1;
            }
          }
          :deep(.swiper-pagination){
            z-index: 2;
          }
        }
      }
      .text{
        padding: 0 .12rem;
        text-align: left;
        .title{
          font-size: .2rem;
        }
        .content{
          font-size: .16rem;
          margin-bottom: 0;
        }
      }
    }
    .comments{
      padding: .15rem .12rem 0 .12rem;
      &__total{
        font-size: .12rem;
        color: $weakColor;
        text-align: left;
      }
    }
  }
  .footer{
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    height: .5rem;
    padding: 0 .12rem;
    z-index: 2;
    background: $bgColor;
    border-top: .01rem solid $content-bgColor;
    display: flex;
    align-items: center;
    .comment__input{
      width: 50%;
      line-height: .3rem;
      border-radius: .15rem;
      background: $content-bgColor;
      input{
        width: 100%;
        height: .3rem;
        padding: 0 .12rem;
        border: none;
        outline: none;
        background: none;
      }
    }
    .like{
      width: .65rem;
      display: flex;
      align-items: center;
      &__icon{
        font-size: .25rem;
        color: $weakColor;
        &--active{
          color: var(--el-color-danger);
        }
      }
      &__count{
        font-size: .15rem;
        color: $weakColor;
      }
    }
    .collect{
      width: .65rem;
      display: flex;
      align-items: center;
      &__icon{
        font-size: .22rem;
        color: $weakColor;
        &--active{
          color: #ffa500;
        }
      }
      &__count{
        font-size: .15rem;
        color: $weakColor;
      }
    }
    .comment{
      width: .65rem;
      display: flex;
      align-items: center;
      &__icon{
        font-size: .23rem;
        color: $weakColor;
      }
      &__count{
        font-size: .15rem;
        color: $weakColor;
      }
    }
  }
  :deep(.el-avatar){
    position: relative;
    top: .1rem;
  }
  :deep(.el-button){
    width: .56rem;
    height: .32rem;
    font-size: .12rem;
  }
  :deep(.el-button.is-round){
    margin-left: .14rem;
    border-radius: .16rem;
  }
  :deep(.el-button:focus, .el-button:hover, el-button:active){
    color: var(--el-button-text-color);
    border-color: var(--el-button-border-color);
    background-color: var(--el-button-bg-color);
}
</style>
