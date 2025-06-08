import { settings } from "../settings";
import { Block } from './teris/block'
import { Matrix } from './teris/matrix'
import { audioManager } from '../entry/music'
import { drawCircle } from '../comon.js';
import { Button, ButtonManager } from '../comon.js';

let canvas, context;
let game = Game;

let BlockSize = 17;

export class Game {
	constructor(canvas, ctx) {
		this.canvas = canvas
		this.ctx = ctx
		this.block = null
		this.nextBlock = null
		this.matrix = new Matrix(BlockSize)
		this.score = 0
		this.maxScore = 0
		this.level = 1
		this.speed = 60
		this.gameOver = false
		this.isPaused = false
		this.gap = 0 //下落结束空一帧
		this.init()
	}

	init() {
		this.nextBlock = new Block()
		// 创建新方块
		this.createNewBlock()

		// 加载游戏状态
		this.loadGameState()
	}

	createNewBlock() {
		this.block = this.nextBlock
		this.nextBlock = new Block()

		if (!this.canBlockMove(this.block)) {
			this.gameOver = true
			audioManager.gameover2();
			this.saveGameState()
			wx.showModal({
				title: '游戏结束',
				content: '得分：' + this.score,
				showCancel: false,
				success: () => {
					this.resetGame()
				}
			})
		}
	}

	update() {
		// 更新游戏状态
		if (this.canBlockMove(this.block, 0, 1)) {
			this.block.updateDown(this.speed)
			this.gap = 20
		} else if (this.gap > 0) {
			this.gap --
		} else {
			this.mergeBlock()
			this.checkLines()
			this.createNewBlock()
		}
	}

	render() {
		// 清空画布
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
		drawBackground();

		// 绘制游戏区域
		this.matrix.render(this.ctx,this.block)
		
		// 绘制下一个方块
		this.renderNextBlock()
		
		// 绘制分数和等级
		this.renderScore()
	}

	renderScore() {
		this.ctx.save()
		this.ctx.fillStyle = '#000'
		this.ctx.font = '20px Arial'
		const X = this.canvas.width/wx.globalData.currentPixelRatio-BlockSize*5;
		const Y = BlockSize*4;
		this.ctx.fillText('分数：', X, Y+BlockSize*2)
		this.ctx.fillStyle = '#F87'
		this.ctx.fillText(this.score, X, Y+BlockSize*4)
		this.ctx.fillStyle = '#000'
		this.ctx.fillText('等级：' + this.level, X, Y+BlockSize*6)
		this.ctx.fillText('最高分：' , X, Y+BlockSize*8)
		this.ctx.fillStyle = '#F87'
		this.ctx.fillText(this.maxScore, X, Y+BlockSize*10)
		this.ctx.fillStyle = '#000'
		this.ctx.fillText('下一个：', X, Y+BlockSize*12)
		this.renderNextBlock(X,Y+BlockSize*14)
		this.ctx.restore()
	}

	renderNextBlock(X,Y) {
		if (this.nextBlock) {
		// 保存当前上下文状态
		this.nextBlock.renderNext(this.ctx,BlockSize,X,Y)
		}
	}

	moveBlockLeft() {
		if (this.canBlockMove(this.block, -1, 0)) {
		this.block.moveLeft()
		audioManager.move2();
		}
	}

	moveBlockRight() {
		if (this.canBlockMove(this.block, 1, 0)) {
		this.block.moveRight()
		audioManager.move2();
		}
	}

	moveBlockDown() {

		for (let i = 20; i>0; i--) {
			if (this.canBlockMove(this.block, 0, i)) {
				this.block.moveDown(i)
				//audioManager.move2();
				break;
			}
		}
		
	}

	rotateBlock() {
		const rotatedBlock = this.block.getRotatedBlock()
		if (this.canBlockMove(rotatedBlock)) {
			this.block.rotate()
			audioManager.rotate();
		}
	}

	canBlockMove(block, offsetX = 0, offsetY = 0) {
		return this.matrix.canBlockFit(block, offsetX, offsetY)
	}

	mergeBlock() {
		this.matrix.mergeBlock(this.block)
		audioManager.fall();
	}

