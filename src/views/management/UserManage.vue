<template>
  <div>
    <el-form
      :inline="true"
      label-position="right"
      label-width="100px"
      :model="filterData"
    >
      <el-form-item label="用户昵称">
        <el-input v-model="filterData.nickname" placeholder="请输入用户昵称" clearable />
      </el-form-item>
      <el-form-item label="邮箱">
        <el-input v-model="filterData.email" placeholder="请输入邮箱" clearable />
      </el-form-item>
      <el-form-item label="用户类型">
        <el-select v-model="filterData.type" placeholder="请选择用户类型">
          <el-option label="管理员" :value="true" />
          <el-option label="注册用户" :value="false" />
        </el-select>
      </el-form-item>
      <el-form-item label="创建时间">
        <el-date-picker
          v-model="filterData.dateRange"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        />
      </el-form-item>
      <el-form-item style="padding-left: 100px;">
        <el-button type="primary" @click="handleSearchClick">搜索</el-button>
        <el-button @click="handleResetClick">重置</el-button>
      </el-form-item>
    </el-form>
    <el-table
      ref="tableRef"
      row-key="id"
      :data="showTableData"
      empty-text="没有数据"
      :header-cell-style="{background: '#f1f4fa'}"
      style="width: 100%; padding: 10px 20px;"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column
        prop="id"
        label="用户编号"
        width="180"
        align="center"
      />
      <el-table-column
        prop="email"
        label="邮箱账号"
        width="180"
        align="center"
      />
      <el-table-column
        prop="nickname"
        label="用户昵称"
        width="180"
        align="center"
      />
      <el-table-column
        prop="type"
        label="管理员"
        width="180"
        align="center"
      >
        <template #default="scope">
          <el-switch
            v-model="scope.row.type"
            active-color="#13ce66"
            @change="handleTypeChange(scope.row.id, scope.row.email, scope.row.type)"
          />
        </template>
      </el-table-column>
      <el-table-column
        prop="sex"
        label="性别"
        width="100"
        align="center"
      />
      <el-table-column
        prop="description"
        label="个人简介"
        width="180"
        align="center"
      />
      <!-- column-key="createTime" 表示该列以createTime字段进行排序（优先按列关键字排序） -->
      <el-table-column
        prop="createTime"
        label="创建时间"
        sortable
        width="160"
        align="center"
        column-key="createTime"
      />

      <el-table-column fixed="right" label="操作" width="120" align="center">
        <template #default="scope">
          <el-button type="text" size="small" @click="handleDetailClick(scope.$index, scope.row)">详情</el-button>
          <el-button type="text" size="small" @click="handleDeleteClick(scope.$index, scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      v-model:currentPage="currentPage"
      :page-size="5"
      :background="true"
      layout="total, prev, pager, next, jumper"
      :total="total"
      @current-change="handleCurrentChange"
    />

    <!-- 点击详情弹出表单对话框 -->
    <el-dialog v-model="dialogFormVisible" title="用户信息">
      <el-form :model="userForm" :inline="true" class="detail__form">
        <el-form-item label="编号" :label-width="80">
          <el-input v-model="userForm.id" disabled />
        </el-form-item>
        <el-form-item label="邮箱" :label-width="80" prop="email">
          <el-input v-model="userForm.email" autocomplete="off" disabled />
        </el-form-item>
        <el-form-item label="用户昵称" :label-width="80" prop="nickname">
          <el-input v-model="userForm.nickname" autocomplete="off" disabled />
        </el-form-item>
        <el-form-item label="角色" :label-width="80">
          <el-input v-model="userForm.type" disabled />
        </el-form-item>
        <el-form-item label="性别" :label-width="80" prop="sex">
          <el-radio-group v-model="userForm.sex" disabled>
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
        <el-form-item label="状态" :label-width="80">
          <el-select v-model="state" @change="handleStateChange">
            <el-option label="正常" value="正常" />
            <el-option label="封禁中" value="封禁中" />
          </el-select>
        </el-form-item>
        <el-form-item label="个人简介" :label-width="80" prop="description" style="width: 100%;">
          <el-input
            v-model="userForm.description"
            :autosize="{ minRows: 3, maxRows: 3 }"
            type="textarea"
            placeholder="请输入个人简介"
            disabled
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogFormVisible = false">取消</el-button>
          <el-button type="primary" @click="updateSaveClick">保存</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 封禁对话框 -->
    <el-dialog custom-class="ban__dialog__wrapper" v-model="banDialogVisible" title="设置封禁时间">
      封禁天数：
      <el-input
        class="ban__time__input"
        type="number"
        v-model="banTime"
        min="1"
        autocomplete="off"
        :disabled="banForever"
      />
      天
      <el-switch
        v-model="banForever"
        active-color="#ff4949"
      />
      永久封禁
      <div class="tips">注：封禁天数必须为正整数</div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="banCancelClick">取消</el-button>
          <el-button type="primary" @click="banConfirmClick">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { computed, onMounted, reactive, ref } from 'vue'
