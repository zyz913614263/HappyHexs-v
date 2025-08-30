import { gameConfig } from './config.js';
// 游戏常量
const ENERGY_POINT_CONSTANTS = {
    ZOOM: 2,
    IMG_SIZE: {
        width: 94 / 2 * window.devicePixelRatio,
        height: 94 / 2 * window.devicePixelRatio
    },
    AMENDMENT: 3 * window.devicePixelRatio,
    RADIUS_OFFSET: 10 * window.devicePixelRatio,
    COLLISION_DISTANCE: 0, // 将在下面计算
    ANIMATION_FRAME_RATE: 4,
    ANIMATION_FRAME_COUNT: 6,
    BONE_IMG_SIZE: 41 * window.devicePixelRatio
};

// 计算碰撞检测距离
ENERGY_POINT_CONSTANTS.COLLISION_DISTANCE = Math.sqrt(
    ENERGY_POINT_CONSTANTS.IMG_SIZE.width * ENERGY_POINT_CONSTANTS.IMG_SIZE.width +
    ENERGY_POINT_CONSTANTS.IMG_SIZE.height * ENERGY_POINT_CONSTANTS.IMG_SIZE.height
) / 4;

/**
 * 能量点类
 * 负责渲染和管理游戏中的能量宝石
 * 
 * 轨道系统说明：
 * - side 1: 内侧轨道
 * - side 2: 外侧轨道
 * - 玩家可以收集这些宝石获得能量
 */
class EnergyPoint extends Laya.Sprite {
    /**
     * 构造函数
     */
    constructor() {
        super();

        // 初始化状态
        this.isDestroyed = false;
        this._index = 1;

        // 渲染UI
        this.renderUI();
    }

    /**
     * 初始化能量点
     * @param {Object} block - 星球块对象
     * @param {number} side - 轨道侧（1:内侧, 2:外侧）
     * @param {number} angle - 初始角度
     */
    init(block, side, angle) {
        this.side = side;
        this._rotation = angle;
        this.radius = block.circle.radius;

        // 获取星球中心点
        this.currX = block.point.currX;
        this.currY = block.point.currY;

        // 根据轨道侧调整半径
        if (side === 1) {
            // 内侧轨道：半径减小
            this.radius -= ENERGY_POINT_CONSTANTS.RADIUS_OFFSET;
        } else {
            // 外侧轨道：半径增大
            this.radius += ENERGY_POINT_CONSTANTS.RADIUS_OFFSET;
        }

        // 设置锚点为中心
        this.pivotX = ENERGY_POINT_CONSTANTS.IMG_SIZE.width / 2;
        this.pivotY = ENERGY_POINT_CONSTANTS.IMG_SIZE.height / 2;

        // 计算初始位置
        this.initPosition(angle);

        // 重置状态
        this.isDestroyed = false;
        this._index = 1;
    }

    /**
     * 根据角度计算位置
     * @param {number} angle - 角度（度）
     */
    initPosition(angle) {
        // 清除之前的图形
        this.graphics.clear();

        // 将角度转换为弧度
        const radian = (Math.PI * angle) / 180;
        const sin = Math.sin(radian);
        const cos = Math.cos(radian);

        // 计算在圆形轨道上的位置
        this.x = this.currX + sin * this.radius;
        this.y = this.currY + cos * this.radius;

        // 设置位置
        this.pos(this.x, this.y);

        // 加载宝石图片
        this.graphics.loadImage(
            `${gameConfig.LOCAL_URL}/little/baoshi_new.png`,
            0, 0,
            ENERGY_POINT_CONSTANTS.IMG_SIZE.width,
            ENERGY_POINT_CONSTANTS.IMG_SIZE.height
        );
    }

    /**
     * 渲染UI
     */
    renderUI() {
        // 创建动画精灵容器
        this.animationSprite = new Laya.Sprite();
        this.addChild(this.animationSprite);
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
        return ENERGY_POINT_CONSTANTS.IMG_SIZE;
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

        // 如果距离小于碰撞距离，触发收集
        if (distance < ENERGY_POINT_CONSTANTS.COLLISION_DISTANCE) {
            this.graphics.clear();
            this.start();
            return true;
        }

        return false;
    }

    /**
     * 开始收集动画
     */
    start() {
        // 检查是否为低端设备
        if (!window.isDIDUAN) {
            // 显示动画精灵
            this.animationSprite.visible = true;

            // 启动帧动画
            Laya.timer.frameLoop(
                ENERGY_POINT_CONSTANTS.ANIMATION_FRAME_RATE,
                this,
                this.animate
            );
        } else {
            // 低端设备：直接隐藏并销毁
            this.animationSprite.visible = false;
            this.visible = false;
            this.destroy();
        }
    }

    /**
     * 停止动画
     */
    stop() {
        Laya.timer.clear(this, this.animate);
    }

    /**
     * 动画更新
     */
    animate() {
        this._index++;

        // 清除之前的图形
        this.animationSprite.graphics.clear();

        // 加载当前帧的图片
        this.animationSprite.graphics.loadImage(
            `${gameConfig.LOCAL_URL}/baoshi_bone/${this._index}.png`,
            0, 0,
            ENERGY_POINT_CONSTANTS.BONE_IMG_SIZE,
            ENERGY_POINT_CONSTANTS.BONE_IMG_SIZE
        );

        // 检查动画是否完成
        if (this._index === ENERGY_POINT_CONSTANTS.ANIMATION_FRAME_COUNT) {
            this.stop();
            this._index = 1;
            this.animationSprite.visible = false;
            this.visible = false;

            // 动画完成后销毁
            this.destroy();
        }
    }

    /**
     * 销毁能量点
     */
    destroy() {
        this.isDestroyed = true;
        this.stop();
        super.destroy();
    }

    /**
     * 设置轨道侧
     * @param {number} side - 轨道侧 (1:内侧, 2:外侧)
     */
    setSide(side) {
        this.side = side;
    }

    /**
     * 设置角度
     * @param {number} angle - 角度
     */
    setAngle(angle) {
        this._rotation = angle;
        this.initPosition(angle);
    }

    /**
     * 检查是否已被收集
     * @returns {boolean} 是否已被收集
     */
    isCollected() {
        return this.isDestroyed;
    }
}

// 导出EnergyPoint类
export default EnergyPoint;