import Sprite from '../base/sprite';
import { SCREEN_WIDTH, SCREEN_HEIGHT } from '../render';

const BACKGROUND_SPEED = 2;

/**
 * 游戏背景类
 * 提供 update 和 render 函数实现无限滚动的背景功能
 */
export default class CommonBackGround extends Sprite {
  constructor(src,width,height) {
    super(src, width, height);
    this.top = 0;
  }

  update() {

  }

  /**
   * 背景图重绘函数
   * 绘制两张图片，两张图片大小和屏幕一致
   * 第一张漏出高度为 top 部分，其余的隐藏在屏幕上面
   * 第二张补全除了 top 高度之外的部分，其余的隐藏在屏幕下面
   */
  render(ctx) {
    // 绘制第一张背景
    ctx.drawImage(
      this.img,
      0,
      0,
      this.width,
      this.height,
      0,
      -SCREEN_HEIGHT + this.top,
      SCREEN_WIDTH,
      SCREEN_HEIGHT
    );

    // 绘制第二张背景
    ctx.drawImage(
      this.img,
      0,
      0,
      this.width,
      this.height,
      0,
      this.top,
      SCREEN_WIDTH,
      SCREEN_HEIGHT
    );
  }
}
