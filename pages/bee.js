import { settings } from '../settings.js';
import { Text, ButtonManager, randInt } from '../comon.js';
import { audioManager } from '../entry/music'
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
		this.y = screenHeight - this.height - baseSize;  // 距离底部一个基础尺寸
		this.speed = baseSize * 0.5;  // 速度为基础尺寸的一半
		this.bullet = null;
		this.lives = 1;
		this.score = 0;
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
		const rows = 3 + Math.floor(this.level / 2);
		const cols = 5 + Math.floor(this.level / 2);
		const screenWidth = this.canvas.width / wx.globalData.currentPixelRatio;
		const screenHeight = this.canvas.height / wx.globalData.currentPixelRatio;
		const baseSize = Math.min(screenWidth / 15, screenHeight / 20); // 基础尺寸
		const startY = 150 * settings.scale;
		const startX = - baseSize/2;

		for (let row = 0; row < rows; row++) {
			for (let col = 0; col < cols; col++) {
				const type = Math.random() < 0.7 ? 1 : Math.random() < 0.9 ? 2 : 3;
				this.enemies.push(new Enemy(
					this.canvas,
					startX + col * baseSize*2,
					startY + row * baseSize*1.5,
					type
				));
			}
		}
	}

	update() {
		const now = Date.now();
		const dt = (now - this.lastUpdate) / 16.666;
		this.lastUpdate = now;

		if (this.gameState !== GAME_STATE.PLAYING) return;

		// 更新子弹
		if (this.player.bullet) {
			this.player.bullet.y -= this.player.bullet.speed;
			if (this.player.bullet.y < 0) {
				this.player.bullet = null;
			}
		}
		let changeDirection = false;
		// 更新敌人
		this.enemies.forEach(enemy => enemy.move());
		//lastDirection = 1 时 ，最右侧的敌人超出屏幕时改变方向
		if(this.lastDirection === 1){
			for (let i = 0; i < this.enemies.length; i++) {
				if(this.enemies[i].x + this.enemies[i].width > this.canvas.width/wx.globalData.currentPixelRatio){
					this.lastDirection *= -1;
					changeDirection = true;
					break;
				}
			}
		}else{
			for (let i = 0; i < this.enemies.length; i++) {
				if(this.enemies[i].x < 0){
					this.lastDirection *= -1;
					changeDirection = true;
					break;
				}
			}
		}
		if(changeDirection){
			for (let i = 0; i < this.enemies.length; i++) {
				this.enemies[i].changeDirection(this.lastDirection);
			}
		}


		// 检测子弹碰撞
		if (this.player.bullet) {
			for (let i = this.enemies.length - 1; i >= 0; i--) {
				const enemy = this.enemies[i];
				if(enemy.type === 4){
					continue;
				}
				if (this.checkCollision(this.player.bullet, enemy)) {
					enemy.health--;
					if (enemy.health <= 0) {
						this.player.score += enemy.points;
						this.enemies.splice(i, 1);
						audioManager.good();

						//有概率生成一个敌人，向player 移动过去
						if(randInt(0,100) < 10){
							this.enemies.push(new Enemy(
								this.canvas,
								enemy.x,
								enemy.y,
								4
							));
						}
					}
					this.player.bullet = null;
					
					break;
				}
			}
		}

		for (let i = this.enemies.length - 1; i >= 0; i--) {
			if(this.enemies[i].type === 4){
				if(this.enemies[i].y > this.player.y + this.player.height){
					this.enemies.splice(i, 1);
				}
			}
		}

		// 检测敌人与玩家碰撞
		for (const enemy of this.enemies) {
			if (this.checkCollision(this.player, enemy)) {
				this.player.lives--;
				if (this.player.lives <= 0) {
					this.gameState = GAME_STATE.GAME_OVER;
				}
				break;
			}
		}

		// 检查是否清空当前关卡
		if (this.enemies.length === 0) {
			this.level++;
			this.lastDirection = 1;
			audioManager.start();
			this.spawnEnemies();
		}
	}

	checkCollision(obj1, obj2) {
		return obj1.x < obj2.x + obj2.width &&
			   obj1.x + obj1.width > obj2.x &&
			   obj1.y < obj2.y + obj2.height &&
			   obj1.y + obj1.height > obj2.y;
	}

	draw() {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

		// 绘制背景
		this.ctx.fillStyle = '#2c3e50';
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

		// 绘制玩家
		this.player.draw(this.ctx);

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
		this.ctx.fillText(`生命: ${this.player.lives}`, 420 * settings.scale, 130 * settings.scale);

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
			this.enemies = [];
			this.gameState = GAME_STATE.PLAYING;
			this.level = 1;
			this.spawnEnemies();
			this.lastDirection = 1;
		}
	}
}

// 初始化游戏
export function InitBee(canvas, ctx) {
	audioManager.start2();
	game = new BeeGame(canvas, ctx);
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
export function animateBee() {
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
	// 根据触摸位置判断移动方向
	//位于player的左侧
	if (x < game.player.x) {
		console.log('left')
		game.handleInput('left');
		audioManager.move();
	} else if (x > game.player.x + game.player.width) {
		console.log('right')
		game.handleInput('right');
		audioManager.move();
	} 
}
