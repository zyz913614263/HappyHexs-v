// 导入依赖模块
import { gameConfig } from "./config.js";
import { syncGameData } from './api.js';
import { strlen, getSig } from './util.js';
import Score from './score.js';

//const util = __webpack_require__(2);
//const Score = __webpack_require__(40);

// 游戏常量
const SPEED = 1;
const X = -40;
const Y = 12;

/**
 * 坐标系统类
 * 负责管理游戏UI界面和游戏数据
 */
class Coordinate extends Laya.Sprite {
    constructor() {
        super();

        this.x = X * window.devicePixelRatio;
        this.y = Y * window.devicePixelRatio;

        this.resetNumber();
        this.init();
    }

    /**
     * 重置所有数据
     */
    reset() {
        this.resetNumber();
        this.drawEnergeNumber(0);
        this.drawNumber(0);
        this.changeProcess(0);
    }

    /**
     * 重置数字数据
     */
    resetNumber() {
        this.lightYear = 100;        // 光年数
        this.score = 0;              // 分数
        this.energeNum = 0;          // 能量宝石数量
        this.maxCombo = 0;           // 最大连击数
        this.rewardEnergeNum = 0;    // 奖励能量宝石数量
        this.maxBaoshi = 10;         // 最大宝石数量
    }

    /**
     * 初始化界面
     */
    init() {
        this.renderBar();           // 渲染背景栏
        this.renderKuang();         // 渲染分数框
        this.renderKuang2();        // 渲染能量框
        this.renderProcess(0);      // 渲染进度条
        this.renderFen();           // 渲染"分"字
        this.renderBs();            // 渲染"宝石"字
        this.initNumberSp();        // 初始化数字精灵
    }

    /**
     * 初始化数字精灵
     */
    initNumberSp() {
        // 分数显示精灵
        this.txtSp = new Laya.Sprite();
        this.addChild(this.txtSp);
        this.txtSp.pos((67 + 226 / 2) * window.devicePixelRatio, 8 * window.devicePixelRatio);
        this.drawNumber(this.score);

        // 能量数量显示精灵
        this.numberSp = new Laya.Sprite();
        this.addChild(this.numberSp);
        this.numberSp.pos((215 + 226 / 2) * window.devicePixelRatio, 8 * window.devicePixelRatio);
        this.drawEnergeNumber(this.energeNum + this.rewardEnergeNum);
    }

    /**
     * 添加能量数量
     */
    addEnergyNum(value) {
        this.energeNum += value;
        this.drawEnergeNumber(this.energeNum + this.rewardEnergeNum);
        this.changeProcess(this.energeNum);
    }

    /**
     * 添加奖励能量数量
     */
    addRewardEnergyNum(value) {
        this.rewardEnergeNum += value;
        this.drawEnergeNumber(this.energeNum + this.rewardEnergeNum);
    }

    /**
     * 绘制能量数量
     */
    drawEnergeNumber(num) {
        this.numberSp.graphics.clear();
        const numStr = num.toString().split('');

        for (let i = numStr.length - 1; i > -1; i--) {
            this.numberSp.graphics.loadImage(
                `${gameConfig.LOCAL_URL}/bar_num/${numStr[i]}.png`,
                (i - 0.5) * 12 * window.devicePixelRatio,
                12 * window.devicePixelRatio,
                16 / 1.5 * window.devicePixelRatio,
                21 / 1.5 * window.devicePixelRatio
            );
        }
    }

    /**
     * 绘制分数
     */
    drawNumber(num) {
        this.txtSp.graphics.clear();
        const numStr = num.toString().split('');

        for (let i = numStr.length - 1; i > -1; i--) {
            this.txtSp.graphics.loadImage(
                `${gameConfig.LOCAL_URL}/bar_num/${numStr[i]}.png`,
                (i - numStr.length + 0.5) * 12 * window.devicePixelRatio,
                12 * window.devicePixelRatio,
                16 / 1.5 * window.devicePixelRatio,
                21 / 1.5 * window.devicePixelRatio
            );
        }
    }

