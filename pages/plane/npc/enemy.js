import Animation from '../base/animation';
import { SCREEN_WIDTH, SCREEN_HEIGHT } from '../render';
import { audioManager } from '../../../entry/music.js'

const ENEMY_IMG_SRC = 'res/images/enemy.png';
const ENEMY_WIDTH = 60;
const ENEMY_HEIGHT = 60;
const EXPLO_IMG_PREFIX = 'res/images/explosion';

export default class Enemy extends Animation {
  speed = Math.random() * 6 + 3; // 飞行速度

  constructor() {
    super(ENEMY_IMG_SRC, ENEMY_WIDTH, ENEMY_HEIGHT);
  }

  init() {
    this.x = this.getRandomX();
    this.y = -this.height;

    this.isActive = true;
    this.visible = true;
    this.life = Math.floor(Math.random() * 10) + 1;
    this.maxLife = this.life; // 记录最大生命值
    
    // 根据生命值设置大小
    this.setEnemySize();
    
    // 设置爆炸动画
    this.initExplosionAnimation();
  }

  // 根据生命值设置敌机大小
  setEnemySize() {
    const scale = 1 + (this.life * 0.1); // 每点生命值增加10%大小
    this.width = ENEMY_WIDTH * scale;
    this.height = ENEMY_HEIGHT * scale;
  }

  // 绘制血条
  drawHealthBar(ctx) {
    const healthBarWidth = this.width * 0.8; // 血条宽度稍小于敌机
    const healthBarHeight = 6; // 增加血条高度
    const padding = 5; // 与敌机的间距
    
    // 计算血条位置，确保在敌机正上方居中
    const healthBarX = this.x+ (this.width - healthBarWidth) / 2;
    const healthBarY = this.y- healthBarHeight - padding;
    
    // 绘制血条边框
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.strokeRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);
    
    // 绘制血条背景
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);
    
    // 绘制当前血量
    ctx.fillStyle = '#00ff00';
    const currentHealthWidth = (this.life / this.maxLife) * healthBarWidth;
    ctx.fillRect(healthBarX, healthBarY, currentHealthWidth, healthBarHeight);
  }

  // 重写绘制方法
  render(ctx) {
    if (!this.visible) return;

    ctx.save();
    
    if (this.isPlaying) {
      // 播放爆炸动画
      this.drawAnimation(ctx);
    } else {
      // 先绘制血条，确保在敌机下层
      this.drawHealthBar(ctx);
      
      // 绘制敌机
      /*ctx.drawImage(
        this.img,
        0, 0, ENEMY_WIDTH, ENEMY_HEIGHT,
        this.x, this.y, this.width, this.height
      );*/
	  ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
    }
    
    ctx.restore();
  }

  // 生成随机 X 坐标
  getRandomX() {
    return Math.floor(Math.random() * (SCREEN_WIDTH - ENEMY_WIDTH));
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

  // 每一帧更新敌人位置
  update() {
    if (GameGlobal.databus.isGameOver) {
      return;
    }

    this.y += this.speed;

    // 对象回收
    if (this.y > SCREEN_HEIGHT + this.height) {
      this.remove();
    }
  }

  destroy() {
    this.isActive = false;
    // 播放销毁动画后移除
    this.playAnimation();
    audioManager.play('boom'); // 播放爆炸音效
    wx.vibrateShort({
      type: 'light'
    }); // 轻微震动
    this.on('stopAnimation', () => this.remove.bind(this));
  }

  remove() {
    this.isActive = false;
    this.visible = false;
    GameGlobal.databus.removeEnemy(this);
  }

  // 受到伤害
  takeDamage(damage = 1) {
    this.life -= damage;
    if (this.life <= 0) {
      this.destroy();
    }
  }
}
