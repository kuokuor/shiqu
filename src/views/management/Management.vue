<template>
  <div class="box">
    <div class="menu__wrapper">
      <div class="menu__title">
        <el-avatar :size="40" src="http://shiqu.hyxk.xyz/shiqu__logo.jpg" />
        <span class="title">食趣后台管理系统</span>
      </div>
      <el-menu
        active-text-color="#ffd04b"
        background-color="#545c64"
        class="el-menu-vertical-demo"
        :default-active="editableTabsValue"
        text-color="#fff"
      >
        <el-menu-item index="1" @click="handleHomeClick">
            <el-icon><home-filled /></el-icon>
            <span>首页</span>
        </el-menu-item>
        <el-menu-item index="2" @click="handleUserClick">
          <el-icon><grid /></el-icon>
          <span>用户管理</span>
        </el-menu-item>
        <el-menu-item index="3" @click="handleNoteClick">
          <el-icon><edit-pen /></el-icon>
          <span>笔记管理</span>
        </el-menu-item>
        <el-menu-item index="4" @click="handleMyClick">
          <el-icon><avatar /></el-icon>
          <span>个人中心</span>
        </el-menu-item>
      </el-menu>
    </div>
    <div class="content__wrapper">
      <div class="content__header">
        <el-avatar style="position: relative; top: 12px; right: 5px;" :size="35" :src="admin.avatar" />
        <span class="nickname">{{admin.nickname}}</span>
        <i class="iconfont logout" @click="handleLogoutClick">&#xe62e;</i>
      </div>
      <div class="content__tabs">
        <el-tabs
          v-model="editableTabsValue"
          type="card"
          editable
          class="demo-tabs"
          @tab-remove="handleTabsRemove"
        >
          <el-tab-pane
            v-for="item in editableTabs"
            :key="item.name"
            :label="item.title"
            :name="item.name"
          >
            <home-manage v-if="editableTabsValue === '1'" />
            <user-manage v-if="editableTabsValue === '2'" />
            <note-manage v-if="editableTabsValue === '3'" />
            <my-manage :admin="admin" v-if="editableTabsValue === '4'" />
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, reactive } from 'vue'
import { HomeFilled, Grid, EditPen, Avatar } from '@element-plus/icons-vue'
import HomeManage from './HomeManage.vue'
import UserManage from './UserManage.vue'
import NoteManage from './NoteManage.vue'
import MyManage from './MyManage.vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { post, get } from '../../utils/request'

