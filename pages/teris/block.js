export class Block {
  constructor() {
    // 方块形状定义
    this.shapes = [
      [[1, 1, 1, 1]], // I
      [[1, 1], [1, 1]], // O
      [[1, 1, 1], [0, 1, 0]], // T
      [[1, 1, 1], [1, 0, 0]], // L
      [[1, 1, 1], [0, 0, 1]], // J
      [[1, 1, 0], [0, 1, 1]], // S
      [[0, 1, 1], [1, 1, 0]]  // Z
    ]
    
    // 方块颜色
    this.colors = [
      '#00f0f0', // cyan
      '#f0f000', // yellow
      '#a000f0', // purple
      '#f0a000', // orange
      '#0000f0', // blue
      '#00f000', // green
      '#f00000'  // red
    ]
    
    // 随机选择形状和颜色
    this.shapeIndex = Math.floor(Math.random() * this.shapes.length)
    this.shape = this.shapes[this.shapeIndex]
    this.color = this.colors[this.shapeIndex]
    
    // 初始位置
    this.x = 3 //偏移3个格子
    this.y = 0
	this.lastDropTime = 0  // 添加最后下落时间记录
	this.currentTime = 0
  }
  
  moveLeft() {
    this.x--
  }
  
  moveRight() {
    this.x++
  }
  
  moveDown(step){
	this.y+=step
	this.currentTime = 0
	this.lastDropTime = 0
  }

  updateDown(speed) {
	this.currentTime++
	if(this.currentTime - this.lastDropTime >= speed){
		this.y++
		this.lastDropTime = this.currentTime
	}
  }
  
  rotate() {
    const newShape = []
    for (let i = 0; i < this.shape[0].length; i++) {
      newShape[i] = []
      for (let j = this.shape.length - 1; j >= 0; j--) {
        newShape[i].push(this.shape[j][i])
      }
    }
    this.shape = newShape
  }
  
  getRotatedBlock() {
    const rotated = new Block()
    rotated.x = this.x
    rotated.y = this.y
    rotated.shape = this.shape
    rotated.color = this.color
    rotated.rotate()
    return rotated
  }
  
  render(ctx,blockSize) {
    for (let i = 0; i < this.shape.length; i++) {
      for (let j = 0; j < this.shape[i].length; j++) {
        if (this.shape[i][j]) {
          const x = (this.x + j) * blockSize
          const y = (this.y + i) * blockSize
          ctx.fillStyle = this.color
          // 填充方块
          ctx.fillRect(x, y, blockSize, blockSize)
          // 绘制边框
          ctx.strokeRect(x, y, blockSize, blockSize)
        }
      }
    }
  }
  renderNext(ctx,blockSize,X,Y) {
	//console.log(this.shape,X,Y,blockSize);
    for (let i = 0; i < this.shape.length; i++) {
      for (let j = 0; j < this.shape[i].length; j++) {
        if (this.shape[i][j]) {
          const x = X + j * blockSize
          const y = Y + (i) * blockSize
          ctx.fillStyle = this.color
          // 填充方块
          ctx.fillRect(x, y, blockSize, blockSize)
          // 绘制边框
          ctx.strokeRect(x, y, blockSize, blockSize)
        }
      }
    }
  }
} 