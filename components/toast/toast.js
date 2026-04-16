Component({
  properties: {
    show: {
      type: Boolean,
      value: false
    },
    message: {
      type: String,
      value: ''
    },
    type: {
      type: String,
      value: 'success' // success, error, info
    }
  },

  data: {
    emoji: '✓'
  },

  observers: {
    'type': function(newType) {
      const emojiMap = {
        success: '✓',
        error: '✕',
        info: 'ℹ'
      }
      this.setData({
        emoji: emojiMap[newType] || '✓'
      })
    }
  }
})
