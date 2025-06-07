import { settings } from "../settings";
import { Block } from './teris/block'
import { Matrix } from './teris/matrix'
import { audioManager } from '../entry/music'

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



function drawBackground() {
	const canvasWidth = context.canvas.width / wx.globalData.currentPixelRatio;
	const canvasHeight = context.canvas.height / wx.globalData.currentPixelRatio;
	
	//console.log('画布尺寸:', canvasWidth, canvasHeight); // 调试信息
	
	// 清空画布
	//ctx.clearRect(0, 0, canvasWidth, canvasHeight);
	//const innerGradient = ctx.createLinearGradient(-canvasWidth, -canvasHeight, canvasWidth, canvasHeight);
	//innerGradient.addColorStop(0, '#3498db');
	//innerGradient.addColorStop(1, '#2980b9');

	// 绘制半透明背景
	//ctx.fillStyle = innerGradient//'rgba(0, 0, 0, 0.5)';
	//ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  	context.fillStyle ='rgb(44, 93, 93)';
  	context.fillRect(0, 0, canvas.width, canvas.height);

	// 绘制返回按钮
	const btnWidth = 100 * settings.scale;
	const btnHeight = 50 * settings.scale;
	const btnX = 20; // 按钮左上角 X 坐标
	const btnY = 20; // 按钮左上角 Y 坐标
	
	context.save();
	context.fillStyle = 'rgba(190, 243, 187, 0)'; // 按钮背景颜色
	context.fillRect(btnX, btnY, btnWidth, btnHeight);
	
	context.font = '20px Arial';
	context.fillStyle = '#bdc3c7'; // 按钮文字颜色
	context.textAlign = 'center';
	context.textBaseline = 'middle';
	context.fillText('返回', btnX + btnWidth / 2, btnY + btnHeight / 2);
	context.restore();
	
	// 将按钮位置存储到全局变量，供触摸事件使用
	wx.globalData.returnButton = { x: btnX, y: btnY, width: btnWidth, height: btnHeight };

	// 绘制返回按钮
	
	const btnLeftX = BlockSize*1; // 按钮左上角 X 坐标
	const btnLeftY = canvasHeight-BlockSize*8; // 按钮左上角 Y 坐标
	
	context.save();
	context.fillStyle = 'rgba(255, 255, 0, 1)'; // 按钮背景颜色
	context.fillRect(btnLeftX, btnLeftY, btnWidth, btnHeight);
	
	context.font = '20px Arial';
	context.fillStyle = 'rgb(0,0,0)'; // 按钮文字颜色
	context.textAlign = 'center';
	context.textBaseline = 'middle';
	context.fillText('左', btnLeftX + btnWidth / 2, btnLeftY + btnHeight / 2);
	context.restore();
	
	// 将按钮位置存储到全局变量，供触摸事件使用
	wx.globalData.leftButton = { x: btnLeftX, y: btnLeftY, width: btnWidth, height: btnHeight };

	context.save();
	const btnDownX = BlockSize+btnHeight*2; // 按钮左上角 X 坐标
	const btnDownY = canvasHeight-BlockSize*4; // 按钮左上角 Y 坐标
	context.fillStyle = 'rgba(255, 255, 0, 1)'; // 按钮背景颜色
	context.fillRect(btnDownX, btnDownY, btnWidth, btnHeight);
	
	context.font = '20px Arial';
	context.fillStyle = 'rgb(0,0,0)'; // 按钮文字颜色
	context.textAlign = 'center';
	context.textBaseline = 'middle';
	context.fillText('下', btnDownX + btnWidth / 2, btnDownY + btnHeight / 2);
	context.restore();
	
	// 将按钮位置存储到全局变量，供触摸事件使用
	wx.globalData.downButton = { x: btnDownX, y: btnDownY, width: btnWidth, height: btnHeight };

	context.save();
	const btnRightX = BlockSize+btnHeight*4; // 按钮左上角 X 坐标
	const btnRightY = canvasHeight-BlockSize*8; // 按钮左上角 Y 坐标
	context.fillStyle = 'rgba(255, 255, 0, 1)'; // 按钮背景颜色
	context.fillRect(btnRightX, btnRightY, btnWidth, btnHeight);
	
	context.font = '20px Arial';
	context.fillStyle = 'rgb(0,0,0)'; // 按钮文字颜色
	context.textAlign = 'center';
	context.textBaseline = 'middle';
	context.fillText('右', btnRightX + btnWidth / 2, btnRightY + btnHeight / 2);
	context.restore();
	
	// 将按钮位置存储到全局变量，供触摸事件使用
	wx.globalData.rightButton = { x: btnRightX, y: btnRightY, width: btnWidth, height: btnHeight };
	
	context.save();
	const btnRotateX = BlockSize*4+btnHeight*6; // 按钮左上角 X 坐标
	const btnRotateY = canvasHeight-BlockSize*8; // 按钮左上角 Y 坐标
	drawCircle(context,btnRotateX+BlockSize,btnRotateY+BlockSize,btnWidth/2,'rgb(255, 0, 0)');
	
	context.font = '20px Arial';
	context.fillStyle = 'rgb(246, 255, 0)'; // 按钮文字颜色
	context.textAlign = 'center';
	context.textBaseline = 'middle';
	context.fillText('旋转', btnRotateX + btnWidth / 3, btnRotateY + btnHeight / 2);
	context.restore();
	
	// 将按钮位置存储到全局变量，供触摸事件使用
	wx.globalData.rotateButton = { x: btnRotateX, y: btnRotateY, width: btnWidth, height: btnHeight };
}

// 基本画圆方法
function drawCircle(ctx, x, y, radius, color) {
    ctx.save();
	ctx.beginPath();  // 开始一个新的路径
    ctx.arc(x, y, radius, 0, Math.PI * 2);  // 画一个完整的圆
    ctx.fillStyle = color;  // 设置填充颜色
    ctx.fill();  // 填充圆
    ctx.closePath();  // 关闭路径
	ctx.restore();
}


function animateTreis() {
	if (!game.gameOver && !game.isPaused) {
		game.update()
		game.render()
	  }
}

export {animateTreis,InitTeris}