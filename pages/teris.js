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
			this.gap = 30
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
		let maxIndex = 0
		for (let i = 0; i<=20; i++) {
			if (this.canBlockMove(this.block, 0, i)) {
				maxIndex = i
				//audioManager.move2();
				//break;
			}else{
				break;
			}
		}
		this.block.moveDown(maxIndex)
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
		
	// 替换触摸事件处理函数
	wx.onTouchStart(handleTouch);

	game = new Game(canvas, context);
	
	audioManager.start2();
	
	console.log('Init',canvas.width,canvas.height,BlockSize,wx.globalData.currentPixelRatio);
}

// 修改触摸事件处理函数
function handleTouch(e) {
	const touch = e.touches[0];
	
	// 检查是否点击了返回按钮
	const returnButton = buttonManager.getButton('return');
	if (returnButton && returnButton.isClicked(touch)) {
		console.log('返回按钮被点击');
		wx.offTouchStart(handleTouch);
		wx.globalData.gameState = 999;
		return;
	}

	// 检查是否点击了暂停按钮
	const pauseButton = buttonManager.getButton('pause');
	if (pauseButton && pauseButton.isClicked(touch)) {
		if (game.isPaused) {
			game.resume();
		} else {
			game.pause();
		}
		pauseButton.text = game.isPaused ? '继续' : '暂停';
		drawBackground();
		audioManager.move();
		return;
	}

	// 如果游戏暂停，不处理其他按钮点击
	if (game.isPaused) {
		return;
	}

	// 检查其他按钮
	const leftButton = buttonManager.getButton('left');
	if (leftButton && leftButton.isClicked(touch)) {
		game.moveBlockLeft();
		return;
	}

	const rightButton = buttonManager.getButton('right');
	if (rightButton && rightButton.isClicked(touch)) {
		game.moveBlockRight();
		return;
	}

	const downButton = buttonManager.getButton('down');
	if (downButton && downButton.isClicked(touch)) {
		game.moveBlockDown();
		return;
	}

	const rotateButton = buttonManager.getButton('rotate');
	if (rotateButton && rotateButton.isClicked(touch)) {
		game.rotateBlock();
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
		baseSize,
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
		baseSize,
		buttonWidth,
		buttonHeight,
		game.isPaused ? '继续' : '暂停',
		{
			backgroundColor: 'rgba(255, 165, 0, 0.8)',
			hoverColor: 'rgba(255, 140, 0, 0.8)',
			textColor: '#FFFFFF',
			fontSize: Math.floor(baseSize * 0.45),
			onClick: () => {
				game.togglePause();
				const pauseButton = buttonManager.getButton('pause');
				if (pauseButton) {
					pauseButton.text = game.isPaused ? '继续' : '暂停';
				}
			}
		}
	);

	// 计算控制按钮区域
	const bottomPadding = baseSize * 0.5; // 减小底部边距
	const controlAreaWidth = buttonWidth * 2 + horizontalSpacing; // 控制区域宽度
	const controlStartX = (canvasWidth - controlAreaWidth) / 2; // 控制区域起始X坐标

	// 第一排按钮 Y 坐标（更靠下）
	const firstRowY = canvasHeight - bottomPadding - buttonHeight*1.5  - verticalSpacing;
	// 第二排按钮 Y 坐标（更靠下）
	const secondRowY = canvasHeight - bottomPadding - buttonHeight;

	// 左移按钮（第一排左）
	buttonManager.addButton(
		'left',
		controlStartX - buttonWidth ,  // 向左移动一个按钮宽度加间距
		firstRowY,
		buttonWidth,
		buttonHeight,
		'左移',
		{
			backgroundColor: 'rgba(255, 255, 0, 0.8)',
			textColor: 'rgb(0,0,0)',
			fontSize: Math.floor(baseSize * 0.45),
			onClick: () => {
				game.moveBlockLeft();
			}
		}
	);

	// 右移按钮（第一排右）
	buttonManager.addButton(
		'right',
		controlStartX + buttonWidth,
		firstRowY,
		buttonWidth,
		buttonHeight,
		'右移',
		{
			backgroundColor: 'rgba(255, 255, 0, 0.8)',
			textColor: 'rgb(0,0,0)',
			fontSize: Math.floor(baseSize * 0.45),
			onClick: () => {
				game.moveBlockRight();
			}
		}
	);

	// 下移按钮（第二排左）
	buttonManager.addButton(
		'down',
		controlStartX,
		secondRowY,
		buttonWidth,
		buttonHeight,
		'下移',
		{
			backgroundColor: 'rgba(255, 255, 0, 0.8)',
			textColor: 'rgb(246, 255, 0)',
			fontSize: Math.floor(baseSize * 0.45),
			onClick: () => {
				game.moveBlockDown();
			}
		}
	);

	// 旋转按钮（第二排右）
	buttonManager.addButton(
		'rotate',
		controlStartX + buttonWidth*2 + horizontalSpacing,
		secondRowY-buttonHeight,
		buttonWidth,
		buttonHeight*1.5,
		'旋转',
		{
			backgroundColor: 'rgb(255, 0, 0)',
			textColor: 'rgb(0,0,0)',
			fontSize: Math.floor(baseSize * 0.45),
			onClick: () => {
				game.rotateBlock();
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
		
		const pauseTextSize = baseSize * 0.8;
		context.font = `bold ${pauseTextSize}px Arial`;
		context.fillStyle = '#FFFFFF';
		context.textAlign = 'center';
		context.textBaseline = 'middle';
		context.fillText('游戏暂停', canvasWidth / 2, canvasHeight / 2);
		context.restore();
	}
}

function animateTreis() {
	if (!game.gameOver && !game.isPaused) {
		game.update()
		game.render()
	}
}

export {animateTreis,InitTeris}