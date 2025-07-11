/**
 * 游戏基础的精灵类
 */
export default class Sprite {
  constructor(imgSrc = '', width = 0, height = 0, x = 0, y = 0) {
    this.img = wx.createImage()
    this.img.src = imgSrc

    this.width = width
    this.height = height

    this.x = x
    this.y = y

    this.visible = true
  }

  /**
   * 将精灵图绘制在canvas上
   */
  drawToCanvas(ctx) {
    if (!this.visible)
      return

    ctx.drawImage(
      this.img,
      this.x,
      this.y,
      this.width,
      this.height
    )
  }

  /**
   * 简单的碰撞检测定义：
   * 另一个精灵的中心点处于本精灵所在的矩形内即可
   * @param{Sprite} sp: Sptite的实例
   */
  isCollideWith(sp) {
    // 快速可见性检查
    if (!this.visible || !sp.visible) return false;

    // 获取两个精灵的边界
    const thisLeft = this.x;
    const thisRight = this.x + this.width;
    const thisTop = this.y;
    const thisBottom = this.y + this.height;

    const spLeft = sp.x;
    const spRight = sp.x + sp.width;
    const spTop = sp.y;
    const spBottom = sp.y + sp.height;

    // 完整的AABB碰撞检测
    return !(thisLeft > spRight ||
      thisRight < spLeft ||
      thisTop > spBottom ||
      thisBottom < spTop);
  }
}
