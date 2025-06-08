import { drawRoundRect } from '../comon.js';	
import { settings } from '../settings.js';
const tt = wx
// 绘制游戏结束界面
function drawGameOver(ctx,canvas) {
    const screenWidth = canvas.width / wx.globalData.currentPixelRatio;
    const screenHeight = canvas.height / wx.globalData.currentPixelRatio;
    const centerX = screenWidth / 2;
    const centerY = screenHeight / 2;
	// 绘制"游戏结束"文本
    ctx.save();
    // 添加半透明背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, screenWidth, screenHeight);

    
    // 添加文字发光效果
    ctx.shadowColor = '#800080';  // 紫色阴影
    ctx.shadowBlur = 20;
    ctx.font = `bold ${48 * settings.scale}px Arial`;
    
    // 创建渐变
   const gradient = ctx.createLinearGradient(
        centerX - 100, 
        centerY - 100, 
        centerX + 100, 
        centerY - 20
    );
    gradient.addColorStop(0, '#00FFFF');  // 粉红色
    gradient.addColorStop(1, '#FFFFFF');  // 紫色
    
    ctx.fillStyle = gradient;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('游戏结束', centerX, centerY - 80 * settings.scale);
    ctx.restore();

    // 绘制分数
    ctx.save();
    //ctx.shadowColor = '#FFFFFF';  // 靛青色阴影
    ctx.shadowBlur = 15;
    ctx.font = `bold ${36 * settings.scale}px Arial`;
    ctx.fillStyle = '#FFA500';  // 橙色
	ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`得分: ${wx.globalData.score}`, centerX, centerY);

	ctx.restore();

    ctx.save();
	ctx.shadowBlur = 15;
    ctx.font = `bold ${36 * settings.scale}px Arial`;
    ctx.fillStyle = '#FFD700';  //金
	ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`最高分: ${wx.globalData.highScore}`, centerX, centerY+80*settings.scale);


    ctx.restore();
	ctx.save();
    const btnWidth = 200 * settings.scale;
    const btnHeight = 60 * settings.scale;
    const btnY = centerY + 180 * settings.scale;

    // 绘制分享按钮背景
    drawRoundRect(ctx, centerX - btnWidth/2, btnY - btnHeight/2, btnWidth, btnHeight, 10 * settings.scale);
    
    // 创建按钮渐变
    const btnGradient = ctx.createLinearGradient(
        centerX - btnWidth/2,
        btnY - btnHeight/2,
        centerX + btnWidth/2,
        btnY + btnHeight/2
    );
    btnGradient.addColorStop(0, '#4CAF50');
    btnGradient.addColorStop(1, '#45a049');
    
    ctx.fillStyle = btnGradient;
    ctx.fill();

    // 绘制按钮文字
    ctx.font = `bold ${24 * settings.scale}px Arial`;
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 10;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('分享战绩', centerX, btnY);
    
    // 存储分享按钮位置信息
    wx.globalData.shareButton = {
        x: centerX - btnWidth/2,
        y: btnY - btnHeight/2,
        width: btnWidth,
        height: btnHeight
    };
    
    ctx.restore();

    // 添加装饰性元素
    ctx.save();
    // 绘制左右装饰线
    const lineLength = 80 * settings.scale;
    const lineSpacing = 140 * settings.scale;
    
    ctx.strokeStyle = '#800080';
    ctx.lineWidth = 2 * settings.scale;
    
    // 左侧装饰线
    ctx.beginPath();
    ctx.moveTo(centerX - lineSpacing, centerY - 80 * settings.scale);
    ctx.lineTo(centerX - lineSpacing - lineLength, centerY - 80 * settings.scale);
    ctx.stroke();
    
    // 右侧装饰线
    ctx.beginPath();
    ctx.moveTo(centerX + lineSpacing, centerY - 80 * settings.scale);
    ctx.lineTo(centerX + lineSpacing + lineLength, centerY - 80 * settings.scale);
    ctx.stroke();
    ctx.restore();
}

export { drawGameOver };