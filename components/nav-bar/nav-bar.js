Component({
  properties: {
    title: {
      type: String,
      value: '日常转盘'
    },
    showBack: {
      type: Boolean,
      value: false
    }
  },

  data: {
    statusBarHeight: 0,
    navBarHeight: 0
  },

  lifetimes: {
    attached() {
      // 获取系统信息
      const systemInfo = wx.getSystemInfoSync()
      const statusBarHeight = systemInfo.statusBarHeight || 0
      const navBarHeight = statusBarHeight + 44 // 44是导航栏内容高度
      
      this.setData({
        statusBarHeight,
        navBarHeight
      })
    }
  },

  methods: {
    onBack() {
      const pages = getCurrentPages()
      if (pages.length > 1) {
        wx.navigateBack({
          delta: 1,
          fail: () => {
            // 返回失败则跳转到首页
            wx.reLaunch({
              url: '/pages/index/index'
            })
          }
        })
      } else {
        // 如果是第一个页面，跳转到首页
        wx.reLaunch({
          url: '/pages/index/index'
        })
      }
    }
  }
})
