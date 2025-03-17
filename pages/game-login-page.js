import { drawRoundRect } from '../comon.js';	
import { settings } from '../settings.js';
const tt = wx
export function drawStartScreen(ctx,canvas) {
	// 使用实际的画布尺寸
	const canvasWidth = canvas.width / wx.globalData.currentPixelRatio;
	const canvasHeight = canvas.height / wx.globalData.currentPixelRatio;
	
	//console.log('画布尺寸:', canvasWidth, canvasHeight); // 调试信息
	
	// 清空画布
	ctx.clearRect(0, 0, canvasWidth, canvasHeight);
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

	// 恢复上下文状态
	ctx.restore();

	// 添加鼠标悬停效果
	if (wx.globalData.mousePos) {
		const dx = wx.globalData.mousePos.x - centerX;
		const dy = wx.globalData.mousePos.y - centerY;
		const distance = Math.sqrt(dx * dx + dy * dy);
		
		if (distance < outerRadius) {
			ctx.save();
			ctx.translate(centerX, centerY);
			ctx.beginPath();
			ctx.arc(0, 0, outerRadius, 0, Math.PI * 2);
			ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
			ctx.fill();
			ctx.restore();
		}
	}
	// 首先绘制游戏标题
   // 首先绘制游戏标题
   const drawGameTitle = () => {
		ctx.save();
		
		// 只有当图片已加载完成时才绘制
		if (wx.globalData.gameLogo.complete) {
			const logoWidth = 450 * settings.scale;
			const logoHeight = (logoWidth * wx.globalData.gameLogo.height) / wx.globalData.gameLogo.width;
			const titleY = canvasHeight * 0.29;
			
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

    // 调用绘制标题函数
    drawGameTitle();
/*
	// 绘制保存到我的小程序按钮 侧边栏
    ctx.save();
    const saveY = centerY + 380 * settings.scale;
	const saveX = centerX -150*settings.scale;
	const btnWidth = 100 * settings.scale;
	const btnHeight = 80 * settings.scale;
    // 绘制保存按钮背景
    drawRoundRect(ctx, saveX - btnWidth/2, saveY - btnHeight/2, btnWidth, btnHeight, 10 * settings.scale);
    
    // 创建按钮渐变
    const btnGradient = ctx.createLinearGradient(
        saveX - btnWidth/2,
        saveY - btnHeight/2,
        saveX + btnWidth/2,
        saveY + btnHeight/2
    );
    btnGradient.addColorStop(0, '#4CAF50');  // 绿色
    btnGradient.addColorStop(1, '#45a049');  // 深绿色
    
    ctx.fillStyle = btnGradient;
    ctx.fill();

    // 绘制按钮文字
    ctx.font = `bold ${20 * settings.scale}px Arial`;
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 10;
	ctx.textAlign = 'center';
    ctx.fillText('保存到我', saveX, saveY-5*settings.scale);
	ctx.fillText('的小程序', saveX, saveY+25*settings.scale);
    ctx.restore();

	 // 在保存到我的小程序按钮旁边添加新按钮
    // 绘制添加到桌面按钮
    ctx.save();
    const addToDesktopY = centerY + 380 * settings.scale;
    const addToDesktopX = centerX ; // 位置调整到右侧

    // 绘制添加到桌面按钮背景
    drawRoundRect(ctx, addToDesktopX - btnWidth/2, addToDesktopY - btnHeight/2, btnWidth, btnHeight, 10 * settings.scale);
    

    //btnGradient.addColorStop(0, '#FF6B6B');  // 红色
    //btnGradient.addColorStop(1, '#ee5253');  // 深红色
    
    ctx.fillStyle = btnGradient;
    ctx.fill();

    // 绘制按钮文字
    ctx.font = `bold ${20 * settings.scale}px Arial`;
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 10;
    ctx.textAlign = 'center';
    ctx.fillText('添加到', addToDesktopX, addToDesktopY-5*settings.scale);
    ctx.fillText('桌面', addToDesktopX, addToDesktopY+25*settings.scale);
    ctx.restore();

	// 添加分享按钮
    ctx.save();
    const shareY = centerY + 380 * settings.scale;
    const shareX = centerX +150 * settings.scale;
	//const btnWidth = 100 * settings.scale;
	//const btnHeight = 80 * settings.scale;
    // 绘制分享按钮背景
    drawRoundRect(ctx, shareX - btnWidth/2, shareY - btnHeight/2, btnWidth, btnHeight, 10 * settings.scale);
    
    // 创建按钮渐变
    const shareGradient = ctx.createLinearGradient(
        shareX - btnWidth/2,
        shareY - btnHeight/2,
        shareX + btnWidth/2,
        shareY + btnHeight/2
    );
    shareGradient.addColorStop(0, '#4CAF50');
    shareGradient.addColorStop(1, '#45a049');
    
    ctx.fillStyle = shareGradient;
    ctx.fill();

    // 绘制按钮文字
    ctx.font = `bold ${20 * settings.scale}px Arial`;
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 10;
    ctx.textAlign = 'center';
    ctx.fillText('分享到', shareX, shareY - 5 * settings.scale);
	ctx.fillText('抖音', shareX, shareY + 25 * settings.scale);
    ctx.restore();*/

	// 添加底部提示文字
    ctx.save();
    const bottomY = canvas.height / wx.globalData.currentPixelRatio - 20 * settings.scale; // 距离底部20像素
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
