const storageUtil = require('../../utils/storage.js')

Page({
  data: {
    navBarHeight: 0,
    list: [],
    result: '',
    isSpinning: false,
    rotation: 0,
    duration: 3, // 转动时长（秒）
    showManage: false,
    editIndex: -1,
    editValue: '',
    newItem: '',
    // 弹框相关
    modalShow: false,
    modalTitle: '',
    modalMessage: '',
    modalShowCancel: true,
    modalAction: '',
    modalData: null,
    // Toast相关
    toastShow: false,
    toastMessage: '',
    toastType: 'success',
    // 最大数量
    maxItems: storageUtil.getMaxItems()
  },

  onLoad() {
    const systemInfo = wx.getSystemInfoSync()
    const statusBarHeight = systemInfo.statusBarHeight || 0
    const navBarHeight = statusBarHeight + 44
    
    this.setData({
      navBarHeight,
      list: storageUtil.getList('exercise')
    })
  },

  // 显示Toast
  showToast(message, type = 'success') {
    this.setData({
      toastShow: true,
      toastMessage: message,
      toastType: type
    })
    
    setTimeout(() => {
      this.setData({ toastShow: false })
    }, 2000)
  },

  // 显示Modal
  showModal(title, message, action, data = null, showCancel = true) {
    this.setData({
      modalShow: true,
      modalTitle: title,
      modalMessage: message,
      modalAction: action,
      modalData: data,
      modalShowCancel: showCancel
    })
  },

  // Modal取消
  onModalCancel() {
    this.setData({ modalShow: false })
  },

  // Modal确认
  onModalConfirm() {
    const { modalAction } = this.data
    this.setData({ modalShow: false })
    
    if (modalAction === 'reset') {
      this.confirmReset()
    } else if (modalAction === 'clear') {
      this.confirmClear()
    }
  },

  // 开始转动
  startSpin() {
    if (this.data.isSpinning || this.data.list.length === 0) {
      if (this.data.list.length === 0) {
        this.showToast('请先添加选项', 'info')
      }
      return
    }

    const list = this.data.list
    const itemCount = list.length
    
    // 随机选择一个结果
    const randomIndex = Math.floor(Math.random() * itemCount)
    const result = list[randomIndex]
    
    // 计算每个项目的角度
    const anglePerItem = 360 / itemCount
    
    // 项目0在0度（顶部），项目按顺时针排列
    // 要让randomIndex项转到顶部，转盘需要逆时针转动（负角度）
    // 转盘旋转角度 = -randomIndex * anglePerItem
    const targetAngle = -randomIndex * anglePerItem
    
    // 计算当前rotation的标准化角度（0-360范围内）
    const currentAngle = ((this.data.rotation % 360) + 360) % 360
    
    // 计算需要转动的角度（从当前位置到目标位置）
    // 因为是逆时针转动，所以目标角度是负数
    let angleToTarget = targetAngle - currentAngle
    
    // 确保转动方向是顺时针（正数），并且至少转8圈
    // 如果angleToTarget是正数，说明需要逆时针转，我们要改成顺时针转更多圈
    if (angleToTarget > 0) {
      angleToTarget = angleToTarget - 360
    }
    
    // 多转几圈（顺时针）+ 到达目标的角度
    const spins = 8 + Math.floor(Math.random() * 5) // 8-12整圈
    const additionalRotation = spins * 360 + angleToTarget
    
    // 基于当前rotation继续转动
    const totalRotation = this.data.rotation + additionalRotation
    
    // 随机转动时长 3-5秒
    const durationMs = 3000 + Math.random() * 2000
    const durationSec = durationMs / 1000

    this.setData({
      isSpinning: true,
      rotation: totalRotation,
      duration: durationSec,
      result: ''
    })

    setTimeout(() => {
      this.setData({
        isSpinning: false,
        result
      })
    }, durationMs)
  },

  showManagePanel() {
    if (this.data.isSpinning) return
    this.setData({ showManage: true })
  },

  hideManagePanel() {
    this.setData({
      showManage: false,
      editIndex: -1,
      editValue: '',
      newItem: ''
    })
  },

  onNewItemInput(e) {
    this.setData({ newItem: e.detail.value })
  },

  addItem() {
    const item = this.data.newItem.trim()
    
    if (!item || item.length === 0) {
      this.showToast('请输入内容', 'info')
      return
    }

    const result = storageUtil.addItem('exercise', item)
    if (result.success) {
      this.setData({
        list: storageUtil.getList('exercise'),
        newItem: ''
      })
      this.showToast(result.message, 'success')
    } else {
      this.showToast(result.message, 'error')
    }
  },

  startEdit(e) {
    const index = e.currentTarget.dataset.index
    this.setData({
      editIndex: index,
      editValue: this.data.list[index]
    })
  },

  onEditInput(e) {
    this.setData({ editValue: e.detail.value })
  },

  saveEdit() {
    const value = this.data.editValue.trim()
    if (!value) {
      this.showToast('请输入内容', 'info')
      return
    }

    // 检查是否与其他项目重复
    const list = this.data.list
    const isDuplicate = list.some((item, index) => 
      item === value && index !== this.data.editIndex
    )
    
    if (isDuplicate) {
      this.showToast('该选项已存在', 'error')
      return
    }

    if (storageUtil.updateItem('exercise', this.data.editIndex, value)) {
      this.setData({
        list: storageUtil.getList('exercise'),
        editIndex: -1,
        editValue: ''
      })
      this.showToast('修改成功', 'success')
    }
  },

  cancelEdit() {
    this.setData({
      editIndex: -1,
      editValue: ''
    })
  },

  deleteItem(e) {
    const index = e.currentTarget.dataset.index
    this.confirmDelete(index)
  },

  confirmDelete(index) {
    if (storageUtil.deleteItem('exercise', index)) {
      this.setData({
        list: storageUtil.getList('exercise')
      })
      this.showToast('删除成功', 'success')
    }
  },

  resetToDefault() {
    this.showModal('确认重置', '确定要恢复默认数据吗？当前数据将被清空。', 'reset')
  },

  confirmReset() {
    if (storageUtil.resetToDefault('exercise')) {
      this.setData({
        list: storageUtil.getList('exercise')
      })
      this.showToast('重置成功', 'success')
    }
  },

  clearAll() {
    this.showModal('确认清空', '确定要清空所有选项吗？此操作不可恢复。', 'clear')
  },

  confirmClear() {
    if (storageUtil.clearAll('exercise')) {
      this.setData({
        list: storageUtil.getList('exercise')
      })
      this.showToast('清空成功', 'success')
    }
  },

  // 分享给朋友
  shareToFriend() {
    const that = this
    wx.showLoading({ title: '生成分享图...' })
    
    // 创建canvas
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
    ctx.fillText('日常转盘 - 打不打✈', 375, 150)
    
    // 绘制结果区域背景
    ctx.fillStyle = 'rgba(45, 27, 78, 0.8)'
    ctx.fillRect(100, 250, 550, 300)
    ctx.strokeStyle = '#FFE600'
    ctx.lineWidth = 8
    ctx.strokeRect(100, 250, 550, 300)
    
    // 绘制结果标签
    ctx.fillStyle = '#00F5D4'
    ctx.font = 'bold 40px sans-serif'
    ctx.fillText('今天', 375, 330)
    
    // 绘制结果内容
    ctx.fillStyle = '#FFFFFF'
    ctx.font = 'bold 100px sans-serif'
    ctx.fillText(this.data.result, 375, 450)
    
    // 绘制emoji
    ctx.font = '80px sans-serif'
    ctx.fillText('🎉', 375, 530)
    
    // 绘制诱惑文字
    ctx.fillStyle = '#FFE600'
    ctx.font = 'bold 45px sans-serif'
    ctx.fillText('你也来试试吧！', 375, 700)
    
    ctx.font = '35px sans-serif'
    ctx.fillStyle = '#FF3AF2'
    ctx.fillText('让转盘帮你做决定', 375, 770)
    
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
          entrancePath: '/pages/exercise/exercise'
        })
      },
      fail: (err) => {
        console.error('生成分享图失败', err)
        wx.hideLoading()
        that.showToast('生成分享图失败', 'error')
      }
    })
  },

  // 分享给朋友
  onShareAppMessage() {
    return {
      title: '日常转盘 - 打不打',
      path: '/pages/exercise/exercise',
      imageUrl: ''
    }
  },

  // 分享到朋友圈
  onShareTimeline() {
    return {
      title: '日常转盘 - 打不打',
      query: '',
      imageUrl: ''
    }
  }
})
