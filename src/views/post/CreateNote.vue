<template>
  <!-- 头部区域 -->
  <div class="header">
    <div class="back">
      <span class="iconfont back__icon" @click="handleBack">&#xe600;</span>
    </div>
    <!-- 点击返回按钮后出现对话框 -->
    <el-dialog
      v-model="backDialogVisible"
      title=""
      width="70%"
      custom-class="my__dialog"
      :show-close="false"
    >
      <span class="dialog__title">保留此次编辑？</span>
      <template #footer>
        <div class="dialog-footer">
          <span class="no__save" @click="handleNoSave">不保留</span>
          <span class="save" @click="handleSave">保留</span>
        </div>
      </template>
    </el-dialog>
    <!-- 发布按钮 -->
    <el-button class="post__button" type="primary" @click="postNote">发布</el-button>
  </div>
  <!-- 笔记内容编辑区域 -->
  <div class="content">
    <el-input
      v-model="title"
      maxlength="20"
      placeholder="标题"
      show-word-limit
      type="text"
    />
    <div class="text">
      <el-input
        v-model="content"
        :rows="4"
        type="textarea"
        placeholder="正文"
      />
    </div>
    <div class="photo__group">
      <el-upload
        action="https://upload-z2.qiniup.com"
        :data="uploadToken"
        list-type="picture-card"
        :on-preview="handlePictureCardPreview"
        :on-remove="handleRemove"
        :on-success="handleSuccess"
        :before-upload="beforeUpload"
        :file-list="photoList"
        :limit=9
      >
        <el-icon style="font-size: .4rem;"><camera-filled /></el-icon>
      </el-upload>

      <el-dialog :fullscreen="true" v-model="photoDialogVisible" custom-class="photo__dialog">
        <img class="photo" w-full :src="dialogImageUrl" alt="Preview Image" />
      </el-dialog>
    </div>
    <div class="type__select">
      <el-select v-model="type" placeholder="笔记类型" size="large" :fit-input-width="true">
        <el-option value="美食笔记" label="美食笔记"/>
        <el-option value="探店笔记" label="探店笔记"/>
      </el-select>
    </div>
    <div class="tags__wrapper">
      <div class="tags" @click="tagsDrawer = true">
        添加标签
        <span class="iconfont next__icon">&#xe60f;</span>
      </div>
      <!-- 展示已选择的标签 -->
      <div class="my__tags">
        <el-tag
          v-for="(value, key) in tagsName"
          :key="key"
          closable
          @close="deleteTag(key)"
        >
          {{value}}
        </el-tag>
      </div>
    </div>
    <!-- 标签选择drawer -->
    <el-drawer
      v-model="tagsDrawer"
      size="100%"
    >
      <div class="dishes">
        <span class="topic">地方菜系</span>
        <div>
          <el-tag
            v-for="(value, key) in tagList.localDishes"
            :key="key"
            @click="addTag(value, key)"
          >
            {{value}}
          </el-tag>
        </div>
      </div>
      <div class="dishes">
        <span class="topic">外国美食</span>
        <div>
          <el-tag
            v-for="(value, key) in tagList.foreignDishes"
            :key="key"
            @click="addTag(value, key)"
          >
            {{value}}
          </el-tag>
        </div>
      </div>
      <div class="dishes">
        <span class="topic">更多美味</span>
        <div>
          <el-tag
            v-for="(value, key) in tagList.otherDishes"
            :key="key"
            @click="addTag(value, key)"
          >
            {{value}}
          </el-tag>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import { useBackRouterEffect } from '../../effects/useBackRouterEffect'
import { onMounted, reactive, ref, toRefs } from 'vue'
import { post, get } from '../../utils/request'
import { ElMessage } from 'element-plus'
import { CameraFilled } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

