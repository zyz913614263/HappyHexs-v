import { gameConfig } from "./config.js";
import musicInstance from './music.js';
import UIRender from './uireder.js';
import Point from './point.js';
import Circle from './circle.js';
import Block from './block.js';
import Airplane from './airplane.js';
import Timer from './timer.js';
import CutOffPoint from './cutOffPoint.js';

// 导入依赖模块

// 游戏常量
const REWARDS_CONSTANTS = {
    IN_SIDE_EDGE_DISTANCE: 30 * window.devicePixelRatio,
    ZOOM: 1,
    IMG_TXT_HEIGHT: 80 * window.devicePixelRatio,
    IMG_TXT_WIDTH: 77 * window.devicePixelRatio,
    IMG_WIDTH: 161 * window.devicePixelRatio,
    IMG_HEIGHT: 161 * window.devicePixelRatio,
    IMG_NUM_HEIGHT: 81 * window.devicePixelRatio,
    IMG_NUM_WIDTH: 68 * window.devicePixelRatio,
    COUNTDOWN_TIME: 14,
    WARNING_TIME: 5,
    TWEEN_DURATION: 200,
    LIGHT_DURATION: 400,
    RESULT_ANIMATION_DELAY: 1000
};

// 星球配置列表
const PLANET_LIST = [
    {
        url: 'res/rewards/1.png',
        radius: 418 / 4,
        correction: { x: 0, y: 0 },
        img: {
            width: 295,
            height: 294,
            coefficient: 200
        }
    },
    {
        url: 'res/rewards/3.png',
        radius: 518 / 4,
        correction: { x: 0, y: 0 },
        img: {
            width: 369,
            height: 369,
            coefficient: 200
        }
    }
];

// 应用设备像素比
PLANET_LIST.forEach(planet => {
    planet.radius *= window.devicePixelRatio;
    planet.img.width *= window.devicePixelRatio;
    planet.img.height *= window.devicePixelRatio;
    planet.img.coefficient *= window.devicePixelRatio;
    planet.correction.x *= window.devicePixelRatio;
    planet.correction.y *= window.devicePixelRatio;
});

/**
 * 奖励系统类
 * 负责游戏中的奖励关卡管理
 */
class Rewards extends Laya.Sprite {
    /**
     * 构造函数
     */
    constructor() {
        super();

        this.width = gameConfig.GameWidth;
        this.height = gameConfig.GameHeight;
        this.blocks = [];
        this.score = 0;
        this._showed = false;

        this.initUI();
    }

    /**
     * 初始化UI
     */
    initUI() {
        this.initBackground();
        this.initBlocks();
        this.initAirplane();
        this.bindEvents();
        this.initTimer();
    }

    /**
     * 预开始倒计时
     */
    preStart() {
        // 创建半透明背景
        const bg = new Laya.Sprite();
        bg.graphics.drawRect(0, 0, this.width, this.height, 'rgba(0,0,0,0.5)');
        this.addChild(bg);

        // 创建倒计时文本
        const countdownLabel = new Laya.Text();
        countdownLabel.text = '3';
        countdownLabel.fontSize = 100 * window.devicePixelRatio;
        countdownLabel.color = '#5fb8f7';
        countdownLabel.wordWrap = true;
        countdownLabel.width = 1000;
        countdownLabel.align = "center";
        countdownLabel.pos(
            (gameConfig.GameWidth - countdownLabel.width) / 2,
            80 * window.devicePixelRatio
        );
        this.addChild(countdownLabel);

        // 倒计时数组
        const countdownTexts = [2, 1, 'GO', ""];
        let index = 0;

        const countdown = () => {
            countdownLabel.text = countdownTexts[index++];
            if (index > 3) {
                Laya.timer.clear(this, countdown);
                countdownLabel.destroy();
                bg.destroy();
            }
        };

        Laya.timer.loop(1000, this, countdown);
    }

    /**
     * 初始化计时器
     */
    initTimer() {
        let startNum = REWARDS_CONSTANTS.COUNTDOWN_TIME;

        if (this._timer) {
            this._timer.visible = false;
            this._timer.y = 0;
        } else {
            this._timer = new Timer();
            this.addChild(this._timer);
        }

        const countdown = () => {
            // 播放警告音效
            if (startNum < REWARDS_CONSTANTS.WARNING_TIME && startNum > 0) {
                musicInstance.playTime();
            }

            this._timer.renderTimer(startNum--);

            // 随机生成能量点
            this.uirender.renderOneEnergyPoint(
                this.blocks[this.getRandomNumber(2)],
                this.getOneRandomGem()
            );

            if (startNum < 0) {
                Laya.timer.clear(this, countdown);

                // 计时器向上移动并显示结果
                Laya.Tween.to(this._timer, {
                    y: -100
                }, 100, Laya.Ease.linearNone, Laya.Handler.create(this, () => {
                    this.showResult();
                }));

                this.airPlane.stop();
            }
        };

        Laya.timer.loop(1000, this, countdown);
    }

