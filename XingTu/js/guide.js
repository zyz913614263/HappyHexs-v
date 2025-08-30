import { gameConfig } from "./config.js";
// 导入依赖模块
//const config = __webpack_require__(0);

// 游戏常量
const GUIDE_CONSTANTS = {
    IMG_WIDTH: 146 * window.devicePixelRatio,
    IMG_HEIGHT: 170 * window.devicePixelRatio,
    IMAGE_ZOOM: 2,
    IMG_JT_HEIGHT: 43 * window.devicePixelRatio,
    IMG_JT_WIDTH: 65 * window.devicePixelRatio,
    IMG_NUM_HEIGHT: 34 * window.devicePixelRatio,
    IMG_NUM_WIDTH: 48 * window.devicePixelRatio,
    UP_TIME: 1000,
    DOWN_TIME: 1000,
    STEP: 15 * window.devicePixelRatio
};

// 应用缩放
const SCALED_DIMENSIONS = {
    width: GUIDE_CONSTANTS.IMG_WIDTH / GUIDE_CONSTANTS.IMAGE_ZOOM,
    height: GUIDE_CONSTANTS.IMG_HEIGHT / GUIDE_CONSTANTS.IMAGE_ZOOM,
    jtWidth: GUIDE_CONSTANTS.IMG_JT_WIDTH / GUIDE_CONSTANTS.IMAGE_ZOOM,
    jtHeight: GUIDE_CONSTANTS.IMG_JT_HEIGHT / GUIDE_CONSTANTS.IMAGE_ZOOM,
    numHeight: GUIDE_CONSTANTS.IMG_NUM_HEIGHT / GUIDE_CONSTANTS.IMAGE_ZOOM,
    numWidth: GUIDE_CONSTANTS.IMG_NUM_WIDTH / GUIDE_CONSTANTS.IMAGE_ZOOM
};

// 获取引导状态
var guideStatus = wx.getStorageSync('guide');
let guideClick = guideStatus;

/**
 * 引导控制器
 * 管理游戏引导的显示和隐藏
 */
class GuideControls {
    constructor() {
        this.status = false;
        this._guide = null;
    }

    /**
     * 初始化引导
     * @param {Laya.Sprite} parentNode - 父节点
     */
    initGuide(parentNode) {
        console.log('initGuide');
        if (guideStatus !== '1' && guideStatus !== '2') {
            this._guide = new Guide();
            this._guide.pos(10 * window.devicePixelRatio, -500 * window.devicePixelRatio);
            this._guide.visible = false;
            parentNode.addChild(this._guide);
        }
    }

    /**
     * 获取引导状态
     * @returns {string} 引导状态
     */
    getGuideStatus() {
        return guideStatus;
    }

    /**
     * 获取引导点击状态
     * @returns {string} 点击状态
     */
    getGuideClickStatus() {
        return guideClick;
    }

    /**
     * 切换引导步骤
     */
    switchGuide() {
        if (!this._guide) return;

        this._guide.visible = false;
        this._guide.hideStep1();
        this._guide.showStep2();
        this._guide.tipsSp.text = '点击屏幕可飞跃至下个轨道';

        if (guideStatus === '2') {
            this._guide.destroy();
            console.log('guide destroy');
            this.resetGuide();
            guideClick = true;
        } else {
            guideClick = false;
        }
    }

    /**
     * 重置引导
     */
    resetGuide() {
        this._guide = null;
    }

    /**
     * 显示引导第一步
     * @param {Object} plant - 星球对象
     */
    showGuideStep1(plant) {
        if (this._guide && guideStatus !== '1' && guideStatus !== '2' && plant._rotation > 75) {
            this.status = true;
            this._guide.visible = true;

            try {
                wx.setStorageSync('guide', '1');
            } catch (ex) {
                console.warn('保存引导状态失败:', ex);
            }

            guideStatus = '1';
            plant.stop(1);
            guideClick = true;
        }
    }

    /**
     * 显示引导第二步
     * @param {Object} plant - 星球对象
     */
    showGuideStep2(plant) {
        if (this._guide && guideStatus !== '2' && plant._rotation > 145) {
            this.status = true;
            this._guide.visible = true;

            try {
                wx.setStorageSync('guide', '2');
            } catch (ex) {
                console.warn('保存引导状态失败:', ex);
            }

            guideStatus = '2';
            plant.stop(1);
            guideClick = true;
        }
    }
}

/**
 * 引导界面类
 * 负责渲染引导的视觉元素和动画
 */
class Guide extends Laya.Sprite {
    constructor() {
        super();

        this.width = SCALED_DIMENSIONS.width;
        this.height = SCALED_DIMENSIONS.height;

        this.initComponents();
        this.initUi();
        this.renderCombo();
    }

