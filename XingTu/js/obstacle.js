// 导入依赖模块

// 游戏常量
const OBSTACLE_CONSTANTS = {
    ZOOM: 4,
    IMG_SIZE: {
        width: 42 / 4 * window.devicePixelRatio,
        height: 55 / 4 * window.devicePixelRatio
    },
    AMENDMENT: 5 * window.devicePixelRatio,
    COLLISION_DISTANCE: 15 * window.devicePixelRatio,
    RADIUS_OFFSET: 10 * window.devicePixelRatio
};

// 计算图片对角线长度
const IMG_LONG_DISTANCE = Math.sqrt(
    OBSTACLE_CONSTANTS.IMG_SIZE.width * OBSTACLE_CONSTANTS.IMG_SIZE.width +
    OBSTACLE_CONSTANTS.IMG_SIZE.height * OBSTACLE_CONSTANTS.IMG_SIZE.height
);

/**
 * 障碍点类
 * 负责渲染和管理游戏中的障碍物
 * 
 * 运动模式说明：
 * - side 1: 内侧轨道
 * - side 2: 外侧轨道
 * - direction 1: 公转（绕星球转）
 * - direction 2: 自转（自身旋转）
 */
class ObstaclePoint extends Laya.Sprite {
    /**
     * 构造函数
     * @param {Object} block - 星球块对象
     * @param {number} side - 轨道侧（1:内侧, 2:外侧）
     * @param {number} angle - 初始角度
     * @param {boolean} can_move - 是否可以移动
     */
    constructor(block, side, angle, can_move) {
        super();

        // 初始化属性
        this.block = block;
        this.side = side;
        this.angle = angle;
        this.can_move = can_move;

        // 渲染UI
        this.renderUI();
    }

    /**
     * 初始化障碍点
     * @param {Object} block - 星球块对象
     * @param {number} side - 轨道侧
     * @param {number} angle - 角度
     * @param {boolean} can_move - 是否可移动
     */
    init(block, side, angle, can_move) {
        this.speed = 0.5;
        this.side = side;
        this.direction = 1; // 默认公转

        // 获取星球中心点
        this.pointCurrX = block.point.currX;
        this.pointCurrY = block.point.currY;

        // 设置旋转和半径
        this._rotation = angle;
        this.radius = block.circle.radius;

        // 根据轨道侧调整半径
        if (side === 1) {
            // 内侧轨道：半径减小
            this.radius -= OBSTACLE_CONSTANTS.RADIUS_OFFSET;
        } else {
            // 外侧轨道：半径增大
            this.radius += OBSTACLE_CONSTANTS.RADIUS_OFFSET;
        }

        // 设置锚点为中心
        this.pivotX = OBSTACLE_CONSTANTS.IMG_SIZE.width / 2;
        this.pivotY = OBSTACLE_CONSTANTS.IMG_SIZE.height / 2;

        // 初始化状态
        this.isDestroyed = false;

        // 计算初始位置
        this.initPosition(angle);

        // 如果可以移动，启动动画
        if (can_move) {
            this.start();
        }
    }

    /**
     * 根据角度计算位置
     * @param {number} angle - 角度（度）
     */
    initPosition(angle) {
        // 将角度转换为弧度
        const radian = (Math.PI * angle) / 180;
        const sin = Math.sin(radian);
        const cos = Math.cos(radian);

        // 计算在圆形轨道上的位置
        this.x = this.pointCurrX + sin * this.radius;
        this.y = this.pointCurrY + cos * this.radius;
    }

    /**
     * 动画更新
     */
    animation() {
        if (this.direction === 2) {
            // 自转：自身逆时针旋转
            this._rotation -= this.speed;
        } else {
            // 公转：绕星球逆时针旋转
            this._rotation += this.speed;
        }

        // 更新位置
        this.initPosition(this._rotation);
    }

    /**
     * 启动动画
     */
    start() {
        Laya.timer.frameLoop(1, this, this.animation);
    }

    /**
     * 停止动画
     */
    stop() {
        Laya.timer.clear(this, this.animation);
    }

    /**
     * 渲染UI
     */
    renderUI() {
        // 加载云朵背景
        this.graphics.loadImage(
            'res/qiu/yun.png',
            0, 0,
            OBSTACLE_CONSTANTS.IMG_SIZE.width,
            OBSTACLE_CONSTANTS.IMG_SIZE.height
        );

        // 渲染陨石
        this.renderMeteor();
    }

    /**
     * 渲染陨石
     */
    renderMeteor() {
        const meteorSize = {
            width: 239 / OBSTACLE_CONSTANTS.ZOOM / 2,
            height: 169 / OBSTACLE_CONSTANTS.ZOOM / 2
        };

        this.graphics.loadImage(
            'res/0e10aaa60c459c91d5022bcdf2e5b822.png',
            -OBSTACLE_CONSTANTS.IMG_SIZE.width / 2,
            -OBSTACLE_CONSTANTS.IMG_SIZE.height / 2,
            meteorSize.width,
            meteorSize.height
        );
    }

    /**
     * 获取当前位置
     * @returns {Object} 位置对象 {x, y}
     */
    getPosition() {
        return {
            x: this.x,
            y: this.y
        };
    }

    /**
     * 获取图片尺寸
     * @returns {Object} 尺寸对象 {width, height}
     */
    getSize() {
        return OBSTACLE_CONSTANTS.IMG_SIZE;
    }

    /**
     * 获取图片对角线长度
     * @returns {number} 对角线长度
     */
    getIMGLongDistance() {
        return IMG_LONG_DISTANCE;
    }

    /**
     * 碰撞检测
     * @param {number} x - 检测点X坐标
     * @param {number} y - 检测点Y坐标
     * @returns {boolean} 是否发生碰撞
     */
    checkCollision(x, y) {
        // 计算两点间距离
        const distance = Math.sqrt(
            Math.pow(this.x - x, 2) + Math.pow(this.y - y, 2)
        );

        // 如果距离小于碰撞距离，触发碰撞
        if (distance < OBSTACLE_CONSTANTS.COLLISION_DISTANCE) {
            this.destroy();
            this.stop();
            return true;
        }

        return false;
    }

    /**
     * 销毁障碍点
     */
    destroy() {
        this.isDestroyed = true;
        this.stop();
        super.destroy();
    }

    /**
     * 设置运动方向
     * @param {number} direction - 运动方向 (1:公转, 2:自转)
     */
    setDirection(direction) {
        this.direction = direction;
    }

    /**
     * 设置运动速度
     * @param {number} speed - 运动速度
     */
    setSpeed(speed) {
        this.speed = speed;
    }
}

// 导出ObstaclePoint类
export default ObstaclePoint;