import { router } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import { post, get } from '../../utils/request'
import moment from 'moment'

export default {
  name: 'UserManage',
  setup () {
    let tableData = [] // 所有用户信息

    const getAllUserInfo = async () => {
      try {
        const result = await get('/admin/getAllUser')
        if (result.code === 200 && result.data) {
          const userList = result.data
          tableData = userList.map(user => {
            // 初始化用户类型
            user.type === 999 ? user.type = true : user.type = false
            // 初始化用户性别
            if (user.sex === 0) {
              user.sex = '未知'
            } else if (user.sex === 1) {
              user.sex = '男'
            } else {
              user.sex = '女'
            }
            // 初始化创建时间
            user.createTime = moment(user.createTime).format('YYYY-MM-DD HH:mm:ss')
            return user
          })
          console.log('用户数据', tableData)
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

    onMounted(async () => {
      await getAllUserInfo()
      filterTableData.value = tableData
      showTableData.value = tableData.slice(0, 5)
      console.log('加载啦')
    })

    // 筛选条件
    const filterData = reactive({
      nickname: '', // 用户昵称
      email: '', // 邮箱
      type: null, // 类型
      dateRange: [] // 创建日期范围
    })

    const filterTableData = ref(tableData) // 筛选出来的数据

    const showTableData = ref(tableData.slice(0, 5)) // 展示在表格的数据(始终跟filterTableData相关)

    // 搜索数据
    const handleSearchClick = () => {
      // 筛选数据
      filterTableData.value = tableData.filter((data) =>
        (!filterData.nickname || data.nickname.toLowerCase().includes(filterData.nickname.toLowerCase())) &&
        (!filterData.email || data.email.toLowerCase().includes(filterData.email.toLowerCase())) &&
        (filterData.type === null || data.type === filterData.type) &&
        (!filterData.dateRange || !filterData.dateRange.length || (moment(data.createTime).valueOf() >= moment(filterData.dateRange[0]).valueOf() && moment(data.createTime).valueOf() <= moment(filterData.dateRange[1]).valueOf()))
      )
      console.log('筛选结果', filterTableData.value)
      showTableData.value = filterTableData.value.slice(0, 5) // 显示前5条
      currentPage.value = 1
    }

    // 重置筛选条件
    const handleResetClick = () => {
      // 清空筛选条件
      filterData.nickname = ''
      filterData.email = ''
      filterData.type = null
      filterData.dateRange = []

      filterTableData.value = tableData // 重置筛选数据
      showTableData.value = filterTableData.value.slice(0, 5) // 显示前5条
      currentPage.value = 1
      console.log('重置', tableData, filterTableData.value, showTableData.value)
    }

    const tableRef = ref()

    const dialogFormVisible = ref(false) // 修改表单的对话框

    const userForm = reactive({
      id: '',
      email: '',
      nickname: '',
      type: '',
      sex: '',
      description: ''
    }) // 表单数据

    /*
    const userFormRef = ref(null)
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
    */

    const handleTypeChange = (id, email, type) => {
      console.log('修改权限', id, email, type)
      const operation = type ? '授予' : '撤销'
      ElMessageBox.confirm(
        `确认${operation}账号${email}的管理员身份？`,
        '系统提示',
        {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(async () => {
          try {
            const formData = new FormData()
            formData.append('userId', id)
            formData.append('isAdmin', type)
            const result = await post('/admin/grant', formData)
            if (result.code === 200) {
              ElMessage({
                showClose: true,
                message: '操作成功',
                type: 'success',
                center: true,
                duration: 1000
              })
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
        })
        .catch(() => {
          showTableData.value = showTableData.value.map(user => {
            if (user.id === id) {
              user.type = !user.type
            }
            return user
          })
        })
    }

    const state = ref('正常') // 指定用户的封禁状态

    // 查看用户详情
    const handleDetailClick = async (index, user) => {
      // index：当前索引；user：该行数据
      dialogFormVisible.value = true

      userForm.id = user.id
      userForm.email = user.email
      userForm.nickname = user.nickname
      user.type ? userForm.type = '管理员' : userForm.type = '注册用户'
      userForm.sex = user.sex
      userForm.description = user.description

      try {
        const formData = new FormData()
        formData.append('userId', user.id)
        const result = await post('/admin/hasBan', formData)
        if (result.code === 200) {
          state.value = result.data ? '封禁中' : '正常'
        } else if (result.code === 401 || result.code === 403) {
          router.replace('/managementLogin')
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

    const banDialogVisible = ref(false) // 封禁对话框
    // 修改用户状态
    const handleStateChange = () => {
      if (state.value === '封禁中') {
        banDialogVisible.value = true
      }
    }

    const handleDeleteClick = (index, user) => {
      ElMessageBox.confirm(
        `确认删除编号为${user.id}的用户数据？`,
        '系统提示',
        {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(async () => {
          try {
            const formData = new FormData()
            formData.append('userId', user.id)
            const result = await post('/admin/deleteUser', formData)
            if (result.code === 200) {
              ElMessage({
                showClose: true,
                message: '操作成功',
                type: 'success',
                center: true,
                duration: 1000
              })
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
        })
        .catch(() => {
          // dialogFormVisible.value = false
        })
    }

    const banTime = ref(0) // 封禁时间(秒)
    const banForever = ref(false) // 是否永久封禁
    let time = 0 // 传给后端的封禁时间
    // 确认封禁时间
    const banConfirmClick = () => {
      if (banTime.value > 0) { // 对正数进行四舍五入取整
        time = banForever.value ? -1 : Math.floor(banTime.value) * 86400
      } else { // 负数，默认为正常
        state.value = '正常'
      }
      banDialogVisible.value = false // 关闭封禁对话框
    }
    // 取消封禁选择
    const banCancelClick = () => {
      state.value = '正常'
      banDialogVisible.value = false // 关闭封禁对话框
    }

    // 保存修改
    const updateSaveClick = async () => {
      if (state.value === '封禁中') { // 封禁
        try {
          const formData = new FormData()
          formData.append('userId', userForm.id)
          formData.append('banTime', time)
          const result = await post('/admin/banUser', formData)
          if (result.code === 200) {
            ElMessage({
              showClose: true,
              message: '操作成功',
              type: 'success',
              center: true,
              duration: 1000
            })
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
      } else { // 解封
        try {
          const formData = new FormData()
          formData.append('userId', userForm.id)
          const result = await post('/admin/unBanUser', formData)
          if (result.code === 200) {
            ElMessage({
              showClose: true,
              message: '操作成功',
              type: 'success',
              center: true,
              duration: 1000
            })
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
      dialogFormVisible.value = false
    }

    const multipleSelection = ref([]) // 被选择的对象列表
    // 多选状态发生变化时触发
    const handleSelectionChange = (rows) => {
      console.log('选择了', rows)
      multipleSelection.value = rows
      /**
      if (rows) {
        rows.forEach(row => {
          tableRef.value.toggleRowSelection(row)
        })
      }
      */
    }

    const total = computed(() => filterTableData.value.length) // 总条数
    const currentPage = ref(1) // 当前页

    // 改变当前页
    const handleCurrentChange = (val) => {
      console.log('当前页', val)
      showTableData.value = filterTableData.value.slice(5 * (val - 1), 5 * val)
      console.log('当前页数据', showTableData.value)
    }

    return {
      handleTypeChange,
      filterData,
      showTableData,
      handleSearchClick,
      handleResetClick,
      tableRef,
      dialogFormVisible,
      userForm,
      state,
      handleDetailClick,
      banDialogVisible,
      handleStateChange,
      banTime,
      banForever,
      banCancelClick,
      banConfirmClick,
      handleDeleteClick,
      updateSaveClick,
      handleSelectionChange,
      total,
      currentPage,
      handleCurrentChange
    }
  }
}
</script>

<style lang="scss" scoped>
  :deep(.el-pagination){
    justify-content: center;
  }
  :deep(.el-form-item__label){
    font-weight: bolder;
  }
  :deep(.el-form--inline .el-form-item){
    width: 400px;
  }
  :deep(.el-select){
    width: 100%;
  }
  .detail__form{
    .el-form-item{
      width: 280px;
    }
  }
  :deep(.el-form--inline .el-form-item){
    margin-right: 0;
  }
  :deep(.el-dialog){
    width: 640px;
    height: 420px;
  }
  :deep(.el-radio){
    margin-right: 5px;
  }
  :deep(.el-dialog__footer){
    padding: 0;
    text-align: center;
  }

  :deep(.ban__dialog__wrapper){
    width: 500px;
    height: 200px;
    margin: calc(50vh - 100px) calc(50vw - 250px);
    .el-dialog__body{
      padding: 10px;
    }
    .el-switch{
      margin-left: 20px;
    }
  }

  .ban__time__input{
    width: 50px;
    :deep(.el-input__inner){
      padding-right: 0;
    }
  }

  .tips{
    font-size: 20px;
    color: red;
    transform: scale(0.5);
    text-align: left;
    margin-left: -10px;
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
