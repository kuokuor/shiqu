// 判断鼠标点击区域的逻辑
import { ref, onMounted, onUnmounted } from 'vue'
export const useClickOutside = (elementRef) => {
  const isOutside = ref(false) // 标识鼠标点击的是否为外部区域
  const handler = (e) => {
    console.log('区域', elementRef.value)
    console.log('点击目标', e.target)
    if (elementRef.value) {
      if (!elementRef.value.contains(e.target)) { // 此处e.target表示鼠标点击的目标对象，不一定为HTMLElement，需断言成HTMLElement
        // 鼠标点击外部区域
        isOutside.value = true
      } else {
        // 鼠标点击内部区域
        isOutside.value = false
      }
    }
  }
  onMounted(() => {
    document.addEventListener('click', handler)
  })
  onUnmounted(() => {
    document.removeEventListener('click', handler)
  })
  return {
    isOutside
  }
}
