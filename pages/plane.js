import { settings } from '../settings.js';
import { Text, ButtonManager, randInt } from '../comon.js';
import { audioManager } from '../entry/music.js'
import Main from './plane/main.js'
let game = null;
let buttonManager = null;
let ctx = null;
let isPaused = false;
// 初始化游戏
export function InitPlane(canvas, ctx1) {
	audioManager.play('bgm');
	ctx = ctx1;
	game = new Main(canvas, ctx);
	//game.loadGameState()
	//game.player.maxScore = game.player.maxScore
	
	console.log('InitPlane',canvas.height,ctx)
	wx.onTouchStart(handleTouch);
	buttonManager = new ButtonManager();
	// 初始化所有按钮
	buttonManager.clear();
	const canvasWidth = canvas.width / wx.globalData.currentPixelRatio;
	const canvasHeight = canvas.height / wx.globalData.currentPixelRatio;
	// 计算基础尺寸
	const screenRatio = canvasWidth / canvasHeight;
	const baseSize = Math.min(canvasWidth / 10, canvasHeight / 14);
	const buttonWidth = baseSize * 2;
	const buttonHeight = baseSize;
	const horizontalSpacing = baseSize;

	// 添加返回按钮 - 左上角
	buttonManager.addButton(
		'return',
		baseSize * 0.5,
		baseSize *0.5,
		buttonWidth,
		buttonHeight,
		'返回',
		{
			backgroundColor: 'rgba(190, 243, 187, 0)',
			textColor: '#bdc3c7',
			fontSize: Math.floor(baseSize * 0.45),
			onClick: () => {
				wx.globalData.gameState = 999;
				audioManager.stop('bgm');
				isPaused = false
			}
		}
	);

	// 添加暂停按钮 - 返回按钮右侧
	buttonManager.addButton(
		'pause',
		baseSize * 0.5 + buttonWidth + horizontalSpacing,
		baseSize *0.5,
		buttonWidth,
		buttonHeight,
		isPaused ? '继续' : '暂停',
		{
			backgroundColor: 'rgba(255, 165, 0, 0.8)',
			hoverColor: 'rgba(255, 140, 0, 0.8)',
			textColor: '#FFFFFF',
			fontSize: Math.floor(baseSize * 0.45),
			onClick: () => {
				if (isPaused) {
					isPaused = false;
				} else {
					isPaused = true;
				}
				const pauseButton = buttonManager.getButton('pause');
				if (pauseButton) {
					pauseButton.text = isPaused ? '继续' : '暂停';
				}
				audioManager.move();
				//game.draw();
			}
		}
	);
}

// 游戏主循环
export function animatePlane() {
	if(isPaused) {
		return;
	}
	game.loop();
	// 绘制所有按钮
	buttonManager.drawAll(ctx);
}

// 处理触摸事件
export function handleTouch(e) {
	if (!game) return;

	const touch = e.touches[0];
	const x = touch.clientX;
	const y = touch.clientY;
	//console.log('handleBeeTouch',x,y)
	buttonManager.handleClick(touch);

	//if (game.gameState === GAME_STATE.GAME_OVER) {
	//	game.handleRestart();
	//	return;
	//}
	const canvasWidth = ctx.canvas.width / wx.globalData.currentPixelRatio;

	// 根据触摸位置判断移动方向
	//位于player的左侧
	if (x < canvasWidth/2) {
		//console.log('left')
		game.player.move('left');
		audioManager.move();
		console.log(game.player.visible)
	} else  {
		//console.log('right')
		game.player.move('right');
		audioManager.move();
	} 
}
