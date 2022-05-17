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
      <!-- column-key="date" 表示该列以date字段进行排序（优先按列关键字排序） -->
      <el-table-column
        prop="date"
        label="创建时间"
        sortable
        width="150"
        column-key="date"
      />

      <el-table-column fixed="right" label="操作" width="120" align="center">
        <template #default="scope">
          <el-button type="text" size="small" @click="handleUpdateClick(scope.$index, scope.row)">修改</el-button>
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

    <!-- 弹出表单对话框 -->
    <el-dialog v-model="dialogFormVisible" title="修改用户">
      <el-form :model="userForm" ref="userFormRef" :rules="rules">
        <el-form-item label="邮箱" :label-width="80">
          <el-input v-model="userForm.email" autocomplete="off" />
        </el-form-item>
        <el-form-item label="用户昵称" :label-width="80">
          <el-input v-model="userForm.nickname" autocomplete="off" />
        </el-form-item>
        <el-form-item label="性别" :label-width="80">
          <el-radio-group v-model="userForm.sex">
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
        <el-form-item label="个人简介" :label-width="80">
          <el-input
            v-model="userForm.description"
            :autosize="{ minRows: 5, maxRows: 5 }"
            type="textarea"
            placeholder="请输入个人简介"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogFormVisible = false">取消</el-button>
          <el-button type="primary" @click="updateConfirmClick(userFormRef)">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { computed, reactive, ref } from 'vue'
import { ElMessageBox } from 'element-plus'

export default {
  name: 'UserManage',
  setup () {
    const tableData = [
      {
        id: 1,
        email: '12',
        nickname: '你好',
        sex: '男',
        description: '',
        date: '2016-05-01'
      },
      {
        id: 2,
        email: '12',
        nickname: '不会吧',
        sex: '未知',
        description: '',
        date: '2016-05-03'
      },
      {
        id: 3,
        email: '23',
        nickname: '哈哈哈',
        sex: '男',
        description: '',
        date: '2016-05-05'
      },
      {
        id: 4,
        email: '34',
        nickname: 'GreatBiscuit',
        sex: '女',
        description: '',
        date: '2016-05-04'
      },
      {
        id: 5,
        email: '12',
        nickname: '你好',
        sex: 0,
        description: '',
        date: '2016-05-01'
      },
      {
        id: 6,
        email: '12',
        nickname: '不会吧',
        sex: 0,
        description: '',
        date: '2016-05-03'
      },
      {
        id: 7,
        email: '23',
        nickname: '哈哈哈',
        sex: 0,
        description: '',
        date: '2016-05-05'
      },
      {
        id: 8,
        email: '34',
        nickname: 'GreatBiscuit',
        sex: 0,
        description: '',
        date: '2016-05-04'
      },
      {
        id: 9,
        email: '12',
        nickname: '你好',
        sex: 0,
        description: '',
        date: '2016-05-01'
      },
      {
        id: 10,
        email: '12',
        nickname: '不会吧',
        sex: 0,
        description: '',
        date: '2016-05-03'
      },
      {
        id: 11,
        email: '23',
        nickname: '哈哈哈',
        sex: 0,
        description: '',
        date: '2016-05-05'
      },
      {
        id: 12,
        email: '34',
        nickname: 'GreatBiscuit',
        sex: 0,
        description: '',
        date: '2016-05-04'
      },
      {
        id: 13,
        email: '12',
        nickname: '你好',
        sex: 0,
        description: '',
        date: '2016-05-01'
      },
      {
        id: 14,
        email: '12',
        nickname: '不会吧',
        sex: 0,
        description: '',
        date: '2016-05-03'
      },
      {
        id: 15,
        email: '23',
        nickname: '哈哈哈',
        sex: 0,
        description: '',
        date: '2016-05-05'
      },
      {
        id: 16,
        email: '34',
        nickname: 'GreatBiscuit',
        sex: 0,
        description: '',
        date: '2016-05-04'
      }
    ]

    // 筛选条件
    const filterData = reactive({
      nickname: '', // 用户昵称
      email: '', // 邮箱
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
        (!filterData.dateRange.length || (data.date >= filterData.dateRange[0] && data.date <= filterData.dateRange[1]))
      )
      console.log('筛选结果', filterTableData.value)
      showTableData.value = filterTableData.value.slice(0, 5) // 显示前5条
    }

    // 重置筛选条件
    const handleResetClick = () => {
      // 清空筛选条件
      filterData.nickname = ''
      filterData.email = ''
      filterData.dateRange = []

      filterTableData.value = tableData // 重置筛选数据
      showTableData.value = filterTableData.value.slice(0, 5) // 显示前5条
      console.log('重置')
    }

    const tableRef = ref()

    const dialogFormVisible = ref(false) // 修改表单的对话框

    const userForm = reactive({
      id: '',
      email: '',
      nickname: '',
      sex: '',
      description: ''
    }) // 表单数据

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

    const handleUpdateClick = (index, user) => {
      // index：当前索引；user：该行数据
      dialogFormVisible.value = true

      userForm.id = user.id
      userForm.email = user.email
      userForm.nickname = user.nickname
      userForm.sex = user.sex
      userForm.description = user.description
      console.log('修改', index, user)
    }

    const handleDeleteClick = (index, user) => {
      console.log('删除')
      ElMessageBox.confirm(
        `确认删除用户编号为${user.id}的数据项？`,
        '系统提示',
        {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(() => {
          console.log('删除成功')
          dialogFormVisible.value = false
        })
        .catch(() => {
          console.log('取消删除')
          dialogFormVisible.value = false
        })
    }

    const updateConfirmClick = (formEl) => {
      console.log('确认修改', formEl)
      if (!formEl) return
      formEl.validate(async (valid) => {
        if (valid) {
          console.log('通过验证，进行请求')
        }
      })

      dialogFormVisible.value = false
    }

    const multipleSelection = ref([]) // 被选择的对象列表
    // 多选状态发生变化时触发
    const handleSelectionChange = (val) => {
      console.log('选择了', val)
      multipleSelection.value = val
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
      filterData,
      showTableData,
      handleSearchClick,
      handleResetClick,
      tableRef,
      dialogFormVisible,
      userForm,
      handleUpdateClick,
      handleDeleteClick,
      userFormRef,
      rules,
      updateConfirmClick,
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