    /**
     * 重置奖励系统
     */
    reset() {
        this.uirender.visible = true;
        this._backGround.visible = true;
        this.visible = true;
        this._showed = false;
        this.initTimer();
    }

    /**
     * 显示结果
     * @param {number} num - 宝石数量
     */
    showResult(num) {
        if (this._showed) return;

        this._showed = true;
        num = num || this.airPlane.gemCount;

        // 创建或获取结果精灵
        if (!this.resultSp) {
            this.resultSp = new Laya.Sprite();
            this.addChild(this.resultSp);
        }

        const txtSp = this.resultSp;
        musicInstance.playResult();

        // 加载结果背景
        txtSp.graphics.loadImage(
            'res/rewards/2.png',
            0, 0,
            REWARDS_CONSTANTS.IMG_TXT_WIDTH,
            REWARDS_CONSTANTS.IMG_TXT_HEIGHT
        );

        // 显示数字
        const numStr = num.toString().split('');
        for (let i = 0; i < numStr.length; i++) {
            txtSp.graphics.loadImage(
                `res/combos/3/${numStr[i]}.png`,
                REWARDS_CONSTANTS.IMG_TXT_WIDTH / 1.5 + REWARDS_CONSTANTS.IMG_NUM_WIDTH * i / 1.5,
                0,
                REWARDS_CONSTANTS.IMG_NUM_WIDTH,
                REWARDS_CONSTANTS.IMG_NUM_HEIGHT
            );
        }

        // 设置位置和初始状态
        txtSp.pos(
            gameConfig.GameWidth / 2 - 60 * (numStr.length - 1),
            150 * window.devicePixelRatio
        );
        txtSp.pivot(60 * window.devicePixelRatio, 40 * window.devicePixelRatio);
        txtSp.alpha = 0;
        txtSp.scaleX = 0.1;
        txtSp.scaleY = 0.1;

        // 结果动画
        Laya.Tween.to(txtSp, {
            alpha: 1,
            scaleX: 1,
            scaleY: 1
        }, REWARDS_CONSTANTS.TWEEN_DURATION, Laya.Ease.linearNone,
            Laya.Handler.create(this, () => {
                this.showLight();
            }));
    }

    /**
     * 显示光效
     */
    showLight() {
        musicInstance.playZhuan1();

        // 创建白色背景
        const bgSp = new Laya.Sprite();
        bgSp.graphics.drawRect(0, 0, gameConfig.GameWidth, gameConfig.GameHeight, "#fff");
        bgSp.alpha = 0;
        this.addChild(bgSp);

        // 背景淡入
        Laya.Tween.to(bgSp, {
            alpha: 1
        }, REWARDS_CONSTANTS.LIGHT_DURATION, Laya.Ease.linearNone,
            Laya.Handler.create(this, () => {
                // 隐藏所有元素
                this._backGround.visible = false;
                this.uirender.visible = false;
                this._timer.visible = false;
                this.airPlane.visible = false;

                // 背景淡出
                Laya.Tween.to(bgSp, {
                    alpha: 0
                }, 500, Laya.Ease.linearNone, Laya.Handler.create(this, () => {
                    this.endRewards();
                }), 200);

                // 结果精灵动画
                Laya.Tween.to(this.resultSp, {
                    x: gameConfig.GameWidth - 120 * window.devicePixelRatio,
                    y: 40 * window.devicePixelRatio,
                    scaleX: 0,
                    scaleY: 0
                }, 500, Laya.Ease.linearNone, Laya.Handler.create(this, () => { }), 200);
            }), REWARDS_CONSTANTS.RESULT_ANIMATION_DELAY);
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // 鼠标点击事件
        this.on('mousedown', this, () => {
            if (!this.airPlane || this.airPlane.gameOver) return;

            // 检查内侧边界
            if (this.airPlane.getSideState() === 1) {
                const currentCutOffPoint = this.checkInSideEdge();
                if (currentCutOffPoint) {
                    const nextBlock = this.getNextBlock(currentCutOffPoint);
                    this.airPlane.reRender(nextBlock, this.currentBlock, currentCutOffPoint);
                    this.currentBlock = nextBlock;
                } else {
                    this.airPlane.changeSide();
                }
            } else {
                // 外侧直接切换
                this.airPlane.changeSide();
            }
        });

        // 奖励结束事件
        window._Event.on('end_rewards', () => {
            this.showResult();
            Laya.timer.clearAll(this);
        });

        // 奖励开始事件
        window._Event.on('start_rewards', () => {
            this.airPlane.start();
        });
    }

