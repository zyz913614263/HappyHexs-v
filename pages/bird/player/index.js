import Sprite from '../base/sprite'
import DataBus from '../databus'
import {audioManager} from '../../../entry/music'

const screenWidth = window.innerWidth
const screenHeight = window.innerHeight
const ground_h = 128

// 玩家相关常量设置
const PLAYER_IMG_SRC = 'res/images/bird-01.png'
const PLAYER_IMG_SRC_ = 'res/images/bird-0{}.png'
const PLAYER_WIDTH = 34
const PLAYER_HEIGHT = 24

let databus = new DataBus()

export default class Player extends Sprite {
  constructor() {
    super(PLAYER_IMG_SRC, PLAYER_WIDTH, PLAYER_HEIGHT)
    this.img.src_ = PLAYER_IMG_SRC_
    this.img.srcNum = 1

    // 玩家默认处于屏幕底部居中位置
    this.x = screenWidth / 2 - this.width / 2
    // this.y = screenHeight - this.height - 30
    this.y = screenHeight / 2 - this.height / 2

    this.w = this.width
    this.h = this.height

    this.vy = 0
    this.rotation = 0
	this.score = 0

    // 初始化事件监听
    this.initEvent()
  }

  reset() {
    this.score = 0
	 // 玩家默认处于屏幕底部居中位置
	 this.x = screenWidth / 2 - this.width / 2
	 // this.y = screenHeight - this.height - 30
	 this.y = screenHeight / 2 - this.height / 2
	 this.vy = 0
	 this.rotation = 0
	 this.img.srcNum = 1
  }


  /**
   * 玩家响应手指的触摸事件
   * 改变战机的位置
   */
  initEvent() {
    canvas.addEventListener('touchstart', ((e) => {
		if (databus.gameOver) {
			return
		}
		audioManager.move2();
      this.vy = -4
      this.rotation = -45

    }).bind(this))

  }

  GameOver() {
	databus.gameOver = true
	audioManager.gameover2()
	databus.saveGameState(this.score)
	wx.showModal({
		title: '游戏结束',
		content: '得分：' + this.score,
		showCancel: true,
		cancelText: '返回',
		confirmText: '重新开始',

		success: (res) => {
			if (res.confirm) {
			  console.log('用户点击重新开始');
			  databus.reset();
			  this.reset();
			} else if (res.cancel) {
			  console.log('用户点击返回');
			  wx.globalData.gameState = 999; // 或其他返回逻辑
			}
		  }

	})
  }

  update() {
    this.y += this.vy
    this.vy += 0.1

    this.rotation += 1
    if (this.rotation >= 45) {
      this.rotation = 45
    }

    var groundPositon = screenHeight - this.height - ground_h
    if (this.y > groundPositon || this.y < 0) {
      this.GameOver()
      //this.y = groundPositon
    }
    if (databus.frame % 5 === 0) {
      this.img.srcNum++
      if (this.img.srcNum > 3) {
        this.img.srcNum = 1
      }
      //   console.log(this.img.srcNum)
      this.img.src = this.img.src_.replace('{}', this.img.srcNum)

    }
    //   console.log(this.img.src)

  }

  draw(ctx) {
    ctx.save()

    var w2 = this.w / 2
    var h2 = this.h / 2
    ctx.translate(this.x + w2, this.y + h2)
    if (this.flipX) {
      ctx.scale(-1, 1)
    }
    ctx.rotate(this.rotation * Math.PI / 180)
    ctx.translate(-w2, -h2)
    ctx.drawImage(this.img, 0, 0, this.width, this.height)

    ctx.restore()

  }
}