	checkLines() {
		const lines = this.matrix.checkLines()
		if (lines > 0) {
			this.updateScore(lines)
			audioManager.clear();
		}
	}

	updateScore(lines) {
		const scores = [0, 100, 300, 700, 1500]
		this.score += scores[lines]
		
		// 更新等级
		const newLevel = Math.floor(this.score / 1000) + 1
		if (newLevel !== this.level) {
		this.level = newLevel
		this.speed = Math.max(20,60 - (this.level - 1) * 5)
		}
		
		this.saveGameState()
	}

	saveGameState() {
		if (this.maxScore < this.score) {
			this.maxScore = this.score
		}
		wx.setStorage({
		key: 'tetris_state',
		data: {
			maxScore: this.maxScore,
		}
		})
	}

	loadGameState() {
		wx.getStorage({
		key: 'tetris_state',
		success: (res) => {
			const { maxScore } = res.data
			if (maxScore!=null && maxScore!=undefined) {
				this.maxScore = maxScore
			}
		}
		})
	}

	resetGame() {
		this.score = 0
		this.level = 1
		this.speed = 60
		this.gameOver = false
		this.matrix.reset()
		this.nextBlock = new Block()
		this.createNewBlock()
		this.saveGameState()
		audioManager.start2();
	}

  pause() {
    this.isPaused = true
  }

  resume() {
    this.isPaused = false
  }
} 



function InitTeris(c, ctxs) {
	canvas = c
	context = ctxs;
	BlockSize = context.canvas.width/wx.globalData.currentPixelRatio/17;
		
	wx.onTouchStart(touch);

	game = new Game(canvas, context);
	
	audioManager.start2();
	
	console.log('Init',canvas.width,canvas.height,BlockSize,wx.globalData.currentPixelRatio);
}

function checkTouch(x,y,button) {
	if (
		x >= button.x &&
		x <= button.x + button.width &&
		y >= button.y &&
		y <= button.y + button.height
	  ) {
		return true;
	  }else{
		return false;	
	  }
}

function touch(e) {
	const touch = e.touches[0];

	// 获取返回按钮的位置信息
	const returnButton = wx.globalData.returnButton;
	const clickX = touch.clientX;
	const clickY = touch.clientY;
	// 检查触摸点是否在返回按钮范围内
	if (checkTouch(clickX,clickY,returnButton)) {
		console.log('返回按钮被点击');
		wx.offTouchStart(touch); // 移除触摸事件监听
		wx.globalData.gameState = 999; // 假设 1 表示返回到主菜单
		
		return;
	}
	// 检查触摸点是否在返回按钮范围内
	if (checkTouch(clickX,clickY,wx.globalData.leftButton)) {
		game.moveBlockLeft()
		
		return;
	}
	if (checkTouch(clickX,clickY,wx.globalData.downButton)) {
		game.moveBlockDown()
		return;
	}
	if (checkTouch(clickX,clickY,wx.globalData.rightButton)) {
		
		game.moveBlockRight()
		return;
	}
	if (checkTouch(clickX,clickY,wx.globalData.rotateButton)) {
		game.rotateBlock()
		return;
	}

}

// 创建按钮管理器实例
const buttonManager = new ButtonManager();

