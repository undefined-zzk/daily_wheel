// 本地存储工具类
const STORAGE_KEYS = {
  EAT_LIST: 'eat_list',
  PLAY_LIST: 'play_list',
  LOCATION_LIST: 'location_list'
}

// 最大数量限制
const MAX_ITEMS = 20

// 默认数据
const DEFAULT_DATA = {
  eat: ['火锅', '烧烤', '日料', '川菜', '粤菜', '西餐', '快餐', '面食', '小吃', '自助餐'],
  play: ['看电影', '打游戏', '运动健身', '逛街购物', 'KTV唱歌', '桌游', '密室逃脱', '剧本杀', '看书', '郊游'],
  location: ['公园', '商场', '咖啡厅', '图书馆', '电影院', '游乐场', '博物馆', '海边', '山上', '老街']
}

class StorageUtil {
  // 获取列表数据
  getList(type) {
    try {
      const key = STORAGE_KEYS[`${type.toUpperCase()}_LIST`]
      const initKey = `${key}_initialized`
      
      // 检查是否已初始化
      const isInitialized = wx.getStorageSync(initKey)
      
      if (!isInitialized) {
        // 首次使用，设置默认数据并标记为已初始化
        wx.setStorageSync(key, DEFAULT_DATA[type])
        wx.setStorageSync(initKey, true)
        return DEFAULT_DATA[type]
      }
      
      // 已初始化，直接返回存储的数据（可能是空数组）
      const data = wx.getStorageSync(key)
      return data || []
    } catch (e) {
      console.error('获取数据失败', e)
      return DEFAULT_DATA[type]
    }
  }

  // 保存列表数据
  setList(type, list) {
    try {
      const key = STORAGE_KEYS[`${type.toUpperCase()}_LIST`]
      wx.setStorageSync(key, list)
      return true
    } catch (e) {
      console.error('保存数据失败', e)
      return false
    }
  }

  // 添加项目
  addItem(type, item) {
    const list = this.getList(type)
    
    // 检查是否重复
    if (list.includes(item)) {
      return { success: false, message: '该选项已存在' }
    }
    
    // 检查是否超过最大数量
    if (list.length >= MAX_ITEMS) {
      return { success: false, message: `最多只能添加${MAX_ITEMS}个选项` }
    }
    
    // 添加到最前面
    list.unshift(item)
    const saved = this.setList(type, list)
    return { success: saved, message: saved ? '添加成功' : '添加失败' }
  }

  // 获取最大数量限制
  getMaxItems() {
    return MAX_ITEMS
  }

  // 删除项目
  deleteItem(type, index) {
    const list = this.getList(type)
    if (index >= 0 && index < list.length) {
      list.splice(index, 1)
      return this.setList(type, list)
    }
    return false
  }

  // 更新项目
  updateItem(type, index, newItem) {
    const list = this.getList(type)
    if (index >= 0 && index < list.length) {
      list[index] = newItem
      return this.setList(type, list)
    }
    return false
  }

  // 重置为默认数据
  resetToDefault(type) {
    return this.setList(type, DEFAULT_DATA[type])
  }

  // 清空所有数据
  clearAll(type) {
    return this.setList(type, [])
  }
}

module.exports = new StorageUtil()
