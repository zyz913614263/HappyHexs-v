import { drawRoundRect } from '../comon.js';	
import { settings } from '../settings.js';
import { audioManager } from '../entry/music.js';
import {Init as InitPopo } from './bubales.js'
import{ InitTeris } from './teris.js'
import{ InitBee } from './bee.js'
import{ InitPlane } from './plane.js'
const tt = wx
let bubbleX, bubbleY,btnWidth,btnHeight;
let terisX, terisY;
let canvas, ctx;
let step = 80

export function touchPop(e) {
	if (wx.globalData.gameState !== 0) return;

	InitPopo(canvas,ctx)
	wx.globalData.gameState = 3
	wx.offTouchStart(touchPop);
	audioManager.stopBGM();
	
}

export function touchTeris(e) {
	if (wx.globalData.gameState !== 0) return;
	
	InitTeris(canvas,ctx)
	wx.globalData.gameState = 4
	wx.offTouchStart(touchTeris);
	audioManager.stopBGM();
	
}

export function touchBee(e) {
	if (wx.globalData.gameState !== 0) return;
	//console.log('touchBee')
	InitBee(canvas,ctx)
	wx.globalData.gameState = 5
	wx.offTouchStart(touchBee);
	audioManager.stopBGM();
	
}

export function touchPlane(e) {
	if (wx.globalData.gameState !== 0) return;
	audioManager.stopBGM();
	//console.log('touchBee')
	InitPlane(canvas,ctx)
	wx.globalData.gameState = 6
	wx.offTouchStart(touchPlane);

	
}

// 绘制按钮的通用函数
function drawButton(ctx, x, y, width, height, text, color = '#FF6B6B', hoverColor = '#ee5253') {
	ctx.save();
	
	// 绘制按钮背景
	drawRoundRect(ctx, x - width/2, y - height/2, width, height, 10 * settings.scale);
	
	// 创建按钮渐变
	const gradient = ctx.createLinearGradient(
		x - width/2,
		y - height/2,
		x + width/2,
		y + height/2
	);
	gradient.addColorStop(0, color);
	gradient.addColorStop(1, hoverColor);
	
	ctx.fillStyle = gradient;
	ctx.fill();

	// 绘制按钮文字
	ctx.font = `bold ${22 * settings.scale}px Arial`;
	ctx.fillStyle = '#FFFFFF';
	ctx.shadowColor = '#000000';
	ctx.shadowBlur = 10;
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	ctx.fillText(text, x, y);
	
	ctx.restore();
}

