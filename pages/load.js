import { settings } from '../settings.js';
import { Text, ButtonManager, randInt } from '../comon.js';
import { audioManager } from '../entry/music.js'
import CommonBackGround from './load/runtime/common_background'; // 导入背景类
import LoadPlayer from './load/player/load_player.js';
import loadDataBus from './load/load_databus.js';

let game = null;
let buttonManager = null;
let ctx = null;
let isPaused = false;
GameGlobal.databus = new loadDataBus();

export default class Load {
	constructor(canvas, ctx1) {
		this.bg = new CommonBackGround('res/images/bg_lu.jpg',1472,2616);
		this.player = new LoadPlayer();
	}

	 render(ctx) {
		ctx.clearRect(0, 0, canvas.width, canvas.height); // 清空画布
		this.bg.render(ctx); // 绘制背景
		this.player.render(ctx);
		GameGlobal.databus.bullets.forEach((item) => item.render(ctx)); // 绘制所有子弹
		GameGlobal.databus.enemys.forEach((item) => item.render(ctx)); // 绘制所有敌机
		//this.gameInfo.render(ctx); // 绘制游戏UI
		GameGlobal.databus.animations.forEach((ani) => {
		  if (ani.isPlaying) {
			ani.aniRender(ctx); // 渲染动画
		  }
		}); 
	}
	update() {
		GameGlobal.databus.frame++; // 增加帧数
		this.player.update();
		// 更新所有子弹
		GameGlobal.databus.bullets.forEach((item) => item.update());
		// 更新所有敌机
		GameGlobal.databus.enemys.forEach((item) => item.update());
	}

}

// 初始化游戏
export function InitLoad(canvas, ctx1) {
	audioManager.play('bgm');
	ctx = ctx1;
	game = new Load(canvas, ctx);
	GameGlobal.databus = new loadDataBus();

	//game = new Main(canvas, ctx);
	//game.loadGameState()
	//game.player.maxScore = game.player.maxScore
	
	console.log('InitLoad',canvas.height,ctx)
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
export function animateLoad() {
	if(isPaused) {
		//return;
	}
	//console.log('animateLoad')
	//game.loop();
	// 绘制所有按钮
	game.update()
	game.render(ctx);
	buttonManager.drawAll(ctx);
}

// 处理触摸事件
export function handleTouch(e) {
	//if (!game) return;

	const touch = e.touches[0];
	const x = touch.clientX;
	const y = touch.clientY;
	//console.log('handleBeeTouch',x,y)
	buttonManager.handleClick(touch);

	//if (game.gameState === GAME_STATE.GAME_OVER) {
	//	game.handleRestart();
	//	return;
	//}
	//const canvasWidth = ctx.canvas.width / wx.globalData.currentPixelRatio;

	// 根据触摸位置判断移动方向
	//位于player的左侧
	/*if (x < canvasWidth/2) {
		//console.log('left')
		game.player.move('left');
		audioManager.move();
		console.log(game.player.visible)
	} else  {
		//console.log('right')
		game.player.move('right');
		audioManager.move();
	}*/ 
}
