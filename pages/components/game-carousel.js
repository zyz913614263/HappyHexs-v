// 游戏轮播图组件
export default class GameCarousel {
	constructor(canvas) {
	  this.canvas = canvas;
	  this.ctx = canvas.getContext('2d');
	  this.pixelRatio = wx.globalData.currentPixelRatio;
	  this.width = canvas.width/this.pixelRatio;
	  this.height = canvas.height/this.pixelRatio;
	  this.centerX = this.width / 2;
	  this.centerY = this.height - 200;
  
	  // 配置参数 - 更大的卡片尺寸
	  this.CARD_WIDTH = 320;
	  this.CARD_HEIGHT = 120;
	  this.CARD_SPACING = 20;
	  
	  // 状态
	  this.currentIndex = 0;
	  this.startTouchX = 0;
	  this.isDragging = false;
	  this.currentOffset = 0;
	  this.imagesLoaded = 0;
	  this.totalImages = 0;
	  
	  // 游戏配置
	  this.games = [
		{ name: '分享', image: 'res/images/share.png', key: 'mainShareButton', desc: '分享给好友' },
		//{ name: '泡泡', image: 'res/images/logo.png', key: 'bubbleButton', desc: '经典泡泡龙' },
		{ name: '方块', image: 'res/images/teris.png', key: 'terisButton', desc: '俄罗斯方块' },
		//{ name: '小蜜蜂', image: 'res/images/bee.png', key: 'beeButton', desc: '小蜜蜂' },
		{ name: '飞机', image: 'res/images/plane.png', key: 'planeButton', desc: '飞机' },
		//{ name: '无人区', image: 'res/images/load.png', key: 'loadButton', desc: '无人区' },
		//{ name: '探险', image: 'res/images/explore.png', key: 'exploreButton', desc: '探险' }
	  ];
	  
	  // 加载图片
	  this.gameImages = {};
	  this.loadImages();
	  
	  // 轮播配置
	  this.autoPlayInterval = 5000; // 改为5秒
	  this.autoPlayTimer = null;
	  this.lastAutoPlayTime = 0; // 记录上次轮播时间
	  
	  // 绑定事件
	  this.bindEvents();
	}
	
	loadImages() {
	  this.totalImages = this.games.length;
	  this.games.forEach(game => {
		const img = wx.createImage();
		img.onload = () => {
		  this.imagesLoaded++;
		};
		img.src = game.image;
		this.gameImages[game.name] = img;
	  });
	}
	
