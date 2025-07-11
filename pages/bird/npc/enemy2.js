import Sprite from '../base/sprite'
import DataBus from '../databus'

const ENEMY_IMG_SRC = 'res/images/pipe1.png'
const ENEMY_WIDTH = 69
const ENEMY_HEIGHT = 397

const __ = {
  speed: Symbol('speed')
}

let databus = new DataBus()

function rnd(start, end) {
  return Math.floor(Math.random() * (end - start) + start)
}

export default class Enemy2 extends Sprite {
  constructor() {
    super(ENEMY_IMG_SRC, ENEMY_WIDTH, ENEMY_HEIGHT)
  }

  init(speed) {
    this.x = rnd(window.innerWidth, window.innerWidth * 2)
    // 底部管道：从底部向上延伸
    this.y = -rnd(150, 200)
    this.speed = speed
    this.visible = true
  }

  // 每一帧更新子弹位置
  update() {
    this.x -= this.speed

    // 对象回收
    if (this.x < -this.width)
      databus.removeEnemey(this)
  }
}
