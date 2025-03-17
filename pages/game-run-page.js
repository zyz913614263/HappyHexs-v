import { settings } from '../settings.js';
import { clearGameBoard,drawPolygon,randInt,rotatePoint,drawRoundRect,renderText } from '../comon.js';

const tt = wx

export function render(ctx,canvas) {
	const screenWidth = canvas.width / wx.globalData.currentPixelRatio;
    const screenHeight = canvas.height / wx.globalData.currentPixelRatio;
    const centerX = screenWidth / 2;
    const centerY = screenHeight / 2;


	var grey = '#bdc3c7';
	//是 Canvas 2D 上下文中用于清除指定矩形区域的方法，会将指定区域变成完全透明：
	ctx.clearRect(0, 0, wx.globalData.trueCanvas.width, wx.globalData.trueCanvas.height);
	
	// 设置白色背景
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, wx.globalData.trueCanvas.width, wx.globalData.trueCanvas.height);
	clearGameBoard(ctx);

	// 绘制最高分
	ctx.shadowBlur = 15;
    ctx.font = `bold ${36 * settings.scale}px Arial`;
    ctx.fillStyle = '#FFA500';  // 橙色
	ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`最高分: ${wx.globalData.highScore}`, centerX, 200*settings.scale);

	if (wx.globalData.gameState === 1 || wx.globalData.gameState === 2) {
		if (wx.globalData.op < 1) {
			wx.globalData.op += 0.01;
		}
		ctx.globalAlpha = wx.globalData.op;
		drawPolygon(ctx,wx.globalData.trueCanvas.width / 2 , wx.globalData.trueCanvas.height / 2 , 6, (settings.rows * settings.blockHeight) * (2/Math.sqrt(3)) + settings.hexWidth, 30, grey, false,6);
		drawTimer(ctx);
		ctx.globalAlpha = 1;
	}

	var i;
	for (i = 0; i < wx.globalData.mainHex.blocks.length; i++) {
		for (var j = 0; j < wx.globalData.mainHex.blocks[i].length; j++) {
			var block = wx.globalData.mainHex.blocks[i][j];
			block.draw(true, j);
		}
	}
	
	for (i = 0; i < wx.globalData.blocks.length; i++) {
		wx.globalData.blocks[i].draw();
	}

	wx.globalData.mainHex.draw();

	for (i = 0; i < wx.globalData.mainHex.texts.length; i++) {
		var alive = wx.globalData.mainHex.texts[i].draw(ctx);
		if(!alive){
			wx.globalData.mainHex.texts.splice(i,1);
			i--;
		}
	}
	var startTextTime = 200;
	if (wx.globalData.mainHex.ct < startTextTime ) {
		if (wx.globalData.mainHex.ct > (startTextTime- 50)) {
			ctx.globalAlpha = (50 - (wx.globalData.mainHex.ct - (startTextTime - 50)))/50;
		}

		if (wx.globalData.mainHex.ct < 50) {
			ctx.globalAlpha = (wx.globalData.mainHex.ct)/50;
		}

		renderBeginningText(ctx);
		ctx.globalAlpha = 1;
	}
	
	
}

function renderBeginningText(ctx) {
	var upperheight = (wx.globalData.trueCanvas.height/3) - ((settings.rows * settings.blockHeight) * (2/Math.sqrt(3))) * (5/6);
	var lowerheight = (wx.globalData.trueCanvas.height/3*2) + ((settings.rows * settings.blockHeight) * (2/Math.sqrt(3))) * (11/16);
    var mob, fontSize;
	mob = true;
	var input_text = '点击屏幕来旋转 '
	var action_text = '<-左边  右边->'
	var score_text = '相邻的3个同色块会消除并得分'
	var fontSize = 35
    
	renderText(ctx,(wx.globalData.trueCanvas.width)/2 + 2 * settings.scale,upperheight-0*settings.scale, fontSize, '#2c3e50', input_text);
	renderText(ctx,(wx.globalData.trueCanvas.width)/2 + 2 * settings.scale,upperheight+33*settings.scale, fontSize, '#00FF00', action_text);
    if (!mob) {
	    drawKey(ctx,"",(wx.globalData.trueCanvas.width)/2 + 2 * settings.scale-2.5,upperheight+38*settings.scale);
    }

	renderText(ctx,(wx.globalData.trueCanvas.width)/2 + 2 * settings.scale,lowerheight,fontSize, '#2c3e50', score_text);

}

