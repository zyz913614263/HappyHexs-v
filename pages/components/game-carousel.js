// 游戏轮播图组件
export default class GameCarousel {
	constructor(canvas) {
	  this.canvas = canvas;
	  this.ctx = canvas.getContext('2d');
	  this.pixelRatio = wx.globalData.currentPixelRatio;
	  this.width = canvas.width/this.pixelRatio;
	  this.height = canvas.height/this.pixelRatio;
	  this.centerX = this.width / 2;
	  this.centerY = this.height - 120;
  
	  // 配置参数 - 更大的卡片尺寸
	  this.CARD_WIDTH = 360;
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
		{ name: '分享', image: 'res/images/share1.png', key: 'mainShareButton', desc: '分享给好友' },
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
			
			this.ctx.save();
			
			// 绘制卡片阴影
			this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
			this.ctx.shadowBlur = 20 * this.pixelRatio;
			this.ctx.shadowOffsetY = 10 * this.pixelRatio;
			
			// 绘制卡片背景
			//this.ctx.fillStyle = '#ffffff';
			//this.ctx.fillRect(x - width/2, y - height/2, width, height);
			
			// 绘制游戏图片
			const img = this.gameImages[game.name];
			if (img && img.complete) {
			try {
				// 图片占据卡片上半部分
				const imgHeight = height * 0.6;
				const imgWidth = width * 0.9;
				const imgX = x - imgWidth/2;
				const imgY = y - height/2 + height * 0.1;
				
				// 直接绘制图片
				this.ctx.drawImage(img, imgX, imgY, imgWidth, imgHeight);
			} catch (e) {
				console.error('Error drawing image:', e);
			}
			}
			
			// 绘制游戏描述
			this.ctx.fillStyle = '#666666';
			this.ctx.font = `${5 * this.pixelRatio}px Arial`;
			this.ctx.fillText(game.desc, x, y + height * 0.3);
			
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
		for (let i = 0; i < this.games.length; i++) {
			// 保存按钮区域信息
			wx.globalData[this.games[i].key] = {
				x: 0,
				y: 0,
				width: 0,
				height: 0
			};
		}
		// 保存按钮区域信息
		wx.globalData[game.key] = {
			x: x - this.CARD_WIDTH/2,
			y: this.centerY - this.CARD_HEIGHT/2,
			width: this.CARD_WIDTH,
			height: this.CARD_HEIGHT
		};
		

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
	  // 保存事件处理函数的引用，以便后续可以移除
	  this.handleTouchStart = e => {
		if (wx.globalData.gameState != 0){
		  return;
		}
		this.startTouchX = e.touches[0].clientX;
		this.isDragging = true;
		this.startOffset = this.currentOffset;
		
		console.log('停止自动轮播');
	  };
	  
	  this.handleTouchMove = e => {
		if (!this.isDragging) return;
		const deltaX = e.touches[0].clientX - this.startTouchX;
		this.currentOffset = deltaX;
	  };
	  
	  this.handleTouchEnd = e => {
		if (wx.globalData.gameState != 0){
		  return;
		}
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
	  };

	  // 绑定事件
	  wx.onTouchStart(this.handleTouchStart);
	  wx.onTouchMove(this.handleTouchMove);
	  wx.onTouchEnd(this.handleTouchEnd);
	}
	
	// 移除所有事件监听
	unbindEvents() {
	  if (this.handleTouchStart) {
		wx.offTouchStart(this.handleTouchStart);
	  }
	  if (this.handleTouchMove) {
		wx.offTouchMove(this.handleTouchMove);
	  }
	  if (this.handleTouchEnd) {
		wx.offTouchEnd(this.handleTouchEnd);
	  }
	  console.log('已移除所有触摸事件监听');
	}

	// 销毁组件
	destroy() {
	  this.unbindEvents();
	  this.lastAutoPlayTime = 0;
	  this.isDragging = false;
	  this.currentIndex = 0;
	  this.currentOffset = 0;
	  console.log('轮播图组件已销毁');
	}
  }