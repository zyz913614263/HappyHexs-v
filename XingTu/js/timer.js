import { gameConfig } from './config.js';
/**
 * 计时器类 - 显示游戏倒计时
 * Timer class - displays game countdown
 */

// 常量定义
const TIMER_CONSTANTS = {
    INITIAL_TIME: 15,           // 初始倒计时时间
    POSITION_X: 120,            // Y坐标位置
    NUMBER_WIDTH: 27,           // 数字图片宽度
    NUMBER_HEIGHT: 42,          // 数字图片高度
    SCALE_FACTOR: 1.5,         // 缩放因子
    SPACING: 20,                // 数字间距
    ICON_OFFSET: 160,           // 图标偏移量
    ICON_POSITION: 22           // 图标X位置
};

/**
 * 计时器类
 * 继承自Laya.Sprite，用于显示游戏倒计时
 */
class Timer extends Laya.Sprite {
    /**
     * 构造函数
     */
    constructor() {
        super();

        // 设置尺寸
        this.width = gameConfig.GameWidth;
        this.height = gameConfig.GameHeight;

        // 初始化UI
        this.initUI();
    }

    /**
     * 初始化UI界面
     */
    initUI() {
        this.renderTimer(TIMER_CONSTANTS.INITIAL_TIME);
        this.pos(this.width / 2 - 50, TIMER_CONSTANTS.POSITION_X);
    }

    /**
     * 渲染计时器
     * @param {number} num - 要显示的数字
     */
    renderTimer(num) {
        this.graphics.clear();

        // 计算尺寸和位置
        const w = TIMER_CONSTANTS.NUMBER_WIDTH / TIMER_CONSTANTS.SCALE_FACTOR * window.devicePixelRatio;
        const h = TIMER_CONSTANTS.NUMBER_HEIGHT / TIMER_CONSTANTS.SCALE_FACTOR * window.devicePixelRatio;

        // 渲染"00"前缀
        this.renderNumberString('00', 0, w, h);

        // 渲染图标
        this.graphics.loadImage(
            `${gameConfig.LOCAL_URL}/rewards/4.png`,
            TIMER_CONSTANTS.ICON_POSITION,
            0,
            w,
            h
        );

        // 格式化数字并渲染
        const formattedNum = num < 10 ? `0${num}` : num.toString();
        this.renderNumberString(formattedNum, TIMER_CONSTANTS.ICON_OFFSET, w, h);
    }

    /**
     * 渲染数字字符串
     * @param {string} numStr - 数字字符串
     * @param {number} xOffset - X轴偏移量
     * @param {number} width - 数字宽度
     * @param {number} height - 数字高度
     */
    renderNumberString(numStr, xOffset, width, height) {
        const digits = numStr.split('');

        for (let i = digits.length - 1; i >= 0; i--) {
            const x = (i - digits.length + 0.5) * TIMER_CONSTANTS.SPACING * window.devicePixelRatio + xOffset;
            const imagePath = `${gameConfig.LOCAL_URL}/result_score_num/${digits[i]}.png`;

            this.graphics.loadImage(imagePath, x, 0, width, height);
        }
    }

    /**
     * 更新计时器显示
     * @param {number} time - 新的时间值
     */
    updateTimer(time) {
        if (time !== this.currentTime) {
            this.currentTime = time;
            this.renderTimer(time);
        }
    }

    /**
     * 开始倒计时动画
     * @param {number} duration - 倒计时持续时间（秒）
     * @param {Function} onComplete - 倒计时完成回调
     */
    startCountdown(duration = TIMER_CONSTANTS.INITIAL_TIME, onComplete) {
        this.currentTime = duration;
        this.renderTimer(duration);

        // 创建倒计时动画
        Laya.timer.frameLoop(1, this, () => {
            this.currentTime--;
            this.renderTimer(this.currentTime);

            if (this.currentTime <= 0) {
                Laya.timer.clear(this, this.startCountdown);
                if (onComplete) onComplete();
            }
        });
    }

    /**
     * 停止倒计时
     */
    stopCountdown() {
        Laya.timer.clear(this, this.startCountdown);
    }

    /**
     * 设置计时器位置
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     */
    setPosition(x, y) {
        this.pos(x, y);
    }

    /**
     * 设置计时器大小
     * @param {number} width - 宽度
     * @param {number} height - 高度
     */
    setSize(width, height) {
        this.width = width;
        this.height = height;
    }
}

// 导出类
export default Timer;