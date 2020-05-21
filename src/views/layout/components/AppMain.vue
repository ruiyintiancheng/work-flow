<template>
  <section class="app-main">
    <transition name="fade" mode="out-in">
        <keep-alive :include="cachedViews">
          <router-view></router-view>
        </keep-alive>
    </transition>
  </section>
</template>

<script>
export default {
  name: 'AppMain',
  computed: {
    cachedViews() {
      return this.$store.state.tagsView.cachedViews
    }
    // key() {
    //   return this.$route.name !== undefined ? this.$route.name + +new Date() : this.$route + +new Date()
    // }
  },
  created() {
    this.$i18n.locale = this.$store.state.app.language
    this.showSideBar(this.$route.path)
  },
  watch: {
    '$route'(to, from) {
      this.showSideBar(to.path)
    }
  },
  methods: {
    showSideBar(path) {
      const leftMap = this.$store.state.permission.leftMap // 左侧map选项
      const topRouters = this.$store.state.permission.topRouters // 顶部菜单
      const current = path.split('/')[path.split('/').length - 1]
      let boo = false
      for (const key in leftMap) {
        this.topItem = false
        this.findChildrenName(current, leftMap[key])
        if (this.topItem) {
          this.baseTopPath = ''
          this.findTopPath(key, topRouters)
          const parmObj = {
            leftRoutes: leftMap[key],
            path: this.baseTopPath
          }
          this.$store.dispatch('GenerateLeftRoutes', parmObj).then(() => {
            const style2 = {
              dispalySideBar: 'block',
              marginNavBar: '210px'
            }
            this.$store.dispatch('setPageStyle', style2).then(() => {
            }).catch(() => {
              alert('error submit!!')
            })
          }).catch(() => {
            alert('error submit!!')
          })
          boo = true
          break
        }
      }
      if (!boo) {
        const style = {
          dispalySideBar: 'none',
          marginNavBar: '0px'
        }
        this.$store.dispatch('setPageStyle', style).then(() => {
        }).catch(() => {
          alert('error submit!!')
        })
      }
    },
    findChildrenName(current, list) {
      for (const iterator of list) {
        if (iterator.path.split('/')[iterator.path.split('/').length - 1] === current) {
          this.topItem = true
          break
        }
        if (iterator.children && iterator.children.length > 0) {
          this.findChildrenName(current, iterator.children)
        }
      }
    },
    findTopPath(key, topRouters, str) {
      if (!str) {
        str = ''
      }
      for (const iterator of topRouters) {
        if (iterator.name === key) {
          str += '/' + iterator.name
          this.baseTopPath = str
          this.$store.dispatch('setSideTitle', iterator.meta.title).then(() => {
          }).catch(() => {
            alert('error submit!!')
          })
          break
        }
        if (iterator.children && iterator.children.length > 0) {
          str += '/' + iterator.name
          this.findTopPath(key, iterator.children, str)
          str = ''
        }
      }
    }
  }
}
</script>


