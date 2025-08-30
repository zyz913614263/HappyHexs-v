// 导入依赖模块
import { gameConfig } from "./config.js";

// 游戏常量
const FRIEND_CONSTANTS = {
    ZOOM: 30,
    IMG_SIZE: {
        width: 720 / 30 * window.devicePixelRatio,
        height: 720 / 30 * window.devicePixelRatio
    },
    AMENDMENT: 10 * window.devicePixelRatio,
    SCALE: 0.01,
    COLLISION_DISTANCE: 30 * window.devicePixelRatio,
    BOUNDARY_THRESHOLD: 200,
    HEAD_SIZE: 20 * window.devicePixelRatio,
    TEXT_OFFSET_Y: -20 * window.devicePixelRatio,
    FONT_SIZE: 10 * window.devicePixelRatio,
    CIRCLE_RADIUS: 4 * window.devicePixelRatio,
    CIRCLE_COLOR: '#7fb2b1'
};

// 计算图片对角线长度
const IMG_LONG_DISTANCE = Math.sqrt(
    FRIEND_CONSTANTS.IMG_SIZE.width * FRIEND_CONSTANTS.IMG_SIZE.width +
    FRIEND_CONSTANTS.IMG_SIZE.height * FRIEND_CONSTANTS.IMG_SIZE.height
);

/**
 * 好友头像类
 * 负责渲染微信好友的头像和排名信息
 * 
 * 轨道系统说明：
 * - side 1: 内侧轨道
 * - side 2: 外侧轨道
 * - angle: 在星球上的角度位置
 */
class Friend extends Laya.Sprite {
    /**
     * 构造函数
     * @param {Object} block - 星球块对象
     * @param {Object} friendInfo - 好友信息
     * @param {number} side - 轨道侧（默认2:外侧）
     */
    constructor(block, friendInfo, side = 2) {
        super();

        this.block = block;
        this.friendInfo = friendInfo;
        this.side = side;

        // 初始化精灵
        this.initSprites();
    }

    /**
     * 初始化好友头像
     * @param {Object} block - 星球块对象
     * @param {Object} friendInfo - 好友信息
     * @param {number} side - 轨道侧（默认2:外侧）
     */
    init(block, friendInfo, side = 2) {
        this.side = side;
        this.scaleDelta = 1;
        this.friendInfo = friendInfo;

        // 计算位置
        this.calculatePosition(block, friendInfo);

        // 边界角度调整
        this.adjustBoundaryAngle();

        // 设置中心位置
        this.setCenterPosition(side, friendInfo.angle);

        // 渲染UI
        this.renderUI();

        // 重置状态
        this.isDestroyed = false;
    }

    /**
     * 计算位置
     * @param {Object} block - 星球块对象
     * @param {Object} friendInfo - 好友信息
     */
    calculatePosition(block, friendInfo) {
        // 计算三角函数值
        let sin = Math.sin(Math.PI * friendInfo.angle / 180);
        let cos = Math.cos(Math.PI * friendInfo.angle / 180);

        // 特殊角度处理
        if (friendInfo.angle === 180) {
            sin = 0;
        }

        const distance = IMG_LONG_DISTANCE / 2;
        const border = 0;
        const radius = block.circle.radius;

        // 计算偏移距离
        const disX = sin < 0 ? -distance : distance;
        const disY = cos >= 0 ? distance : -distance;

        // 计算实际位置
        this.x = border + block.point.currX + sin * (radius - disX);
        this.y = border + block.point.currY + cos * (radius - disY);

        // 计算中心位置
        this.centerX = border + block.point.currX + sin * radius;
        this.centerY = border + block.point.currY + cos * radius;
    }

    /**
     * 调整边界角度
     */
    adjustBoundaryAngle() {
        if (this.x < FRIEND_CONSTANTS.BOUNDARY_THRESHOLD) {
            this.friendInfo.angle = 90;
        }
        if (this.x > gameConfig.GameWidth - FRIEND_CONSTANTS.BOUNDARY_THRESHOLD) {
            this.friendInfo.angle = 270;
        }
    }

    /**
     * 初始化精灵
     */
    initSprites() {
        // 头像容器
        this.headContainer = new Laya.Sprite();
        this.addChild(this.headContainer);

        // 好友昵称文本
        this.nicknameText = new Laya.Text();
        this.nicknameText.overflow = Laya.Text.HIDDEN;
        this.nicknameText.color = "#FFFFFF";
        this.nicknameText.fontSize = FRIEND_CONSTANTS.FONT_SIZE;
        this.nicknameText.y = FRIEND_CONSTANTS.TEXT_OFFSET_Y;

        this.headContainer.addChild(this.nicknameText);
    }

    /**
     * 设置中心位置
     * @param {number} side - 轨道侧
     * @param {number} angle - 角度
     */
    setCenterPosition(side, angle) {
        if (side === 1) {
            // 内侧轨道
            if (angle <= 90) {
                this.setRightDown();
            } else if (angle <= 180) {
                this.setRightUp();
            } else if (angle <= 270) {
                this.setLeftDown();
            } else {
                this.setLeftUp();
            }
        } else {
            // 外侧轨道
            if (angle <= 90) {
                this.setLeftDown();
            } else if (angle <= 180) {
                this.setLeftUp();
            } else if (angle <= 270) {
                this.setRightDown();
            } else {
                this.setRightUp();
            }
        }
    }

