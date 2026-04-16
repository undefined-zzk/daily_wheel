Page({
  data: {
    navBarHeight: 0,
    isShaking: false,
    showStick: false,
    showResult: false,
    lotResult: {
      type: '',
      title: '',
      content: ''
    }
  },

  onLoad() {
    const systemInfo = wx.getSystemInfoSync()
    const statusBarHeight = systemInfo.statusBarHeight || 0
    const navBarHeight = statusBarHeight + 44
    
    this.setData({
      navBarHeight
    })
  },

  drawLot() {
    if (this.data.isShaking) return

    // 签文数据
    const lots = [
      { type: '上上签', title: '大吉大利', content: '万事如意，心想事成，好运连连' },
      { type: '上签', title: '吉星高照', content: '贵人相助，事业顺利，财运亨通' },
      { type: '上签', title: '喜事临门', content: '好事将近，喜上眉梢，笑口常开' },
      { type: '中签', title: '平安顺遂', content: '平平安安，顺顺利利，知足常乐' },
      { type: '中签', title: '稳中求进', content: '脚踏实地，步步为营，终有所成' },
      { type: '中签', title: '守得云开', content: '耐心等待，时机将至，否极泰来' },
      { type: '下签', title: '谨慎行事', content: '三思而后行，小心为上，避免冲动' },
      { type: '下签', title: '静待时机', content: '暂时蛰伏，积蓄力量，等待转机' }
    ]

    // 随机抽取
    const randomIndex = Math.floor(Math.random() * lots.length)
    const result = lots[randomIndex]

    // 第一步：开始晃动签筒
    this.setData({
      isShaking: true,
      showStick: false,
      showResult: false,
      lotResult: result
    })

    // 第二步：800ms后签飞出来，同时显示完整签文
    setTimeout(() => {
      this.setData({
        showStick: true,
        showResult: true
      })
    }, 800)

    // 第三步：2300ms后结束动画（800ms晃动 + 1500ms飞行）
    setTimeout(() => {
      this.setData({
        isShaking: false,
        showStick: false
      })
    }, 2300)
  },

  // 分享给朋友
  shareToFriend() {
    const that = this
    wx.showLoading({ title: '生成分享图...' })
    
    const canvas = wx.createOffscreenCanvas({ type: '2d', width: 750, height: 1200 })
    const ctx = canvas.getContext('2d')
    
    // 绘制背景
    const gradient = ctx.createLinearGradient(0, 0, 0, 1200)
    gradient.addColorStop(0, '#0D0D1A')
    gradient.addColorStop(1, '#1a0d2e')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 750, 1200)
    
    // 绘制装饰图案
    ctx.fillStyle = 'rgba(255, 58, 242, 0.1)'
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 15; j++) {
        ctx.beginPath()
        ctx.arc(i * 80 + 40, j * 80 + 40, 2, 0, Math.PI * 2)
        ctx.fill()
      }
    }
    
    // 绘制标题
    ctx.fillStyle = '#FFFFFF'
    ctx.font = 'bold 70px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('日常转盘 - 抽签', 375, 150)
    
    // 绘制结果区域背景
    ctx.fillStyle = 'rgba(45, 27, 78, 0.8)'
    ctx.fillRect(100, 250, 550, 400)
    ctx.strokeStyle = '#FFE600'
    ctx.lineWidth = 8
    ctx.strokeRect(100, 250, 550, 400)
    
    // 绘制签文类型
    ctx.fillStyle = '#FFE600'
    ctx.font = 'bold 50px sans-serif'
    ctx.fillText(this.data.lotResult.type, 375, 330)
    
    // 绘制签文标题
    ctx.fillStyle = '#00F5D4'
    ctx.font = 'bold 60px sans-serif'
    ctx.fillText(this.data.lotResult.title, 375, 420)
    
    // 绘制签文内容
    ctx.fillStyle = '#FFFFFF'
    ctx.font = '35px sans-serif'
    const content = this.data.lotResult.content
    const maxWidth = 450
    const lineHeight = 50
    const words = content.split('，')
    let y = 500
    
    words.forEach((word, index) => {
      if (index < words.length - 1) {
        ctx.fillText(word + '，', 375, y)
      } else {
        ctx.fillText(word, 375, y)
      }
      y += lineHeight
    })
    
    // 绘制emoji
    ctx.font = '80px sans-serif'
    ctx.fillText('🎐', 375, 700)
    
    // 绘制诱惑文字
    ctx.fillStyle = '#FFE600'
    ctx.font = 'bold 45px sans-serif'
    ctx.fillText('你也来试试吧！', 375, 850)
    
    ctx.font = '35px sans-serif'
    ctx.fillStyle = '#FF3AF2'
    ctx.fillText('测测你的运势', 375, 920)
    
    // 绘制底部提示
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
    ctx.font = '30px sans-serif'
    
    // 转换为临时文件
    wx.canvasToTempFilePath({
      canvas: canvas,
      success: (res) => {
        wx.hideLoading()
        wx.showShareImageMenu({
          path: res.tempFilePath,
          entrancePath: '/pages/dice/dice'
        })
      },
      fail: (err) => {
        console.error('生成分享图失败', err)
        wx.hideLoading()
        wx.showToast({ title: '生成分享图失败', icon: 'none' })
      }
    })
  },

  // 分享给朋友
  onShareAppMessage() {
    return {
      title: '日常转盘 - 抽签',
      path: '/pages/dice/dice',
      imageUrl: ''
    }
  },

  // 分享到朋友圈
  onShareTimeline() {
    return {
      title: '日常转盘 - 抽签',
      query: '',
      imageUrl: ''
    }
  }
})