function drawBackground() {
	const canvasWidth = context.canvas.width / wx.globalData.currentPixelRatio;
	const canvasHeight = context.canvas.height / wx.globalData.currentPixelRatio;
	
	context.fillStyle = 'rgb(44, 93, 93)';
	context.fillRect(0, 0, canvas.width, canvas.height);

	// 初始化所有按钮
	buttonManager.clear();

	// 添加返回按钮
	buttonManager.addButton(
		'return',
		20,
		20,
		100 * settings.scale,
		50 * settings.scale,
		'返回',
		{
			backgroundColor: 'rgba(190, 243, 187, 0)',
			textColor: '#bdc3c7',
			fontSize: 20,
			onClick: () => {
				wx.globalData.gameState = 999;
			}
		}
	);

	// 添加暂停按钮
	buttonManager.addButton(
		'pause',
		canvasWidth - 120 * settings.scale,
		60 * settings.scale,
		100 * settings.scale,
		50 * settings.scale,
		game.isPaused ? '继续' : '暂停',
		{
			backgroundColor: 'rgba(255, 165, 0, 0.8)',
			hoverColor: 'rgba(255, 140, 0, 0.8)',
			textColor: '#FFFFFF',
			fontSize: 20,
			onClick: () => {
				game.togglePause();
				// 更新按钮文字
				const pauseButton = buttonManager.getButton('pause');
				if (pauseButton) {
					pauseButton.text = game.isPaused ? '继续' : '暂停';
				}
			}
		}
	);

	// 添加左移按钮
	buttonManager.addButton(
		'left',
		BlockSize * 1,
		canvasHeight - BlockSize * 8,
		100 * settings.scale,
		50 * settings.scale,
		'左',
		{
			backgroundColor: 'rgba(255, 255, 0, 1)',
			textColor: 'rgb(0,0,0)',
			fontSize: 20,
			onClick: () => {
				game.moveLeft();
			}
		}
	);

	// 添加下移按钮
	buttonManager.addButton(
		'down',
		BlockSize + 50 * settings.scale * 2,
		canvasHeight - BlockSize * 4,
		100 * settings.scale,
		50 * settings.scale,
		'下',
		{
			backgroundColor: 'rgba(255, 255, 0, 1)',
			textColor: 'rgb(0,0,0)',
			fontSize: 20,
			onClick: () => {
				game.moveDown();
			}
		}
	);

	// 添加右移按钮
	buttonManager.addButton(
		'right',
		BlockSize + 50 * settings.scale * 4,
		canvasHeight - BlockSize * 8,
		100 * settings.scale,
		50 * settings.scale,
		'右',
		{
			backgroundColor: 'rgba(255, 255, 0, 1)',
			textColor: 'rgb(0,0,0)',
			fontSize: 20,
			onClick: () => {
				game.moveRight();
			}
		}
	);

	// 添加旋转按钮
	buttonManager.addButton(
		'rotate',
		BlockSize * 4 + 50 * settings.scale * 6,
		canvasHeight - BlockSize * 8,
		100 * settings.scale,
		50 * settings.scale,
		'旋转',
		{
			backgroundColor: 'rgb(255, 0, 0)',
			textColor: 'rgb(246, 255, 0)',
			fontSize: 20,
			isCircle: true,
			onClick: () => {
				game.rotate();
			}
		}
	);

	// 绘制所有按钮
	buttonManager.drawAll(context);

	// 存储按钮位置信息到全局变量
	buttonManager.buttons.forEach((button, id) => {
		wx.globalData[`${id}Button`] = {
			x: button.x,
			y: button.y,
			width: button.width,
			height: button.height
		};
	});

	// 如果游戏暂停，绘制暂停提示
	if (game.isPaused) {
		context.save();
		context.fillStyle = 'rgba(0, 0, 0, 0.5)';
		context.fillRect(0, 0, canvasWidth, canvasHeight);
		
		context.font = `bold ${36 * settings.scale}px Arial`;
		context.fillStyle = '#FFFFFF';
		context.textAlign = 'center';
		context.textBaseline = 'middle';
		context.fillText('游戏暂停', canvasWidth / 2, canvasHeight / 2);
		context.restore();
	}
}

// 修改触摸事件处理函数
function handleTouch(e) {
	const touch = e.touches[0];
	
	// 检查是否点击了暂停按钮
	const pauseButton = buttonManager.getButton('pause');
	if (pauseButton && pauseButton.isClicked(touch)) {
		game.togglePause();
		// 更新按钮文字
		pauseButton.text = game.isPaused ? '继续' : '暂停';
		// 重绘背景
		drawBackground();
		return;
	}

	// 如果游戏暂停，不处理其他按钮点击
	if (game.isPaused) {
		return;
	}

	// 处理其他按钮点击
	buttonManager.handleClick(touch);
}

function animateTreis() {
	if (!game.gameOver && !game.isPaused) {
		game.update()
		game.render()
	  }
}

export {animateTreis,InitTeris}