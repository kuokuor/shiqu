<template>
  <loading v-if="load" />
  <div class="wrapper">
    <div class="header">
      <div class="back">
        <a class="iconfont back__icon" @click="handleBackClick">&#xe600;</a>
      </div>
      <div class="author">
        <div class="avatar">
          <el-avatar style="--el-avatar-size: .4rem" :src="noteDetail.author?.avatar" @click="handleAvatarClick(noteDetail.author?.id)" />
        </div>
        <div class="wrapper">
          <span class="nickname">{{noteDetail.author?.nickname}}</span>
          <span class="editTime">{{noteDetail.note?.editTime}}</span>
        </div>
        <el-button v-show="noteDetail.author?.id != holderId" :type="buttonType" round @click="handleFollowClick(noteDetail.author.followed)">{{followButtonText}}</el-button>
      </div>
      <div class="more" v-if="noteDetail.author?.id === holderId">
        <a class="iconfont more__icon" @click.prevent="handleMoreClick">&#xe6ad;</a>
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
        <div v-for="item in noteDetail.comments" :key="item.id">
          <comment
            :comment="item"
            :noteId="noteDetail.note.id"
            :holderId="holderId"
            :refresh="refresh"
            @changeCommentLiked="changeCommentLiked"
            @handleInputComment="handleInputComment"
            @updateData="updateData"
          />
        </div>
      </div>
    </div>
    <div class="footer" v-show="!sendDrawer">
      <div class="comment__input">
        <input placeholder="说亿点好听的~" @focus="handleInputComment" />
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
    <el-drawer v-model="sendDrawer" direction="btt" :with-header="false" size="6%">
      <div class="input__wrapper">
        <div class="comment__input">
          <input v-model="inputValue" ref="inputRef" placeholder="说亿点好听的~" />
        </div>
        <span class="send" @click="handleSendClick">发送</span>
      </div>
    </el-drawer>

    <el-drawer v-model="drawer" direction="btt" :with-header="false" size="15%">
      <div class="operation__drawer">
        <div class="drawer__item" @click="handleEditClick">重新编辑</div>
        <div class="drawer__item" @click="handleDeleteClick">删除</div>
        <div class="drawer__item" @click="handleCancelClick">取消</div>
      </div>
    </el-drawer>

    <!-- 点击删除按钮后出现对话框 -->
    <el-dialog
      v-model="deleteDialogVisible"
      title=""
      width="70%"
      custom-class="delete__dialog"
      :show-close="false"
    >
      <span class="dialog__title">确定删除?</span>
      <template #footer>
        <div class="dialog-footer">
          <span class="cancel" @click="handleCancel">取消</span>
          <span class="delete" @click="handleDelete">删除</span>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { useBackRouterEffect } from '../../effects/useBackRouterEffect'
import { ref, onMounted, nextTick, inject } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { post, get } from '../../utils/request'
import { ElMessage } from 'element-plus'
import { handleCountShow } from '../../effects/useHandleCountEffect'
import Loading from '../../components/Loading.vue'
import Comment from '../../components/Comment.vue'

import { Navigation, Pagination, Scrollbar, A11y } from 'swiper'

import { Swiper, SwiperSlide } from 'swiper/vue/swiper-vue.js'

import 'swiper/swiper.min.css'
import 'swiper/modules/navigation/navigation.min.css'
import 'swiper/modules/pagination/pagination.min.css'
import 'swiper/modules/scrollbar/scrollbar.min.css'

import moment from 'moment'