export default {
  name: 'Management',
  components: {
    HomeFilled,
    Grid,
    EditPen,
    Avatar,
    HomeManage,
    UserManage,
    NoteManage,
    MyManage
  },
  setup () {
    // 管理员信息
    const admin = reactive({
      id: '',
      nickname: '',
      avatar: '',
      email: '',
      sex: '',
      description: ''
    })

    const getAdminInfo = async () => {
      try {
        const result = await get('/user/getHolderInfo')
        if (result.code === 200 && result.data) {
          if (result.data.type !== 999) {
            ElMessage({
              showClose: true,
              message: '无权限访问！',
              type: 'error',
              center: true,
              duration: 1000
            })
            router.replace('/managementLogin')
          }
          admin.id = result.data.id
          admin.nickname = result.data.nickname
          admin.avatar = result.data.avatar
          admin.email = result.data.email
          admin.sex = result.data.sex
          admin.description = result.data.description
        } else if (result.code === 401) {
          ElMessage({
            showClose: true,
            message: '请先登录！',
            type: 'error',
            center: true,
            duration: 1000
          })
          router.replace('/managementLogin')
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

    // 点击菜单--首页
    const handleHomeClick = () => {
      console.log('首页')
      let isExist = false // 当前菜单对应的tab是否存在
      editableTabs.value.forEach(item => {
        if (item.name === '1') {
          isExist = true
        }
      })
      if (isExist) {
        editableTabsValue.value = '1'
      } else {
        const newTabName = '1'
        editableTabs.value.push({
          title: '首页',
          name: newTabName
        })
        editableTabsValue.value = newTabName
      }
    }
    // 点击菜单--用户管理
    const handleUserClick = () => {
      console.log('用户')
      let isExist = false
      editableTabs.value.forEach(item => {
        if (item.name === '2') {
          isExist = true
        }
      })
      if (isExist) {
        editableTabsValue.value = '2'
      } else {
        const newTabName = '2'
        editableTabs.value.push({
          title: '用户管理',
          name: newTabName
        })
        editableTabsValue.value = newTabName
      }
    }
    // 点击菜单--笔记管理
    const handleNoteClick = () => {
      console.log('笔记')
      let isExist = false
      editableTabs.value.forEach(item => {
        if (item.name === '3') {
          isExist = true
        }
      })
      if (isExist) {
        editableTabsValue.value = '3'
      } else {
        const newTabName = '3'
        editableTabs.value.push({
          title: '笔记管理',
          name: newTabName
        })
        editableTabsValue.value = newTabName
      }
    }
    // 点击菜单--个人中心
    const handleMyClick = () => {
      console.log('个人中心')
      let isExist = false
      editableTabs.value.forEach(item => {
        if (item.name === '4') {
          isExist = true
        }
      })
      if (isExist) {
        editableTabsValue.value = '4'
      } else {
        const newTabName = '4'
        editableTabs.value.push({
          title: '个人中心',
          name: newTabName
        })
        editableTabsValue.value = newTabName
      }
    }

    onMounted(() => {
      getAdminInfo() // 获取管理员信息
      handleHomeClick() // 默认首页
    })

    const editableTabsValue = ref('1') // 当前选中的tab
    // 可编辑的tabs
    const editableTabs = ref([
      {
        title: '首页',
        name: '1'
      }
    ])

    // 移除某个tab
    const handleTabsRemove = (targetName) => {
      const tabs = editableTabs.value
      let activeName = editableTabsValue.value
      if (activeName === targetName) {
        tabs.forEach((tab, index) => {
          if (tab.name === targetName) {
            const nextTab = tabs[index + 1] || tabs[index - 1]
            if (nextTab) {
              activeName = nextTab.name
            }
          }
        })
      }
      editableTabsValue.value = activeName
      editableTabs.value = tabs.filter((tab) => tab.name !== targetName)
    }

    const router = useRouter()
    const handleLogoutClick = async () => {
      try {
        const result = await post('user/logout')
        if (result.code === 200) {
          ElMessage({
            showClose: true,
            message: '退出成功！',
            type: 'success',
            center: true,
            duration: 1000
          })
          router.push('/managementLogin')
        } else {
          ElMessage({
            showClose: true,
            message: result.msg,
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
      admin,
      // activeIndex,
      handleHomeClick,
      handleUserClick,
      handleNoteClick,
      handleMyClick,
      editableTabsValue,
      editableTabs,
      handleTabsRemove,
      handleLogoutClick
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../style/viriables.scss';
  .box{
    width: 100vw;
    height: 100vh;
    display: flex;
  }
  .menu__wrapper{
    width: 220px;
  }
  .menu__title{
    width: 220px;
    height: 60px;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #fff;
    background-color: rgb(84, 92, 100);
    border-bottom: 1px solid rgb(25, 23, 23, .19);
  }
  .title{
    font-weight: bold;
    font-size: 16px;
    letter-spacing: 2px;
    margin-left: 5px;
  }
  .el-menu{
    height: calc(100vh - 60px);
  }
  :deep(.el-tabs__item){
    height: 30px;
    line-height: 30px;
    font-size: 12px;
  }
  :deep(.el-tabs__item:hover){
    color: #75a297;
  }
  :deep(.el-tabs__item.is-active){
    color: #75a297;
  }
  .content__wrapper{
    flex: 1;
    font-size: 18px;
    overflow: auto;
  }
  .content__header{
    height: 60px;
    padding-right: 20px;
    text-align: right;
    border-bottom: 1px solid #f3f3f3;
  }
  .nickname{
    font-size: 14px;
  }
  .logout{
    position: relative;
    top: 3px;
    margin-left: 10px;
    font-size: 22px;
    cursor: pointer; // 鼠标悬停出现小手
  }
  .content__tabs{
    font-size: 18px;
  }
  .demo-tabs > .el-tabs__content {
    padding: 32px;
    color: #6b778c;
    font-size: 32px;
    font-weight: 600;
  }
  :deep(.el-tabs__new-tab){
    display: none;
  }
</style>
