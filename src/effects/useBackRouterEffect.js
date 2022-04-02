import { useRouter } from 'vue-router'

// 点击返回图标的逻辑
export const useBackRouterEffect = () => {
  const router = useRouter()
  const handleBackClick = () => {
    router.back() // 返回到上一页面
  }
  return { handleBackClick }
}