export default {
  name: 'CreateNote',
  components: {
    CameraFilled
  },
  setup () {
    const { handleBackClick } = useBackRouterEffect()

    const noteData = reactive({
      title: '', // 笔记的标题
      content: '', // 正文内容
      type: '', // 笔记类型（0: 美食笔记；1: 探店笔记）（页面上显示类型名称，传给后端对应number）
      tagsName: {}, // 标签（此处存放对应标签名，为了草稿的展示。传给后端对应number）
      photoList: [] // 准备上传的图片文件列表
    })

    const uploadToken = reactive({
      token: null
    })
    // 获取上传图片的token
    const getUploadToken = async () => {
      try {
        const result = await get('/image/getToken')
        if (result.code === 200) {
          uploadToken.token = result.data
        } else if (result.code === 401) {
          ElMessage({
            showClose: true,
            message: '暂未登录，请登录!',
            type: 'error',
            center: true,
            duration: 1000
          })
          router.replace('/registerAndLogin')
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
      const savedNote = JSON.parse(localStorage.getItem('savedNote')) // 获取localStorage保存的内容
      if (savedNote) {
        // 初始化为上一次保存的数据
        noteData.title = savedNote.title
        noteData.content = savedNote.content
        noteData.type = savedNote.type
        noteData.tagsName = savedNote.tagsName
        noteData.photoList = savedNote.photoList
      }
      getUploadToken()
    })

    // 上传前先处理类型
    const beforeUpload = (rawFile) => {
      if (rawFile.type !== 'image/jpeg') {
        ElMessage({
          showClose: true,
          message: 'Avatar picture must be JPG format!',
          type: 'error',
          center: true,
          duration: 1000
        })
        return false
      } else if (rawFile.size / 1024 / 1024 > 2) {
        ElMessage({
          showClose: true,
          message: 'Avatar picture size can not exceed 2MB!',
          type: 'error',
          center: true,
          duration: 1000
        })
        return false
      }
      return true
    }

    const handleSuccess = (res) => {
      noteData.photoList.pop()
      noteData.photoList.push({ url: 'http://shiqu.hyxk.xyz/' + res.key })
    }

    const backDialogVisible = ref(false) // 点击返回图标后是否显示dialog

    const handleBack = () => {
      // 是否有笔记数据
      const haveData = noteData.title !== '' || noteData.content !== '' || noteData.type !== '' || noteData.tagsName.length || noteData.photoList.length
      if (haveData) {
        backDialogVisible.value = true // 显示对话框
      } else {
        handleBackClick() // 返回上一页
      }
    }

    // 不保存未发布的笔记
    const handleNoSave = () => {
      localStorage.removeItem('savedNote') // 删除保存的笔记
      backDialogVisible.value = false // 隐藏对话框
      handleBackClick() // 返回上一页
    }
    // 保存未发布的笔记（草稿）
    const handleSave = () => {
      try {
        localStorage.setItem('savedNote', JSON.stringify(noteData)) // 保存到localStorage
      } catch (e) {
        ElMessage({
          showClose: true,
          message: '发生错误',
          type: 'error',
          center: true,
          duration: 1000
        })
      }
      backDialogVisible.value = false // 隐藏对话框
      handleBackClick() // 返回上一页
    }

    const dialogImageUrl = ref('') // 当前预览图片的url
    const photoDialogVisible = ref(false) // 预览图片的对话框
    // 删除上传的图片
    const handleRemove = (uploadFile, uploadFiles) => {
      console.log(uploadFile, uploadFiles)
    }
    // 预览上传的图片
    const handlePictureCardPreview = (uploadFile) => {
      dialogImageUrl.value = uploadFile.url
      photoDialogVisible.value = true
    }

    // 标签种类
    const tagList = ref({
      localDishes: {
        0: '川湘菜',
        1: '粤菜',
        2: '江浙菜',
        3: '农家菜',
        4: '家常菜',
        5: '其他中餐'
      },
      foreignDishes: {
        6: '西餐',
        7: '日本料理',
        8: '韩式料理',
        9: '东南亚菜'
      },
      otherDishes: {
        10: '小吃快餐',
        11: '奶茶果汁',
        12: '面包蛋糕',
        13: '甜品',
        14: '下午茶',
        15: '火锅',
        16: '自助餐',
        17: '烧烤烤肉'
      }
    })

    const tagsDrawer = ref(false) // tags选择页(drawer)

    // 添加标签
    const addTag = (tagName, tagIndex) => {
      if (noteData.tagsName[tagIndex] !== undefined) { // 已添加过的tag不能重复添加
        ElMessage({
          showClose: true,
          message: '标签重复',
          type: 'error',
          center: true,
          duration: 1000
        })
      } else {
        noteData.tagsName[tagIndex] = tagName // 将点击的标签加入标签列表
        tagsDrawer.value = false // 关闭drawer
      }
    }

    // 移除已选标签
    const deleteTag = (tagIndex) => {
      delete noteData.tagsName[tagIndex] // 删除选中的标签
    }

    // 发布笔记
    const router = useRouter()
    const postNote = async () => {
      try {
        let tags = [] // 选择的标签
        tags = Object.keys(noteData.tagsName)

        const images = [] // 上传的图片路径
        noteData.photoList.forEach((item) => {
          images.push(item.url)
        })

        const noteType = noteData.type === '美食笔记' ? 0 : 1

        const formData = new FormData()
        formData.append('title', noteData.title)
        formData.append('content', noteData.content)
        formData.append('type', noteType)
        formData.append('tags', tags)
        formData.append('photoList', images)

        const result = await post('/note/createNote', formData)
        if (result.code === 200) {
          localStorage.removeItem('savedNote') // 移除localStorage中上一次保存的笔记内容
          ElMessage({
            showClose: true,
            message: '发布成功！',
            type: 'success',
            center: true,
            duration: 1000
          })
          router.push('/') // 跳转到首页
        } else if (result.code === 500) {
          ElMessage({
            showClose: true,
            message: '填写完整才可发布哦~',
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
          duration: 1000
        })
      }
    }

    const { title, content, type, tagsName, photoList } = toRefs(noteData)

    return {
      backDialogVisible,
      handleBack,
      uploadToken,
      beforeUpload,
      handleSuccess,
      handleNoSave,
      handleSave,
      title,
      content,
      photoList,
      dialogImageUrl,
      photoDialogVisible,
      handleRemove,
      handlePictureCardPreview,
      type,
      tagsName,
      tagList,
      tagsDrawer,
      addTag,
      deleteTag,
      postNote
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../style/viriables.scss';
  .header{
    display: flex;
    justify-content: space-between;
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
    .post__button{
      position: relative;
      right: 0.1rem;
      width: .55rem;
      height: .32rem;
      font-size: .14rem;
      border-radius: .16rem;
      background-color: $themeColor;
    }
    :deep(.my__dialog){
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
        .no__save{
          flex: 1;
          text-align: center;
          color: $textColor;
        }
        .save{
          flex: 1;
          text-align: center;
          color: $themeColor;
        }
      }
    }
  }
  .content{
    :deep(.el-input__inner){ // 标题样式
      height: .5rem;
      padding: 0;
      margin: 0 .1rem;
      border-radius: 0;
      box-shadow: none;
      font-size: .18rem;
      border-bottom: .01rem solid $content-bgColor;
    }
    :deep(.el-input__count){
      font-size: .12rem;
    }
    .text{
      width: 100%;
      height: 1.2rem;
      overflow: auto;
      :deep(.el-textarea__inner){
        padding: .1rem;
        font-size: .16rem;
        box-shadow: none; // 去掉文本域的边框阴影
        resize: none; // 去掉文本域右下角黑点
      }
    }
    .photo__group{
      text-align: left;
    }
    :deep(.el-upload--picture-card){
      --el-upload-picture-card-size: 1.18rem;
      width: 1.18rem;
      height: 1.18rem;
      margin: .02rem;
    }
    :deep(.el-upload-list--picture-card) {
      --el-upload-list-picture-card-size: 1.18rem; // 设置每个card的大小
      margin: 0 .04rem; // 设置整个card组的margin
      max-height: 3.66rem;
      overflow: hidden;
      .el-upload-list__item{
        margin: .02rem; // 设置每个card的margin
      }
      .el-upload-list__item-actions span+span{
        margin-left: 50%; // 设置点击card后显示的预览和删除图标的间距
      }
      .el-upload-list__item-thumbnail{
        object-fit: cover; // 设置图片填充整个img
      }
    }
    :deep(.el-upload-list__item-status-label) {
      display: none;
    }
    :deep(.photo__dialog){
      background: $textColor;
      .el-dialog__header {
        padding: 0;
        margin: 0;
        width: 100%;
        height: 0.5rem;
        background: #fff;
      }
      .el-dialog__body{
        width: 100%;
        height: calc(100vh - 0.5rem);
        padding: 0;
        overflow: auto;
        position: relative;
      }
      .photo{
        width: 100%;
        // 居中预览
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }
      .el-dialog__headerbtn{
        top: 0;
      }
      .el-dialog__headerbtn .el-dialog__close {
        font-size: 25px;
      }
    }
    .type__select{
      margin: .1rem;
      :deep(.el-select--large) {
        width: 100%;
      }
      :deep(.el-input__inner){ // 标题样式
        height: .5rem;
        padding: .1rem;
        margin: 0;
        border-radius: var(--el-input-border-radius,var(--el-border-radius-base));
        box-shadow: 0 0 0 1px var(--el-input-border-color,var(--el-border-color)) inset;
        font-size: .16rem;
      }
    }
    .tags__wrapper{
      padding: 0 .1rem;
      margin-bottom: 2rem; // 可按需求删除
      .tags{
        position: relative;
        width: 100%;
        height: .5rem;
        line-height: .5rem;
        font-size: .16rem;
        text-align: left;
        border-top: .01rem solid $content-bgColor;
        border-bottom: .01rem solid $content-bgColor;
        .next__icon{
          position: absolute;
          right: 0;
        }
      }
    }
    :deep(.el-drawer__close-btn){
      font-size: .2rem;
    }
    .dishes{
      width: 100%;
      margin-bottom: .1rem;
    }
    .topic{
      font-size: .18rem;
    }
    :deep(.el-tag){
      height: .3rem;
      font-size: .14rem;
      margin: .08rem;
    }
  }
  // 设置下拉选择器的样式
  .el-select-dropdown__item{
    font-size: .16rem;
  }
</style>