    /**
     * 设置左下位置
     */
    setLeftDown() {
        this.x += FRIEND_CONSTANTS.IMG_SIZE.width / 2 + FRIEND_CONSTANTS.AMENDMENT;
        this.y += FRIEND_CONSTANTS.IMG_SIZE.height / 2 - FRIEND_CONSTANTS.AMENDMENT;
    }

    /**
     * 设置左上位置
     */
    setLeftUp() {
        this.x += FRIEND_CONSTANTS.IMG_SIZE.width / 2 + FRIEND_CONSTANTS.AMENDMENT;
        this.y -= FRIEND_CONSTANTS.IMG_SIZE.height / 2 - FRIEND_CONSTANTS.AMENDMENT;
    }

    /**
     * 设置右上位置
     */
    setRightUp() {
        this.x -= FRIEND_CONSTANTS.IMG_SIZE.width / 2 - FRIEND_CONSTANTS.AMENDMENT;
        this.y += FRIEND_CONSTANTS.IMG_SIZE.height / 2 + FRIEND_CONSTANTS.AMENDMENT;
    }

    /**
     * 设置右下位置
     */
    setRightDown() {
        this.x -= FRIEND_CONSTANTS.IMG_SIZE.width / 2 + FRIEND_CONSTANTS.AMENDMENT;
        this.y -= FRIEND_CONSTANTS.IMG_SIZE.height / 2 + FRIEND_CONSTANTS.AMENDMENT;
    }

    /**
     * 渲染UI
     */
    renderUI() {
        // 清除之前的图形
        this.graphics.clear();

        // 绘制背景圆圈
        this.graphics.drawCircle(
            0, 0,
            FRIEND_CONSTANTS.CIRCLE_RADIUS,
            FRIEND_CONSTANTS.CIRCLE_COLOR
        );

        // 清除头像容器
        this.headContainer.graphics.clear();

        // 加载好友头像
        const avatarUrl = (this.friendInfo.src || "").replace(/\/0$/, '/64') || 'res/default_head.png';
        this.headContainer.graphics.loadImage(
            avatarUrl,
            3, 23,
            FRIEND_CONSTANTS.IMG_SIZE.width - 6,
            FRIEND_CONSTANTS.IMG_SIZE.height - 6
        );

        // 添加头像边框
        const borderImage = new Laya.Image();
        borderImage.skin = `${gameConfig.LOCAL_URL}/result/kuang.png`;
        borderImage.x = 0;
        borderImage.y = 20;
        borderImage.width = FRIEND_CONSTANTS.IMG_SIZE.width;
        borderImage.height = FRIEND_CONSTANTS.IMG_SIZE.height;
        this.headContainer.addChild(borderImage);

        // 设置昵称文本
        this.nicknameText.text = this.friendInfo.nick || '';

        // 设置头像容器位置
        this.headContainer.x = this.x - this.centerX;
        this.headContainer.y = this.y - this.centerY;

        // 设置整体位置
        this.pos(this.centerX, this.centerY);
    }

    /**
     * 获取位置
     * @returns {Object} 位置对象 {x, y}
     */
    getPosition() {
        return {
            x: this.centerX,
            y: this.centerY
        };
    }

    /**
     * 获取尺寸
     * @returns {Object} 尺寸对象 {width, height}
     */
    getSize() {
        return FRIEND_CONSTANTS.IMG_SIZE;
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
        const distance = Math.sqrt(
            Math.pow(this.centerX - x, 2) + Math.pow(this.centerY - y, 2)
        );

        if (distance < FRIEND_CONSTANTS.COLLISION_DISTANCE) {
            this.startDestroy();
            return true;
        }

        return false;
    }

    /**
     * 开始销毁
     */
    startDestroy() {
        if (!window.isDIDUAN) {
            // 非低端设备：播放销毁动画
            Laya.timer.frameLoop(1, this, this.animate);
        } else {
            // 低端设备：直接销毁
            this.destroy();
        }
    }

    /**
     * 销毁动画
     */
    animate() {
        // 随机缩放减少
        this.scaleDelta -= FRIEND_CONSTANTS.SCALE * ~~(Math.random() * 10);

        if (this.scaleDelta <= 0) {
            // 动画完成，停止定时器并销毁
            Laya.timer.clear(this, this.animate);
            this.destroy();
            return;
        }

        // 应用缩放
        this.scale(this.scaleDelta, this.scaleDelta);
    }

    /**
     * 销毁好友头像
     */
    destroy() {
        this.isDestroyed = true;
        Laya.timer.clear(this, this.animate);
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
        this.friendInfo.angle = angle;
    }

    /**
     * 检查是否已被收集
     * @returns {boolean} 是否已被收集
     */
    isCollected() {
        return this.isDestroyed;
    }
}

// 导出Friend类
export default Friend;