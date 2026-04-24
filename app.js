// app.js
App({
  onLaunch() {
    // 获取系统信息并存储，供全局使用
    this.getSystemInfo()
    // 检查小程序更新
    this.checkUpdate()
  },

  // 获取系统信息
  getSystemInfo() {
    const systemInfo = wx.getSystemInfoSync()
    const menuButtonInfo = wx.getMenuButtonBoundingClientRect()
    
    // 计算安全区域
    const statusBarHeight = systemInfo.statusBarHeight || 0
    const navBarHeight = statusBarHeight + 44
    const safeTopHeight = menuButtonInfo.bottom + 10
    
    // 底部安全区域高度
    const safeAreaInsets = systemInfo.safeArea || {}
    const screenHeight = systemInfo.screenHeight || 0
    const safeAreaBottom = safeAreaInsets.bottom || screenHeight
    const safeBottomHeight = screenHeight - safeAreaBottom
    
    // 存储到全局数据
    this.globalData = {
      systemInfo,
      statusBarHeight,
      navBarHeight,
      safeTopHeight,
      safeBottomHeight,
      isIOS: systemInfo.platform === 'ios'
    }
  },

  // 检查小程序更新
  checkUpdate() {
    const updateManager = wx.getUpdateManager()

    // 检查是否有新版本
    updateManager.onCheckForUpdate((res) => {
      console.log('检查更新结果:', res.hasUpdate)
    })

    // 新版本下载成功
    updateManager.onUpdateReady(() => {
      wx.showModal({
        title: '更新提示',
        content: '新版本已经准备好，是否重启应用？',
        success: (res) => {
          if (res.confirm) {
            // 新版本已下载，调用 applyUpdate 应用新版本并重启
            updateManager.applyUpdate()
          }
        }
      })
    })

    // 新版本下载失败
    updateManager.onUpdateFailed(() => {
      wx.showModal({
        title: '更新失败',
        content: '新版本下载失败，请删除小程序后重新搜索打开',
        showCancel: false
      })
    })
  }
})
