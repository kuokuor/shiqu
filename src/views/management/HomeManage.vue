<template>
  <div class="wrapper">
    <el-card class="box-card">
      <div class="card__title">用户状态</div>
      <div class="item__total">
        <span>用户总数</span>
        <div style="color: #f33243;">{{allUser}}</div>
      </div>
      <div class="item__wrapper">
        <div class="item__count">
          <span>未知用户</span>
          <div style="color: #717e88;">{{unknownUser}}</div>
        </div>
        <div class="item__count">
          <span>男性用户</span>
          <div style="color: #0da0f0;">{{maleUser}}</div>
        </div>
        <div class="item__count">
          <span>女性用户</span>
          <div style="color: #f458c2;">{{femaleUser}}</div>
        </div>
      </div>
    </el-card>

    <el-card class="box-card">
      <div class="card__title">笔记状态</div>
      <div class="item__total">
        <span>笔记总数</span>
        <div style="color: #f33243;">{{allNote}}</div>
      </div>
      <div class="item__wrapper">
        <div class="item__count">
          <span>美食笔记</span>
          <div style="color: #ff8107;">{{foodNote}}</div>
        </div>
        <div class="item__count">
          <span>探店笔记</span>
          <div style="color: #17db84;">{{shopNote}}</div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import { onMounted, ref } from 'vue'
import { get } from '../../utils/request'
import { ElMessage } from 'element-plus'

export default {
  name: 'HomeManage',
  setup () {
    const allUser = ref(0)
    const unknownUser = ref(0)
    const maleUser = ref(0)
    const femaleUser = ref(0)
    // 获取用户数量
    const getUserCount = async () => {
      try {
        const result = await get('/admin/userCount')
        if (result.code === 200) {
          allUser.value = result.data.allUser
          unknownUser.value = result.data.unknownUser
          maleUser.value = result.data.maleUser
          femaleUser.value = result.data.femaleUser
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

    const allNote = ref(0)
    const foodNote = ref(0)
    const shopNote = ref(0)
    // 获取笔记数量
    const getNoteCount = async () => {
      try {
        const result = await get('/admin/noteCount')
        if (result.code === 200) {
          allNote.value = result.data.allNote
          foodNote.value = result.data.foodNote
          shopNote.value = result.data.shopNote
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

    onMounted(() => {
      getUserCount()
      getNoteCount()
    })
    return {
      allUser,
      unknownUser,
      maleUser,
      femaleUser,
      allNote,
      foodNote,
      shopNote
    }
  }
}
</script>

<style lang="scss" scoped>
  .box-card {
    display: inline-block;
    width: 350px;
    height: 200px;
    margin: 20px 30px;
  }
  .card__title{
    margin-bottom: 20px;
    font-size: 16px;
    text-align: left;
    font-weight: bold;
  }
  .item__total{
    margin-bottom: 20px;
    /* font-weight: bold; */
    font-size: 16px;
  }
  .item__wrapper{
    display: flex;
    /* font-weight: bold; */
    font-size: 16px;
  }
  .item__count{
    flex: 1;
  }
</style>
