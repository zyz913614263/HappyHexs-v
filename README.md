# HappyHexs 休闲游戏集合

一个基于微信小游戏平台的休闲游戏集合，包含多个经典小游戏，提供流畅的游戏体验和精美的视觉效果。

## 游戏列表

### 1. 俄罗斯方块
- 经典的俄罗斯方块玩法
- 触控优化的操作界面
- 支持方块旋转、移动和快速下落
- 实时分数统计和等级系统
- 支持游戏暂停/继续功能

### 2. 泡泡消除
- 轻松有趣的泡泡消除玩法
- 流畅的动画效果
- 关卡进度系统

### 3. 六边形消除
- 创新的六边形消除玩法
- 独特的旋转机制
- 连击奖励系统

## 技术特点

### 自适应布局系统
- 智能屏幕尺寸适配
- 响应式UI设计
- 支持多种设备分辨率

```javascript
// 自适应计算示例
const baseSize = Math.min(canvasWidth / 10, canvasHeight / 14);
const buttonWidth = baseSize * 2;
const buttonHeight = baseSize;
```

### 按钮管理系统
- 统一的按钮样式管理
- 支持自定义按钮外观
- 精确的触控响应
- 支持圆形和矩形按钮
- 渐变背景效果

### 音频系统
- 背景音乐支持
- 游戏音效
- 智能音频加载
- 音频状态管理

### 事件处理系统
- 优化的触摸事件处理
- 精确的碰撞检测
- 流畅的游戏控制

## 项目结构

```
HappyHexs/
├── pages/
│   ├── teris.js          # 俄罗斯方块游戏逻辑
│   ├── bubales.js        # 泡泡消除游戏逻辑
│   ├── game-login-page.js # 游戏登录页面
│   └── game-run-page.js   # 游戏运行页面
├── entry/
│   └── music.js          # 音频管理系统
├── comon.js              # 通用组件和工具
└── settings.js           # 游戏配置
```

## 核心功能

### 游戏状态管理
```javascript
class Game {
    constructor() {
        this.score = 0;
        this.level = 1;
        this.isPaused = false;
    }
    
    // 游戏状态控制
    pause() {
        this.isPaused = true;
    }
    
    resume() {
        this.isPaused = false;
    }
}
```

### 按钮管理器
```javascript
class ButtonManager {
    constructor() {
        this.buttons = new Map();
    }

    addButton(id, x, y, width, height, text, options) {
        const button = new Button(id, x, y, width, height, text, options);
        this.buttons.set(id, button);
    }
}
```

## 安装和运行

1. 克隆项目到本地
```bash
git clone [项目地址]
```

2. 使用微信开发者工具打开项目

3. 编译和预览
- 在微信开发者工具中点击"编译"
- 使用微信扫描二维码进行预览

## 游戏截图
[待添加游戏截图]

## 开发团队
[待添加开发团队信息]

## 版本历史

### v1.0.0
- 初始版本发布
- 包含三个基础游戏
- 完整的游戏功能实现

## 后续计划
- [ ] 添加更多游戏类型
- [ ] 优化游戏性能
- [ ] 添加排行榜系统
- [ ] 增加社交分享功能
- [ ] 优化触控体验

## 技术支持
如有问题或建议，请提交 Issue 或联系开发团队。

## 许可证
[待添加许可证信息]
