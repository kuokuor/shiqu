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
      style="width: 100%"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column
        prop="id"
        label="用户编号"
        width="180"
      />
      <el-table-column
        prop="email"
        label="邮箱账号"
        width="100"
      />
      <el-table-column
        prop="nickname"
        label="用户昵称"
        width="100"
      />
      <el-table-column
        prop="sex"
        label="性别"
        width="100"
      />
      <el-table-column
        prop="description"
        label="个人简介"
        width="100"
      />
      <!-- column-key="date" 表示该列以date字段进行排序（优先按列关键字排序） -->
      <el-table-column
        prop="date"
        label="创建时间"
        sortable
        width="180"
        column-key="date"
      />

      <el-table-column fixed="right" label="操作" width="120">
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
    <el-dialog v-model="dialogFormVisible" title="Shipping address">
      <el-form :model="form">
        <el-form-item label="Promotion name" :label-width="140">
          <el-input v-model="form.name" autocomplete="off" />
        </el-form-item>
        <el-form-item label="Zones" :label-width="140">
          <el-select v-model="form.region" placeholder="Please select a zone">
            <el-option label="Zone No.1" value="shanghai" />
            <el-option label="Zone No.2" value="beijing" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogFormVisible = false">Cancel</el-button>
          <el-button type="primary" @click="dialogFormVisible = false"
            >Confirm</el-button
          >
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { computed, reactive, ref } from 'vue'
export default {
  name: 'UserManage',
  setup () {
    const tableData = [
      {
        id: 1,
        email: '12',
        nickname: '你好',
        sex: 0,
        description: '',
        date: '2016-05-01'
      },
      {
        id: 2,
        email: '12',
        nickname: '不会吧',
        sex: 0,
        description: '',
        date: '2016-05-03'
      },
      {
        id: 3,
        email: '23',
        nickname: '哈哈哈',
        sex: 0,
        description: '',
        date: '2016-05-05'
      },
      {
        id: 4,
        email: '34',
        nickname: 'GreatBiscuit',
        sex: 0,
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

    const dialogFormVisible = ref(false)

    const handleUpdateClick = (index, user) => {
      dialogFormVisible.value = true
      console.log('修改', index, user)
    }

    const handleDeleteClick = () => {
      console.log('删除')
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
      handleUpdateClick,
      handleDeleteClick,
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
</style>
