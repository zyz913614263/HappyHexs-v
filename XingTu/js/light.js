// 导入依赖模块
import { gameConfig } from "./config.js";
import Rewards from './rewards.js';

// 游戏常量
const LIGHT_CONSTANTS = {
    Z_ORDER: 10000,
    ANIMATION_FRAME_RATE: 2,
    TWEEN_DURATION: 400,
    LIGHT_IMAGE_COUNT: 5,
    LIGHT_IMAGE_OFFSET_X: -120 * window.devicePixelRatio,
    LIGHT_IMAGE_OFFSET_Y: -30 * window.devicePixelRatio,
    LIGHT_IMAGE_SCALE: 2,
    TEXT_SCALE: window.devicePixelRatio / 1.5
};

/**
 * 光效类
 * 负责游戏中的光效动画和奖励界面过渡
 */
class Light extends Laya.Sprite {
    /**
     * 构造函数
     */
    constructor() {
        super();

        this.init();
        this.zOrder = LIGHT_CONSTANTS.Z_ORDER;
    }

    /**
     * 初始化光效
     */
    init() {
        this._turnedSelfIndex = 1;
        this.callback = null;

        // 创建背景精灵
        this.createBackground();

        // 创建光效精灵
        this.createLightSprite();

        // 创建文本图片
        this.createTextImage();

        // 启动光效动画
        this.tweenAnimation();
    }

    /**
     * 创建背景精灵
     */
    createBackground() {
        this.bgSp = new Laya.Sprite();
        this.bgSp.graphics.drawRect(
            0, 0,
            gameConfig.GameWidth,
            gameConfig.GameHeight,
            "#fff"
        );
        this.bgSp.alpha = 0;
        this.addChild(this.bgSp);
    }

    /**
     * 创建光效精灵
     */
    createLightSprite() {
        this.sp = new Laya.Sprite();
        this.addChild(this.sp);
    }

    /**
     * 创建文本图片
     */
    createTextImage() {
        this.txtImg = new Laya.Image();
        this.txtImg.skin = 'res/light/text.png';
        this.txtImg.width *= LIGHT_CONSTANTS.TEXT_SCALE;
        this.txtImg.height *= LIGHT_CONSTANTS.TEXT_SCALE;

        // 居中定位
        this.txtImg.pos(
            (gameConfig.GameWidth - this.txtImg.width) / 2,
            (gameConfig.GameHeight - this.txtImg.height) / 2
        );

        this.addChild(this.txtImg);
    }

    /**
     * 重置光效
     */
    reset() {
        this.visible = true;
        this.alpha = 1;
        this.sp.graphics.clear();
        this.start();
        this.tweenAnimation();
    }

    /**
     * 光效动画
     */
    tweenAnimation() {
        // 背景淡入
        Laya.Tween.to(this.bgSp, {
            alpha: 1
        }, LIGHT_CONSTANTS.TWEEN_DURATION, Laya.Ease.linearNone,
            Laya.Handler.create(this, () => {
                // 创建奖励界面
                this.createRewardsInterface();
            }));
    }

    /**
     * 创建奖励界面
     */
    createRewardsInterface() {
        window._Rewards = new Rewards();
        window.stage.addChild(window._Rewards);

        // 光效淡出
        Laya.Tween.to(this, {
            alpha: 0
        }, LIGHT_CONSTANTS.TWEEN_DURATION, Laya.Ease.linearNone,
            Laya.Handler.create(this, () => {
                // 触发奖励开始事件
                window._Event.emit('start_rewards');
                this.visible = false;
            }));
    }

    /**
     * 创建光效精灵
     * @param {Function} callback - 回调函数
     */
    createSp(callback) {
        this.sp.pos(
            (gameConfig.GameWidth - this.txtImg.width) / 2,
            (gameConfig.GameHeight - this.txtImg.height) / 2
        );
        this.callback = callback;
        this.start();
    }

    /**
     * 停止自转动画
     */
    stopTurnedSelf() {
        Laya.timer.clear(this, this.turnedSelf);
    }

    /**
     * 启动光效
     */
    start() {
        this._turnedSelfIndex = 1;
        Laya.timer.frameLoop(
            LIGHT_CONSTANTS.ANIMATION_FRAME_RATE,
            this,
            this.turnedSelf
        );
    }

    /**
     * 自转动画
     */
    turnedSelf() {
        this.sp.graphics.clear();

        // 加载光效图片
        this.sp.graphics.loadImage(
            `res/light/${this._turnedSelfIndex}.png`,
            LIGHT_CONSTANTS.LIGHT_IMAGE_OFFSET_X,
            LIGHT_CONSTANTS.LIGHT_IMAGE_OFFSET_Y,
            this.txtImg.width * LIGHT_CONSTANTS.LIGHT_IMAGE_SCALE,
            this.txtImg.height * LIGHT_CONSTANTS.LIGHT_IMAGE_SCALE
        );

        // 检查动画是否完成
        if (this._turnedSelfIndex === LIGHT_CONSTANTS.LIGHT_IMAGE_COUNT) {
            this.stopTurnedSelf();

            // 执行回调函数
            if (this.callback) {
                this.callback();
            }
        }

        this._turnedSelfIndex++;
    }

    /**
     * 销毁光效
     */
    destroy() {
        this.stopTurnedSelf();
        super.destroy();
    }

    /**
     * 设置回调函数
     * @param {Function} callback - 回调函数
     */
    setCallback(callback) {
        this.callback = callback;
    }

    /**
     * 获取当前动画索引
     * @returns {number} 当前动画索引
     */
    getCurrentIndex() {
        return this._turnedSelfIndex;
    }

    /**
     * 检查动画是否完成
     * @returns {boolean} 是否完成
     */
    isAnimationComplete() {
        return this._turnedSelfIndex > LIGHT_CONSTANTS.LIGHT_IMAGE_COUNT;
    }

    /**
     * 暂停动画
     */
    pause() {
        this.stopTurnedSelf();
    }

    /**
     * 恢复动画
     */
    resume() {
        if (!this.isAnimationComplete()) {
            this.start();
        }
    }
}

// 导出Light类
export default Light;