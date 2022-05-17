<template>
  <div class="wrapper">
    <el-card class="login__card">
      <div class="card__title">食趣后台管理系统</div>
      <el-form
        :model="loginForm"
        status-icon
        :rules="rules"
        ref="loginFormRef"
        class="input__form"
      >
        <el-form-item prop="email" label="邮箱" :label-width="80">
          <el-input type="email"
            placeholder="请输入邮箱"
            v-model="loginForm.email"
            autocomplete="off"
            class="input__item"
          >
          </el-input>
        </el-form-item>
        <el-form-item prop="password" label="密码" :label-width="80">
          <el-input
            type="password"
            placeholder="请输入密码"
            v-model="loginForm.password"
            autocomplete="off"
            class="input__item"
            show-password
          >
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="login(loginFormRef)" class="button">登录</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { reactive, ref } from 'vue'
import { post } from '../../utils/request'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'

const useValidateEffect = (loginForm) => {
  const loginFormRef = ref(null)

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
      callback(new Error('请输入密码!'))
    } else {
      if (value.length < 6 || value.length > 15) {
        callback(new Error('密码长度在6到15个字符!'))
      }
      // 密码强度检验
      if (!passReg.test(value)) {
        callback(new Error('需包含字母、数字, 不允许有空格!'))
      }
      callback()
    }
  }
  const rules = reactive({
    email: [
      { required: true, validator: validateEmail, trigger: 'blur' }
    ],
    password: [
      { required: true, validator: validatePass, trigger: 'blur' }
    ]
  })

  return {
    loginFormRef,
    rules
  }
}

const useSubmitEffect = (loginForm) => {
  const router = useRouter()
  const login = (formEl) => {
    if (!formEl) return
    formEl.validate(async (valid) => {
      if (valid) {
        try {
          const formData = new FormData()
          formData.append('email', loginForm.email)
          formData.append('password', loginForm.password)
          const result = await post('/user/login', formData)
          if (result.code === 200) {
            ElMessage({
              showClose: true,
              message: '登录成功',
              center: true,
              duration: 1000
            })
            formEl.resetFields() // 清空表单
            // 1秒后跳转到登录页
            setTimeout(() => {
              router.push('/management')
            }, 1000)
          }
        } catch (e) {
          ElMessage({
            showClose: true,
            message: '登录失败',
            type: 'error',
            center: true,
            duration: 1000
          })
        }
      }
    })
  }
  return {
    login
  }
}
export default {
  name: 'ManagementLogin',
  setup () {
    const loginForm = reactive({
      email: '',
      password: '',
      checkPassword: '',
      code: ''
    })

    const { loginFormRef, rules } = useValidateEffect(loginForm)

    const { login } = useSubmitEffect(loginForm)

    return {
      loginForm,
      loginFormRef,
      rules,
      login
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../style/viriables.scss';
  .wrapper{
    width: 100vw;
    height: 100vh;
    margin: 0;
    padding: 0;
    background: url('../../assets/management__bgImg.jpg') no-repeat;
    background-size: cover;
  }
  .login__card{
    width: 400px;
    height: 300px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  .card__title{
    margin-bottom: 30px;
    font-size: 20px;
  }
  .input__form{
    background-color: $bgColor;
    border-radius: 15px;
    overflow: hidden;
    opacity: 1;
    visibility: visible;
    transition: 0.3s ease;
    .input__item{
      line-height: 40px;
      height: 40px;
      margin-bottom: 20px;
      font-size: 16px;
    }
    .send{
      margin-left: 8px;
    }
  }

  // 取消elementUI输入框组件自带高度和阴影
  :deep(.el-input__inner){
    height: inherit;
    line-height: inherit;
    box-shadow: none;
    border-radius: 0;
    border-bottom: 1px solid $content-bgColor;
  }
  :deep(.el-input__inner::placeholder){
    font-size: 12px;
  }
  :deep(.el-input__inner:focus){
    border-bottom: 1px solid #75a297;
  }
  :deep(.el-form-item.is-error .el-input__inner){
    height: inherit;
    line-height: inherit;
    box-shadow: none;
    border-bottom: 1px solid var(--el-color-danger);
  }
  // 修改elementUI输入框组件验证失败提示的样式
  :deep(.el-form-item__error){
    font-size: 13px;
    top: 42px;
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
    width: 100px;
    height: 28px;
    font-size: 12px;
  }
  :deep(.el-button:focus, .el-button:hover){
    color: var(--el-color-primary);
    border-color: var(--el-color-primary-light-5);
    background-color: var(--el-color-primary-light-9);
  }

  .button{
    width: 100%;
    margin: 10px 0;
    height: 44px;
    line-height: 44px;
    border: none;
    border-radius: 22px;
    color: rgba(255,255,255,0.8);
    font-size: 16px;
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
