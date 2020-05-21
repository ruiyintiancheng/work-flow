// // 导出
// export default Loading
module.exports = function(path) {
  const arr = path.split('$workFlow')
  const component = arr[arr.length - 1]
  return function() {
    return import('./src/views' + component + '.vue')
  }
}
