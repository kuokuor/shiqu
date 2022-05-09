<template>
  <el-card shadow="never" @click="toNoteDetail">
    <img
      :src="noteData.note.headerImg"
      class="image"
    />
    <div class="message">
      <div class="title">{{noteData.note.title}}</div>
      <div class="bottom">
        <div class="author">
          <div class="avatar">
            <el-avatar style="--el-avatar-size: .22rem" :src="noteData.author.avatar" />
          </div>
          <span class="nickname">{{noteData.author.nickname}}</span>
        </div>
        <div class="like">
          <span
            :class="{'iconfont': true, 'like__icon': true, 'like__icon--active': noteData.note.liked}"
            v-html="icon"
            @click.stop="handleLikeClick(noteData.note.id, noteData.note.liked)"
          >
          </span>
          <span class="like__count">{{noteData.note.likeCount}}</span>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { post } from '../../utils/request'
import { ElMessage } from 'element-plus'

// 点赞及取消逻辑
const useLikeEffect = (noteData, icon, emit) => {
  // 处理点击点赞图标的事件
  const handleLikeClick = async (noteId, liked) => {
    try {
      const formData = new FormData()
      formData.append('entityType', 1)
      formData.append('entityId', noteData.note.id)
      formData.append('entityUserId', noteData.author.id)
      formData.append('noteId', noteData.note.id)
      // 发送修改点赞状态的请求
      const result = await post('/note/changeLiked', formData)
      if (result.code === 200) {
        if (!liked) {
          liked = true
          icon.value = '&#xe6aa;'
          emit('changeLiked', noteId, true, 1)
        } else {
          liked = false
          icon.value = '&#xe6a9;'
          emit('changeLiked', noteId, false, -1)
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

export default {
  name: 'Contents',
  props: ['noteData'],
  setup (props, context) {
    const icon = props.noteData.note.liked ? ref('&#xe6aa;') : ref('&#xe6a9;')
    const { emit } = context
    const { handleLikeClick } = useLikeEffect(props.noteData, icon, emit)
    const router = useRouter()
    const toNoteDetail = () => {
      router.push(`/noteDetail/${props.noteData.note.id}`)
      console.log(props.noteData.note.title)
    }
    return {
      icon,
      handleLikeClick,
      toNoteDetail
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../style/viriables.scss';
@import '../../style/mixins.scss';

  :deep(.el-card__body){
    padding: 0;
  }
  .image{
    width: 100%;
    height: 80%;
  }
  .message{
    padding: .1rem .12rem;
    .title{
      //width: 100%;
      height: .56rem;
      text-align: left;
      font-size: .18rem;
      color: $textColor;
      @include two-ellipsis;
    }
    .bottom {
      margin-top: .1rem;
      height: .24rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      .author{
        width: 63%;
        height: .24rem;
        display: flex;
        align-items: center;
        .avatar{
          width: .3rem;
        }
        .nickname{
          //display: inline-block;
          color: $weakColor;
          @include ellipsis;
        }
      }
      .like{
        width: 36%;
        height: .24rem;
        display: flex;
        justify-content: end;
        align-items: center;
        &__icon{
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
  }
  :deep(.el-avatar){
    position: relative;
    top: .01rem;
    left: -.03rem;
  }
</style>