function drawKey(ctx,key, x, y) {
	ctx.save();
	switch (key) {
		case "left":
			ctx.translate(x, y + settings.scale * 13);
			ctx.rotate(3.14159);
			ctx.font = "20px Fontawesome";
			ctx.scale(settings.scale, settings.scale);
			ctx.fillText(String.fromCharCode("0xf04b"), 0, 0);
			break;
		case "right":
			ctx.font = "20px Fontawesome";
			ctx.translate(x , y + settings.scale * 27.5);
			ctx.scale(settings.scale, settings.scale);
			ctx.fillText(String.fromCharCode("0xf04b"), 0, 0);
			break;
		
		default:
			drawKey("left", x - 5, y);
			drawKey("right", x + 5, y);
	}
	ctx.restore();
}



//绘制六边形外的线条型倒计时 
export function drawTimer(ctx) {
	if(wx.globalData.gameState==1){
		var leftVertexes = [];
		var rightVertexes = [];
		if(wx.globalData.mainHex.ct - wx.globalData.mainHex.lastCombo < settings.comboTime){
			for(var i=0;i<6;i++){
				var done = (wx.globalData.mainHex.ct -wx.globalData.mainHex.lastCombo);
				if(done<(settings.comboTime)*(5-i)*(1/6)){
					leftVertexes.push(calcSide(ctx,i,i+1,1,1));
					rightVertexes.push(calcSide(ctx,12-i,11-i,1,1));
				}
				else{
					leftVertexes.push(calcSide(ctx,i,i+1,1-((done*6)/settings.comboTime)%(1),1));
					rightVertexes.push(calcSide(ctx,12-i,11-i,1-((done*6)/settings.comboTime)%(1),1));
					break;
				}
			}
		}
		if(rightVertexes.length !== 0) drawSide(ctx,rightVertexes);
		if(leftVertexes.length !== 0) drawSide(ctx,leftVertexes);
	}
}

function calcSide(ctx,startVertex,endVertex,fraction,offset){
	startVertex = (startVertex+offset)%12;
	endVertex = (endVertex+offset)%12;
	ctx.globalAlpha=1;
	ctx.beginPath();
	ctx.lineCap = "round";

	var radius = (settings.rows * settings.blockHeight) * (2/Math.sqrt(3)) + settings.hexWidth ;
	var halfRadius = radius/2;
	var triHeight = radius *(Math.sqrt(3)/2);
	var Vertexes =[
		[(halfRadius*3)/2,triHeight/2],
		[radius,0],
		[(halfRadius*3)/2,-triHeight/2],
		[halfRadius,-triHeight],
		[0,-triHeight],
		[-halfRadius,-triHeight],
		[-(halfRadius*3)/2,-triHeight/2],
		[-radius,0],
		[-(halfRadius*3)/2,triHeight/2],
		[-halfRadius,triHeight],
		[0,triHeight],
		[halfRadius,triHeight]
	].reverse();
	var startX =wx.globalData.trueCanvas.width/2 + Vertexes[startVertex][0];
	var startY =wx.globalData.trueCanvas.height/2 + Vertexes[startVertex][1];
	var endX = wx.globalData.trueCanvas.width/2 + Vertexes[endVertex][0];
	var endY = wx.globalData.trueCanvas.height/2 + Vertexes[endVertex][1];
		return [[startX,startY],[((endX-startX)*fraction)+startX,((endY-startY)*fraction)+startY]];
}

function drawSide(ctx,vertexes){
	if (wx.globalData.gameState === 0) {
		ctx.strokeStyle = wx.globalData.hexColorsToTintedColors[wx.globalData.mainHex.lastColorScored];
	} else {
		ctx.strokeStyle = wx.globalData.mainHex.lastColorScored;
	}
	ctx.lineWidth =4*settings.scale;
		ctx.moveTo(vertexes[0][0][0],vertexes[0][0][1]);
	ctx.lineTo(vertexes[0][1][0],vertexes[0][1][1]);
		for(var i=1;i<vertexes.length;i++){
			ctx.lineTo(vertexes[i][1][0],vertexes[i][1][1]);
			ctx.moveTo(vertexes[i][1][0],vertexes[i][1][1]);
		}
	ctx.closePath();
	ctx.fill();
	ctx.stroke();

}
