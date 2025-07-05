import { settings } from '../settings.js';
import { Text, ButtonManager, randInt } from '../comon.js';
import { audioManager } from '../entry/music.js'
import { drawHexGrid,path } from './hex.js'
let game = null;
let buttonManager = null;
// 游戏状态
const GAME_STATE = {
	PLAYING: 1,
	GAME_OVER: 2
};

// 玩家战机类
class PlayerShip {
	constructor(canvas) {
		this.canvas = canvas;
		const screenWidth = canvas.width / wx.globalData.currentPixelRatio;
		const screenHeight = canvas.height / wx.globalData.currentPixelRatio;
		const baseSize = Math.min(screenWidth / 20, screenHeight / 30); // 基础尺寸
		
		this.width = baseSize * 4;  // 战机宽度为基础尺寸的2倍
		this.height = baseSize * 3;  // 战机高度为基础尺寸的1.5倍
		this.x = screenWidth / 2;
		this.y = screenHeight - this.height - 2* baseSize;  // 距离底部一个基础尺寸
		this.speed = baseSize * 0.5;  // 速度为基础尺寸的一半
		this.bullet = null;
		this.lives = 1;
		this.score = 0;
		this.maxScore = 0;
	}

	move(direction) {
		if (direction === 'left' && this.x > 0) {
			this.x -= this.speed;
		} else if (direction === 'right' && this.x < this.canvas.width/wx.globalData.currentPixelRatio - this.width) {
			this.x += this.speed;
		}
	}

	shoot() {
		if (!this.bullet) {
			const baseSize = Math.min(this.canvas.width/wx.globalData.currentPixelRatio / 20, this.canvas.height/wx.globalData.currentPixelRatio / 30);
			this.bullet = {
				x: this.x + this.width / 2,
				y: this.y,
				width: baseSize * 0.2,  // 子弹宽度为基础尺寸的0.2倍
				height: baseSize * 0.4,  // 子弹高度为基础尺寸的0.5倍
				speed: baseSize * 0.5  // 子弹速度为基础尺寸的0.8倍
			};
			audioManager.move2();
		}
	}

	draw(ctx) {
		// 绘制战机
		ctx.fillStyle = '#3498db';
		ctx.beginPath();
		ctx.moveTo(this.x + this.width / 2, this.y);
		ctx.lineTo(this.x + this.width, this.y + this.height);
		ctx.lineTo(this.x, this.y + this.height);
		ctx.closePath();
		ctx.fill();

		// 绘制子弹
		if (this.bullet) {
			ctx.fillStyle = '#e74c3c';
			ctx.fillRect(
				this.bullet.x - this.bullet.width / 2,
				this.bullet.y,
				this.bullet.width,
				this.bullet.height
			);
		}
	}
}

// 敌人类
class Enemy {
	constructor(canvas, x, y, type) {
		this.canvas = canvas;
		const screenWidth = canvas.width / wx.globalData.currentPixelRatio;
		const screenHeight = canvas.height / wx.globalData.currentPixelRatio;
		const baseSize = Math.min(screenWidth / 15, screenHeight / 20); // 基础尺寸
		
		this.x = x;
		this.y = y;
		this.type = type; // 1: 普通敌人, 2: 中型敌人, 3: 大型敌人 4: 向player移动的敌人
		this.width = baseSize * (1 );  // 敌人宽度随类型增加
		this.height = baseSize * (0.75 );  // 敌人高度随类型增加
		this.speed = baseSize * 0.6;  // 敌人速度随类型增加
		this.direction = 1;
		this.points = type * 100;
		this.health = type;
		this.lastTime = 0
		this.yOffset = 1
	}

	move() {
		if(this.lastTime === 0){
			this.lastTime = 60
			if(this.type === 4){
				this.y += this.speed*3;
			}else{
				this.x += this.speed * this.direction;
				this.y += (this.height / 2) * this.yOffset;
				this.yOffset *= -1;
			}
		}
		this.lastTime--;
	}

	changeDirection(direction){
		this.direction = direction;
		this.y += this.height;
	}
	
	getColor(){
		if(this.health === 4){
			return 'rgba(34, 2, 39, 0.8)'
		}else if(this.health === 3){
			return '#2ecc71'
		}else if(this.health === 2){
			return '#f1c40f'
		}else{
			return '#e74c3c'
		}
	}
	draw(ctx) {
		ctx.fillStyle = this.getColor()
		ctx.fillRect(this.x, this.y, this.width, this.height);
	}
}

// 游戏管理类
class BeeGame {
	constructor(canvas,ctx) {
		this.canvas = canvas;
		this.ctx = ctx;
		this.player = new PlayerShip(canvas);
		this.enemies = [];
		this.gameState = GAME_STATE.PLAYING;
		this.level = 1;
		this.spawnEnemies();
		this.lastUpdate = Date.now();
		this.isPaused = false;
		this.lastDirection = 1;
	}
	pause() {
		this.isPaused = true
	}
	
	resume() {
		this.isPaused = false
	}
	spawnEnemies() {
		// 计算起始位置，使网格居中
        const hexSize = 35; // 六边形的大小
        const startX = 100; // 起始X坐标
        const startY = 50;  // 起始Y坐标
        // 绘制六边形网格
        drawHexGrid(this.ctx, 0, 0, hexSize);
	}

