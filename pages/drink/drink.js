const storageUtil = require('../../utils/storage.js')

Page({
  data: {
    navBarHeight: 0,
    list: [],
    result: '',
    isSpinning: false,
    rotation: 0,
    duration: 3,
    showManage: false,
    editIndex: -1,
    editValue: '',
    newItem: '',
    modalShow: false,
    modalTitle: '',
    modalMessage: '',
    modalShowCancel: true,
    modalAction: '',
    modalData: null,
    toastShow: false,
    toastMessage: '',
    toastType: 'success',
    maxItems: storageUtil.getMaxItems()
  },

  onLoad() {
    const systemInfo = wx.getSystemInfoSync()
    const statusBarHeight = systemInfo.statusBarHeight || 0
    const navBarHeight = statusBarHeight + 44
    
    this.setData({
      navBarHeight,
      list: storageUtil.getList('drink')
    })
  },

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

  onModalCancel() {
    this.setData({ modalShow: false })
  },

  onModalConfirm() {
    const { modalAction } = this.data
    this.setData({ modalShow: false })
    
    if (modalAction === 'reset') {
      this.confirmReset()
    } else if (modalAction === 'clear') {
      this.confirmClear()
    }
  },

  startSpin() {
    if (this.data.isSpinning || this.data.list.length === 0) {
      if (this.data.list.length === 0) {
        this.showToast('请先添加选项', 'info')
      }
      return
    }

    const list = this.data.list
    const itemCount = list.length
    const randomIndex = Math.floor(Math.random() * itemCount)
    const result = list[randomIndex]
    const anglePerItem = 360 / itemCount
    const targetAngle = -randomIndex * anglePerItem
    const currentAngle = ((this.data.rotation % 360) + 360) % 360
    let angleToTarget = targetAngle - currentAngle
    
    if (angleToTarget > 0) {
      angleToTarget = angleToTarget - 360
    }
    
    const spins = 8 + Math.floor(Math.random() * 5)
    const additionalRotation = spins * 360 + angleToTarget
    const totalRotation = this.data.rotation + additionalRotation
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

    const result = storageUtil.addItem('drink', item)
    if (result.success) {
      this.setData({
        list: storageUtil.getList('drink'),
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

    const list = this.data.list
    const isDuplicate = list.some((item, index) => 
      item === value && index !== this.data.editIndex
    )
    
    if (isDuplicate) {
      this.showToast('该选项已存在', 'error')
      return
    }

    if (storageUtil.updateItem('drink', this.data.editIndex, value)) {
      this.setData({
        list: storageUtil.getList('drink'),
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
    if (storageUtil.deleteItem('drink', index)) {
      this.setData({
        list: storageUtil.getList('drink')
      })
      this.showToast('删除成功', 'success')
    }
  },

  resetToDefault() {
    this.showModal('确认重置', '确定要恢复默认数据吗？当前数据将被清空。', 'reset')
  },

  confirmReset() {
    if (storageUtil.resetToDefault('drink')) {
      this.setData({
        list: storageUtil.getList('drink')
      })
      this.showToast('重置成功', 'success')
    }
  },

  clearAll() {
    this.showModal('确认清空', '确定要清空所有选项吗？此操作不可恢复。', 'clear')
  },

  confirmClear() {
    if (storageUtil.clearAll('drink')) {
      this.setData({
        list: storageUtil.getList('drink')
      })
      this.showToast('清空成功', 'success')
    }
  },

  shareToFriend() {
    const that = this
    wx.showLoading({ title: '生成分享图...' })
    
    const canvas = wx.createOffscreenCanvas({ type: '2d', width: 750, height: 1200 })
    const ctx = canvas.getContext('2d')
    
    const gradient = ctx.createLinearGradient(0, 0, 0, 1200)
    gradient.addColorStop(0, '#0D0D1A')
    gradient.addColorStop(1, '#1a0d2e')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 750, 1200)
    
    ctx.fillStyle = 'rgba(255, 58, 242, 0.1)'
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 15; j++) {
        ctx.beginPath()
        ctx.arc(i * 80 + 40, j * 80 + 40, 2, 0, Math.PI * 2)
        ctx.fill()
      }
    }
    
    ctx.fillStyle = '#FFFFFF'
    ctx.font = 'bold 70px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('日常转盘 - 喝什么', 375, 150)
    
    ctx.fillStyle = 'rgba(45, 27, 78, 0.8)'
    ctx.fillRect(100, 250, 550, 300)
    ctx.strokeStyle = '#FFE600'
    ctx.lineWidth = 8
    ctx.strokeRect(100, 250, 550, 300)
    
    ctx.fillStyle = '#00F5D4'
    ctx.font = 'bold 40px sans-serif'
    ctx.fillText('今天喝', 375, 330)
    
    ctx.fillStyle = '#FFFFFF'
    ctx.font = 'bold 100px sans-serif'
    ctx.fillText(this.data.result, 375, 450)
    
    ctx.font = '80px sans-serif'
    ctx.fillText('🎉', 375, 530)
    
    ctx.fillStyle = '#FFE600'
    ctx.font = 'bold 45px sans-serif'
    ctx.fillText('你也来试试吧！', 375, 700)
    
    ctx.font = '35px sans-serif'
    ctx.fillStyle = '#FF3AF2'
    ctx.fillText('让转盘帮你做决定', 375, 770)
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
    ctx.font = '30px sans-serif'
    
    wx.canvasToTempFilePath({
      canvas: canvas,
      success: (res) => {
        wx.hideLoading()
        wx.showShareImageMenu({
          path: res.tempFilePath,
          entrancePath: '/pages/drink/drink'
        })
      },
      fail: (err) => {
        console.error('生成分享图失败', err)
        wx.hideLoading()
        that.showToast('生成分享图失败', 'error')
      }
    })
  },

  onShareAppMessage() {
    return {
      title: '日常转盘 - 喝什么',
      path: '/pages/drink/drink',
      imageUrl: ''
    }
  },

  onShareTimeline() {
    return {
      title: '日常转盘 - 喝什么',
      query: '',
      imageUrl: ''
    }
  }
})
