import {gameinit,animLoop} from './gamelogic.js';

// 初始化微信小游戏
wx.onShow(() => {
    console.log('游戏启动');
});


requestAnimationFrame(animLoop);
gameinit()

 // 设置分享功能
 wx.onShareAppMessage(() => {
	return {
	  title: '飞机大战 - 考验反应力的休闲小游戏',
	  desc: '快来和我一起玩飞机大战吧！',
	  imageUrl: 'res/images/share.png', // 分享图片
	  success: function() {
		wx.showToast({
		  title: '分享成功',
		  icon: 'success',
		  duration: 2000
		});
	  },
	  fail: function() {
		wx.showToast({
		  title: '分享失败',
		  icon: 'none',
		  duration: 2000
		});
	  }
	}
  });