    /**
     * 初始化组件
     */
    initComponents() {
        this.txtSp = new Laya.Sprite();
        this.bgSp = new Laya.Sprite();
        this.bgSp.pivot(SCALED_DIMENSIONS.width / 2, SCALED_DIMENSIONS.height / 2);
        this.bgSp.pos(SCALED_DIMENSIONS.width / 2, SCALED_DIMENSIONS.height / 2);

        this.addChild(this.txtSp);
        this.addChild(this.bgSp);
    }

    /**
     * 隐藏连击效果
     */
    hideCombo() {
        this.bgSp.visible = false;
        this.txtSp.graphics.clear();
    }

    /**
     * 渲染连击动画
     */
    renderCombo() {
        const directions = [
            { x: -GUIDE_CONSTANTS.STEP, y: GUIDE_CONSTANTS.STEP },    // 左下
            { x: -GUIDE_CONSTANTS.STEP, y: 0 },                       // 左
            { x: GUIDE_CONSTANTS.STEP, y: -GUIDE_CONSTANTS.STEP },    // 右上
            { x: GUIDE_CONSTANTS.STEP, y: 0 }                         // 右
        ];

        for (let i = 0; i < 4; i++) {
            const sp = this[`jiantou${i}`];
            const { x, y } = directions[i];

            Laya.Tween.to(sp, {
                y: sp.y - y,
                x: sp.x - x,
                scaleX: 1.2,
                scaleY: 1.2,
                alpha: 0.5
            }, GUIDE_CONSTANTS.UP_TIME, Laya.Ease.linearNone,
                Laya.Handler.create(this, this.moveTextEnd, [sp, x, y]));
        }
    }

    /**
     * 箭头移动结束回调
     */
    moveTextEnd(sp, x, y) {
        Laya.Tween.to(sp, {
            y: sp.y + y,
            x: sp.x + x,
            alpha: 1,
            scaleX: 1,
            scaleY: 1
        }, GUIDE_CONSTANTS.DOWN_TIME, Laya.Ease.linearNone,
            Laya.Handler.create(this, this.txtEnd, [x, y]));
    }

    /**
     * 文本动画结束回调
     */
    txtEnd(x, y) {
        if (x === -GUIDE_CONSTANTS.STEP && y === GUIDE_CONSTANTS.STEP) {
            this.renderCombo();
        }
    }

    /**
     * 初始化UI
     */
    initUi() {
        this.drawCircle();
        this.drawNeiCircle();
        this.drawHand();
        this.drawText();
        this.drawJianTou();
    }

    /**
     * 绘制手指
     */
    drawHand() {
        const img = new Laya.Image();
        img.skin = 'res/hand.png';
        img.width = SCALED_DIMENSIONS.width;
        img.height = SCALED_DIMENSIONS.height;
        img.pos((gameConfig.GameWidth - SCALED_DIMENSIONS.width) / 2,
            gameConfig.GameHeight - 200 * window.devicePixelRatio);

        this.handSp = img;
        this.addChild(img);
        this.handUpAnimation();
    }

    /**
     * 手指向上动画
     */
    handUpAnimation() {
        Laya.Tween.to(this.handSp, {
            y: this.handSp.y - 8 * window.devicePixelRatio
        }, GUIDE_CONSTANTS.DOWN_TIME, Laya.Ease.linearNone,
            Laya.Handler.create(this, this.handDownAnimation, [this]));
    }

    /**
     * 手指向下动画
     */
    handDownAnimation() {
        Laya.Tween.to(this.handSp, {
            y: this.handSp.y + 8 * window.devicePixelRatio
        }, GUIDE_CONSTANTS.DOWN_TIME, Laya.Ease.linearNone,
            Laya.Handler.create(this, this.handUpAnimation, [this]));
    }

    /**
     * 隐藏第一步引导
     */
    hideStep1() {
        this.jiantou1.visible = false;
        this.jiantou3.visible = false;
    }

    /**
     * 显示第二步引导
     */
    showStep2() {
        this.jiantou0.visible = true;
        this.jiantou2.visible = true;
    }

    /**
     * 绘制外圆圈
     */
    drawCircle() {
        const img = new Laya.Image();
        img.skin = 'res/circle.png';
        img.width = 108 / 3 * window.devicePixelRatio;
        img.height = 108 / 3 * window.devicePixelRatio;
        img.pivot(img.width / 2, img.height / 2);
        img.pos(gameConfig.GameWidth / 2 - 8 * window.devicePixelRatio,
            gameConfig.GameHeight - 190 * window.devicePixelRatio);

        this.circleSp = img;
        this.addChild(img);
        this.circleAnimation();
    }

