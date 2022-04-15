// 格式化关注、点赞、收藏、评论数量
export const handleCountShow = (count) => {
  let result = count
  if (result / 10000 >= 1) {
    let format = (result / 10000).toFixed(1)
    if (format > 10) {
      format = Math.floor(format)
    }
    result = `${format}万`
  }
  return result
}
