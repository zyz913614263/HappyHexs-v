
import { getFriendRank, createPkRoom, reportPKRank, app } from './api.js';
import { loadCircleImage, getSig } from './util.js';
import musicInstance from './music.js';
import { drawShareCanvas } from './sharecanvas.js';
import { gameConfig } from './config.js';


var music = musicInstance;

var color = '#116bb0';
var selectColor = '#3bc2cf';

var margin = 40 * window.devicePixelRatio;

/*https://wximg.qq.com/wxgame/bottlefly/xingji/rank/kuang.png
https://wximg.qq.com/wxgame/bottlefly/xingji/rank/back.png
https://wximg.qq.com/wxgame/bottlefly/xingji/rank/bg.png
https://wximg.qq.com/wxgame/bottlefly/xingji/rank/replay.png*/

class Rank extends Laya.Sprite {

    constructor(scores, arrayData, resultPanel) {
        super();

        this.scores = scores;
        this.arrayData = arrayData;
        this.result = resultPanel;
        this.width = gameConfig.GameWidth - margin;
        this.height = gameConfig.GameHeight - margin;
        this.arrayData = arrayData;
        this.initUI();
    }

    initUI() {
        this.renderBg();
        this.renderBack();
        this.renderReplay();
        this.renderRankBg();
        this.setupRank();
        this.renderData();
        this.addTitle();
        this.renderTextSp();
        this.createText(this.scores.newscore);
    }
    refresh(scores, arrayData) {
        this.scores = scores;
        this.arrayData = arrayData;
        this.renderData();
        this.createText(this.scores.newscore);
        this.baoshiTab.color = color;
        this.comboTab.color = color;
        this.rankTab.color = selectColor;

        this.visible = true;
    }
    renderMySelf() {
        if (!this.selfUserInfo) return;
        if (this._hasRenderSelf) return;

        var mySprite = new Laya.Sprite();

        loadCircleImage(this.selfUserInfo.head_img_url || 'res/default_head.png', mySprite, 60 * window.devicePixelRatio, 60 * window.devicePixelRatio);

        var label1 = new Laya.Label();
        label1.text = this.selfUserInfo.nick_name;
        label1.fontBold = true;
        label1.fontSize = 14 * window.devicePixelRatio;
        label1.color = '#82b9c7';
        label1.x = (gameConfig.GameWidth - label1.width) / 2;
        label1.y = 90 * window.devicePixelRatio;

        mySprite.x = (this.width - 40 * window.devicePixelRatio) / 2 + 10 * window.devicePixelRatio;
        mySprite.y = 20 * window.devicePixelRatio;

        this._hasRenderSelf = true;
        this.addChild(label1);
        this.addChild(mySprite);
    }
    renderTextSp() {
        this.txtSp = new Laya.Sprite();

        this.addChild(this.txtSp);
    }
    createText(num) {
        var width = 5;

        this.txtSp.graphics.clear();
        var numStr = num.toString().split('');
        for (var i = 0; i < numStr.length; i++) {
            this.txtSp.graphics.loadImage(`${gameConfig.LOCAL_URL}/result_score_num/${numStr[i]}.png`, (194 / 2 + i * 15) * window.devicePixelRatio, 0, 27 / 2 * window.devicePixelRatio, 42 / 2 * window.devicePixelRatio);
            width += 5;
        }

        this.txtSp.graphics.loadImage(`${gameConfig.LOCAL_URL}/result/defen.png`, -5 * window.devicePixelRatio, -2 * window.devicePixelRatio, 194 / 2 * window.devicePixelRatio, 47 / 2 * window.devicePixelRatio);

        this.txtSp.pos((165 - width) * window.devicePixelRatio, 120 * window.devicePixelRatio);
    }
    renderBg() {
        this.graphics.loadImage(`${gameConfig.LOCAL_URL}/bg1.png`, 0, 0, gameConfig.GameWidth, gameConfig.GameWidth * (1500 / 443));
    }
    renderBack() {
        var backBtn = new Laya.Sprite();
        var width = 68 / 1.8 * window.devicePixelRatio;
        backBtn.graphics.loadImage(`${gameConfig.LOCAL_URL}/rank/back.png`, 0, 0, width, width);
        this.addChild(backBtn);
        backBtn.pos(10 * window.devicePixelRatio, 20 * window.devicePixelRatio);
        backBtn.height = width;
        backBtn.width = width;
        backBtn.on('click', this, function () {
            music.playBtn();
            this.visible = false;
        });
    }
    addTitle() {
        var scoreTab = new Laya.Sprite();

        var scoreText = new Laya.Text();
        scoreText.overflow = Laya.Text.HIDDEN;
        scoreText.color = selectColor;
        scoreText.fontSize = 14 * window.devicePixelRatio;
        scoreTab.x = (gameConfig.GameWidth - scoreText.width) / 2 - 160 * window.devicePixelRatio;
        scoreTab.y = 170 * window.devicePixelRatio;
        scoreTab.height = 35 * window.devicePixelRatio;
        scoreTab.width = 90 * window.devicePixelRatio;

        scoreText.text = '排行榜';
        this.addChild(scoreTab);
        scoreText.pos(30 * window.devicePixelRatio, 10 * window.devicePixelRatio);
        // scoreTab.graphics.drawRect(0 ,0, 90, 35, 'red');
        this.rankTab = scoreText;
        scoreTab.addChild(scoreText);
        this.addLine();
        this.addLine2();
        this.addTitle1();
        this.addTitle2();
        scoreTab.on('mousedown', this, function () {
            music.playBtn();
            this.baoshiTab.color = color;
            this.comboTab.color = color;
            this.rankTab.color = selectColor;
            this.selectData('newscore');
        });
    }
    addLine() {
        var sp = new Laya.Sprite();
        sp.graphics.drawLine(150 * window.devicePixelRatio, 173 * window.devicePixelRatio, 150 * window.devicePixelRatio, 198 * window.devicePixelRatio, color, 1 * window.devicePixelRatio);
        this.addChild(sp);
    }
    addLine2() {
        var sp = new Laya.Sprite();
        sp.graphics.drawLine(270 * window.devicePixelRatio, 173 * window.devicePixelRatio, 270 * window.devicePixelRatio, 198 * window.devicePixelRatio, color, 1 * window.devicePixelRatio);
        this.addChild(sp);
    }
    addTitle1() {
        var scoreTab = new Laya.Sprite();

        var scoreText = new Laya.Text();
        scoreText.overflow = Laya.Text.HIDDEN;
        scoreText.color = color;
        scoreText.fontSize = 14 * window.devicePixelRatio;
        scoreTab.x = (gameConfig.GameWidth - scoreText.width) / 2 - 55 * window.devicePixelRatio;
        scoreTab.y = 170 * window.devicePixelRatio;
        scoreTab.height = 35 * window.devicePixelRatio;
        scoreTab.width = 100 * window.devicePixelRatio;
        scoreText.text = 'COMBO';
        scoreText.pos(30 * window.devicePixelRatio, 10 * window.devicePixelRatio);
        // scoreTab.graphics.drawRect(0 ,0, 110, 35, 'red');
        scoreTab.addChild(scoreText);
        this.addChild(scoreTab);

        this.comboTab = scoreText;

        scoreTab.on('mousedown', this, function () {
            music.playBtn();
            this.baoshiTab.color = color;
            this.comboTab.color = selectColor;
            this.rankTab.color = color;
            this.selectData('combo');
        });
    }
    addTitle2() {
        var scoreTab = new Laya.Sprite();
        var scoreText = new Laya.Text();
        scoreText.overflow = Laya.Text.HIDDEN;
        scoreText.color = color;
        scoreText.fontSize = 14 * window.devicePixelRatio;
        scoreText.text = '宝石';
        scoreText.pos(20 * window.devicePixelRatio, 10 * window.devicePixelRatio);
        scoreTab.x = (gameConfig.GameWidth - scoreText.width) / 2 + 95 * window.devicePixelRatio;
        scoreTab.y = 170 * window.devicePixelRatio;
        scoreTab.width = 80 * window.devicePixelRatio;
        scoreTab.height = 30 * window.devicePixelRatio;

        scoreTab.addChild(scoreText);
        this.addChild(scoreTab);
        this.baoshiTab = scoreText;

        scoreTab.on('mousedown', this, function () {
            music.playBtn();
            this.baoshiTab.color = selectColor;
            this.comboTab.color = color;
            this.rankTab.color = color;
            this.selectData('baoshi');
        });
    }
    renderReplay() {
        var backBtn = new Laya.Image();

        backBtn.skin = `${gameConfig.LOCAL_URL}/rank/replay.png`;
        backBtn.pos((gameConfig.GameWidth - 319 / 10 * window.devicePixelRatio) / 1.8, 670 * window.devicePixelRatio);
        backBtn.width = 319 / 2 * window.devicePixelRatio;
        backBtn.height = 117 / 2 * window.devicePixelRatio;
        backBtn.on('click', this, function () {
            music.playBtn();
            this.result.reStart();
            this.visible = false;
        });
        this.addChild(backBtn);

        this.renderShare();
    }
    renderShare() {
        var backBtn = new Laya.Image();

        backBtn.skin = `${gameConfig.LOCAL_URL}/rank/share.png`;
        backBtn.pos((gameConfig.GameWidth - 2 * 319 / 2 * window.devicePixelRatio) / 2, 670 * window.devicePixelRatio);
        backBtn.width = 319 / 2 * window.devicePixelRatio;
        backBtn.height = 117 / 2 * window.devicePixelRatio;
        backBtn.on('click', this, function () {
            this.shareFunc();
        });
        this.addChild(backBtn);
    }
    shareFunc() {
        music.playBtn();
        if (!wx.shareAppMessage) {
            return;
        }
        window._shareInfo.imageUrl = drawShareCanvas({
            score: this.scores.newscore || 0,
            energeNum: this.scores.baoshi || 0,
            maxCombo: this.scores.combo || 0,
            percent: this.result.getRankPercent(this.scores.newscore) || 0
        });
        window._shareInfo.title = '星途，穿越未知银河道途';
        window._shareInfo.query = 'modal=qun';
        wx.shareAppMessage(window._shareInfo);
    }
    renderRankBg() {
        var sp = new Laya.Sprite();
        sp.graphics.loadImage(`${gameConfig.LOCAL_URL}/kuang2.png`, 20 * window.devicePixelRatio, 140 * window.devicePixelRatio, 485 / 1.3 * window.devicePixelRatio, 698 / 1.4 * window.devicePixelRatio);
        this.addChild(sp);
    }
    setupRank() {
        var list = new Laya.List();

        list.itemRender = Laya.Item;
        list.repeatX = 1;
        list.repeatY = 7;

        //list.x = (Laya.stage.width - WID) / 2;
        //list.y = (Laya.stage.height - HEI * list.repeatY) / 2;

        // 使用但隐藏滚动条
        list.vScrollBarSkin = "";

        list.selectEnable = true;
        //list.selectHandler = new Laya.Handler(this, onSelect);

        list.renderHandler = new Laya.Handler(this, this.updateItem);

        this.addChild(list);
        this.list = list;
        list.x = 50 * window.devicePixelRatio;
        list.y = 205 * window.devicePixelRatio;

        this.addRankInfo();
    }
    addRankInfo() {
        var scoreText = new Laya.Text();
        scoreText.overflow = Laya.Text.HIDDEN;
        scoreText.color = '#3b68b1';
        scoreText.fontSize = 12 * window.devicePixelRatio;
        scoreText.text = '只显示前50位好友成绩';
        scoreText.pos((gameConfig.GameWidth - scoreText.width) / 2, 635 * window.devicePixelRatio);
        this.addChild(scoreText);
    }
    renderData() {
        var _this2 = this;

        var that = this;
        /*this.arrayData = [{
            index: 1,
            score: 11111,
            nick: 'addyxu',
            src: 'https://wx.qlogo.cn/mmhead/PiajxSqBRaEIGx42OM7opSuBQJ7fr8ic9tWotCNua7nL0OpJO6qbFt1Q/0',
         }]*/
        if (this.arrayData) {
            this.rankData = this.arrayData.user_multi_rank || {};
            this.selectData();
            return;
        }
        getFriendRank({
            appid: gameConfig.APPID,
            rank_key_list: ['newscore', 'combo', 'baoshi']
        }).then(function (res) {
            if (res.errcode === 0) {
                _this2.rankData = res.data ? res.data.user_multi_rank || {} : {};
                _this2.selectData();
            } else {
                _this2.rankData = {};
                wx.getNetworkType({
                    success: function success(res) {
                        // 返回网络类型, 有效值：
                        // wifi/2g/3g/4g/unknown(Android下不常见的网络类型)/none(无网络)
                        var txt = '服务器开小差啦，请稍后查看排行榜哦' + (res.errcode || '');
                        if (res.networkType === 'none') {
                            txt = '当前无网络，请联网再查看哦';
                        }
                        wx.showModal({
                            title: '温馨提示',
                            content: txt,
                            showCancel: false
                        });
                    }
                });
            }
        }).catch(function (res) {
            wx.showModal({
                title: '温馨提示',
                content: '网络忙，请稍后再试' + res,
                showCancel: false
            });
        });
    }
    findData(data, key) {
        for (var i = 0; i < data.length; i++) {
            if (data[i].key === key) {
                return data[i];
            }
        }
    }
    selectData(key) {

        key = key || 'newscore';
        var data = [];

        if (!this.rankData) return;
        if (!this.rankData.rank_list) return;

        this.list.array = [];

        this.userinfoObj = this.userinfoObj || this.getUserInfoByUid(this.rankData.user_info_list);
        var i = 1;

        var list = this.findData(this.rankData.rank_list, key) || {};
        var self_rank_item = list.self_rank_item || {};
        var uid = app.session().userId;

        this.selfUserInfo = this.userinfoObj[self_rank_item.user_id || uid];

        var ranklist = list.rank_item_list;
        ranklist = this.parseList(ranklist, uid, this.scores[key], list.self_rank_item);

        var that = this;
        ranklist.forEach(function (it) {
            var user = that.getUserInfoByid(it.user_id);
            var temp = {
                index: it.index || i++,
                score: it.value + that.getDanWeiByKey(key),
                nick: strlen(user.nick_name || '', 18),
                src: (user.head_img_url || '').replace(/\/0$/, '/64') || 'res/default_head.png'
            };
            data.push(temp);
        });
        this.renderMySelf();
        this.list.array = data;
        this.list.tweenTo(0, 0);
    }
    getUserInfoByid(id) {
        return this.userinfoObj[id] || {};
    }
    getDanWeiByKey(key) {
        if (key === 'newscore') {
            return '分';
        } else if (key === 'combo') {
            return '次';
        } else if (key === 'baoshi') {
            return '个';
        }
    }
    parseList(list, uid, score, self_rank_item) {
        list = list || [];
        self_rank_item = self_rank_item || {};
        if (!this.selfUserInfo) return list;

        var flag = false;
        for (var i = 0; i < list.length; i++) {
            if (list[i].user_id === this.selfUserInfo.user_id) {
                flag = true;
                if (score > list[i].value) {
                    list[i].value = score;
                }
            }
        }

        if (!flag) {
            if (self_rank_item.value > score) {
                list.push(self_rank_item);
                self_rank_item.index = self_rank_item.rank;
            } else {
                list.push({
                    value: score,
                    user_id: uid,
                    rank: 1
                });
            }
        }

        return list.sort(function (a, b) {
            return b.value - a.value;
        });
    }
    getUserInfoByUid(list) {
        var obj = {};
        for (var i = 0; i < list.length; i++) {
            obj[list[i].user_id] = list[i];
        }
        return obj;
    }
    updateItem(cell, index) {
        cell.setData(cell.dataSource);
    }


}

export default Rank;
