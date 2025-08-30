import { gameConfig, infoList } from "./config.js";
import musicInstance from "./music.js";

// 游戏常量
const GAME_CONSTANTS = {
    BG_SPEED: 1 * window.devicePixelRatio,
    PLANET_SPEED: 3 * window.devicePixelRatio,
    PERSON_IMG_WIDTH: 75 / 2.5 * window.devicePixelRatio,
    PLANET_START_Y_OFFSET: 150 * window.devicePixelRatio,
    ANIMATION_DELAY: 500,
    PERSON_ANIMATION_INTERVAL: 10,
    TURNED_SELF_INTERVAL: 3
};

// 人物动画资源
const PEOPLE_IMAGES = Array.from({ length: 7 }, (_, i) => `${gameConfig.LOCAL_URL}/p/${i}.png`);
var planetSpeed = GAME_CONSTANTS.PLANET_SPEED;

/**
 * 启动动画类
 * 负责游戏的启动界面和动画效果
 */
class StartUp extends Laya.Sprite {
    constructor(startCallback, flyCallBack) {
        super();

        // 基本属性
        this.width = gameConfig.GameWidth;
        this.height = gameConfig.GameHeight;
        this.personLoop = 0;
        this.personIndex = 0;
        this._step = 0;
        this._turnedSelfIndex = 1;
        this.isCollisioned = false;

        // 回调函数
        this.startCallback = startCallback;
        this.flyCallBack = flyCallBack;

        // 计算星球起始位置
        this.planetStartY = gameConfig.GameHeight - GAME_CONSTANTS.PLANET_START_Y_OFFSET;
        console.log('planetStartY', this.planetStartY);

        // 初始化
        this.init();
        console.log('init');
        // 延迟启动人物动画
        setTimeout(() => {
            this.personAnimation();
        }, GAME_CONSTANTS.ANIMATION_DELAY);
    }

    /**
     * 初始化启动界面
     */
    init() {
        // 播放背景音乐
        musicInstance.playBg();
        //musicInstance.playStart();

        // 渲染界面元素
        this.renderEnergyPoint();
        this.createTitle();
        this.renderStartBtn();
        this.renderPlanet();

        // 初始化人物动画
        this.drawPersonAnimation();

        // 绑定事件
        this.bind();
    }

    /**
     * 渲染能量点
     */
    renderEnergyPoint() {
        this.energy_point = new Laya.Sprite();
        this.energy_point.loadImage(
            `${gameConfig.LOCAL_URL}/little/baoshi_new.png`,
            0, 0,
            105 / 2 * window.devicePixelRatio,
            105 / 2 * window.devicePixelRatio
        );

        this.energy_point.pos(
            (gameConfig.GameWidth - 105 / 2 * window.devicePixelRatio) / 2,
            300 * window.devicePixelRatio
        );
        this.energy_point.alpha = 0;

        this.addChild(this.energy_point);
    }

    /**
     * 渲染星球
     */
    renderPlanet() {
        this.planet = new Laya.Sprite();
        this.planet.loadImage(
            `${gameConfig.LOCAL_URL}/fly/1.png`,
            0, 0,
            65 / 2.5 * window.devicePixelRatio,
            80 / 2.5 * window.devicePixelRatio
        );

        this.planet.x = (gameConfig.GameWidth - 65 / 2.5 * window.devicePixelRatio) / 2;
        this.planet.y = this.planetStartY - 2 * window.devicePixelRatio;
        console.log('planet', this.planet.y);

        this.addChild(this.planet);
    }

    /**
     * 渲染尾部特效
     */
    renderTail() {
        this.tailSprite = new Laya.Sprite();
        this.tailSprite.loadImage(
            `${gameConfig.LOCAL_URL}/53c914c3d30c663fe9c26819ef54882d.png`,
            -9.5 * window.devicePixelRatio,
            10 * window.devicePixelRatio,
            67 / 1.5 * window.devicePixelRatio,
            68 / 1.5 * window.devicePixelRatio
        );

        this.planet.addChild(this.tailSprite);
    }

    /**
     * 渲染尾部特效2
     */
    renderTail2() {
        this.tailSprite2 = new Laya.Sprite();
        this.tailSprite2.loadImage(
            `${gameConfig.LOCAL_URL}/871f2e463d2b893ba247f3062179b504.png`,
            10.7 * window.devicePixelRatio,
            32 * window.devicePixelRatio,
            8 / 2 * window.devicePixelRatio,
            213 / 6 * window.devicePixelRatio
        );

        this.tailSprite.addChild(this.tailSprite2);
    }

    /**
     * 绘制人物动画
     */
    drawPersonAnimation() {
        // 清理之前的人物
        if (this.person) {
            this.person.destroy();
        }

        // 创建新的人物精灵
        this.person = new Laya.Sprite();
        this.person.pos(
            (175 + this.personLoop * 20) * window.devicePixelRatio,
            this.planetStartY - 2 * window.devicePixelRatio
        );

        this.addChild(this.person);

        // 加载人物图片
        this.person.graphics.loadImage(
            PEOPLE_IMAGES[this.personIndex],
            0, 0,
            GAME_CONSTANTS.PERSON_IMG_WIDTH,
            85 / 2.5 * window.devicePixelRatio
        );

        this.personIndex++;

        // 检查是否完成所有帧
        if (this.personIndex === 7) {
            this.stopPersonAnimation();

            if (this.person) {
                this.person.destroy();
            }

            // 延迟启动游戏
            setTimeout(() => {
                this.start();
                window.BackGround.start();

                // 能量点淡入动画
                Laya.Tween.to(this.energy_point, {
                    alpha: 1
                }, 1000, Laya.Ease.linearNone);
            }, 200);
        }
    }

