Page({
  data: {
    statusBarHeight: 0,
    safeTopHeight: 0
  },

  onLoad() {
    // 获取系统信息
    const systemInfo = wx.getSystemInfoSync()
    const statusBarHeight = systemInfo.statusBarHeight || 0
    const menuButtonInfo = wx.getMenuButtonBoundingClientRect()
    
    // 计算安全顶部高度：胶囊按钮底部位置 + 一些间距
    const safeTopHeight = menuButtonInfo.bottom + 10
    
    this.setData({
      statusBarHeight,
      safeTopHeight
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
