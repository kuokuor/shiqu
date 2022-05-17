<template>
  <div class="container">
    <div class="header__wrapper">
      <span class="iconfont back__icon" @click="handleBackClick">&#xe600;</span>
      <span class="title">修改密码</span>
    </div>
    <div class="content__wrapper">
      <el-form
        :model="resetForm"
        status-icon
        :rules="rules"
        ref="resetFormRef"
        class="input__form"
      >
        <el-form-item prop="email">
          <el-input type="email"
            placeholder="请输入邮箱"
            v-model="resetForm.email"
            autocomplete="off"
            class="input__item"
          >
          </el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            type="password"
            placeholder="请输入6-15位密码，至少包含数字、英文字母"
            v-model="resetForm.password"
            autocomplete="off"
            class="input__item"
            show-password
          >
          </el-input>
        </el-form-item>
        <el-form-item prop="checkPassword">
          <el-input
            type="password"
            placeholder="再次输入新密码"
            v-model="resetForm.checkPassword"
            autocomplete="off"
            class="input__item"
            show-password
          >
          </el-input>
        </el-form-item>
        <el-form-item prop="code">
          <el-input
            type="number"
            placeholder="请输入验证码"
            v-model="resetForm.code"
            autocomplete="off"
            class="input__item"
          >
          </el-input>
          <el-button
            type="primary"
            plain
            :disabled = "disabled"
            class="send"
            @click="sendCode(resetForm.email)"
          >
          {{text}}
          </el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="resetSubmit(resetFormRef)" class="button">确定修改</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import { reactive, ref } from 'vue'
import { post } from '../../utils/request'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { useBackRouterEffect } from '../../effects/useBackRouterEffect'

const useValidateEffect = (resetForm) => {
  const resetFormRef = ref(null)

  // 邮箱格式
  const emailReg = /^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/
  const validateEmail = (rule, value, callback) => {
    if (value === '') {
      callback(new Error('请输入邮箱!'))
    } else {
      // 验证邮箱合法性
      if (!emailReg.test(value)) {
        callback(new Error('请输入有效邮箱!'))
      }
      callback()
    }
  }
  // 包括字母，数字，不许有空格，6位以上
  const passReg = /^(?=\S*[a-z])(?=\S*\d)\S{6,}$/
  const validatePass = (rule, value, callback) => {
    if (value === '') {
      callback(new Error('请输入新密码!'))
    } else {
      if (value.length < 6 || value.length > 15) {
        callback(new Error('密码长度在6到15个字符!'))
      }
      // 密码强度检验
      if (!passReg.test(value)) {
        callback(new Error('需包含字母、数字, 不允许有空格!'))
      }
      if (resetForm.checkPassword !== '') {
        if (!resetFormRef.value) return
        resetFormRef.value.validateField('checkPassword', () => null)
      }
      callback()
    }
  }
  const validatePass2 = (rule, value, callback) => {
    if (value === '') {
      callback(new Error('请再次输入密码!'))
    } else if (value !== resetForm.password) {
      callback(new Error('两次输入密码不一致!'))
    } else {
      callback()
    }
  }
  const rules = reactive({
    email: [
      { validator: validateEmail, trigger: 'blur' }
    ],
    password: [
      { validator: validatePass, trigger: 'blur' }
    ],
    checkPassword: [
      { validator: validatePass2, trigger: 'blur' }
    ],
    code: [
      { required: true, message: '请输入验证码!', trigger: 'blur' }
    ]
  })

  return {
    resetFormRef,
    rules
  }
}

const useCodeEffect = (resetFormRef) => {
  const text = ref('获取验证码')
  const disabled = ref(false)
  // 倒计时
  const textBtn = () => {
    let time = 60
    const timer = setInterval(() => {
      if (time === 0) {
        clearInterval(timer)
        disabled.value = false
        text.value = '获取验证码'
      } else {
        disabled.value = true
        text.value = '重新获取(' + time + 's)'
        time--
      }
    }, 1000)
  }
  // 发送验证码
  const sendCode = (email) => {
    resetFormRef.value.validateField('email', async (valid) => {
      if (valid) {
        try {
          const formData = new FormData()
          formData.append('email', email)
          const result = await post('/user/sendCodeForResetPass', formData)
          if (result.code === 200) {
            textBtn() // 验证码倒数60秒
            ElMessage({
              showClose: true,
              message: '成功发送验证码，请注意查收!',
              type: 'success',
              center: true,
              duration: 2000
            })
          } else {
            ElMessage({
              showClose: true,
              message: result.msg,
              type: 'error',
              center: true,
              duration: 2000
            })
          }
        } catch (e) {
          ElMessage({
            showClose: true,
            message: '发生错误',
            type: 'error',
            center: true,
            duration: 2000
          })
        }
      }
    })
  }
  return {
    text,
    disabled,
    sendCode
  }
}