    /**
     * 创建游戏标题
     */
    createTitle() {
        this.titleSprite = new Laya.Sprite();
        this.titleSprite.loadImage(
            `${gameConfig.LOCAL_URL}/start/logo.png`,
            0, 0,
            484 / 1.5 * window.devicePixelRatio,
            335 / 1.5 * window.devicePixelRatio
        );

        this.titleSprite.x = (gameConfig.GameWidth - 484 / 1.5 * window.devicePixelRatio) / 2;
        this.titleSprite.y = 150 * window.devicePixelRatio;
        this.titleSprite.visible = false;

        window.stage.addChild(this.titleSprite);

        return this.titleSprite;
    }

    /**
     * 渲染开始按钮
     */
    renderStartBtn() {
        console.log('renderStartBtn');
        this.btnSprite = new Laya.Sprite();
        this.btnSprite.loadImage(
            `${gameConfig.LOCAL_URL}/start/start_btn.png`,
            0, 0,
            485 / 1.5 * window.devicePixelRatio,
            135 / 1.5 * window.devicePixelRatio
        );

        this.btnSprite.x = (gameConfig.GameWidth - 485 / 1.5 * window.devicePixelRatio) / 2;
        this.btnSprite.y = 550 * window.devicePixelRatio;
        this.btnSprite.visible = false;

        window.stage.addChild(this.btnSprite);

        return this.btnSprite;
    }

    /**
     * 绑定事件
     */
    bind() {
        this.btnSprite.on('click', this, this.startGame);
    }

    /**
     * 开始游戏
     */
    startGame() {
        console.log('startGame');
        // 播放按钮音效
        musicInstance.playBtn();

        // 按钮淡出动画
        Laya.Tween.to(this.btnSprite, {
            alpha: 0
        }, 200, Laya.Ease.linearNone);

        // 标题淡出动画
        Laya.Tween.to(this.titleSprite, {
            alpha: 0
        }, 200, Laya.Ease.linearNone);

        // 执行开始回调
        if (this.startCallback) {
            this.startCallback();
        }

        // 设置星球速度
        planetSpeed = 4 * window.devicePixelRatio;
        console.log('window.planetSpeed', planetSpeed);
        this._step = 0;

        // 移除点击事件
        this.btnSprite.off('click', this, this.startGame);

        // 播放背景音乐2 这里会卡住

        musicInstance.playStart();

        // 销毁UI元素
        this.btnSprite.destroy();
        this.titleSprite.destroy();
        console.log('startGame end');
    }

    /**
     * 启动人物动画
     */
    personAnimation() {
        Laya.timer.frameLoop(GAME_CONSTANTS.PERSON_ANIMATION_INTERVAL, this, this.drawPersonAnimation);
    }

    /**
     * 停止人物动画
     */
    stopPersonAnimation() {
        Laya.timer.clear(this, this.drawPersonAnimation);
    }

    /**
     * 检查碰撞
     */
    checkCollision() {
        if (!this.isCollisioned && this.planet.y < this.energy_point.y + 50) {
            this.energy_point.destroy();
            this.isCollisioned = true;
            musicInstance.playEnergy();
            this.startTurnedSelf();
        }
    }

    /**
     * 星球自转动画
     */
    turnedSelf() {
        this.planet.graphics.clear();
        this.planet.graphics.loadImage(
            `${gameConfig.LOCAL_URL}/fly/${this._turnedSelfIndex}.png`,
            0, 0,
            65 / 2.5 * window.devicePixelRatio,
            80 / 2.5 * window.devicePixelRatio
        );

        if (this._turnedSelfIndex === 13) {
            this.stopTurnedSelf();
        }

        this._turnedSelfIndex++;
    }

    /**
     * 停止星球自转
     */
    stopTurnedSelf() {
        Laya.timer.clear(this, this.turnedSelf);
    }

    /**
     * 启动星球自转
     */
    startTurnedSelf() {
        this._turnedSelfIndex = 1;
        Laya.timer.frameLoop(GAME_CONSTANTS.TURNED_SELF_INTERVAL, this, this.turnedSelf);
    }

    /**
     * 主动画循环
     */
    animation() {
        //console.log('animation');
        // 检查碰撞
        this.checkCollision();

        // 星球向上移动
        this.planet.y -= planetSpeed;

        // 渲染尾部特效2
        if (this.planet.y < 420 * window.devicePixelRatio && !this.tailSprite2) {
            this.renderTail2();
            planetSpeed = 1 * window.devicePixelRatio;
        }

        // 显示UI元素
        if (this.planet.y < 280 * window.devicePixelRatio) {
            this.btnSprite.visible = true;
            this.titleSprite.visible = true;
            window.BackGround.SPEED = 1 * window.devicePixelRatio;
        }

        // 计算步数
        if (planetSpeed === 4 * window.devicePixelRatio) {
            this._step += planetSpeed;
        }

        // 检查是否完成启动动画
        if (planetSpeed === 4 * window.devicePixelRatio && this._step > 600 * window.devicePixelRatio) {
            this.stop();
        }

        // 背景移动
        this.y += GAME_CONSTANTS.BG_SPEED;
    }

    /**
     * 停止动画
     */
    stop() {
        console.log('stop');
        // 执行飞行完成回调
        if (this.flyCallBack) {
            this.flyCallBack();
        }

        // 清理资源
        this.btnSprite.destroy();
        this.titleSprite.destroy();
        Laya.timer.clear(this, this.animation);
    }

    /**
     * 启动动画
     */
    start() {
        console.log('start');
        this.renderTail();
        Laya.timer.frameLoop(1, this, this.animation);
    }
}

// 模块导出
export default StartUp;