    /**
     * 圆圈动画
     */
    circleAnimation() {
        this.circleSp.alpha = 1;
        this.circleSp.scale(1, 1);
        Laya.Tween.to(this.circleSp, {
            alpha: 0,
            scaleY: 1.5,
            scaleX: 1.5
        }, GUIDE_CONSTANTS.DOWN_TIME, Laya.Ease.linearNone,
            Laya.Handler.create(this, this.circleAnimation, [this]));
    }

    /**
     * 绘制内圆圈
     */
    drawNeiCircle() {
        const img = new Laya.Image();
        img.skin = 'res/circle_nei.png';
        img.width = 88 / 3 * window.devicePixelRatio;
        img.height = 88 / 3 * window.devicePixelRatio;
        img.pivot(img.width / 2, img.height / 2);
        img.pos(gameConfig.GameWidth / 2 - 8 * window.devicePixelRatio,
            gameConfig.GameHeight - 190 * window.devicePixelRatio);

        this.circleNeiSp = img;
        this.addChild(img);
        this.circleNeiAnimation();
    }

    /**
     * 内圆圈动画
     */
    circleNeiAnimation() {
        this.circleNeiSp.alpha = 1;
        this.circleNeiSp.scale(1, 1);
        Laya.Tween.to(this.circleNeiSp, {
            alpha: 0,
            scaleY: 1.5,
            scaleX: 1.5
        }, GUIDE_CONSTANTS.DOWN_TIME + 200, Laya.Ease.linearNone,
            Laya.Handler.create(this, this.circleNeiAnimation, [this]));
    }

    /**
     * 绘制提示文本
     */
    drawText() {
        const label1 = new Laya.Text();
        label1.text = "点击屏幕可内外切换轨道";
        label1.fontSize = 14 * window.devicePixelRatio;
        label1.color = '#82b9c7';
        label1.pos((gameConfig.GameWidth - label1.width) / 2,
            gameConfig.GameHeight - 100 * window.devicePixelRatio);

        this.tipsSp = label1;
        this.addChild(label1);
    }

    /**
     * 绘制箭头
     */
    drawJianTou() {
        const dis = 30 * window.devicePixelRatio;
        const baseX = gameConfig.GameWidth / 2 + 85 * window.devicePixelRatio;
        const baseY = SCALED_DIMENSIONS.jtHeight / 2 + gameConfig.GameHeight / 2 - 25 * window.devicePixelRatio;

        for (let i = 0; i < 4; i++) {
            this[`jiantou${i}`] = new JianTou();
            this[`jiantou${i}`].pivot(SCALED_DIMENSIONS.jtWidth / 2, SCALED_DIMENSIONS.jtHeight / 2);

            let x, y, rotation, visible = true;

            switch (i) {
                case 0: // 左下
                    x = baseX - dis * 1.5 + 5;
                    y = baseY - dis;
                    rotation = 30;
                    visible = false;
                    break;
                case 1: // 左
                    x = baseX + dis / 2;
                    y = baseY + dis * 2;
                    rotation = 90;
                    break;
                case 2: // 右上
                    x = baseX - dis * 2 + 10 * window.devicePixelRatio;
                    y = baseY;
                    rotation = 210;
                    visible = false;
                    break;
                case 3: // 右
                    x = baseX - dis / 2;
                    y = baseY + dis * 2;
                    rotation = 270;
                    break;
            }

            this[`jiantou${i}`].pos(x, y);
            this[`jiantou${i}`].rotation = rotation;
            this[`jiantou${i}`].visible = visible;
            this.addChild(this[`jiantou${i}`]);
        }
    }
}

/**
 * 箭头类
 * 渲染箭头指示器
 */
class JianTou extends Laya.Sprite {
    constructor() {
        super();
        this.renderUI();
    }

    /**
     * 渲染UI
     */
    renderUI() {
        // 主箭头
        const img = new Laya.Image();
        img.skin = `${gameConfig.LOCAL_URL}/jiantou.png`;
        img.width = SCALED_DIMENSIONS.jtWidth;
        img.height = SCALED_DIMENSIONS.jtHeight;
        img.pos(0, 0);
        this.addChild(img);

        // 数字箭头
        const img2 = new Laya.Image();
        img2.skin = `${gameConfig.LOCAL_URL}/jiantou1.png`;
        img2.width = SCALED_DIMENSIONS.numWidth;
        img2.height = SCALED_DIMENSIONS.numHeight;
        img2.pos(4 * window.devicePixelRatio, 10 * window.devicePixelRatio);
        this.addChild(img2);
    }
}
// 创建单例实例
const GuideControl = new GuideControls();
// 导出引导控制器
export default GuideControl;