    /**
     * 渲染背景栏
     */
    renderBar() {
        const bgImg = new Laya.Image();
        bgImg.skin = `${gameConfig.LOCAL_URL}/bar/bar1.png`;

        bgImg.width = gameConfig.GameWidth;
        bgImg.height = gameConfig.GameWidth * 130 / 750;
        bgImg.x = -this.x;
        bgImg.y = -this.y;
        this.barHeight = bgImg.height;

        this.addChild(bgImg);
    }

    /**
     * 渲染分数框
     */
    renderKuang() {
        const bgImg = new Laya.Image();
        bgImg.skin = `${gameConfig.LOCAL_URL}/bar/kuang2.png`;

        bgImg.width = 157 / 2 * window.devicePixelRatio;
        bgImg.height = 67 / 1.8 * window.devicePixelRatio;
        bgImg.x = 240 * window.devicePixelRatio;
        bgImg.y = 8 * window.devicePixelRatio;

        this.addChild(bgImg);
    }

    /**
     * 改变进度条
     */
    changeProcess(num) {
        const percent = num % this.maxBaoshi / this.maxBaoshi;
        const width = 157 / 2.8 * window.devicePixelRatio;

        this.processImg.width = width * percent;
        this.processTxt.text = Math.round(percent * 100) + '%';

        if (percent === 0 && num > 0) {
            window._Event.emit('play_reward');
        }
    }

    /**
     * 渲染进度条
     */
    renderProcess(percent) {
        const bgImg = new Laya.Image();
        bgImg.skin = `${gameConfig.LOCAL_URL}/bar/process.png`;

        const width = 157 / 2.8 * window.devicePixelRatio;
        const height = 67 / 3 * window.devicePixelRatio;
        const x = 250 * window.devicePixelRatio;
        const y = 15.5 * window.devicePixelRatio;

        bgImg.width = width * percent;
        bgImg.height = height;
        bgImg.x = x;
        bgImg.y = y;

        this.processImg = bgImg;

        const text = new Laya.Text();
        text.overflow = Laya.Text.HIDDEN;
        text.color = "#a9fbff";
        text.fontSize = 12 * window.devicePixelRatio;
        text.text = percent * 100 + '%';
        text.width = width;
        text.height = height;
        text.align = 'center';
        text.valign = 'middle';
        text.x = x + 2 * window.devicePixelRatio;
        text.y = y;
        text.bold = true;

        this.processTxt = text;
        this.addChild(bgImg);
        this.addChild(text);
    }

    /**
     * 渲染能量框
     */
    renderKuang2() {
        const bgImg = new Laya.Image();
        bgImg.skin = `${gameConfig.LOCAL_URL}/bar/kuang2.png`;

        bgImg.width = 157 / 1.8 * window.devicePixelRatio;
        bgImg.height = 67 / 1.8 * window.devicePixelRatio;
        bgImg.x = 105 * window.devicePixelRatio;
        bgImg.y = 8 * window.devicePixelRatio;

        this.addChild(bgImg);
    }

    /**
     * 渲染"分"字
     */
    renderFen() {
        const bgImg = new Laya.Image();
        bgImg.skin = `${gameConfig.LOCAL_URL}/bar/fen.png`;

        bgImg.width = 56 / 1.8 * window.devicePixelRatio;
        bgImg.height = 26 / 1.8 * window.devicePixelRatio;
        bgImg.x = 70 * window.devicePixelRatio;
        bgImg.y = 20 * window.devicePixelRatio;

        this.addChild(bgImg);
    }

    /**
     * 渲染"宝石"字
     */
    renderBs() {
        const bgImg = new Laya.Image();
        bgImg.skin = `${gameConfig.LOCAL_URL}/bar/baoshi.png`;

        bgImg.width = 56 / 1.8 * window.devicePixelRatio;
        bgImg.height = 26 / 1.8 * window.devicePixelRatio;
        bgImg.x = 205 * window.devicePixelRatio;
        bgImg.y = 20 * window.devicePixelRatio;

        this.addChild(bgImg);
    }

