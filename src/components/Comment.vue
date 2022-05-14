<template>
  <div class="wrapper">
    <div class="comment__wrapper">
      <div class="avatar">
        <el-avatar style="--el-avatar-size: .35rem" :src="comment.user.avatar" @click="handleAvatarClick(comment.user.id)" />
      </div>
      <div class="middle">
        <span class="nickname">{{comment.user.nickname}}</span>
        <p class="text" @click="handleTextClick(comment.id, comment.user.id, comment.id)">{{comment.commentText}}</p>
        <span class="commentTime">{{comment.commentTime}}</span>
      </div>
      <div class="like">
        <span
          :class="{'iconfont': true, 'like__icon': true, 'like__icon--active': comment.liked}"
          v-html="icon"
          @click="handleCommentLikeClick(comment.id, comment.user.id, comment.liked)"
        >
        </span>
        <span class="like__count">{{comment.likeCount}}</span>
      </div>
    </div>
    <div class="reply__wrapper">
      <div
        class="reply__item"
        v-for="(item, index) in comment.reply"
        :key="item.id"
        v-show="tips === '收起' ? true : (index < 2)"
      >
        <div class="reply__avatar">
          <el-avatar style="--el-avatar-size: .3rem" :src="item?.user.avatar" @click="handleAvatarClick(item?.user.id)" />
        </div>
        <div class="reply__middle">
          <span class="user__nickname">{{item?.user.nickname}}</span>
          <p @click="handleTextClick(comment.id, item.user.id, item.id)"><span class="reply__tip" v-if="item?.target != null">回复 <span class="target__nickname">{{item?.target.nickname}}</span>: </span><span class="text">{{item?.replyText}}</span></p>
          <span class="replyTime">{{item?.replyTime}}</span>
        </div>
        <div class="reply__like">
          <span
            :class="{'iconfont': true, 'like__icon': true, 'like__icon--active': item?.liked}"
            v-html="replyIcon[index]"
            @click="handleReplyLikeClick(comment.id, item?.id, item?.user.id, index, item?.liked)"
          >
          </span>
          <span class="like__count">{{item?.likeCount}}</span>
        </div>
      </div>
      <span class="expand__tips" v-show="comment.reply?.length > 2" v-html="tips" @click="handleExpandClick"></span>
    </div>

    <el-drawer v-model="drawer" direction="btt" :with-header="false" size="15%">
      <div class="operation__drawer">
        <div class="drawer__item" @click="handleReplyClick">回复</div>
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { post } from '../utils/request'
import { handleCountShow } from '../effects/useHandleCountEffect'

// 初始化数据的逻辑
const useDataEffect = (comment, replyIcon) => {
  const handleDataInit = () => {
    if (comment.reply) {
      comment.reply.forEach((item, index) => {
        if (item.liked) {
          replyIcon.value[index] = '&#xe6aa;'
        } else {
          replyIcon.value[index] = '&#xe6a9;'
        }
      })
    }
    // 格式化评论的点赞数
    const likeCount = handleCountShow(comment.likeCount)
    comment.likeCount = likeCount
    // 格式化回复的点赞数
    if (comment.reply) {
      comment.reply.forEach((item) => {
        const likeCount = handleCountShow(item.likeCount)
        item.likeCount = likeCount
      })
    }
  }
  return {
    handleDataInit
  }
}

