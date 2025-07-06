// 游戏轮播图组件
export default class GameCarousel {
	constructor(canvas, settings) {
	  this.canvas = canvas;
	  this.ctx = canvas.getContext('2d');
	  this.settings = settings;
	  this.width = canvas.width;
	  this.height = canvas.height;
	  this.centerX = this.width / 2;
	  this.centerY = this.height / 2;
  
	  // 配置参数
	  this.CARD_WIDTH = 200 * settings.scale;
	  this.CARD_HEIGHT = 300 * settings.scale;
	  this.CARD_SPACING = 40 * settings.scale;
	  
	  // 状态
	  this.currentIndex = 0;
	  this.startTouchX = 0;
	  this.isDragging = false;
	  this.currentOffset = 0;
	  this.imagesLoaded = 0;
	  this.totalImages = 0;
	  
	  // 游戏配置
	  this.games = [
		{ name: '分享', image: 'res/images/hero.png', key: 'mainShareButton' },
		{ name: '泡泡', image: 'res/images/hero.png', key: 'bubbleButton' },
		{ name: '方块', image: 'res/images/hero.png', key: 'terisButton' },
		{ name: '小蜜蜂', image: 'res/images/hero.png', key: 'beeButton' },
		{ name: '飞机', image: 'res/images/hero.png', key: 'planeButton' },
		{ name: '无人区', image: 'res/images/hero.png', key: 'loadButton' },
		{ name: '探险', image: 'res/images/hero.png', key: 'exploreButton' }
	  ];
	  
	  // 加载图片
	  this.gameImages = {};
	  this.loadImages();
	  
	  // 绑定事件
	  this.bindEvents();
	}
	
	loadImages() {
	  this.totalImages = this.games.length;
	  this.games.forEach(game => {
		const img = wx.createImage();
		img.onload = () => {
		  this.imagesLoaded++;
		  if (this.imagesLoaded === this.totalImages) {
			this.update(); // 所有图片加载完成后更新画布
		  }
		};
		img.src = game.image;
		this.gameImages[game.name] = img;
	  });
	}
	
	drawGameCard(game, x, y, scale = 1) {
	  const width = this.CARD_WIDTH * scale;
	  const height = this.CARD_HEIGHT * scale;
	  const radius = 15; // 圆角半径
	  
	  // 绘制卡片背景
	  this.ctx.save();
	  this.ctx.fillStyle = '#ffffff';
	  this.ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
	  this.ctx.shadowBlur = 10;
	  this.ctx.shadowOffsetY = 5;

	  // 手动绘制圆角矩形
	  this.ctx.beginPath();
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
		  const imgWidth = width * 0.8;
		  const imgHeight = height * 0.6;
		  const imgX = x - imgWidth/2;
		  const imgY = y - height/2 + height * 0.2;
		  
		  // 添加图片边框
		  this.ctx.strokeStyle = '#e0e0e0';
		  this.ctx.lineWidth = 2;
		  this.ctx.strokeRect(imgX, imgY, imgWidth, imgHeight);
		  
		  // 绘制图片
		  this.ctx.drawImage(img, imgX, imgY, imgWidth, imgHeight);
		} catch (e) {
		  console.error('Error drawing image:', e);
		}
	  }
	  
	  // 绘制游戏名称
	  this.ctx.fillStyle = '#333333';
	  this.ctx.font = `${24 * this.settings.scale}px Arial`;
	  this.ctx.textAlign = 'center';
	  this.ctx.fillText(game.name, x, y + height/2 - 30 * this.settings.scale);
	  
	  this.ctx.restore();
	}
	
	drawIndicators() {
	  const dotRadius = 4 * this.settings.scale;
	  const dotSpacing = 15 * this.settings.scale;
	  const y = this.height - 50 * this.settings.scale;
	  const totalWidth = (this.games.length * 2 * dotRadius) + ((this.games.length - 1) * dotSpacing);
	  let x = this.centerX - totalWidth/2 + dotRadius;
	  
	  this.games.forEach((_, index) => {
		this.ctx.beginPath();
		this.ctx.fillStyle = index === this.currentIndex ? '#4CAF50' : '#cccccc';
		this.ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
		this.ctx.fill();
		x += dotSpacing + 2 * dotRadius;
	  });
	}
	
	update() {
	this.ctx.save();
	  // 清除画布
	  this.ctx.clearRect(0, 0, this.width, this.height);
	  
	  // 绘制轮播图
	  this.games.forEach((game, index) => {
		const x = this.centerX + (index - this.currentIndex) * (this.CARD_WIDTH + this.CARD_SPACING) + this.currentOffset;
		const distance = Math.abs(x - this.centerX);
		const scale = Math.max(0.8, 1 - distance / (this.CARD_WIDTH * 2));
		
		// 只绘制可见的卡片
		if (x + this.CARD_WIDTH/2 > 0 && x - this.CARD_WIDTH/2 < this.width) {
		  this.drawGameCard(game, x, this.centerY, scale);
		}
		
		// 保存按钮区域信息
		wx.globalData[game.key] = {
		  x: x - this.CARD_WIDTH/2,
		  y: this.centerY - this.CARD_HEIGHT/2,
		  width: this.CARD_WIDTH,
		  height: this.CARD_HEIGHT
		};
	  });
	  
	  // 绘制指示点
	  this.drawIndicators();
	  this.ctx.restore();
	}
	
	bindEvents() {
	  wx.onTouchStart(e => {
		this.startTouchX = e.touches[0].clientX;
		this.isDragging = true;
	  });
	  
	  wx.onTouchMove(e => {
		if (!this.isDragging) return;
		const deltaX = e.touches[0].clientX - this.startTouchX;
		this.currentOffset = deltaX;
		this.update();
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
		this.update();
	  });
	}
  }