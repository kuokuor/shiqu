<template>
  <div class="chat__box">
    <div class="header">
      <a class="iconfont back__icon" @click.prevent="handleBackClick">&#xe600;</a>
      <span>{{targetNickname}}</span>
    </div>
    <div class="msg__box" ref="msgBox">
      <div
        v-for="(item, index) of chatList"
        :key="index"
        class="msg__wrapper"
      >
        <div class="msg" v-if="item.fromId === myUserId" style="float: right;"> <!-- 我发的消息 -->
          <div class="user__msg">
            <span>{{item.content}}</span>
          </div>
          <div class="user__header">
            <el-avatar style="--el-avatar-size: .3rem" :src="myAvatar" />
          </div>
        </div>
        <div class="msg" v-else> <!-- 对方发的 -->
          <div class="user__header">
            <el-avatar style="--el-avatar-size: .3rem" :src="targetAvatar" />
          </div>
          <div class="user__msg">
            <span>{{item.content}}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="input__box">
      <div class="input__wrapper">
        <input type="text" ref="sendMsg" v-model="contentText" @input="inputText" @keyup.enter="sendText" />
      </div>
      <el-button :class="{'inputting': isInput}" type="primary" round @click="sendText">发送</el-button>
    </div>
  </div>
</template>

<script>
import { nextTick, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { get, post } from '../../utils/request'
import { ElMessage } from 'element-plus'
import { useBackRouterEffect } from '../../effects/useBackRouterEffect'

export default {
  name: 'Chat',
  setup () {
    const route = useRoute()
    const targetId = route.params.targetId // 对方的id
    const targetNickname = ref('') // 对方的昵称
    const targetAvatar = ref('') // 对方的头像
    const contentText = ref('') // 发送的消息内容
    const myUserId = ref('') // 自己的id
    const myAvatar = ref('') // 自己的头像
    const chatList = ref([]) // 聊天记录

    const { handleBackClick } = useBackRouterEffect()

    const sendMsg = ref(null) // input框

    // 获取聊天记录
    const getChatList = async () => {
      try {
        const formData = new FormData()
        formData.append('targetId', targetId)
        console.log('请求了聊天记录')
        const result = await get('/message/getChatList', formData)
        if (result.code === 200 && result.data) {
          targetNickname.value = result.data.target.nickname
          targetAvatar.value = result.data.target.avatar
          myUserId.value = result.data.holder.id
          myAvatar.value = result.data.holder.avatar
          chatList.value = [...result.data.letterList]
          nextTick(() => {
            const scrollHeight = msgBox.value.scrollHeight // 聊天框整体高度
            const clientHeight = msgBox.value.clientHeight // 聊天框可视高度
            msgBox.value.scrollTop = scrollHeight - clientHeight // 滚动到底部
          })
        } else {
          ElMessage({
            showClose: true,
            message: '错误' + result.code,
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

    const isInput = ref(false)
    const inputText = () => {
      if (contentText.value !== '') {
        isInput.value = true
      } else {
        isInput.value = false
      }
      console.log('输入ing', isInput.value)
    }

    // 发送消息
    const sendText = async () => {
      // 没有输入内容或内容为空时，不可发送
      if (!isInput.value || contentText.value === '') {
        return
      }
      try {
        const formData = new FormData()
        formData.append('toId', targetId)
        formData.append('content', contentText.value)
        const result = await post('/message/sendText', formData)
        if (result.code === 200) {
          const newChat = {
            id: '',
            fromId: myUserId.value,
            avatar: myAvatar.value,
            content: contentText.value
          }
          chatList.value.push(newChat)
          nextTick(() => {
            const scrollHeight = msgBox.value.scrollHeight // 聊天框整体高度
            const clientHeight = msgBox.value.clientHeight // 聊天框可视高度
            msgBox.value.scrollTop = scrollHeight - clientHeight // 滚动到底部
          })
          contentText.value = '' // 重置
          sendMsg.value.blur() // 设置输入框失焦
          isInput.value = false
          console.log('发送了消息', chatList.value)
        } else {
          ElMessage({
            showClose: true,
            message: '错误' + result.code,
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

    const msgBox = ref(null) // 聊天记录展示框

    onMounted(() => {
      getChatList()
    })

    return {
      targetNickname,
      targetAvatar,
      myUserId,
      myAvatar,
      contentText,
      chatList,
      handleBackClick,
      sendMsg,
      sendText,
      msgBox,
      isInput,
      inputText
    }
  }

}
</script>

<style lang="scss" scoped>
@import '../../style/viriables.scss';
  .chat__box{
    width: 100%;
    height: 100vh;
    .header{
      position: fixed;
      top: 0;
      right: 0;
      left: 0;
      height: .5rem;
      line-height: .5rem;
      margin: 0;
      padding: 0;
      background: $themeColor;
      font-size: .16rem;
      .back__icon{
        position: absolute;
        top: 0;
        left: .1rem;
        color: $bgColor;
      }
    }
    .msg__box{
      position: relative;
      top: .5rem;
      width: 100%;
      height: calc(100vh - 1rem);
      overflow: auto;
      background: $content-bgColor;
      .msg__wrapper{
        zoom: 1;
      }
      .msg__wrapper::after{
        content: '';
        height: 0;
        display: block;
        clear: both;
      }
      .msg{
        display: flex;
        margin-top: .2rem;
        max-width: calc(100vw - 0.5rem);
        text-align: left;
        .user__header{
          width: .3rem;
          height: .3rem;
          margin: 0 0.1rem;
        }
        .user__msg{
          padding: .05rem;
          font-size: .16rem;
          border-radius: .12rem;
          background: $bgColor;
        }
      }
    }
    .input__box{
      position: fixed;
      right: 0;
      left: 0;
      bottom: 0;
      height: .5rem;
      padding: 0 .12rem;
      display: flex;
      align-items: center;
      background: $content-bgColor;
      .input__wrapper{
        flex: 1;
        line-height: .3rem;
        padding: 0 .12rem;
        border-radius: .15rem;
        background: $bgColor;
        input{
          width: 100%;
          line-height: .3rem;
          border: none;
          outline: none;
          background: none;
          font-size: .14rem;
        }
      }
      .inputting{
        border-color: $themeColor !important;
        background-color: $themeColor !important;
      }
      :deep(.el-button){
        height: .3rem;
        font-size: .14rem;
        border-color: #c2dbd4;
        background-color: #c2dbd4;
      }
      :deep(.el-button.is-round){
        margin-left: .05rem;
        border-radius: .15rem;
      }
      //:deep(.el-button:focus, .el-button:hover, el-button:active){
      //  color: $bgColor;
      //  border-color: #c2dbd4;
      //  background-color: #c2dbd4;
      //}
    }
  }
</style>