export function drawStartScreen(c,ca) {
	canvas = ca;
	ctx = c;
	const screenWidth = canvas.width / wx.globalData.currentPixelRatio;
	const screenHeight = canvas.height / wx.globalData.currentPixelRatio;
	const canvasWidth = screenWidth
	const canvasHeight = screenHeight
	// 清除画布
	ctx.clearRect(0, 0, screenWidth, screenHeight);
	ctx.fillStyle = '#ffffff';
	ctx.fillRect(0, 0, screenWidth, screenHeight);
	const innerGradient = ctx.createLinearGradient(-canvasWidth, -canvasHeight, canvasWidth, canvasHeight);
	innerGradient.addColorStop(0, '#3498db');
	innerGradient.addColorStop(1, '#2980b9');

	// 绘制半透明背景
	ctx.fillStyle = innerGradient//'rgba(0, 0, 0, 0.5)';
	ctx.fillRect(0, 0, canvasWidth, canvasHeight);
	
	// 绘制开始按钮（六边形版本）
	const centerX = canvasWidth / 2;
	const centerY = canvasHeight / 2;
	
	// 更新按钮动画状态
	if (!wx.globalData.btnAnimation) {
		wx.globalData.btnAnimation = {
			scale: 1,
			glowSize: 0,
			time: 0,
			hexRotation: 0,
			innerHexRotation: 0
		};
	}

	// 更新动画参数
	wx.globalData.btnAnimation.time += 0.03;
	wx.globalData.btnAnimation.scale = 1 + Math.sin(wx.globalData.btnAnimation.time) * 0.02;
	wx.globalData.btnAnimation.glowSize = 5 + Math.abs(Math.sin(wx.globalData.btnAnimation.time)) * 15;
	wx.globalData.btnAnimation.hexRotation += 0.005; // 外层六边形旋转速度
	wx.globalData.btnAnimation.innerHexRotation -= 0.008; // 内层六边形旋转速度

	// 保存当前上下文状态
	ctx.save();
	ctx.translate(centerX, centerY);

	// 绘制外层六边形
	const outerRadius = 200 * settings.scale;
	const innerRadius = 80 * settings.scale;
	const outerHexPoints = [];
	const innerHexPoints = [];

	// 计算外层六边形顶点
	for (let i = 0; i < 6; i++) {
		const angle = (i * Math.PI / 3) + wx.globalData.btnAnimation.hexRotation;
		outerHexPoints.push({
			x: outerRadius * Math.cos(angle),
			y: outerRadius * Math.sin(angle)
		});
	}

	// 计算内层六边形顶点
	for (let i = 0; i < 6; i++) {
		const angle = (i * Math.PI / 3) + wx.globalData.btnAnimation.innerHexRotation;
		innerHexPoints.push({
			x: innerRadius * Math.cos(angle),
			y: innerRadius * Math.sin(angle)
		});
	}

	// 绘制外发光
	//ctx.shadowColor = '#3498db';
	//ctx.shadowBlur = wx.globalData.btnAnimation.glowSize * settings.scale;
	//ctx.shadowOffsetX = 0;
	//ctx.shadowOffsetY = 0;

	// 绘制外层六边形
	ctx.beginPath();
	ctx.moveTo(outerHexPoints[0].x, outerHexPoints[0].y);
	for (let i = 1; i < 6; i++) {
		ctx.lineTo(outerHexPoints[i].x, outerHexPoints[i].y);
	}
	ctx.closePath();

	// 外层六边形渐变
	const outerGradient = ctx.createLinearGradient(-outerRadius, -outerRadius, outerRadius, outerRadius);
	outerGradient.addColorStop(0, 'rgba(252, 15, 21, 0.7)');
	outerGradient.addColorStop(1, 'rgba(255, 255, 255, 0.5)');

	ctx.strokeStyle = outerGradient;
	ctx.lineWidth = 2 * settings.scale;
	ctx.stroke();

	// 绘制内层六边形
	ctx.beginPath();
	ctx.moveTo(innerHexPoints[0].x, innerHexPoints[0].y);
	for (let i = 1; i < 6; i++) {
		ctx.lineTo(innerHexPoints[i].x, innerHexPoints[i].y);
	}
	ctx.closePath();

	// 内层六边形渐变
	//const innerGradient = ctx.createLinearGradient(-innerRadius, -innerRadius, innerRadius, innerRadius);
	//innerGradient.addColorStop(0, '#3498db');
	//innerGradient.addColorStop(1, '#2980b9');

	ctx.fillStyle = '#FFC107';
	ctx.fill();

	// 添加内部光泽效果
	const glossGradient = ctx.createLinearGradient(0, -innerRadius, 0, innerRadius);
	glossGradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
	glossGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
	ctx.fillStyle = glossGradient;
	ctx.fill();

	// 绘制连接线动画
	for (let i = 0; i < 6; i++) {
		const time = wx.globalData.btnAnimation.time + i * Math.PI / 3;
		
		ctx.beginPath();
		ctx.moveTo(innerHexPoints[i].x, innerHexPoints[i].y);
		ctx.lineTo(outerHexPoints[i].x, outerHexPoints[i].y);
		
		ctx.strokeStyle = `rgba(252, 252, 0, ${0.6 + 0.2 * Math.sin(time)})`;
		ctx.lineWidth = 1 * settings.scale;
		ctx.stroke();
	}

	// 绘制文字
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	ctx.font = `bold ${40 * settings.scale}px Arial`;
	ctx.fillStyle = '#ffffff';
	ctx.shadowColor = '#000000';
	ctx.shadowBlur = 4 * settings.scale;
	ctx.fillText('开始', 0, 0);
	ctx.restore();

	// 存储开始按钮位置信息
	wx.globalData.startButton = {
		x: centerX - btnWidth/2,
		y: centerY - btnHeight/2,
		width: btnWidth,
		height: btnHeight
	};

	// 绘制游戏标题
	const drawGameTitle = () => {
		ctx.save();
		if (wx.globalData.gameLogo && wx.globalData.gameLogo.complete) {
			const logoWidth = 450 * settings.scale;
			const logoHeight = (logoWidth * wx.globalData.gameLogo.height) / wx.globalData.gameLogo.width;
			const titleY = screenHeight * 0.25; // 调整标题位置更靠上
			
			ctx.drawImage(
				wx.globalData.gameLogo,
				centerX - logoWidth/2,
				titleY - logoHeight/2,
				logoWidth,
				logoHeight
			);
		}
		ctx.restore();
	};

	// 绘制最高分
	const drawHighScore = () => {
		ctx.save();
		ctx.font = `bold ${24 * settings.scale}px Arial`;
		ctx.fillStyle = '#333333';
		ctx.textAlign = 'center';
		ctx.fillText(`历史最高分: ${wx.globalData.highScore}`, centerX, centerY + 220 * settings.scale);
		ctx.restore();
	};

	// 按顺序绘制各个元素
	drawGameTitle();
	drawHighScore();

	// 按钮配置
	const btnWidth = 85* settings.scale;
	const btnHeight = 60 * settings.scale;
	const btnSpacing = 20 * settings.scale; // 按钮之间的间距
	const bottomMargin = 200 * settings.scale; // 距离底部的距离
	const totalButtons = 5; // 按钮总数
	const totalWidth = (btnWidth * totalButtons) + (btnSpacing * (totalButtons - 1));
	let startX = centerX - totalWidth/2 + btnWidth/2;
	let startY = canvasHeight - bottomMargin;
	// 绘制分享按钮
	drawButton(ctx, startX, startY, btnWidth, btnHeight, '分享', '#3498db', '#2980b9');
	wx.globalData.mainShareButton = {
		x: startX - btnWidth/2,
		y: startY - btnHeight/2,
		width: btnWidth,
		height: btnHeight
	};

	// 绘制泡泡按钮
	startX += btnWidth + btnSpacing;
	drawButton(ctx, startX, startY, btnWidth, btnHeight, '泡泡','#4CAF50', '#45a049');
	wx.globalData.bubbleButton = {
		x: startX - btnWidth/2,
		y: startY - btnHeight/2,
		width: btnWidth,
		height: btnHeight
	};

	// 绘制方块按钮
	startX += btnWidth + btnSpacing;
	drawButton(ctx, startX, startY, btnWidth, btnHeight, '方块', '#4CAF50', '#45a049');
	wx.globalData.terisButton = {
		x: startX - btnWidth/2,
		y: startY - btnHeight/2,
		width: btnWidth,
		height: btnHeight
	};

	// 绘制小蜜蜂按钮
	startX += btnWidth + btnSpacing;
	drawButton(ctx, startX, startY, btnWidth, btnHeight, '小蜜蜂', '#4CAF50', '#45a049');
	wx.globalData.beeButton = {
		x: startX - btnWidth/2,
		y: startY - btnHeight/2,
		width: btnWidth,
		height: btnHeight
	};

	// 绘制飞机按钮
	startX += btnWidth + btnSpacing;
	drawButton(ctx, startX, startY, btnWidth, btnHeight, '飞机', '#4CAF50', '#45a049');
	wx.globalData.planeButton = {
		x: startX - btnWidth/2,
		y: startY - btnHeight/2,
		width: btnWidth,
		height: btnHeight
	};
	startX = centerX - totalWidth/2 + btnWidth/2;
	startY = canvasHeight - bottomMargin + btnHeight + btnSpacing;
	// 绘制分享按钮
	drawButton(ctx, startX, startY, btnWidth, btnHeight, '无人区','#4CAF50', '#45a049');
	wx.globalData.loadButton = {
		x: startX - btnWidth/2,
		y: startY - btnHeight/2,
		width: btnWidth,
		height: btnHeight
	};


	
	// 添加底部提示文字
	ctx.save();
	const bottomY = screenHeight - 50 * settings.scale; // 距离底部20像素
	ctx.font = `${12 * settings.scale}px Arial`;
	ctx.fillStyle = '#FFFFFF'; // 使用灰色让文字不那么显眼
	ctx.textAlign = 'center';
	ctx.textBaseline = 'bottom';
	
	// 分两行显示文字
	const line1 = '抵制不良游戏，拒绝盗版游戏。注意自我保护，谨防受骗上当。';
	const line2 = '适度游戏益脑，沉迷游戏伤身。合理安排时间，享受健康生活。';
	
	ctx.fillText(line1, centerX, bottomY - 15 * settings.scale);
	ctx.fillText(line2, centerX, bottomY);
	ctx.restore();
}

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