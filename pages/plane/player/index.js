import Animation from '../base/animation';
import { SCREEN_WIDTH, SCREEN_HEIGHT } from '../render';
import Bullet from './bullet';
import { audioManager } from '../../../entry/music.js'

// 玩家相关常量设置
const PLAYER_IMG_SRC = 'res/images/hero.png';
const PLAYER_WIDTH = 80;
const PLAYER_HEIGHT = 80;
const EXPLO_IMG_PREFIX = 'res/images/explosion';
const PLAYER_SHOOT_INTERVAL = 20;

export default class Player extends Animation {
  constructor() {
    super(PLAYER_IMG_SRC, PLAYER_WIDTH, PLAYER_HEIGHT);

    // 初始化坐标
    this.init();

    // 初始化事件监听
    this.initEvent();
	this.level = 1;
	this.levelDown = 600 //每10秒下降1级
  }

  init() {
    // 玩家默认处于屏幕底部居中位置
    this.x = SCREEN_WIDTH / 2 - this.width / 2;
    this.y = SCREEN_HEIGHT - this.height - 30;

    // 用于在手指移动的时候标识手指是否已经在飞机上了
    this.touched = false;

    this.isActive = true;
    this.visible = true;
	this.level = 1;

    // 设置爆炸动画
    this.initExplosionAnimation();
  }

  // 预定义爆炸的帧动画
  initExplosionAnimation() {
    const EXPLO_FRAME_COUNT = 19;
    const frames = Array.from(
      { length: EXPLO_FRAME_COUNT },
      (_, i) => `${EXPLO_IMG_PREFIX}${i + 1}.png`
    );
    this.initFrames(frames);
  }

  /**
   * 判断手指是否在飞机上
   * @param {Number} x: 手指的X轴坐标
   * @param {Number} y: 手指的Y轴坐标
   * @return {Boolean}: 用于标识手指是否在飞机上的布尔值
   */
  checkIsFingerOnAir(x, y) {
    const deviation = 30;
    return (
      x >= this.x - deviation &&
      y >= this.y - deviation &&
      x <= this.x + this.width + deviation &&
      y <= this.y + this.height + deviation
    );
  }

  /**
   * 根据手指的位置设置飞机的位置
   * 保证手指处于飞机中间
   * 同时限定飞机的活动范围限制在屏幕中
   */
  setAirPosAcrossFingerPosZ(x, y) {
    const disX = Math.max(
      0,
      Math.min(x - this.width / 2, SCREEN_WIDTH - this.width)
    );


    this.x = disX;
	if (y != 0) {
		const disY = Math.max(
			0,
			Math.min(y - this.height / 2, SCREEN_HEIGHT - this.height)
		);
		this.y = disY;
	}
  }

  move(direction) {
    if (direction === 'left') {
      this.x -= 30;
	  if(this.x < 0) {
		this.x = 0;
	  }
	  console.log('left',this.x)
    } else if (direction === 'right') {
      this.x += 30;
	  if(this.x > SCREEN_WIDTH - this.width) {
		this.x = SCREEN_WIDTH - this.width;
	  }
    }
  }

  /**
   * 玩家响应手指的触摸事件
   * 改变战机的位置
   */
  initEvent() {
    wx.onTouchStart((e) => {
      const { clientX: x, clientY: y } = e.touches[0];

      if (GameGlobal.databus.isGameOver) {
        return;
      }
      if (this.checkIsFingerOnAir(x, y)) {
        this.touched = true;
        this.setAirPosAcrossFingerPosZ(x, y);
      }
    });

    wx.onTouchMove((e) => {
      const { clientX: x, clientY: y } = e.touches[0];

      if (GameGlobal.databus.isGameOver) {
        return;
      }
      if (this.touched) {
		
        this.setAirPosAcrossFingerPosZ(x, 0);
      }
    });

    wx.onTouchEnd((e) => {
      this.touched = false;
    });

    wx.onTouchCancel((e) => {
      this.touched = false;
    });
  }

  /**
   * 玩家射击操作
   * 射击时机由外部决定
   */
  shoot(x) {
    const bullet = GameGlobal.databus.pool.getItemByClass('bullet', Bullet);
    bullet.init(x - bullet.width / 2, this.y - 10, 10);
    GameGlobal.databus.bullets.push(bullet);
   
  }

  updateLevel() {
    this.level++;
	if (this.level >= 5) {
		this.level = 5;
	}
  }

  /**
   * 根据等级计算子弹位置
   * @param {Number} level - 玩家等级
   * @returns {Array} 子弹位置数组
   */
  calculateBulletPositions(level) {
    const positions = [];
    const maxBullets = 5;
    const bulletCount = Math.min(level, maxBullets);
    
    if (bulletCount === 1) {
      // 单发子弹，从飞机中心发射
      positions.push(this.x + this.width / 2);
    } else {
      // 多发子弹，均匀分布在飞机宽度范围内
      const spacing = this.width / (bulletCount - 1);
      for (let i = 0; i < bulletCount; i++) {
        positions.push(this.x + i * spacing);
      }
    }
    
    return positions;
  }

  update() {
    if (GameGlobal.databus.isGameOver) {
      return;
    }

    // 每20帧让玩家射击一次
    if (GameGlobal.databus.frame % PLAYER_SHOOT_INTERVAL === 0) {
		audioManager.play('bullet'); // 播放射击音效
		
		// 根据等级计算子弹位置并发射
		const bulletPositions = this.calculateBulletPositions(this.level);
		bulletPositions.forEach(position => {
			this.shoot(position);
		});
    }
	if (GameGlobal.databus.frame % this.levelDown === 0) {
		this.level--;
		if (this.level < 1) {
			this.level = 1;
		}
	}
  }

  destroy() {
    this.isActive = false;
    this.playAnimation();
    audioManager.play('boom'); // 播放爆炸音效
    wx.vibrateShort({
      type: 'medium'
    }); // 震动
  }
}