    /**
     * 结束奖励
     */
    endRewards() {
        window._Event.off('end_rewards');
        window._Event.off('start_rewards');
        this.destroy();
        window._Event.emit('go_on');
    }

    /**
     * 检查内侧边界
     * @returns {Object|false} 切断点或false
     */
    checkInSideEdge() {
        const plane = this.airPlane.plane;
        const pos = { x: plane.x, y: plane.y };
        const cutOffPoints = this.currentBlock.cutOffPoints;

        for (let i = 0; i < cutOffPoints.length; i++) {
            const disX = pos.x - cutOffPoints[i].currX;
            const disY = pos.y - cutOffPoints[i].currY;
            const distance = Math.sqrt(disX * disX + disY * disY);

            if (distance < REWARDS_CONSTANTS.IN_SIDE_EDGE_DISTANCE) {
                return cutOffPoints[i];
            }
        }

        return false;
    }

    /**
     * 初始化飞机
     */
    initAirplane() {
        this.currentBlock = this.blocks[0];
        this.airPlane = new Airplane(this.currentBlock, this.blocks, '', 'rewards');
        this.airPlane.SPEED = 2.5;
        this.addChild(this.airPlane);
        this.airPlane.stop();
    }

    /**
     * 为星球添加随机宝石
     * @param {Object} planet - 星球对象
     * @returns {Object} 添加宝石后的星球
     */
    addGemRandom(planet) {
        planet.energyPoints = [];
        const gemCount = this.getRandomNumber(5, 2);

        for (let i = 0; i < gemCount; i++) {
            planet.energyPoints.push(this.getOneRandomGem());
        }

        return planet;
    }

    /**
     * 获取一个随机宝石
     * @returns {Object} 宝石对象
     */
    getOneRandomGem() {
        return {
            side: this.getRandomNumber(2, 1),
            angle: this.getRandomNumber(2) % 2 ?
                this.getRandomNumber(120, 30) :
                this.getRandomNumber(120, 210)
        };
    }

    /**
     * 获取随机数
     * @param {number} max - 最大值
     * @param {number} step - 步长
     * @returns {number} 随机数
     */
    getRandomNumber(max, step = 0) {
        return ~~(Math.random() * max) + step;
    }

    /**
     * 获取最后一个区块
     * @returns {Object} 最后一个区块
     */
    getLastBlock() {
        return this.blocks[this.blocks.length - 1];
    }

    /**
     * 初始化区块
     */
    initBlocks() {
        const planetListCopy = JSON.parse(JSON.stringify(PLANET_LIST));

        for (let i = 0; i < planetListCopy.length; i++) {
            const planet = this.addGemRandom(planetListCopy[i]);
            this.createBlock(planet, i);
        }

        this.uirender = new UIRender(this.blocks);
        this.addChild(this.uirender);
    }

    /**
     * 创建点
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @returns {Object} 点对象
     */
    createPoint(x = gameConfig.startX, y = gameConfig.GameHeight / 1.5) {
        return new Point(x, y);
    }

    /**
     * 创建圆圈
     * @param {Object} point - 圆心点
     * @param {number} radius - 半径
     * @returns {Object} 圆圈对象
     */
    createCircle(point, radius) {
        return new Circle(point, radius);
    }

    /**
     * 创建切断点
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {Array} blockArrID - 区块ID数组
     * @returns {Object} 切断点对象
     */
    createCutOffPoint(x, y, blockArrID) {
        return new CutOffPoint(x, y, blockArrID);
    }

    /**
     * 获取前一个区块
     * @param {number} index - 索引
     * @returns {Object} 前一个区块
     */
    getPreBlock(index) {
        if (index == 0) {
            return this.blocks[0]
        }
        return this.blocks[index - 1];
    }

    /**
     * 获取下一个区块
     * @param {Object} currentCutOffPoint - 当前切断点
     * @returns {Object} 下一个区块
     */
    getNextBlock(currentCutOffPoint) {
        for (let i = 0; i < currentCutOffPoint.blocks.length; i++) {
            const blockId = currentCutOffPoint.blocks[i];
            if (blockId !== this.currentBlock.keyId) {
                return this.getBlockByKeyId(blockId);
            }
        }
        return null;
    }

