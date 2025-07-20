import {gameinit,animLoop} from './gamelogic.js';

// 初始化微信小游戏
wx.onShow(() => {
    console.log('游戏启动');
});

wx.showShareMenu({
    menus: ['shareAppMessage', 'shareTimeline']
  })

  const pageManager = wx.createPageManager();

pageManager.load({
  openlink: '-SSEykJvFV3pORt5kTNpS0g9v-S9KI824nQjR7uPSuDZWntNQ64ZfIpCj-M2bBfXJW7O35YSywieJtmCpg9v5654E4hUSX0MsRnpCPrZmyUaQuf6PDhwYqw12GURpL0ixhURyEQnunJh5sGUT7grysveyQmAbYZU2OrV23n1G1DSSAFMKULr05Lpl_fXWcYRLlq16buOhfFpPYZXOmxbRtUh1PGdvFiZ5d1SIFOB3KJDenJemtToMGtnCxKTF22C6nQ_JGnvkbS1BtCCd-aDw6oYw_fMkm_9r8PGOJixfPTC5BQ1FOSZXLqs-TJSGppCbwJ5bwTlLv7cneHD16IQ7w', // 由不同渠道获得的OPENLINK值
}).then((res) => {
  // 加载成功，res 可能携带不同活动、功能返回的特殊回包信息（具体请参阅渠道说明）
  console.log(res);

  // 加载成功后按需显示
  pageManager.show();

}).catch((err) => {
  // 加载失败，请查阅 err 给出的错误信息
  console.error(err);
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