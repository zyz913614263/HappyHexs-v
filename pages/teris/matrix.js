import { Block } from './block'
export class Matrix {
	constructor(blockSize) {
		this.rows = 20
		this.cols = 10
		this.blockSize = blockSize
		this.reset()
	}
  
	reset() {
	  	this.grid = Array(this.rows).fill().map(() => Array(this.cols).fill(null))
	}
  
	getData() {
	  	return this.grid
	}
  
	setData(data) {
	  	this.grid = data
	}
  
	canBlockFit(block, offsetX = 0, offsetY = 0) {
		for (let i = 0; i < block.shape.length; i++) {
			for (let j = 0; j < block.shape[i].length; j++) {
				if (block.shape[i][j]) {
					const x = block.x + j + offsetX
					const y = block.y + i + offsetY
					
					// 检查边界
					if (x < 0 || x >= this.cols || y < 0 || y >= this.rows) {
						return false
					}
					
					// 检查碰撞
					if (y >= 0 && this.grid[y][x]) {
						return false
					}
				}
			}
		}
		return true
	}
  
	mergeBlock(block) {
		for (let i = 0; i < block.shape.length; i++) {
			for (let j = 0; j < block.shape[i].length; j++) {
				if (block.shape[i][j]) {
					const x = block.x + j
					const y = block.y + i
					if (y >= 0) {
						this.grid[y][x] = block.color
					}
				}
			}
		}
	}
  
	checkLines() {
		let linesCleared = 0
		
		for (let i = this.rows - 1; i >= 0; i--) {
			if (this.isLineComplete(i)) {
				this.clearLine(i)
				linesCleared++
				i++ // 重新检查当前行（因为上面的行下移了）
			}
		}
		
		return linesCleared
	}
  
	isLineComplete(row) {
	  	return this.grid[row].every(cell => cell !== null)
	}
  
	clearLine(row) {
		// 删除完整的行
		this.grid.splice(row, 1)
		// 在顶部添加新的空行
		this.grid.unshift(Array(this.cols).fill(null))
	}
  
	/**
	 * 
	 * @param {*} ctx 
	 * @param {Block} block 
	 */
	render(ctx,block) {
	
		// 保存当前的坐标系状态
		ctx.save();
		// 移动坐标系原点到画布中心，并向右下偏移
		const X = this.blockSize//(canvasWidth - this.cols*this.blockSize)/2;
		//console.log(X,this.cols,this.rows,this.blockSize,canvasWidth);
		const Y = this.blockSize*5;
		ctx.translate(X,Y);
		// 计算并应用变换
		const canvasWidth = ctx.canvas.width / wx.globalData.currentPixelRatio;
		const canvasHeight = ctx.canvas.height / wx.globalData.currentPixelRatio;
		const totalWidth = this.cols * this.blockSize;
		const totalHeight = this.rows * this.blockSize;

		ctx.fillStyle ='rgb(167, 167, 167)';
		ctx.fillRect(0, 0, totalWidth, totalHeight);
		
		
		// 第一部分：绘制背景网格
		ctx.strokeStyle = '#ccc'  // 设置网格线颜色为浅灰色
		for (let i = 0; i < this.rows; i++) {  // 遍历所有行
			for (let j = 0; j < this.cols; j++) {  // 遍历所有列
			ctx.strokeRect(  // 绘制一个矩形边框
				j * this.blockSize,  // x坐标：列数 * 方块大小
				i * this.blockSize,  // y坐标：行数 * 方块大小
				this.blockSize,      // 宽度：方块大小
				this.blockSize       // 高度：方块大小
			)
			}
		}
		
		// 第二部分：绘制已固定的方块
		for (let i = 0; i < this.rows; i++) {  // 遍历所有行
			for (let j = 0; j < this.cols; j++) {  // 遍历所有列
				if (this.grid[i][j]) {  // 如果该位置有方块
					ctx.fillStyle = this.grid[i][j]  // 设置方块填充颜色
					ctx.fillRect(  // 绘制填充矩形
					j * this.blockSize,  // x坐标：列数 * 方块大小
					i * this.blockSize,  // y坐标：行数 * 方块大小
					this.blockSize,      // 宽度：方块大小
					this.blockSize       // 高度：方块大小
					)
					ctx.strokeStyle = '#000'  // 设置方块边框颜色为黑色
					ctx.strokeRect(  // 绘制方块边框
					j * this.blockSize,  // x坐标：列数 * 方块大小
					i * this.blockSize,  // y坐标：行数 * 方块大小
					this.blockSize,      // 宽度：方块大小
					this.blockSize       // 高度：方块大小
					)
				}
			}
		}

		if(block){
			block.render(ctx,this.blockSize)
		}

	   	// 恢复坐标系状态
	   	ctx.restore();

		// 保存当前的坐标系状态
		//ctx.save();
		//ctx.translate(X,Y);
		
		//ctx.restore();
	}
	
  } 