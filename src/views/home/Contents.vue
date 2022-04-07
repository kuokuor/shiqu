<template>
  <el-card shadow="never">
    <img
      :src="notes.note.images[0]"
      class="image"
    />
    <div class="message">
      <div class="title">{{notes.note.title}}</div>
      <div class="bottom">
        <div class="author">
          <div class="avatar">
            <el-avatar style="--el-avatar-size: .22rem" :src="notes.author.avatar" />
          </div>
          <span class="nickName">{{notes.author.nickName}}</span>
        </div>
        <div class="like">
          <span
            :class="{'iconfont': true, 'like__icon': true, 'like__icon--active': notes.note.liked}"
            v-html="icon"
            @click="handleLikeClick(notes.note.id, notes.note.liked)"
          >
          </span>
          <span class="like__count">{{notes.note.likeCount}}</span>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script>
import { ref } from 'vue'
import { post } from '../../utils/request'
import { ElMessage } from 'element-plus'

// 点赞及取消逻辑
const useLikeEffect = (icon, emit) => {
  // 处理点击点赞图标的事件
  const handleLikeClick = async (noteId, liked) => {
    if (!liked) {
      liked = true
      icon.value = '&#xe6aa;'
      emit('changeLiked', noteId, true, 1)
    } else {
      liked = false
      icon.value = '&#xe6a9;'
      emit('changeLiked', noteId, false, -1)
    }
    try {
      // 发送修改点赞状态的请求
      const result = await post('/note/changeLiked', { noteId: noteId })
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
  return {
    handleLikeClick
  }
}

export default {
  name: 'Contents',
  props: ['notes'],
  setup (props, context) {
    const icon = props.notes.note.liked ? ref('&#xe6aa;') : ref('&#xe6a9;')
    const { emit } = context
    const { handleLikeClick } = useLikeEffect(icon, emit)
    return {
      icon,
      handleLikeClick
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
        //height: .24rem;
        display: flex;
        align-items: center;
        .avatar{
          width: .3rem;
        }
        .nickName{
          //display: inline-block;
          color: $weakColor;
          @include ellipsis;
        }
      }
      .like{
        width: 36%;
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
