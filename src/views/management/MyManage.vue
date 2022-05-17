<template>
  <div class="wrapper">
    <el-card class="login__card">
      <div class="card__title">基本资料</div>
      <el-form
        ref="adminFormRef"
        :model="adminForm"
        :rules="rules"
        label-width="120px"
        class="input__form"
      >
        <el-form-item label="用户昵称" prop="nickname">
          <el-input v-model="adminForm.nickname" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="adminForm.email" />
        </el-form-item>
        <el-form-item label="性别" prop="sex">
          <el-radio-group v-model="adminForm.sex">
            <el-radio label="未知">
              <span class="iconfont unknown__icon" style="font-size: 16px;">&#xfb29;<span style="font-size: 14px;"> 未知</span></span>
            </el-radio>
            <el-radio label="男">
              <span class="iconfont male__icon" style="font-size: 14px;">&#xe643;<span style="font-size: 14px;"> 男</span></span>
            </el-radio>
            <el-radio label="女">
              <span class="iconfont female__icon" style="font-size: 14px;">&#xe647;<span style="font-size: 14px;"> 女</span></span>
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="个人简介" prop="description">
          <el-input
            v-model="adminForm.description"
            :autosize="{ minRows: 5, maxRows: 5 }"
            type="textarea"
            placeholder="请输入个人简介"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" style="margin-left: 100px;" @click="save(adminFormRef)" class="button">保存</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
export default {
  name: 'MyManage',
  setup () {
    const adminFormRef = ref(null)
    const adminForm = reactive({
      id: '',
      nickname: 'Hello',
      email: '23456',
      sex: '男',
      description: '1123'
    })

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

    const rules = reactive({
      nickname: [
        { required: true, message: '请输入昵称', trigger: 'blur' },
        { min: 1, max: 20, message: '不能超过20个字符', trigger: 'blur' }
      ],
      email: [
        { required: true, validator: validateEmail, trigger: 'blur' }
      ],
      sex: [
        {
          required: true,
          message: '请选择性别',
          trigger: 'change'
        }
      ],
      description: [
        { required: true, message: '请输入个人简介', trigger: 'blur' },
        { min: 1, max: 100, message: '不能超过100个字符哦', trigger: 'blur' }
      ]
    })

    const save = (formEl) => {
      console.log('保存', formEl)
      if (!formEl) return
      formEl.validate(async (valid) => {
        if (valid) {
          console.log('验证成功，进行请求')
        }
      })
    }

    return {
      adminFormRef,
      adminForm,
      rules,
      save
    }
  }
}
</script>

<style lang="scss" scoped>
  .wrapper{
    width: 100%;
    height: 500px;
    position: relative;
  }
  .login__card{
    width: 500px;
    height: 420px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  .card__title{
    text-align: left;
    margin-bottom: 30px;
    font-size: 18px;
  }

  .unknown__icon {
    font-size: .22rem;
    color: #666;
  }
  .male__icon {
    font-size: .2rem;
    color: #25a0e8;
  }
  .female__icon {
    font-size: .2rem;
    color: #e93170;
  }
</style>