const useInitDataEffect = (noteDetail) => {
  const load = ref(true)

  const buttonType = ref('primary') // 关注按钮样式
  const followButtonText = ref('+ 关注') // 关注按钮文字

  const likedIcon = ref('&#xe6a9;') // 点赞图标
  const collectedIcon = ref('&#xe605;') // 收藏图标

  const route = useRoute()
  const getNoteDetail = async () => {
    try {
      const result = await get(`/note/getNoteDetail/${route.params.noteId}`)
      if (result.code === 200 && result.data) {
        const detail = result.data
        // 格式化点赞数量
        const likeCount = handleCountShow(detail.note.likeCount)
        detail.note.likeCount = likeCount
        // 格式化收藏数量
        const collectCount = handleCountShow(detail.note.collectCount)
        detail.note.collectCount = collectCount
        // 统计评论回复总数量
        detail.commentCount = 0
        if (detail.comments) {
          detail.commentCount += detail.comments.length
          detail.comments.forEach(comment => {
            if (comment.reply) {
              detail.commentCount += comment.reply.length
            }
          })
        }

        const currentTime = moment()
        // 格式化评论、回复的时间
        detail.comments = detail.comments.map((comment) => {
          if (currentTime.valueOf() - moment(comment.commentTime).valueOf() < 129600000) { // 36小时内，显示xx秒/分钟/小时/天前
            comment.commentTime = moment(comment.commentTime).fromNow()
          } else if (currentTime.get('year') === moment(comment.commentTime).get('year')) { // 超过36小时，显示月日
            comment.commentTime = moment(comment.commentTime).format('MM-DD')
          } else { // 超过一年，显示年月日
            comment.commentTime = moment(comment.commentTime).format('YY-MM-DD')
          }
          comment.reply = comment.reply.map((item) => {
            if (currentTime.valueOf() - moment(item.replyTime).valueOf() < 129600000) { // 36小时内
              item.replyTime = moment(item.replyTime).fromNow()
            } else if (currentTime.get('year') === moment(item.replyTime).get('year')) { // 超过36小时，显示月日
              item.replyTime = moment(item.replyTime).format('MM-DD')
            } else { // 超过一年，显示年月日
              item.replyTime = moment(item.replyTime).format('YY-MM-DD')
            }
            return item
          })
          return comment
        })
        // 格式化笔记时间
        if (currentTime.valueOf() - moment(detail.note.editTime).valueOf() < 129600000) { // 36小时内，显示xx秒/分钟/小时/天前
          detail.note.editTime = moment(detail.note.editTime).fromNow()
        } else if (currentTime.get('year') === moment(detail.note.editTime).get('year')) { // 超过36小时，显示月日
          detail.note.editTime = moment(detail.note.editTime).format('MM-DD')
        } else { // 超过一年，显示年月日
          detail.note.editTime = moment(detail.note.editTime).format('YY-MM-DD')
        }
        noteDetail.value = detail
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
        load.value = false
        // setTimeout(() => {
        //  load.value = false
        // }, 1000)
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
    load,
    buttonType,
    followButtonText,
    likedIcon,
    collectedIcon,
    getNoteDetail
  }
}

const useFollowedEffect = (noteDetail, buttonType, followButtonText) => {
  const handleFollowClick = async (followed) => {
    try {
      const formData = new FormData()
      formData.append('userId', noteDetail.value.author.id)
      // 发送修改关注状态的请求
      const result = await post('/user/changeFollowed', formData)
      if (result.code === 200) {
        if (!followed) {
          buttonType.value = ''
          followButtonText.value = '已关注'
          noteDetail.value.author.followed = true
        } else {
          buttonType.value = 'primary'
          followButtonText.value = '+ 关注'
          noteDetail.value.author.followed = false
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
    handleFollowClick
  }
}

const useLikedEffect = (noteDetail, likedIcon) => {
  // 对笔记进行点赞取消
  const handleLikeClick = async (liked) => {
    try {
      const formData = new FormData()
      formData.append('entityType', 1)
      formData.append('entityId', noteDetail.value.note.id)
      formData.append('entityUserId', noteDetail.value.author.id)
      formData.append('noteId', noteDetail.value.note.id)
      // 发送修改点赞状态的请求
      const result = await post('/note/changeLiked', formData)
      console.log(result)
      if (result.code === 200) {
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
    handleLikeClick
  }
}

const useCollectedEffect = (noteDetail, collectedIcon) => {
  // 对笔记进行收藏取消
  const handleCollectClick = async (collected) => {
    try {
      const formData = new FormData()
      formData.append('noteId', noteDetail.value.note.id)
      // 发送修改收藏状态的请求
      const result = await post('/note/changeCollected', formData)
      if (result.code === 200) {
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
    handleCollectClick
  }
}

const useCommentEffect = (noteDetail) => {
  // 点击评论图标定位到评论区域
  const handleCommentClick = () => {
    const detailHeight = document.getElementsByClassName('detail')[0].offsetHeight // detail元素的可见高度
    const mainDiv = document.getElementsByClassName('main')[0]
    mainDiv.scrollTop = detailHeight
  }

  // 对评论或回复点赞取消
  const changeCommentLiked = (contentId, replyId, liked, count) => {
    noteDetail.value.comments = noteDetail.value.comments.map((comment) => {
      if (comment.id === contentId) {
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
  return {
    handleCommentClick,
    changeCommentLiked
  }
}

const useInputEffect = (sendDrawer, refresh) => {
  const inputRef = ref(null)
  const handleInputComment = () => {
    console.log('唤起输入框')
    sendDrawer.value = true
    console.log('正在输入', sendDrawer.value)
    nextTick(() => {
      inputRef.value.focus() // 输入框显示后，获取焦点
    })
    console.log('输入框Ref', inputRef.value)
  }

  const route = useRoute()
  const entityType = ref(1) // 实体类型（1笔记，2评论）
  const entityId = ref(route.params.noteId) // 实体id
  const targetId = ref(0) // 目标用户id
  const inputValue = ref('') // 输入的内容
  // const targetNickname = ref(null) // 目标用户昵称
  // 修改发送评论时需要传送的数据（comment组件用）
  const updateData = (entityType1, entityId1, targetId1) => {
    entityType.value = entityType1
    entityId.value = entityId1
    targetId.value = targetId1
    // targetNickname.value = targetNickname1
  }
  // 发送评论
  const handleSendClick = async () => {
    try {
      const formData = new FormData()
      formData.append('entityType', entityType.value)
      formData.append('entityId', entityId.value)
      formData.append('targetId', targetId.value)
      formData.append('content', inputValue.value)
      const result = await post('/note/sendComment', formData)
      if (result.code === 200) {
        refresh()
        /*
        // 对笔记进行评论
        if (entityType.value === 1) {
          // 获取到发送的评论，以及我的信息
          const myComment = {
            id: result.data, // 返回的评论id
            user: {
              id: holder.id,
              nickname: holder.nickname,
              avatar: holder.avatar
            },
            commentText: inputValue.value,
            liked: false,
            likeCount: 0,
            commentTime: '刚刚'
          }
          noteDetail.value.comments.unshift(myComment) // 新增一条评论
        } else { // 对评论进行回复
          // 获取到发送的评论，以及我的信息
          const myReply = {
            id: result.data, // 返回的回复id
            user: {
              id: holder.id,
              nickname: holder.nickname,
              avatar: holder.avatar
            },
            target: {
              nickname: targetNickname.value
            },
            replyText: inputValue.value,
            liked: false,
            likeCount: 0,
            replyTime: '刚刚'
          }
          noteDetail.value.comments = noteDetail.value.comments.map(comment => {
            if (comment.id === entityId.value) {
              comment.reply.unshift(myReply) // 新增一条回复
            }
            return comment
          })
          console.log(noteDetail.value.comments)
        }
        noteDetail.value.commentCount++ // 评论总数增1
        inputValue.value = '' // 清空输入框内容
        inputting.value = false // 发送完评论后收起输入框
        updateData(1, noteDetail.value.note.id, 0, null) // 重置数据
        */
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
    inputRef,
    inputValue,
    updateData,
    handleInputComment,
    handleSendClick
  }
}

export default {
  name: 'NoteDetail',
  components: {
    Loading,
    Comment,
    Swiper,
    SwiperSlide
  },
  setup () {
    const { handleBackClick } = useBackRouterEffect()

    const noteDetail = ref({}) // 笔记详情

    const { load, buttonType, followButtonText, likedIcon, collectedIcon, getNoteDetail } = useInitDataEffect(noteDetail) // 数据初始化的逻辑

    const { handleFollowClick } = useFollowedEffect(noteDetail, buttonType, followButtonText) // 关注及取消的逻辑

    const { handleLikeClick } = useLikedEffect(noteDetail, likedIcon) // 点赞及取消的逻辑

    const { handleCollectClick } = useCollectedEffect(noteDetail, collectedIcon) // 收藏及取消的逻辑

    const { handleCommentClick, changeCommentLiked } = useCommentEffect(noteDetail) // 操作评论的逻辑

    const mySwiper = ref(null)

    onMounted(() => {
      getNoteDetail()
      getHolderId()
    })

    /*
    const holder = reactive({
      id: '', // 用户id
      avatar: '', // 用户头像
      nickname: '' // 用户昵称
    })
    */
    const holderId = ref('') // 持有者id

    const getHolderId = async () => {
      try {
        const result = await get('/user/getHolderUserId')
        if (result.code === 200 && result.data) {
          holderId.value = result.data
          /*
          holder.id = result.data.id
          holder.avatar = result.data.avatar
          holder.nickname = result.data.nickname
          console.log('持有者', holder)
          */
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

    // 点击用户头像进入个人资料页
    const router = useRouter()
    const handleAvatarClick = (userId) => {
      router.push(`/user/${userId}`)
    }

    const sendDrawer = ref(false) // 控制发送评论el-drawer的显示
    const refresh = inject('reload')
    const { inputRef, inputValue, updateData, handleInputComment, handleSendClick } = useInputEffect(sendDrawer, refresh)

    const drawer = ref(false) // 控制el-drawer组件的显示
    const handleMoreClick = () => {
      drawer.value = true
    }

    const handleEditClick = () => {
      console.log('编辑')
    }

    const deleteDialogVisible = ref(false) // 控制删除对话框的显示

    // 点击el-drawer中的删除按钮
    const handleDeleteClick = () => {
      drawer.value = false // 关闭el-drawer抽屉
      deleteDialogVisible.value = true // 显示删除对话框
    }

    // 点击el-drawer中的取消按钮
    const handleCancelClick = () => {
      drawer.value = false // 关闭el-drawer抽屉
    }

    // 点击删除对话框中的取消按钮
    const handleCancel = () => {
      deleteDialogVisible.value = false // 关闭删除对话框
    }

    // 点击删除对话框中的删除按钮（确认删除）
    const handleDelete = async () => {
      try {
        const formData = new FormData()
        formData.append('noteId', noteDetail.value.note.id)
        const result = await post('/note/deleteNote', formData)
        if (result.code === 200) {
          router.push('/my') // 删除成功跳转到个人中心页
        } else {
          deleteDialogVisible.value = false // 关闭删除对话框
          ElMessage({
            showClose: true,
            message: '错误',
            type: 'error',
            center: true,
            duration: 1000
          })
        }
      } catch (e) {
        deleteDialogVisible.value = false // 关闭删除对话框
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
      handleBackClick,
      mySwiper,
      modules: [Navigation, Pagination, Scrollbar, A11y],
      holderId,
      buttonType,
      followButtonText,
      likedIcon,
      collectedIcon,
      handleLikeClick,
      handleCollectClick,
      handleCommentClick,
      handleFollowClick,
      noteDetail,
      handleAvatarClick,
      changeCommentLiked,
      sendDrawer,
      inputRef,
      handleInputComment,
      inputValue,
      updateData,
      handleSendClick,
      drawer,
      handleMoreClick,
      handleEditClick,
      deleteDialogVisible,
      handleDeleteClick,
      handleCancelClick,
      handleCancel,
      handleDelete,
      refresh
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
      .wrapper{
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        .nickname{
          line-height: .3rem;
          font-size: .17rem;
        }
        .editTime{
          line-height: .15rem;
          font-size: .12rem;
          color: $darkgray;
        }
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
        line-height: .3rem;
        padding: 0 .12rem;
        border: none;
        outline: none;
        background: none;
        font-size: .14rem;
        &::placeholder{
          font-size: .14rem;
        }
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
  :deep(.el-overlay){
    background-color: transparent !important;
  }
  .input__wrapper{
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    height: .5rem;
    padding: 0 .12rem;
    //z-index: 2;
    background: $bgColor;
    border-top: .01rem solid $content-bgColor;
    display: flex;
    align-items: center;
    .comment__input{
      width: 80%;
      line-height: .3rem;
      border-radius: .15rem;
      background: $content-bgColor;
      input{
        width: 100%;
        line-height: .3rem;
        padding: 0 .12rem;
        border: none;
        outline: none;
        background: none;
        font-size: .14rem;
        &::placeholder{
          font-size: .14rem;
        }
      }
    }
    .send{
      width: 20%;
      font-size: .14rem;
      color: $themeColor;
    }
  }
  :deep(.el-avatar){
    position: relative;
    top: .1rem;
  }
  :deep(.el-button){
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

  .operation__drawer{
    margin: -20px;
    height: 1.2rem;
  }
  .drawer__item{
    width: 100%;
    height: .4rem;
    line-height: .4rem;
    font-size: .15rem;
  }

  :deep(.delete__dialog){
    border-radius: .05rem;
    margin: 0;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    .dialog__title{
      font-size: .16rem;
    }
    .dialog-footer{
      display: flex;
      font-size: .16rem;
      .cancel{
        flex: 1;
        text-align: center;
        color: $textColor;
      }
      .delete{
        flex: 1;
        text-align: center;
        color: $themeColor;
      }
    }
  }
</style>
