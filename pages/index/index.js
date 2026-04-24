Page({
  data: {
    statusBarHeight: 0,
    safeTopHeight: 0,
    safeBottomHeight: 0,
    recommendVisible: false
  },

  onLoad() {
    // 获取系统信息
    const systemInfo = wx.getSystemInfoSync()
    const statusBarHeight = systemInfo.statusBarHeight || 0
    const menuButtonInfo = wx.getMenuButtonBoundingClientRect()
    
    // 计算安全顶部高度：胶囊按钮底部位置 + 一些间距
    const safeTopHeight = menuButtonInfo.bottom + 10
    
    // 计算底部安全区域高度
    const safeArea = systemInfo.safeArea || {}
    const screenHeight = systemInfo.screenHeight || 0
    const safeAreaBottom = safeArea.bottom || screenHeight
    const safeBottomHeight = screenHeight - safeAreaBottom
    
    this.setData({
      statusBarHeight,
      safeTopHeight,
      safeBottomHeight
    })
    
    // 创建 IntersectionObserver 监听推荐区域
    this.createObserver()
  },

  onShow() {
    // 每次显示页面时重置推荐区域状态
    this.setData({
      recommendVisible: false
    })
    
    // 重新创建观察器
    if (this.observer) {
      this.observer.disconnect()
    }
    this.createObserver()
  },

  onUnload() {
    // 页面卸载时断开观察器
    if (this.observer) {
      this.observer.disconnect()
    }
  },

  createObserver() {
    // 创建 IntersectionObserver 实例
    this.observer = wx.createIntersectionObserver(this, {
      thresholds: [0.1] // 当目标元素 10% 进入视口时触发
    })
    
    // 监听推荐区域
    this.observer.relativeToViewport({ bottom: 100 }).observe('.recommend-section', (res) => {
      if (res.intersectionRatio > 0 && !this.data.recommendVisible) {
        // 进入可视区域，显示动画
        this.setData({
          recommendVisible: true
        })
      }
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
