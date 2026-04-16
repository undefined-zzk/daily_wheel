Page({
  data: {
    navBarHeight: 0
  },

  onLoad() {
    // 获取导航栏高度
    const systemInfo = wx.getSystemInfoSync()
    const statusBarHeight = systemInfo.statusBarHeight || 0
    const navBarHeight = statusBarHeight + 44
    
    this.setData({
      navBarHeight
    })
  },

  navigateTo(e) {
    const page = e.currentTarget.dataset.page
    wx.navigateTo({
      url: `/pages/${page}/${page}`
    })
  },

  // 分享给朋友
  onShareAppMessage() {
    return {
      title: '日常转盘 - 让转盘帮你做决定',
      path: '/pages/index/index',
      imageUrl: ''
    }
  },

  // 分享到朋友圈
  onShareTimeline() {
    return {
      title: '日常转盘 - 让转盘帮你做决定',
      query: '',
      imageUrl: ''
    }
  }
})
