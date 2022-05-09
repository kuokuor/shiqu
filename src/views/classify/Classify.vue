<template>
  <div class="title">分类</div>
  <el-tabs v-model="activeTabName" type="border-card" class="demo-tabs" tab-position="left" @tab-click="handleTabClick">
    <el-tab-pane
      v-for="(item, index) of tagList"
      :key="index"
      :label="item"
      :name="index"
    >
      <div class="wrapper">
        <div
          v-for="item in noteList[index]"
          :key="item.note.id"
          class="content__wrapper"
        >
          <contents :noteData="item" @changeLiked="changeLiked" />
        </div>
      </div>
    </el-tab-pane>
  </el-tabs>
  <docker :currentIndex="2" />
</template>

<script>
import { onMounted, ref } from 'vue'
import { post } from '../../utils/request'
import { handleCountShow } from '../../effects/useHandleCountEffect'
import { ElMessage } from 'element-plus'
import Contents from '../home/Contents.vue'
import Docker from '../../components/Docker.vue'
export default {
  name: 'Classify',
  components: {
    Contents,
    Docker
  },
  setup () {
    const tagList = ref([
      '川湘菜', '粤菜', '江浙菜', '农家菜', '家常菜', '其他中餐',
      '西餐', '日本料理', '韩式料理', '东南亚菜',
      '小吃快餐', '奶茶果汁', '面包蛋糕', '甜品', '下午茶', '火锅', '自助餐', '烧烤烤肉'
    ])

    const activeTabName = ref(0)

    const noteList = ref([])

    const handleTabClick = async () => {
      console.log(activeTabName.value)
      try {
        const formData = new FormData()
        formData.append('tag', activeTabName.value)
        const result = await post('/note/classify', formData)
        if (result.code === 200) {
          console.log('该分类下的笔记列表', result.data)
          // 该分类下的笔记列表不为空，对笔记点赞数进行格式化
          if (!result.data) {
            const list = result.data
            list.forEach((column) => {
              const likeCount = handleCountShow(column.note.likeCount) // 格式化点赞数量
              column.note.likeCount = likeCount
            })
          }
          noteList.value[activeTabName.value] = [...result.data]
          console.log(noteList.value)
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
      handleTabClick()
    })

    // 点赞与取消
    const changeLiked = (id, liked, count) => {
      noteList.value[activeTabName.value] = noteList.value[activeTabName.value].map((noteData) => {
        if (noteData.note.id === id) {
          noteData.note.liked = liked
          if (typeof noteData.note.likeCount === 'number') {
            noteData.note.likeCount += count
          }
        }
        return noteData
      })
    }

    return {
      tagList,
      activeTabName,
      noteList,
      handleTabClick,
      changeLiked
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../style/viriables.scss';
  .title {
    width: 100%;
    height: .5rem;
    line-height: .5rem;
    font-size: .18rem;
  }
  .demo-tabs {
    width: 100%;
    height: calc(100vh - 1rem);
  }
  :deep(.demo-tabs .custom-tabs-label span) {
    vertical-align: middle;
    margin-left: 4px;
  }
  :deep(.el-tabs__item.is-left) {
    height: calc((100vh - 1rem) / 18);
    line-height: calc((100vh - 1rem) / 18);
    text-align: center;
  }
  :deep(.el-tabs__item.is-active) {
    color: $themeColor !important;
  }
  :deep(.el-tabs__nav-prev) {
    left: 0 !important;
  }
  :deep(.el-tabs__nav-next) {
    right: 0 !important;
  }
  .wrapper{
    padding: 0 .02rem;
    overflow: auto;
    column-count: 2;
    column-gap: .01rem;
  }
  .content__wrapper{
    margin-bottom: .02rem;
    break-inside: avoid;
  }
</style>