// 点赞及取消逻辑
const useLikeEffect = (icon, replyIcon, noteId, emit) => {
  // 处理点赞评论的事件
  const handleCommentLikeClick = async (commentId, commentUserId, liked) => {
    try {
      const formData = new FormData()
      formData.append('entityType', 2)
      formData.append('entityId', commentId)
      formData.append('entityUserId', commentUserId)
      formData.append('noteId', noteId)
      // 发送修改点赞状态的请求
      const result = await post('/note/changeLiked', formData)
      if (result.code === 200) {
        if (!liked) {
          icon.value = '&#xe6aa;'
          emit('changeCommentLiked', commentId, null, true, 1)
        } else {
          icon.value = '&#xe6a9;'
          emit('changeCommentLiked', commentId, null, false, -1)
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

  // 处理点赞回复的事件
  const handleReplyLikeClick = async (commentId, replyId, replyUserId, index, liked) => {
    try {
      const formData = new FormData()
      formData.append('entityType', 2)
      formData.append('entityId', replyId)
      formData.append('entityUserId', replyUserId)
      formData.append('noteId', noteId)
      // 发送修改点赞状态的请求
      const result = await post('/note/changeLiked', formData)
      if (result.code === 200) {
        if (!liked) {
          // liked = true
          replyIcon.value[index] = '&#xe6aa;'
          emit('changeCommentLiked', commentId, replyId, true, 1)
        } else {
          // liked = false
          replyIcon.value[index] = '&#xe6a9;'
          emit('changeCommentLiked', commentId, replyId, false, -1)
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
    handleCommentLikeClick,
    handleReplyLikeClick
  }
}

const useUserAvatarEffect = () => {
  const router = useRouter()
  const handleAvatarClick = (userId) => {
    router.push(`/user/${userId}`)
  }
  return {
    handleAvatarClick
  }
}

export default {
  name: 'Comment',
  props: ['comment', 'noteId', 'holderId', 'refresh'],
  setup (props, context) {
    console.log(props.comment)
    const icon = props.comment.liked ? ref('&#xe6aa;') : ref('&#xe6a9;') // 评论的点赞图标
    const replyIcon = ref([]) // 回复列表的点赞图标

    const { handleDataInit } = useDataEffect(props.comment, replyIcon)
    const { handleCommentLikeClick, handleReplyLikeClick } = useLikeEffect(icon, replyIcon, props.noteId, context.emit)
    handleDataInit()

    const tips = ref(`展开${props.comment.reply?.length}条回复`)
    const handleExpandClick = () => {
      if (tips.value === '收起') {
        tips.value = `展开${props.comment.reply?.length}条回复`
      } else {
        tips.value = '收起'
      }
    }

    const { handleAvatarClick } = useUserAvatarEffect()

    const drawer = ref(false) // 控制el-drawer显示
    const entityId = ref('') // 实体id(笔记或首层评论的id)
    const targetId = ref('') // 目标用户id
    const targetCommentId = ref('') // 目标评论id
    // 回复操作
    const handleReplyClick = () => {
      drawer.value = false // 关闭el-drawer抽屉
      context.emit('handleInputComment') // 唤起输入框
      context.emit('updateData', 2, entityId.value, targetId.value) // 传给父组件需要的数据
    }
    // 点击评论触发的事件
    const handleTextClick = (entityId1, targetId1, targetCommentId1) => {
      console.log('进行回复', entityId)
      if (targetId1 === props.holderId) { // 本人发的评论
        drawer.value = true
      } else { // 非本人的评论
        handleReplyClick()
      }
      entityId.value = entityId1
      targetId.value = targetId1
      targetCommentId.value = targetCommentId1
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
        formData.append('commentId', targetCommentId.value)
        const result = await post('/note/deleteComment', formData)
        if (result.code === 200) {
          props.refresh() // 刷新
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
      icon,
      replyIcon,
      handleCommentLikeClick,
      handleReplyLikeClick,
      tips,
      handleExpandClick,
      handleAvatarClick,
      drawer,
      handleTextClick,
      handleReplyClick,
      handleDeleteClick,
      handleCancelClick,
      deleteDialogVisible,
      handleCancel,
      handleDelete
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../style/viriables.scss';
  .wrapper{
    padding-bottom: .05rem;
    border-bottom: .01rem solid $content-bgColor;
    margin-top: .1rem;
    .comment__wrapper{
      display: flex;
      .avatar{
        width: .35rem;
        margin-right: .1rem;
        :deep(.el-avatar){
          top: .03rem;
        }
      }
      .middle{
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        text-align: left;
        .nickname{
          color: $nicknameColor;
          font-size: .14rem;
        }
        .text{
          margin: 0;
          font-size: .14rem;
          color: $textColor;
        }
        .commentTime{
          line-height: .14rem;
          font-size: .12rem;
          color: $darkgray;
        }
      }
      .like{
        width: .4rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        &__icon{
          height: .22rem;
          font-size: .2rem;
          color: $weakColor;
          &--active{
            color: var(--el-color-danger);
          }
        }
        &__count{
          font-size: .14rem;
          color: $weakColor;
        }
      }
    }
    .reply__wrapper{
      margin: .1rem 0 0 .45rem;
      border-radius: .05rem;
      background: $content-bgColor;
      text-align: left;
      .reply__item{
        display: flex;
        padding-bottom: .05rem;
        .reply__avatar{
          width: .3rem;
          margin: 0 0.05rem 0 .02rem;
          :deep(.el-avatar){
            top: .05rem;
          }
        }
        .reply__middle{
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          text-align: left;
          .user__nickname{
            color: $nicknameColor;
            font-size: .14rem;
          }
          p{
            margin: 0;
            .reply__tip{
              font-size: .14rem;
              color: $textColor;
            }
            .target__nickname{
              color: $themeColor;
              font-size: .14rem;
            }
            .text{
              font-size: .14rem;
              color: $textColor;
            }
          }
          .replyTime{
            line-height: .14rem;
            font-size: .12rem;
            color: $darkgray;
          }
        }
        .reply__like{
          width: .4rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          .like__icon{
            height: .22rem;
            font-size: .2rem;
            color: $weakColor;
            &--active{
              color: var(--el-color-danger);
            }
          }
          .like__count{
            font-size: .14rem;
            color: $weakColor;
          }
        }
      }
      .expand__tips{
        position: relative;
        left: .38rem;
        font-size: .12rem;
        color: $themeColor;
      }
    }
  }
  :deep(.el-overlay){
    background-color: transparent !important;
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