    /**
     * 渲染当前值显示
     */
    renderCurrentValue() {
        const imgHeight = 10 / 1.2 * window.devicePixelRatio;
        const currentValueSprite = new Laya.Sprite();
        currentValueSprite.graphics.loadImage(
            'https://wximg.qq.com/wxgame/temp/603acedb3258ff82fac99d109efcb504.png',
            1 * window.devicePixelRatio,
            0,
            15 / 1.2 * window.devicePixelRatio,
            imgHeight
        );
        this.currentValueSprite = currentValueSprite;

        this.currentValueTxtNode = this.renderCurrentValueTxt(this.lightYear + '光年');
        this.currentValueSprite.addChild(this.currentValueTxtNode);

        this.currentValueSprite.y = this.barHeight - imgHeight < 0 ? 0 : this.barHeight - imgHeight;

        this.addChild(currentValueSprite);
    }

    /**
     * 渲染当前值文本
     */
    renderCurrentValueTxt(txt) {
        const text = new Laya.Text();
        text.overflow = Laya.Text.HIDDEN;
        text.color = "#0f9d9d";
        text.fontSize = 14 * window.devicePixelRatio;
        text.text = txt;
        text.x = 15 * window.devicePixelRatio;
        text.y = -5 * window.devicePixelRatio;
        return text;
    }

    /**
     * 添加光年
     */
    addLightYear(value) {
        this.lightYear += 1;
    }

    /**
     * 获取光年数
     */
    getLightYear() {
        return this.lightYear;
    }

    /**
     * 渲染分数栏
     */
    renderScoreBar() {
        const imgHeight = 10 / 1.2 * window.devicePixelRatio;
        const scoreBarSprite = new Laya.Sprite();
        scoreBarSprite.graphics.loadImage(
            'https://wximg.qq.com/wxgame/temp/d280e68306db5d38c0215b914156578a.png',
            0,
            -30 * window.devicePixelRatio,
            113 / 2 * window.devicePixelRatio,
            6 * window.devicePixelRatio
        );

        this.scoreBarSprite = scoreBarSprite;

        this.scoreTxtNode = this.renderScoreTxt(this.score);
        scoreBarSprite.addChild(this.scoreTxtNode);
        this.addChild(scoreBarSprite);
    }

    /**
     * 添加分数
     */
    addScore(value) {
        this.score += value || 1;
        this.drawNumber(this.score);
    }

    /**
     * 设置连击数
     */
    setCombo(value) {
        if (this.maxCombo < value) {
            this.maxCombo = value;
        }
    }

    /**
     * 上传分数到服务器
     */
    uploadScore() {
        const data = [{
            key: 'newscore',
            value: this.score
        }, {
            key: 'level',
            value: this.lightYear
        }, {
            key: 'baoshi',
            value: this.energeNum + this.rewardEnergeNum
        }, {
            key: 'combo',
            value: this.maxCombo
        }];

        const params = {
            appid: 'wx7a727ff7d940bb3f',
            game_behav_list: data,
            sync_type: window._pk_user_game_id ? 2 : 1,
            sig: getSig(data),
            use_time: Math.ceil((Date.now() - this.use_time) / 1000)
        };

        if (window._pk_user_game_id) {
            params.user_game_id = window._pk_user_game_id;
        }

        syncGameData(params).then(res => {
            if (res.errcode !== 0) {
                wx.getNetworkType({
                    success: (res) => {
                        if (res.networkType === 'none') {
                            return;
                        }
                        wx.showModal({
                            title: '温馨提示',
                            content: '分数提交失败，服务器开小差啦' + (res.errcode || ''),
                            showCancel: false
                        });
                    }
                });
            }
            console.log(res);
        }).catch(res => {
            wx.showModal({
                title: '温馨提示',
                content: '网络忙，请稍后再试' + res,
                showCancel: false
            });
        });
    }

    /**
     * 获取分数
     */
    getScore() {
        return this.score;
    }

    /**
     * 渲染分数文本
     */
    renderScoreTxt(txt) {
        const text = new Laya.Text();
        text.overflow = Laya.Text.HIDDEN;
        text.color = "#0f9d9d";
        text.fontSize = 14 * window.devicePixelRatio;
        text.text = txt;
        text.x = 0 * window.devicePixelRatio;
        text.y = -50 * window.devicePixelRatio;
        return text;
    }
}

export default Coordinate;