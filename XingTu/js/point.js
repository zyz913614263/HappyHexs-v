// 私有属性符号定义
const PRIVATE_PROPS = {
    currX: Symbol('currX'),    // 当前X坐标的私有符号
    currY: Symbol('currY'),    // 当前Y坐标的私有符号
    color: Symbol('color')     // 颜色的私有符号
};

/**
 * 点类
 * 基类：俄罗斯方块里面最基础的一个方块
 * Base class: The most basic block in Tetris
 */
class Point {
    /**
     * 构造函数
     * @param {number} x - X坐标，默认值0
     * @param {number} y - Y坐标，默认值0
     * @param {*} color - 颜色值，默认值0
     */
    constructor(x = 0, y = 0, color = 0) {
        // 使用Symbol设置私有属性
        this[PRIVATE_PROPS.currX] = x;
        this[PRIVATE_PROPS.currY] = y;
        this[PRIVATE_PROPS.color] = color;
    }

    /**
     * 获取当前X坐标
     * @returns {number} X坐标值
     */
    get currX() {
        return this[PRIVATE_PROPS.currX];
    }

    /**
     * 获取当前Y坐标
     * @returns {number} Y坐标值
     */
    get currY() {
        return this[PRIVATE_PROPS.currY];
    }

    /**
     * 获取颜色值
     * @returns {*} 颜色值
     */
    get color() {
        return this[PRIVATE_PROPS.color];
    }

    /**
     * 设置X坐标
     * @param {number} x - 新的X坐标值
     */
    set currX(x) {
        this[PRIVATE_PROPS.currX] = x;
    }

    /**
     * 设置Y坐标
     * @param {number} y - 新的Y坐标值
     */
    set currY(y) {
        this[PRIVATE_PROPS.currY] = y;
    }

    /**
     * 设置颜色值
     * @param {*} color - 新的颜色值
     */
    set color(color) {
        this[PRIVATE_PROPS.color] = color;
    }

    /**
     * 获取点的字符串表示
     * @returns {string} 点的字符串表示
     */
    toString() {
        return `Point(${this.currX}, ${this.currY}, ${this.color})`;
    }

    /**
     * 检查两个点是否相等
     * @param {Point} other - 另一个点对象
     * @returns {boolean} 是否相等
     */
    equals(other) {
        if (!(other instanceof Point)) {
            return false;
        }
        return this.currX === other.currX &&
            this.currY === other.currY &&
            this.color === other.color;
    }

    /**
     * 计算到另一个点的距离
     * @param {Point} other - 另一个点对象
     * @returns {number} 两点间的距离
     */
    distanceTo(other) {
        if (!(other instanceof Point)) {
            throw new Error('参数必须是Point类型');
        }

        const dx = this.currX - other.currX;
        const dy = this.currY - other.currY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * 克隆当前点
     * @returns {Point} 新的点对象
     */
    clone() {
        return new Point(this.currX, this.currY, this.color);
    }

    /**
     * 移动点到新位置
     * @param {number} dx - X方向偏移量
     * @param {number} dy - Y方向偏移量
     * @returns {Point} 当前点对象（支持链式调用）
     */
    move(dx, dy) {
        this[PRIVATE_PROPS.currX] += dx;
        this[PRIVATE_PROPS.currY] += dy;
        return this;
    }
}

// 导出类
export default Point;