const useSubmitEffect = (resetForm) => {
  const router = useRouter()
  const resetSubmit = (formEl) => {
    if (!formEl) return
    formEl.validate(async (valid) => {
      if (valid) {
        try {
          const formData = new FormData()
          formData.append('email', resetForm.email)
          formData.append('password', resetForm.password)
          formData.append('code', resetForm.code)
          const result = await post('/user/resetPass', formData)
          if (result.code === 200) {
            ElMessage({
              showClose: true,
              message: '密码已修改！',
              center: true,
              duration: 1000
            })
            formEl.resetFields() // 清空表单
            // 1秒后跳转到登录页
            setTimeout(() => {
              router.push({ name: 'RegisterAndLogin' })
            }, 1000)
          } else {
            ElMessage({
              showClose: true,
              message: '密码修改失败',
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
    })
  }
  return {
    resetSubmit
  }
}
export default {
  name: 'UpdatePassword',
  setup () {
    const { handleBackClick } = useBackRouterEffect()

    const resetForm = reactive({
      email: '',
      password: '',
      checkPassword: '',
      code: ''
    })

    const { resetFormRef, rules } = useValidateEffect(resetForm)

    const { text, disabled, sendCode } = useCodeEffect(resetFormRef)

    const { resetSubmit } = useSubmitEffect(resetForm)

    return {
      handleBackClick,
      resetForm,
      resetFormRef,
      rules,
      text,
      disabled,
      sendCode,
      resetSubmit
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../style/viriables.scss';
  .container{
    width: 100vw;
    height: 100vh;
    padding: 0;
  }
  .header__wrapper{
    width: 100%;
    height: .5rem;
    line-height: .5rem;
    .back__icon{
      position: absolute;
      top: 0;
      left: .16rem;
      color: $textColor;
    }
    .title{
      font-size: .18rem;
    }
  }
  .content__wrapper{
    padding: .2rem .3rem;
  }
  .input__form{
    background-color: $bgColor;
    border-radius: .15rem;
    overflow: hidden;
    opacity: 1;
    visibility: visible;
    transition: 0.3s ease;
    .input__item{
      line-height: .4rem;
      height: .4rem;
      margin-bottom: .2rem;
      font-size: .16rem;
    }
    .send{
      margin-left: .08rem;
    }
  }

  // 取消elementUI输入框组件自带高度和阴影
  :deep(.el-input__inner){
    height: inherit;
    line-height: inherit;
    box-shadow: none;
    border-radius: 0;
    border-bottom: .01rem solid $content-bgColor;
  }
  :deep(.el-input__inner::placeholder){
    font-size: .13rem;
  }
  :deep(.el-input__inner:focus){
    border-bottom: .01rem solid #75a297;
  }
  :deep(.el-form-item.is-error .el-input__inner){
    height: inherit;
    line-height: inherit;
    box-shadow: none;
    border-bottom: .01rem solid var(--el-color-danger);
  }
  // 修改elementUI输入框组件验证失败提示的样式
  :deep(.el-form-item__error){
    font-size: .13rem;
    top: .42rem;
  }
  // 隐藏验证成功和失败时的图标
  :deep(.el-input__validateIcon){
    display: none !important;
  }
  // 清除输入框组件自带mb
  :deep(.el-form-item){
    margin-bottom: 0;
  }
  // 修改表单组件自带布局
  :deep(.el-form-item__content){
    flex-wrap: nowrap;
    align-items: stretch;
  }
  :deep(.el-button){
    width: 1rem;
    height: .28rem;
    font-size: .12rem;
  }
  :deep(.el-button:focus, .el-button:hover){
    color: var(--el-color-primary);
    border-color: var(--el-color-primary-light-5);
    background-color: var(--el-color-primary-light-9);
  }

  .button{
    width: 100%;
    margin: .1rem 0;
    height: .44rem;
    line-height: .44rem;
    border: none;
    border-radius: .22rem;
    color: rgba(255,255,255,0.8);
    font-size: .16rem;
    font-weight: bold;
    opacity: 1;
    visibility: visible;
    outline: none;
    transition: 0.3s ease;
  }
  .button:active{
    //border-color: var(--el-color-primary-light-3);
    background: var(--el-color-primary-light-3);
  }
  .button:hover{
    color: rgba(255,255,255,0.8);
    border-color: var(--el-color-primary);
    background-color: var(--el-color-primary);
  }
</style>