	drawGameCard(game, x, y, scale = 1) {
	  const width = this.CARD_WIDTH * scale;
	  const height = this.CARD_HEIGHT * scale;
	  const radius = 20 * this.pixelRatio; // 圆角半径
	  
	  this.ctx.save();
	  
	  // 绘制卡片阴影
	  this.ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
	  this.ctx.shadowBlur = 20 * this.pixelRatio;
	  this.ctx.shadowOffsetY = 10 * this.pixelRatio;
	  
	  // 绘制卡片背景
	  this.ctx.fillStyle = '#ffffff';
	  this.ctx.beginPath();
	  
	  // 手动绘制圆角矩形
	  const left = x - width/2;
	  const top = y - height/2;
	  
	  // 左上角
	  this.ctx.moveTo(left + radius, top);
	  // 上边
	  this.ctx.lineTo(left + width - radius, top);
	  // 右上角
	  this.ctx.arc(left + width - radius, top + radius, radius, -Math.PI/2, 0);
	  // 右边
	  this.ctx.lineTo(left + width, top + height - radius);
	  // 右下角
	  this.ctx.arc(left + width - radius, top + height - radius, radius, 0, Math.PI/2);
	  // 下边
	  this.ctx.lineTo(left + radius, top + height);
	  // 左下角
	  this.ctx.arc(left + radius, top + height - radius, radius, Math.PI/2, Math.PI);
	  // 左边
	  this.ctx.lineTo(left, top + radius);
	  // 左上角
	  this.ctx.arc(left + radius, top + radius, radius, Math.PI, -Math.PI/2);
	  
	  this.ctx.closePath();
	  this.ctx.fill();
	  
	  // 绘制游戏图片
	  const img = this.gameImages[game.name];
	  if (img && img.complete) {
		try {
		  // 图片占据卡片上半部分
		  const imgHeight = height * 0.6;
		  const imgWidth = width * 0.9;
		  const imgX = x - imgWidth/2;
		  const imgY = y - height/2 + height * 0.1;
		  
		  // 绘制图片（带圆角）
		  this.ctx.save();
		  this.ctx.beginPath();
		  
		  // 手动绘制图片的圆角裁剪区域
		  const imgRadius = radius/2;
		  this.ctx.moveTo(imgX + imgRadius, imgY);
		  this.ctx.lineTo(imgX + imgWidth - imgRadius, imgY);
		  this.ctx.arc(imgX + imgWidth - imgRadius, imgY + imgRadius, imgRadius, -Math.PI/2, 0);
		  this.ctx.lineTo(imgX + imgWidth, imgY + imgHeight - imgRadius);
		  this.ctx.arc(imgX + imgWidth - imgRadius, imgY + imgHeight - imgRadius, imgRadius, 0, Math.PI/2);
		  this.ctx.lineTo(imgX + imgRadius, imgY + imgHeight);
		  this.ctx.arc(imgX + imgRadius, imgY + imgHeight - imgRadius, imgRadius, Math.PI/2, Math.PI);
		  this.ctx.lineTo(imgX, imgY + imgRadius);
		  this.ctx.arc(imgX + imgRadius, imgY + imgRadius, imgRadius, Math.PI, -Math.PI/2);
		  
		  this.ctx.closePath();
		  this.ctx.clip();
		  this.ctx.drawImage(img, imgX, imgY, imgWidth, imgHeight);
		  this.ctx.restore();
		} catch (e) {
		  console.error('Error drawing image:', e);
		}
	  }
	  
	  // 绘制游戏名称
	  this.ctx.fillStyle = '#333333';
	  this.ctx.font = `bold ${28 * this.pixelRatio}px Arial`;
	  this.ctx.textAlign = 'center';
	  this.ctx.fillText(game.name, x, y + height * 0.2);
	  
	  // 绘制游戏描述
	  this.ctx.fillStyle = '#666666';
	  this.ctx.font = `${20 * this.pixelRatio}px Arial`;
	  this.ctx.fillText(game.desc, x, y + height * 0.3);
	  
	  // 绘制装饰线
	  this.ctx.strokeStyle = '#f0f0f0';
	  this.ctx.lineWidth = 2 * this.pixelRatio;
	  this.ctx.beginPath();
	  this.ctx.moveTo(x - width * 0.4, y + height * 0.4);
	  this.ctx.lineTo(x + width * 0.4, y + height * 0.4);
	  this.ctx.stroke();
	  
	  this.ctx.restore();
	}
	
	update() {
	  // 清除画布
	  //this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
	  
	  // 只绘制当前图片
	  const game = this.games[this.currentIndex];
	  const x = this.centerX + this.currentOffset;
	  
	  // 绘制当前卡片
	  this.drawGameCard(game, x, this.centerY, 1);
	  
	  // 保存按钮区域信息
	  wx.globalData[game.key] = {
		x: x - this.CARD_WIDTH/2,
		y: this.centerY - this.CARD_HEIGHT/2,
		width: this.CARD_WIDTH,
		height: this.CARD_HEIGHT
	  };
	  this.startAutoPlay();
	}
	
	startAutoPlay() {
		if (!this.isDragging) {  // 只在非拖动状态下自动轮播
			this.lastAutoPlayTime ++;
		  	if (this.lastAutoPlayTime % 120 == 0){
				console.log('自动轮播');
				if (this.currentIndex < this.games.length - 1) {
					this.currentIndex++;
				} else {
					this.currentIndex = 0;  // 循环到第一个
				}
			}
		}
	}
	
	bindEvents() {
	  wx.onTouchStart(e => {
		this.startTouchX = e.touches[0].clientX;
		this.isDragging = true;
		this.startOffset = this.currentOffset;
		
		// 触摸时停止自动轮播
		console.log('停止自动轮播');
	  });
	  
	  wx.onTouchMove(e => {
		if (!this.isDragging) return;
		const deltaX = e.touches[0].clientX - this.startTouchX;
		this.currentOffset = deltaX;
	  });
	  
	  wx.onTouchEnd(e => {
		if (!this.isDragging) return;
		this.isDragging = false;
		
		const deltaX = this.currentOffset;
		const threshold = this.CARD_WIDTH / 3;
		
		if (Math.abs(deltaX) > threshold) {
		  if (deltaX > 0 && this.currentIndex > 0) {
			this.currentIndex--;
		  } else if (deltaX < 0 && this.currentIndex < this.games.length - 1) {
			this.currentIndex++;
		  }
		}
		
		this.currentOffset = 0;
		console.log('重新开始自动轮播');
	  });
	}
	
	// 在组件销毁时调用
	destroy() {
	  this.stopAutoPlay();
	}
  }