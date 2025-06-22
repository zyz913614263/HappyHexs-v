import Sprite from '../base/sprite';

const BULLET_IMG_SRC = 'res/images/bullet.png';
const BULLET_WIDTH = 16;
const BULLET_HEIGHT = 30;

export default class Bullet extends Sprite {
  constructor() {
    super(BULLET_IMG_SRC, BULLET_WIDTH, BULLET_HEIGHT);
  }

  init(x, y, speed) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.isActive = true;
    this.visible = true;
	this.startY = y;
  }

  // 每一帧更新子弹位置
  update() {
    if (GameGlobal.databus.isGameOver) {
      return;
    }
  
    this.y -= this.speed;
	this.scale = this.y/ this.startY*1.5;
    // 超出屏幕外销毁
    if (this.y < 0 ) {
      	this.destroy();
    }
  }

  destroy() {
	console.log('destroy')
    this.isActive = false;
    // 子弹没有销毁动画，直接移除
    this.remove();
  }

  remove() {
    this.isActive = false;
    this.visible = false;
    // 回收子弹对象
    GameGlobal.databus.removeBullets(this);
  }
}
