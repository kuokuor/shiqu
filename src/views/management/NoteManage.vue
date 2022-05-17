<template>
  <div>
    <el-form
      :inline="true"
      label-position="right"
      label-width="100px"
      :model="filterData"
    >
      <el-form-item label="笔记编号">
        <el-input v-model="filterData.id" placeholder="请输入笔记编号" clearable />
      </el-form-item>
      <el-form-item label="类型">
        <el-select v-model="filterData.type" placeholder="类型">
          <el-option label="美食笔记" value="美食笔记" />
          <el-option label="探店笔记" value="探店笔记" />
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
      :header-cell-style="{background: '#f1f4fa'}"
      style="width: 100%; padding: 10px 20px;"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column
        prop="id"
        label="笔记编号"
        width="180"
        align="center"
      />
      <el-table-column
        prop="userId"
        label="作者编号"
        width="180"
        align="center"
      />
      <el-table-column
        prop="title"
        label="标题"
        width="180"
        align="center"
      />
      <el-table-column
        prop="type"
        label="类型"
        width="100"
        align="center"
      />
      <el-table-column
        prop="score"
        label="分数"
        sortable
        width="180"
        column-key="score"
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
    <el-dialog v-model="dialogFormVisible" title="修改笔记">
      <el-form :model="noteForm" ref="noteFormRef" :rules="rules">
        <el-form-item label="标题" :label-width="80">
          <el-input v-model="noteForm.title" autocomplete="off" />
        </el-form-item>
        <el-form-item label="类型" :label-width="80">
          <el-select v-model="noteForm.type" placeholder="请选择类型">
            <el-option label="美食笔记" value="美食笔记" />
            <el-option label="探店笔记" value="探店笔记" />
          </el-select>
        </el-form-item>
        <el-form-item label="笔记正文" :label-width="80">
          <el-input
            v-model="noteForm.content"
            :autosize="{ minRows: 8, maxRows: 8 }"
            type="textarea"
            placeholder="请输入正文"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogFormVisible = false">取消</el-button>
          <el-button type="primary" @click="updateConfirmClick(noteFormRef)">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, computed } from 'vue'
import { ElMessageBox } from 'element-plus'

export default {
  name: 'NoteManage',
  setup () {
    const tableData = [
      {
        id: '1',
        userId: '',
        title: '你好',
        type: '美食笔记',
        content: '1',
        date: '2016-05-01'
      },
      {
        id: '2',
        userId: '',
        title: '不会吧',
        type: '美食笔记',
        content: '2',
        date: '2016-05-03'
      },
      {
        id: '3',
        userId: '',
        title: '哈哈哈',
        type: '探店笔记',
        content: '333',
        date: '2016-05-05'
      },
      {
        id: '4',
        userId: '',
        title: 'GreatBiscuit',
        type: '探店笔记',
        content: '444',
        date: '2016-05-04'
      },
      {
        id: '5',
        userId: '',
        title: 'GreatBiscuit',
        type: '探店笔记',
        content: 'hhh',
        date: '2016-05-04'
      },
      {
        id: '6',
        userId: '',
        title: 'GreatBiscuit',
        type: '探店笔记',
        content: 'uuu',
        date: '2016-05-04'
      },
      {
        id: '7',
        userId: '',
        title: 'GreatBiscuit',
        type: '探店笔记',
        content: 'zzz',
        date: '2016-05-04'
      },
      {
        id: '8',
        userId: '',
        title: 'GreatBiscuit',
        type: '探店笔记',
        content: '777',
        date: '2016-05-04'
      },
      {
        id: '9',
        userId: '',
        title: 'GreatBiscuit',
        type: '探店笔记',
        content: '88',
        date: '2016-05-04'
      },
      {
        id: '10',
        userId: '',
        title: 'GreatBiscuit',
        type: '探店笔记',
        content: '99',
        date: '2016-05-04'
      },
      {
        id: '11',
        userId: '',
        title: 'GreatBiscuit',
        type: '探店笔记',
        content: '11',
        date: '2016-05-04'
      },
      {
        id: '12',
        userId: '',
        title: 'GreatBiscuit',
        type: '探店笔记',
        content: '22',
        date: '2016-05-04'
      },
      {
        id: '13',
        userId: '',
        title: 'GreatBiscuit',
        type: '探店笔记',
        content: '33',
        date: '2016-05-04'
      },
      {
        id: '14',
        userId: '',
        title: 'GreatBiscuit',
        type: '探店笔记',
        content: '22',
        date: '2016-05-04'
      }
    ]

    // 筛选条件
    const filterData = reactive({
      id: '', // 笔记编号
      type: '', // 类型
      dateRange: [] // 创建日期范围
    })

    const filterTableData = ref(tableData) // 筛选出来的数据

    const showTableData = ref(tableData.slice(0, 5)) // 展示在表格的数据(始终跟filterTableData相关)

    // 搜索数据
    const handleSearchClick = () => {
      // 筛选数据
      filterTableData.value = tableData.filter((data) =>
        (!filterData.id || data.id.toLowerCase().includes(filterData.id.toLowerCase())) &&
        (!filterData.type || data.type === filterData.type) &&
        (!filterData.dateRange.length || (data.date >= filterData.dateRange[0] && data.date <= filterData.dateRange[1]))
      )
      console.log('筛选结果', filterTableData.value)
      showTableData.value = filterTableData.value.slice(0, 5) // 显示前5条
    }

    // 重置筛选条件
    const handleResetClick = () => {
      filterData.id = ''
      filterData.type = ''
      filterData.dateRange = []

      filterTableData.value = tableData // 重置筛选数据
      showTableData.value = filterTableData.value.slice(0, 5) // 显示前5条
      console.log('重置')
    }

    const tableRef = ref()

    const dialogFormVisible = ref(false) // 修改表单的对话框

    const noteForm = reactive({
      id: '',
      title: '',
      type: '',
      content: ''
    }) // 表单数据

    const noteFormRef = ref(null)

    const rules = reactive({
      title: [
        { required: true, message: '请输入标题', trigger: 'blur' },
        { min: 1, max: 20, message: '不能超过20个字符', trigger: 'blur' }
      ],
      type: [
        {
          required: true,
          message: '请选择类型',
          trigger: 'change'
        }
      ],
      content: [
        { required: true, message: '请输入正文', trigger: 'blur' }
      ]
    })

    const handleUpdateClick = (index, note) => {
      // index：当前索引；user：该行数据
      dialogFormVisible.value = true

      noteForm.id = note.id
      noteForm.title = note.title
      noteForm.type = note.type
      noteForm.content = note.content
      console.log('修改', index, note)
    }

    const handleDeleteClick = (index, note) => {
      console.log('删除')
      ElMessageBox.confirm(
        `确认删除用户编号为${note.id}的数据项？`,
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
      console.log('确认修改')
      if (!formEl) return
      formEl.validate(async (valid) => {
        if (valid) {
          console.log('验证成功，进行请求')
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
      showTableData.value = filterTableData.value.slice(5 * (val - 1), 5 * val)
    }

    return {
      filterData,
      showTableData,
      handleSearchClick,
      handleResetClick,
      tableRef,
      dialogFormVisible,
      noteForm,
      noteFormRef,
      rules,
      handleUpdateClick,
      handleDeleteClick,
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
  :deep(.el-select){
    width: 100%;
  }
</style>
