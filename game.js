import {gameinit} from './gamelogic.js';

// 初始化微信小游戏
wx.onShow(() => {
    console.log('游戏启动');
});

// 游戏主循环
function mainLoop() {
    // 游戏逻辑
    requestAnimationFrame(mainLoop);
}

// 启动游戏主循环
mainLoop();

gameinit()