	update() {
		
	}

	checkCollision(obj1, obj2) {
		return obj1.x < obj2.x + obj2.width &&
			   obj1.x + obj1.width > obj2.x &&
			   obj1.y < obj2.y + obj2.height &&
			   obj1.y + obj1.height > obj2.y;
	}

	draw() {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.spawnEnemies();
		// 绘制背景
		//this.ctx.fillStyle = '#2c3e50';
		//
		// 绘制玩家
		//this.player.draw(this.ctx);

		// 绘制敌人
		this.enemies.forEach(enemy => enemy.draw(this.ctx));

		// 绘制UI
		this.drawUI();

		if (this.gameState === GAME_STATE.GAME_OVER) {
			this.drawGameOver();
		}
	}

	drawUI() {
		// 绘制分数
		this.ctx.fillStyle = 'rgba(22, 191, 6, 0.8)';
		this.ctx.font = `${25 * settings.scale}px Arial`;
		this.ctx.textAlign = 'left';
		this.ctx.fillText(`分数: ${this.player.score}`, 20 * settings.scale, 130 * settings.scale);
		this.ctx.fillStyle = 'rgba(179, 191, 6, 0.8)';
		this.ctx.fillText(`关卡: ${this.level}`, 220 * settings.scale, 130 * settings.scale);
		this.ctx.fillStyle = 'rgba(191, 68, 6, 0.8)';
		this.ctx.fillText(`最高分: ${this.player.maxScore}`, 360 * settings.scale, 130 * settings.scale);

		// 绘制所有按钮
		buttonManager.drawAll(this.ctx);
	}

	drawGameOver() {
		audioManager.gameover2();
		wx.showModal({
			title: '游戏结束',
			content: '得分：' + this.player.score,
			showCancel: false,
			success: () => {
				this.handleRestart()
			}
		})
		this.saveGameState()
	}

	handleInput(direction) {
		if (this.gameState === GAME_STATE.PLAYING) {
			this.player.move(direction);
		}
	}

	handleShoot() {
		if (this.gameState === GAME_STATE.PLAYING) {
			this.player.shoot();
		}
	}

	handleRestart() {
		if (this.gameState === GAME_STATE.GAME_OVER) {
			this.player = new PlayerShip(this.canvas);
			this.loadGameState()
			//this.player.maxScore = this.player.maxScore
			this.enemies = [];
			this.gameState = GAME_STATE.PLAYING;
			this.level = 1;
			this.spawnEnemies();
			this.lastDirection = 1;
		}
	}
	saveGameState() {
		if (this.player.score > this.player.maxScore) {
			this.player.maxScore = this.player.score
		}
		wx.setStorage({
			key: 'bee_state',
			data: {
				maxScore: this.player.maxScore,
			}
		})
	}

	loadGameState() {
		wx.getStorage({
		key: 'bee_state',
		success: (res) => {
			const { maxScore } = res.data
			if (maxScore!=null && maxScore!=undefined) {
				this.player.maxScore = maxScore
			}
		}
		})
	}

}

// 初始化游戏
export function InitExplore(canvas, ctx) {
	wx.globalData.path = []
	wx.globalData.hexList = []
	audioManager.start2();
	game = new BeeGame(canvas, ctx);
	game.loadGameState()
	game.player.maxScore = game.player.maxScore
	console.log('InitBee',canvas.height,ctx)
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
	const verticalSpacing = baseSize * 0.8;
	

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
				wx.globalData.path.length = 0
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
		game.isPaused ? '继续' : '暂停',
		{
			backgroundColor: 'rgba(255, 165, 0, 0.8)',
			hoverColor: 'rgba(255, 140, 0, 0.8)',
			textColor: '#FFFFFF',
			fontSize: Math.floor(baseSize * 0.45),
			onClick: () => {
				if (game.isPaused) {
					game.resume();
				} else {
					game.pause();
				}
				const pauseButton = buttonManager.getButton('pause');
				if (pauseButton) {
					pauseButton.text = game.isPaused ? '继续' : '暂停';
				}
				audioManager.move();
				game.draw();
			}
		}
	);
}

// 游戏主循环
export function animateExplore() {
	if (!game) return;
	if(game.isPaused) return;
	if(game.gameState === GAME_STATE.GAME_OVER) return;

	game.update();
	game.draw();
}

// 处理触摸事件
export function handleTouch(e) {
	if (!game) return;

	const touch = e.touches[0];
	const x = touch.clientX;
	const y = touch.clientY;
	//console.log('handleBeeTouch',x,y)
	buttonManager.handleClick(touch);

	if (game.gameState === GAME_STATE.GAME_OVER) {
		game.handleRestart();
		return;
	}
	const canvasWidth = game.canvas.width / wx.globalData.currentPixelRatio;
	//如果点中了player，则发子弹
	if(game.checkCollision(game.player, {x: x, y: y, width: 10, height: 10})){
		console.log('shoot')
		game.handleShoot();
		return
	}

	// 检查是否点击了六边形
	//wx.globalData.hexList.forEach(hex => {
	//	if(game.checkCollision(game.player, {x: hex.centerX, y: hex.centerY, width: hex.hexSize, height: hex.hexSize})){
	//		console.log('hex',hex)
	//	}
	//})
}
