import {gameinit,animLoop} from './gamelogic.js';

// 初始化微信小游戏
wx.onShow(() => {
    console.log('游戏启动');
});

requestAnimationFrame(animLoop);
gameinit()