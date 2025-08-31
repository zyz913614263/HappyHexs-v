
import './libs/weapp-adapter.js'
import { gameinit, animLoop } from './gamelogic.js';

// 初始化微信小游戏
wx.onShow(() => {
	console.log('游戏启动');
});

wx.showShareMenu({
	menus: ['shareAppMessage', 'shareTimeline']
})

/* wx.showActionSheet({
   itemList: ['保存', '分享', '删除'],
   success(res) { console.log('选中索引：', res.tapIndex); }
 });
*/
//wx.showLoading({ title: '支付中...', mask: true });
requestAnimationFrame(animLoop);
gameinit()

// 设置分享功能
wx.onShareAppMessage(() => {
	return {
		title: '快乐六边形 - 考验反应力的休闲小游戏',
		desc: '快来和我一起玩快乐六边形吧！',
		imageUrl: 'res/images/share.png', // 分享图片
		success: function () {
			wx.showToast({
				title: '分享成功',
				icon: 'success',
				duration: 2000
			});
		},
		fail: function () {
			wx.showToast({
				title: '分享失败',
				icon: 'none',
				duration: 2000
			});
		}
	}
});
