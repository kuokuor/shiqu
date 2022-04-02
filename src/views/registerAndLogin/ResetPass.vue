<template>
  <div class="container">
    <a class="iconfont back__icon" @click="handleBackClick">&#xe600;</a>
    <div class="card__wrapper">
      <div class="reset__card">
        <h2 class="reset__title">
          重置密码
        </h2>
        <el-form
          :model="resetForm"
          status-icon
          :rules="rules"
          ref="resetFormRef"
          class="input__form"
        >
          <el-form-item prop="email">
            <el-input type="email"
              placeholder="邮箱"
              v-model="resetForm.email"
              autocomplete="off"
              class="input__item"
            >
            </el-input>
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              type="password"
              placeholder="新密码"
              v-model="resetForm.password"
              autocomplete="off"
              class="input__item"
            >
            </el-input>
          </el-form-item>
          <el-form-item prop="checkPassword">
            <el-input
              type="password"
              placeholder="确认密码"
              v-model="resetForm.checkPassword"
              autocomplete="off"
              class="input__item"
            >
            </el-input>
          </el-form-item>
          <el-form-item prop="code">
            <el-input
              type="number"
              placeholder="验证码"
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
            <el-button type="primary" @click="resetSubmit(resetFormRef)" class="button">确定</el-button>
          </el-form-item>
        </el-form>
      </div>
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
  const text = ref('发送')
  const disabled = ref(false)
  // 倒计时
  const textBtn = () => {
    let time = 60
    const timer = setInterval(() => {
      if (time === 0) {
        clearInterval(timer)
        disabled.value = false
        text.value = '发送'
      } else {
        disabled.value = true
        text.value = '重发(' + time + 's)'
        time--
      }
    }, 1000)
  }
  // 发送验证码
  const sendCode = (email) => {
    resetFormRef.value.validateField('email', async (valid) => {
      if (valid) {
        textBtn() // 验证码倒数60秒
        try {
          const result = await post('/user/login/sendVerificationCode', { email: email })
          if (result.code === 200) {
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
              message: '发生错误',
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
          const resetData = reactive({
            email: resetForm.email,
            password: resetForm.password
          })
          const result = await post('/user/resetPass', resetData)
          if (result.code === 200) {
            ElMessage({
              showClose: true,
              message: '密码已重置！',
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
              message: '密码重置失败',
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
  name: 'ResetPass',
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
    min-height: 100vh;
    background: url('../../assets/bg-image.jpg') no-repeat;
    background-size: cover;
    .card__wrapper{
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 2.5rem;
      height: 4.5rem;
      //margin: .54rem .3rem;
      border-radius: .15rem;
      background: $bgColor;
      box-shadow: 0 0 .1rem .01rem $shadowColor;
      overflow: hidden;
    }
  }
  .reset__card{
    width: 2.2rem;
    position: absolute;
    z-index: 1;
    top: 50%;
    left: 50%;
    transform: translate(-50%,-50%);
    transition: 0.3s ease;
    .reset__title{
      color: $textColor;
      font-size: .24rem;
      text-align: center;
    }
    .button{
      background-color: $titleColor;
    }
    .button:active {
      background-color: rgba(0,0,0,0.8);
    }
  }
  .input__form{
    background-color: $bgColor;
    border-radius: .15rem;
    border: .01rem solid $content-bgColor;
    overflow: hidden;
    margin-top: .3rem;
    padding: .18rem .1rem;
    opacity: 1;
    visibility: visible;
    transition: 0.3s ease;
    .input__item{
      line-height: .28rem;
      height: .28rem;
      margin-bottom: .16rem;
      font-size: .16rem;
    }
    .send{
      margin-left: .08rem;
    }
  }

  // 取消elementUI输入框组件自带高度和阴影
  ::v-deep .el-input__inner{
    height: inherit;
    line-height: inherit;
    box-shadow: none;
    border-radius: 0;
    border-bottom: .01rem solid $content-bgColor;
  }
  ::v-deep .el-input__inner:focus{
    border-bottom: .01rem solid #75a297;
  }
  ::v-deep .el-form-item.is-error .el-input__inner{
    height: inherit;
    line-height: inherit;
    box-shadow: none;
    border-bottom: .01rem solid var(--el-color-danger);
  }
  // 修改elementUI输入框组件验证失败提示的样式
  ::v-deep .el-form-item__error{
    font-size: .12rem;
    top: .3rem;
  }
  // 清除输入框组件自带mb
  ::v-deep .el-form-item{
    margin-bottom: 0;
  }
  // 修改表单组件自带布局
  ::v-deep .el-form-item__content{
    flex-wrap: nowrap;
    align-items: stretch;
  }
  // 修改多选框组件自带样式
  ::v-deep .el-checkbox{
    color: $titleColor;
    height: .12rem;
  }
  ::v-deep .el-checkbox__input.is-checked .el-checkbox__inner{
    background-color: #75a297;
    border-color: #75a297;
  }
  ::v-deep .el-checkbox__input.is-focus .el-checkbox__inner{
    border-color: #75a297;
  }
  ::v-deep .el-checkbox__inner{
    width: .12rem;
    height: .12rem;
  }
  ::v-deep .el-checkbox__inner::after{
    width: .04rem;
    height: .08rem;
    top: -.01rem;
    left: .02rem;
  }
  ::v-deep .el-checkbox__inner:hover{
    border-color: #75a297;
  }
  ::v-deep .el-checkbox__label{
    font-size: .12rem;
    padding-left: .08rem;
  }
  ::v-deep .el-checkbox__input.is-checked+.el-checkbox__label{
    color: #75a297;
  }
  ::v-deep .el-button{
    width: .6rem;
    height: .28rem;
    font-size: .12rem;
  }

  .button{
    width: 100%;
    margin: .1rem 0;
    height: .44rem;
    line-height: .44rem;
    border: none;
    border-radius: .15rem;
    color: rgba(255,255,255,0.8);
    font-size: .16rem;
    font-weight: bold;
    opacity: 1;
    visibility: visible;
    outline: none;
    transition: 0.3s ease;
  }
</style>
