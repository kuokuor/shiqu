<template>
  <div class="header">
    <div class="back">
      <span class="iconfont back__icon" @click="handleBackClick">&#xe600;</span>
    </div>
    <span class="title">个人信息</span>
    <el-button class="save__button" type="primary" round @click="submitForm(ruleFormRef)">保存</el-button>
  </div>
  <div class="info__wrapper">
    <div class="avatar__wrapper">
      <el-upload
        class="avatar-uploader"
        action="https://jsonplaceholder.typicode.com/posts/"
        :show-file-list="false"
        :on-success="handleAvatarSuccess"
        :before-upload="beforeAvatarUpload"
      >
        <img v-if="imageUrl" :src="imageUrl" class="avatar" fit="cover"/>
        <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
      </el-upload>
      <div class="id">{{`食趣ID: ${user.id}`}}</div>
    </div>
    <div class="other">
      <el-form
        ref="ruleFormRef"
        label-position="left"
        label-width="80px"
        size="large"
        :model="user"
        :rules="rules"
        style="max-width: 460px; padding-top: 16px;"
      >
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="user.nickname" />
        </el-form-item>
        <el-form-item label="性别" prop="sex">
          <el-radio-group v-model="user.sex">
            <el-radio :label="0">
              <span class="iconfont unknown__icon" style="font-size: .16rem">&#xfb29;<span style="font-size: 14px;"> 未知</span></span>
            </el-radio>
            <el-radio :label="1">
              <span class="iconfont male__icon" style="font-size: .14rem">&#xe643;<span style="font-size: 14px;"> 男</span></span>
            </el-radio>
            <el-radio :label="2">
              <span class="iconfont female__icon" style="font-size: .14rem">&#xe647;<span style="font-size: 14px;"> 女</span></span>
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="个人简介" prop="description" style="border: none;">
          <el-input
            v-model="user.description"
            :autosize="{ minRows: 5, maxRows: 5 }"
            type="textarea"
            placeholder="介绍一下自己吧~"
          />
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import { useBackRouterEffect } from '../../effects/useBackRouterEffect'
import { onMounted, ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { get, post } from '../../utils/request'

export default {
  name: 'EditInfo',
  components: {
    Plus
  },
  setup () {
    const { handleBackClick } = useBackRouterEffect()

    // （持有者）用户信息
    const user = ref({})

    // 获取持有者信息
    const getHolderInfo = async () => {
      try {
        const result = await get('/user/getHolderInfo')
        if (result.code === 200 && result.data) {
          user.value = result.data
          imageUrl.value = user.value.avatar
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
      // 获取持有者信息
      getHolderInfo()
    })

    const imageUrl = ref('')

    // 上传头像成功的操作
    const handleAvatarSuccess = (response, uploadFile) => {
      imageUrl.value = URL.createObjectURL()
    }
    // 上传之前的操作
    const beforeAvatarUpload = (rawFile) => {
      // 判断图片类型及大小限制
      if (rawFile.type !== 'image/jpeg' && rawFile.type !== 'image/png' && rawFile.type !== 'image/jpg') {
        ElMessage.error('图片类型必须是jpeg、jpg、png中的一种！')
        return false
      } else if (rawFile.size / 1024 / 1024 > 2) {
        ElMessage.error('图片大小不能超过2MB！')
        return false
      }
      return true
    }

    // 表单验证规则
    const rules = reactive({
      nickname: [
        { required: true, message: '请输入昵称', trigger: 'blur' },
        { min: 1, max: 20, message: '不能超过20个字符', trigger: 'blur' }
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

    // 表单节点
    const ruleFormRef = ref()
    // 提交表单
    const submitForm = async (formEl) => {
      if (!formEl) return
      await formEl.validate((valid, fields) => {
        if (valid) {
          // 表单验证成功，调用修改用户信息的方法
          updateUserInfo()
        }
      })
    }

    // 修改用户信息
    const updateUserInfo = async () => {
      try {
        const result = await post('/user/updateUserInfo', user)
        if (result.code === 200) {
          ElMessage({
            showClose: true,
            message: '修改成功！',
            type: 'success',
            center: true,
            duration: 1000
          })
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
      handleBackClick,
      user,
      imageUrl,
      handleAvatarSuccess,
      beforeAvatarUpload,
      rules,
      ruleFormRef,
      submitForm,
      updateUserInfo
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../style/viriables.scss';
  .header{
    display: flex;
    align-items: center;
    width: 100%;
    margin: 0;
    padding: 0;
    .back{
      width: .6rem;
      height: .5rem;
      &__icon{
        color: $textColor;
      }
    }
    .title{
      flex: 1;
      font-size: .2rem;
      background: $bgColor;
      color: $textColor;
    }
    .save__button{
      position: relative;
      right: 0.1rem;
      background-color: var(--el-button-bg-color);
      :deep(.el-button){
        height: .32rem;
        font-size: .12rem;
      }
      :deep(.el-button.is-round){
        border-radius: .16rem;
      }
    }
  }

  .info__wrapper{
    width: 100%;
    height: calc(100vh - .5rem);
    background: $content-bgColor;
  }

  .avatar__wrapper{
    padding: 30px 0 20px 0;
    background: $bgColor;
    .id{
      width: 120px;
      line-height: 25px;
      margin: 30px auto 0 auto;
      border: 1px solid $weakColor;
      border-radius: 15px;
      font-size: 14px;
      color: $nicknameColor;
    }
  }

  .avatar-uploader .avatar {
    width: 90px;
    height: 90px;
    display: block;
  }
  :deep(.avatar-uploader .el-upload) {
    border: 1px dashed #d9d9d9;
    border-radius: 45px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: var(--el-transition-duration-fast);
  }

  :deep(.avatar-uploader .el-upload:hover) {
    border-color: var(--el-color-primary);
  }

  :deep(.el-icon.avatar-uploader-icon) {
    font-size: 28px;
    color: #8c939d;
    width: 90px;
    height: 90px;
    text-align: center;
  }

  .other{
    margin-top: 10px;
    background: $bgColor;
    padding-bottom: .05rem;
  }

  .el-form-item{
    padding: 0 20px;
    border-bottom: 1px solid $content-bgColor;
  }
  :deep(.el-input__inner){
    box-shadow: none;
    border-radius: 0;
  }
  :deep(.el-form-item.is-error .el-input__inner){
    box-shadow: none;
    border-radius: 0;
    //border-bottom: .01rem solid var(--el-color-danger);
  }
  :deep(.el-textarea__inner:hover){
    box-shadow: 0 0 0 1px var(--el-input-border-color,var(--el-border-color)) inset;
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
