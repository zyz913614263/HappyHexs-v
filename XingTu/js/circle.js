/**
 * 圆心和半径
 * Circle itself does not maintain position information
 * It only needs to maintain its own size information
 * radiusBuffer - radius buffer, inner ring and outer ring radius sizes
 * 
 * 圆心和半径
 * Circle类本身不维护位置信息
 * 仅仅需要维护自身的大小信息
 * radiusBuffer - 半径缓冲，内环与外环半径大小
 */

// 私有属性符号定义
const PRIVATE_PROPS = {
    radius: Symbol('radius'),           // 半径的私有符号
    point: Symbol('point'),             // 圆心点的私有符号
    radiusBuffer: Symbol('radiusBuffer') // 半径缓冲的私有符号
};

/**
 * 圆形类
 * 表示一个圆形，包含圆心点、半径和缓冲半径
 */
class Circle {
    /**
     * 构造函数
     * @param {Point} point - 圆心点
     * @param {number} radius - 半径
     * @param {number} radiusBuffer - 半径缓冲，默认值10
     */
    constructor(point, radius, radiusBuffer = 10) {
        // 使用Symbol设置私有属性
        this[PRIVATE_PROPS.point] = point;
        this[PRIVATE_PROPS.radius] = radius;
        this[PRIVATE_PROPS.radiusBuffer] = radiusBuffer;

        // 公共属性
        this.border = 2;                  // 边框宽度
        this.color = '#606e93';           // 边框颜色
    }

    /**
     * 获取半径
     * @returns {number} 半径值
     */
    get radius() {
        return this[PRIVATE_PROPS.radius];
    }

    /**
     * 获取半径缓冲
     * @returns {number} 半径缓冲值
     */
    get radiusBuffer() {
        return this[PRIVATE_PROPS.radiusBuffer];
    }

    /**
     * 获取圆心点
     * @returns {Point} 圆心点对象
     */
    get point() {
        return this[PRIVATE_PROPS.point];
    }

    /**
     * 设置半径
     * @param {number} radius - 新的半径值
     */
    set radius(radius) {
        this[PRIVATE_PROPS.radius] = radius;
    }

    /**
     * 设置半径缓冲
     * @param {number} radiusBuffer - 新的半径缓冲值
     */
    set radiusBuffer(radiusBuffer) {
        this[PRIVATE_PROPS.radiusBuffer] = radiusBuffer;
    }

    /**
     * 设置圆心点
     * @param {Point} point - 新的圆心点对象
     */
    set point(point) {
        this[PRIVATE_PROPS.point] = point;
    }

    /**
     * 获取圆的面积
     * @returns {number} 圆的面积
     */
    getArea() {
        return Math.PI * this.radius * this.radius;
    }

    /**
     * 获取圆的周长
     * @returns {number} 圆的周长
     */
    getCircumference() {
        return 2 * Math.PI * this.radius;
    }

    /**
     * 检查点是否在圆内
     * @param {Point} testPoint - 要测试的点
     * @returns {boolean} 点是否在圆内
     */
    containsPoint(testPoint) {
        if (!testPoint || !this.point) {
            return false;
        }

        const dx = testPoint.currX - this.point.currX;
        const dy = testPoint.currY - this.point.currY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        return distance <= this.radius;
    }

    /**
     * 检查点是否在缓冲区域内
     * @param {Point} testPoint - 要测试的点
     * @returns {boolean} 点是否在缓冲区域内
     */
    containsPointInBuffer(testPoint) {
        if (!testPoint || !this.point) {
            return false;
        }

        const dx = testPoint.currX - this.point.currX;
        const dy = testPoint.currY - this.point.currY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        return distance <= (this.radius + this.radiusBuffer);
    }

    /**
     * 克隆圆形
     * @returns {Circle} 新的圆形对象
     */
    clone() {
        return new Circle(this.point, this.radius, this.radiusBuffer);
    }

    /**
     * 获取圆的字符串表示
     * @returns {string} 圆的字符串表示
     */
    toString() {
        return `Circle(center: ${this.point}, radius: ${this.radius}, buffer: ${this.radiusBuffer})`;
    }
}

// 导出类
export default Circle;