    /**
     * 根据ID获取区块
     * @param {number} id - 区块ID
     * @returns {Object} 区块对象
     */
    getBlockByKeyId(id) {
        return this.blocks.find(block => block.keyId === id);
    }

    /**
     * 获取下一个点
     * @param {Object} preCircle - 前一个圆圈
     * @param {number} radius - 半径
     * @param {number} angle - 角度
     * @returns {Object} 包含下一个点和切断点的对象
     */
    getNextPoint(preCircle, radius, angle = 0) {
        const sin = Math.sin(Math.PI * angle / 180);
        const cos = Math.cos(Math.PI * angle / 180);

        const dis = preCircle.radius + radius - preCircle.border;
        const x = sin * dis;
        const y = -cos * dis;

        const cutOffDis = preCircle.radius;
        const cutOffX = sin * cutOffDis;
        const cutOffY = -cos * cutOffDis;

        return {
            nextPoint: new Point(preCircle.point.currX + x, preCircle.point.currY + y),
            cutOffPoint: new Point(preCircle.point.currX + cutOffX, preCircle.point.currY + cutOffY)
        };
    }

    /**
     * 创建区块
     * @param {Object} planet - 星球对象
     * @param {number} index - 索引
     * @returns {Object} 区块对象
     */
    createBlock(planet, index) {
        if (this.blocks.length) {
            var pointObj = this.getNextPoint(this.getLastBlock().circle, planet.radius, planet.angle);
            var point = pointObj.nextPoint;
            var circle = this.createCircle(point, planet.radius);
        } else {
            var point = this.createPoint();
            var circle = this.createCircle(point, planet.radius);
        }

        var block = new Block(circle, point, '', planet, index);

        if (index > 0) {
            var preBlock = this.getPreBlock(index);

            if (!preBlock) return;
            var _cutOffPoint = this.createCutOffPoint(pointObj.cutOffPoint.currX, pointObj.cutOffPoint.currY, [preBlock.keyId, block.keyId]);

            preBlock.addCutOffPoints(_cutOffPoint);
            block.addCutOffPoints(_cutOffPoint);
        }

        this.blocks.push(block);
        return block;
    }

    /**
     * 初始化背景
     */
    initBackground() {
        const backGround = new BackGround('res/rewards/bg.png', '', 2 * window.devicePixelRatio);
        this.addChild(backGround);
        this._backGround = backGround;
    }
}

/**
 * 背景类
 * 负责滚动的背景效果
 */
class BackGround extends Laya.Sprite {
    /**
     * 构造函数
     * @param {string} url - 背景图片URL
     * @param {string} url2 - 第二张背景图片URL
     * @param {number} speed - 滚动速度
     */
    constructor(url, url2, speed = 1) {
        super();

        this.width = gameConfig.GameWidth;
        this.height = gameConfig.GameHeight;
        this.speed = speed;
        this.url = url;
        this.url2 = url2 || url;

        this.init();
    }

    /**
     * 初始化背景
     */
    init() {
        this.renderBg();
        this.renderCycleBg();
        this.start();
    }

    /**
     * 渲染静态背景
     */
    renderBg() {
        const bgImg = new Laya.Image();
        bgImg.skin = this.url;

        const height = bgImg.height;
        const width = bgImg.width;

        bgImg.width = gameConfig.GameWidth;
        bgImg.height = gameConfig.GameWidth / (width / height);

        this.staticImgHeight = bgImg.height;
        this.y = gameConfig.GameHeight - this.staticImgHeight;
        this.addChild(bgImg);
    }

    /**
     * 渲染循环背景
     */
    renderCycleBg() {
        const bgImg = new Laya.Image();
        bgImg.skin = this.url2;

        const height = bgImg.height;
        const width = bgImg.width;

        bgImg.width = gameConfig.GameWidth;
        bgImg.height = gameConfig.GameWidth / (width / height);

        this.bgImgHeight = -bgImg.height;
        bgImg.y = this.bgImgHeight + 1;
        this.addChild(bgImg);
    }

    /**
     * 背景动画
     */
    animation() {
        if (this.y >= this.staticImgHeight) {
            this.y = 0;
        }
        this.y += this.speed;
    }

    /**
     * 停止动画
     */
    stop() {
        Laya.timer.clear(this, this.animation);
    }

    /**
     * 启动动画
     */
    start() {
        Laya.timer.frameLoop(1, this, this.animation);
    }
}

// 导出Rewards类
export default Rewards;