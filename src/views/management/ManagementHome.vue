<template>
  <div class="box">
    <div class="menu__wrapper">
      <div class="menu__title">
        <el-avatar style="--el-avatar-size: .16rem" src="" />
        <span class="title">食趣后台管理系统</span>
      </div>
      <el-menu
        active-text-color="#ffd04b"
        background-color="#545c64"
        class="el-menu-vertical-demo"
        :default-active="activeIndex"
        text-color="#fff"
      >
        <el-menu-item index="1" @click="handleHomeClick">
            <el-icon><home-filled /></el-icon>
            <span>首页</span>
        </el-menu-item>
        <el-menu-item index="2" @click="handleUserClick">
          <el-icon><user-filled /></el-icon>
          <span>用户管理</span>
        </el-menu-item>
        <el-menu-item index="3" @click="handleNoteClick">
          <el-icon><edit-pen /></el-icon>
          <span>笔记管理</span>
        </el-menu-item>
        <el-menu-item index="4" @click="handleNoticeClick">
          <el-icon><comment /></el-icon>
          <span>通知公告</span>
        </el-menu-item>
      </el-menu>
    </div>
    <div class="content__wrapper">
      <div class="content__header">
        header
      </div>
      <div class="content__tabs">
        <el-tabs
          v-model="editableTabsValue"
          type="card"
          editable
          class="demo-tabs"
          @tab-remove="handleTabsRemove"
          @tab-click="handleTabClick"
        >
          <el-tab-pane
            v-for="item in editableTabs"
            :key="item.name"
            :label="item.title"
            :name="item.name"
          >
            <user-manage />
          </el-tab-pane>
        </el-tabs>
      </div>
      <div class="content__main">
        main
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { HomeFilled, UserFilled, EditPen, Comment } from '@element-plus/icons-vue'
import UserManage from './UserManage.vue'
export default {
  name: 'ManagementHome',
  components: {
    HomeFilled,
    UserFilled,
    EditPen,
    Comment,
    UserManage
  },
  setup () {
    const activeIndex = ref('1') // 当前菜单默认选中项

    const handleHomeClick = () => {
      console.log('首页')
      let isExist = false
      editableTabs.value.forEach(item => {
        if (item.name === '1') {
          isExist = true
        }
      })
      console.log(isExist)
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
    const handleUserClick = () => {
      console.log('用户')
      let isExist = false
      editableTabs.value.forEach(item => {
        if (item.name === '2') {
          isExist = true
        }
      })
      console.log(isExist)
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
    const handleNoteClick = () => {
      console.log('笔记')
      let isExist = false
      editableTabs.value.forEach(item => {
        if (item.name === '3') {
          isExist = true
        }
      })
      console.log(isExist)
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
    const handleNoticeClick = () => {
      console.log('通知')
      let isExist = false
      editableTabs.value.forEach(item => {
        if (item.name === '4') {
          isExist = true
        }
      })
      console.log(isExist)
      if (isExist) {
        editableTabsValue.value = '4'
      } else {
        const newTabName = '4'
        editableTabs.value.push({
          title: '通知公告',
          name: newTabName
        })
        editableTabsValue.value = newTabName
      }
    }

    onMounted(() => {
      handleHomeClick()
    })

    const editableTabsValue = ref('1')
    const editableTabs = ref([
      {
        title: '首页',
        name: '1'
      }
    ])

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

    const handleTabClick = (TabsPaneContext) => {
      // 变动对应菜单
      activeIndex.value = TabsPaneContext.props.name
    }

    return {
      activeIndex,
      handleHomeClick,
      handleUserClick,
      handleNoteClick,
      handleNoticeClick,
      editableTabsValue,
      editableTabs,
      handleTabsRemove,
      handleTabClick
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
    width: 100%;
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
  }
  .content__header{
    font-size: 18px;
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
  .content__main{
    font-size: 18px;
  }
</style>
