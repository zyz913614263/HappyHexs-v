const tt = wx
// 创建 Canvas
const canvas = wx.createCanvas()

// 创建基础对象
const document = {
  createElementNS(nameSpace, type) {
    return null
  },
  createElement(type) {
    if (type === 'canvas') {
      return canvas
    }
    return null
  }
}

const { platform } = wx.getSystemInfoSync()
const navigator = {
  userAgent: `BytedanceGame/${platform}`,
  language: 'zh-CN',
  appVersion: '5.0',
  platform: platform
}

// 确保 wx.globalData 存在
if (!wx.globalData) {
    wx.globalData = {};
}

const global = wx.globalData;

// 定义属性的辅助函数
function defineGlobalProperty(key, getter) {
    // 添加安全检查
    if (!global) {
        console.error('global is not initialized');
        return;
    }
    
    if (!(key in global)) {
        Object.defineProperty(global, key, {
            get: getter,
            configurable: true,
            enumerable: true
        });
    }
}

// 定义全局属性
const globalProperties = [
    ['document', () => {
        // 创建模拟的 document 对象
        if (!global.document) {
            global.document = {
                // 添加必要的属性和方法
                createElement: () => ({}),
                // ... 其他需要的属性
            };
        }
        return global.document;
    }],
    ['navigator', () => navigator],
    ['canvas', () => canvas],
    ['alert', () => wx.showModal],
    ['focus', () => function() {}],
    ['blur', () => function() {}],
    ['requestAnimationFrame', () => wx.requestAnimationFrame || function(cb) { return setTimeout(cb, 1000 / 60) }],
    ['cancelAnimationFrame', () => wx.cancelAnimationFrame || clearTimeout],
    ['innerWidth', () => canvas.width],
    ['innerHeight', () => canvas.height],
    ['devicePixelRatio', () => 1],
    ['location', () => ({ href: 'game.js' })],
    ['XMLHttpRequest', () => wx.request],
    ['WebSocket', () => wx.connectSocket],
    ['Image', () => wx.createImage],
    ['window', () => global]  // 使用 global 作为 window
]

// 初始化全局属性
globalProperties.forEach(([key, getter]) => {
    defineGlobalProperty(key, getter);
});

// 添加计时器函数
const timerFunctions = {
  setTimeout,
  clearTimeout,
  setInterval,
  clearInterval
}

Object.keys(timerFunctions).forEach(key => {
  if (!(key in global)) {
    global[key] = timerFunctions[key]
  }
})

// 导出适配器类
export default class WeappAdapter {
  constructor() {
    this.initTouchEvent()
  }

  initTouchEvent() {
    const eventNames = ['touchstart', 'touchmove', 'touchend', 'touchcancel']
    
    eventNames.forEach(eventName => {
      tt[`on${eventName[0].toUpperCase()}${eventName.slice(1)}`]((e) => {
        const event = {
          touches: e.touches,
          changedTouches: e.changedTouches,
          timeStamp: e.timeStamp,
          type: eventName,
          preventDefault: () => {},
          stopPropagation: () => {}
        }
        
        if (document.dispatchEvent) {
          document.dispatchEvent(event)
        }
      })
    })
  }
} 