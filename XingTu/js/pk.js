import { gameConfig, infoList } from "./config.js";
import musicInstance from "./music.js";
import { loadCircleImage, strlen } from "./util.js";
import { getFriendRank, getPkRoomInfo } from './api.js';
import { drawShareCanvas, createText, drawShareNumber } from './sharecanvas.js';


var music = musicInstance;

var color = '#116bb0';
var selectColor = '#3bc2cf';

var margin = 40 * window.devicePixelRatio;

class PkRank extends Laya.Sprite {
    constructor() {
        super();

        this.scores = {};
        this.width = gameConfig.GameWidth - margin;
        this.height = gameConfig.GameHeight - margin;
        this.visible = false;
        this.initUI();
    }

    initUI() {
        this.renderBg();
        this.renderBack();
        this.renderRankBg();
        this.setupRank();
        this.initSp();
        this.renderTextSp();
    }

    initSp() {
        this.replayBtn = new Laya.Image();
        this.replayBtn.width = 360 / 2 * window.devicePixelRatio;
        this.replayBtn.height = 122 / 2 * window.devicePixelRatio;
        this.addChild(this.replayBtn);

        this.timeInfoText = new Laya.Text();
        this.timeInfoText.overflow = Laya.Text.HIDDEN;
        this.timeInfoText.color = '#5fb8f7';
        this.timeInfoText.alpha = 0.6;
        this.timeInfoText.fontSize = 14 * window.devicePixelRatio;
        this.addChild(this.timeInfoText);

        this.noBodyTxt = new Laya.Text();
        this.noBodyTxt.overflow = Laya.Text.HIDDEN;
        this.noBodyTxt.color = '#5fb8f7';
        this.noBodyTxt.alpha = 0.6;
        this.noBodyTxt.fontSize = 14 * window.devicePixelRatio;
        this.addChild(this.noBodyTxt);

        this.tzTxt = new Laya.Text();
        this.addChild(this.tzTxt);
        this.tzTxt.overflow = Laya.Text.HIDDEN;
        this.tzTxt.color = '#4ddae8';
        this.tzTxt.fontSize = 14 * window.devicePixelRatio;

        this.nickTxt = new Laya.Text();
        this.nickTxt.fontBold = true;
        this.nickTxt.fontSize = 16 * window.devicePixelRatio;
        this.nickTxt.color = '#d0d1e6';
        this.nickTxt.y = 130 * window.devicePixelRatio;
        this.addChild(this.nickTxt);

        this.headSprite = new Laya.Sprite();
        this.addChild(this.headSprite);
    }

    initData(query, group_info, callback, scores) {
        this.room_id = query.room_id;
        this.share_user_openid = query.share_user_openid;
        this.group_info = group_info;
        this.callback = callback;
        this.scores = scores || {};
        this.zOrder = 10000;
        if (!scores) {
            this.arrayData = null;
        }
        this._hasRenderSelf = false;
        this.replayBtn.visible = false;
        this.replayBtn.offAll('click');
        this.headSprite.removeChildren(0, 1);
        this.nickTxt.text = '';
        this.noBodyTxt.text = '';
        this.timeInfoText.text = '';
        this.tzTxt.text = '';
        this.txtSp.graphics.clear();
        this.renderData();
    }

    renderMySelf() {
        if (!this.selfUserInfo) return;
        if (this._hasRenderSelf) return;

        loadCircleImage(this.selfUserInfo.head_img_url || 'res/default_head.png', this.headSprite, 80 * window.devicePixelRatio, 80 * window.devicePixelRatio);

        this.nickTxt.text = this.selfUserInfo.nick_name + '发起的挑战';
        this.nickTxt.x = (gameConfig.GameWidth - this.nickTxt.width) / 2;

        this.headSprite.x = (this.width - 40 * window.devicePixelRatio) / 2;
        this.headSprite.y = 40 * window.devicePixelRatio;

        this._hasRenderSelf = true;
    }

    renderTextSp() {
        this.txtSp = new Laya.Sprite();
        this.addChild(this.txtSp);
    }

    createText(num) {
        var width = 0;

        this.txtSp.graphics.clear();
        var numStr = num.toString().split('');
        for (var i = 0; i < numStr.length; i++) {
            this.txtSp.graphics.loadImage(`${gameConfig.LOCAL_URL}/result_score_num/${numStr[i]}.png`, i * 30 * window.devicePixelRatio, 0, 27 * window.devicePixelRatio, 42 * window.devicePixelRatio);
            width += 30 * window.devicePixelRatio;
        }

        this.txtSp.pos((gameConfig.GameWidth - width) / 2, 240 * window.devicePixelRatio);
    }

    renderBg() {
        this.graphics.loadImage('res/bg1.png', 0, 0, gameConfig.GameWidth, gameConfig.GameWidth * (1500 / 443));
    }

    renderBack() {
        var backBtn = new Laya.Sprite();
        var width = 68 / 1.8 * window.devicePixelRatio;
        backBtn.graphics.loadImage('res/rank/back.png', 0, 0, width, width);
        this.addChild(backBtn);
        backBtn.pos(10 * window.devicePixelRatio, 20 * window.devicePixelRatio);
        backBtn.height = width;
        backBtn.width = width;
        backBtn.on('click', this, function () {
            music.playBtn();
            if (wx.exitMiniProgram) {
                wx.exitMiniProgram();
            } else {
                this.callback && this.callback();
                this.reStart();
                this.hideUI();
            }
        });
    }

    hideUI() {
        Laya.Tween.to(this, {
            alpha: 0
        }, 1000, Laya.Ease.linearNone, Laya.Handler.create(this, function () {
            this.visible = false;
            this.alpha = 1;
            window._GC();
        }));
    }

    renderReplay(flag, expire) {
        this.replayBtn.skin = expire ? 'res/pk/over.png' : flag ? 'res/rank/replay.png' : 'res/pk/tz.png';
        this.replayBtn.pos((gameConfig.GameWidth - 360 / 2 * window.devicePixelRatio) / 2, 330 * window.devicePixelRatio);
        this.replayBtn.visible = true;
        this.replayBtn.on('click', this, function () {
            if (expire) {
                return;
            }
            music.playBtn();
            this.callback && this.callback();
            this.reStart();
            window._pk_user_game_id = this.arrayData.pk_room_info.user_game_id;
            this.hideUI();
        });
    }

    renderRankBg() {
        var sp = new Laya.Sprite();
        sp.graphics.loadImage('res/pk/pkk.png', 12 * window.devicePixelRatio, 150 * window.devicePixelRatio, 742 / 1.9 * window.devicePixelRatio, 1012 / 1.9 * window.devicePixelRatio);
        this.addChild(sp);
    }

    setupRank() {
        this.list = new Laya.List();

        this.list.itemRender = Laya.Item;
        this.list.repeatX = 1;
        this.list.repeatY = 4;

        //this.list.x = (Laya.stage.width - WID) / 2;
        //this.list.y = (Laya.stage.height - HEI * this.list.repeatY) / 2;

        // 使用但隐藏滚动条
        this.list.vScrollBarSkin = "";

        this.list.selectEnable = true;
        //this.list.selectHandler = new Laya.Handler(this, onSelect);

        this.list.renderHandler = new Laya.Handler(this, this.updateItem);

        this.addChild(this.list);
        this.list.x = 50 * window.devicePixelRatio;
        this.list.y = 432 * window.devicePixelRatio;

        this.addRankInfo();
        this.addShareBtn();
    }

    addRankInfo() {
        var scoreText = new Laya.Image();
        scoreText.skin = 'res/pk/restart.png';
        scoreText.width = 318 * window.devicePixelRatio / 2;
        scoreText.height = 115 * window.devicePixelRatio / 2;
        scoreText.pos((gameConfig.GameWidth - scoreText.width) / 5, 675 * window.devicePixelRatio);
        scoreText.on('click', this, function () {
            music.playBtn();
            this.callback && this.callback();
            this.reStart();
            window._pk_user_game_id = null;
            this.hideUI();
        });
        scoreText.visible = false;
        this.addChild(scoreText);
        this.reStartBtn = scoreText;
    }

    addShareBtn() {
        var scoreText = new Laya.Image();
        scoreText.skin = 'res/pk/share.png';
        scoreText.width = 318 * window.devicePixelRatio / 2;
        scoreText.height = 115 * window.devicePixelRatio / 2;
        scoreText.pos((gameConfig.GameWidth - scoreText.width) / 1.2, 675 * window.devicePixelRatio);
        scoreText.on('click', this, function () {
            music.playBtn();
            if (!wx.shareAppMessage) {
                return;
            }
            wx.shareAppMessage(window._shareInfo);
        });
        scoreText.visible = false;
        this.addChild(scoreText);
        this.shareBtn = scoreText;
    }

    createShareInfo(my_score, leiZhuScore) {
        window._shareInfo.title = '不服来战';
        window._shareInfo.query = 'room_id=' + this.room_id;
        var config = {
            score: my_score || 0,
            energeNum: 0,
            maxCombo: 0,
            percent: 0
        };
        if (my_score >= leiZhuScore) {
            config.isSuccess = my_score > leiZhuScore;
            config.my_head_url = (this.userinfoObj[this.arrayData.pk_room_info.my_user_id] || {}).head_img_url || 'res/default_head.png';
            config.own_head_url = (this.selfUserInfo || {}).head_img_url || 'res/default_head.png';
        }
        this.loadHeadImage(config);
    }

    loadHeadImage(config) {
        if (config.my_head_url) {
            var img = [],
                flag = 0,
                mulitImg = [config.my_head_url, config.own_head_url];
            var imgTotal = mulitImg.length;
            for (var i = 0; i < imgTotal; i++) {
                img[i] = new Image();
                img[i].src = mulitImg[i];
                img[i].onload = function () {
                    //第i张图片加载完成
                    flag++;
                    if (flag == imgTotal) {
                        window._shareInfo.imageUrl = drawShareCanvas(config, 1);
                    }
                };
            }
        } else {
            window._shareInfo.imageUrl = drawShareCanvas(config, 1);
        }
    }

    reStart() {
        if (window.Main) {
            if (window.Main.startUpSprite) {
                console.error('deep start');
                window.Main.startUpSprite.startGame();
            } else {
                console.error('light start');
                window.Main.reStart();
            }

            if (window.Main.resultSprite) {
                window.Main.resultSprite.visible = false;
            }
            if (window.rankUI) {
                window.rankUI.visible = false;
            }
        }
    }

    addTimeInfo(time) {

        var d = new Date(time * 1000);
        this.timeInfoText.text = time * 1000 <= Date.now() ? '已过期' : '有效时间至 ' + this.fomateNum(d.getHours()) + ':' + this.fomateNum(d.getMinutes());
        this.timeInfoText.pos((gameConfig.GameWidth - this.timeInfoText.width) / 2, 400 * window.devicePixelRatio);
    }

    addNoBody() {
        this.noBodyTxt.text = '暂无人应战';
        this.noBodyTxt.pos((gameConfig.GameWidth - this.noBodyTxt.width) / 2, 500 * window.devicePixelRatio);
    }

    fomateNum(num) {
        return num > 9 ? num : '0' + num;
    }

    addTzInfo(leiZhuScore, myScore) {
        console.error(leiZhuScore, myScore);
        if (myScore > leiZhuScore) {
            this.tzTxt.text = '挑战成功';
        } else if (myScore === leiZhuScore) {
            this.tzTxt.text = '打成平手';
        } else {
            this.tzTxt.text = '挑战失败';
        }
        this.tzTxt.pos((gameConfig.GameWidth - this.tzTxt.width) / 2, 200 * window.devicePixelRatio);
    }

    renderData() {
        var _this2 = this;

        var that = this;
        if (this.arrayData) {
            this.rankData = this.arrayData.user_multi_rank;
            this.selectData();
            wx.hideLoading && wx.hideLoading();
            this.visible = true;
            return;
        }
        var data = {
            appid: 'wx7a727ff7d940bb3f',
            room_id: this.room_id,
            share_user_openid: this.share_user_openid
        };
        if (this.group_info) {
            data.group_info = this.group_info;
        }
        getPkRoomInfo(data).then(function (res) {
            wx.hideLoading && wx.hideLoading();
            if (res.errcode === 0) {
                console.error(res);
                if (!res.data.pk_room_info) {
                    _this2.visible = false;
                    _this2.callback && _this2.callback();
                    return;
                }
                _this2.arrayData = res.data;
                _this2.rankData = res.data ? res.data.user_multi_rank : {};
                _this2.selectData();
                _this2.visible = true;
            } else {
                _this2.rankData = {};
                var that = _this2;
                wx.showModal({
                    title: '温馨提示',
                    content: '获取PK数据失败,点击确定回到游戏' + res.errcode,
                    showCancel: false,
                    success: function success(res) {
                        if (res.confirm) {
                            that.callback && that.callback();
                            this.visible = false;
                        }
                    }
                });
            }
        }).catch(function (res) {
            console.error(res);
            _this2.visible = false;
            _this2.callback && _this2.callback();
            wx.hideLoading && wx.hideLoading();
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
        if (!this.rankData) return;

        key = key || 'newscore';
        var data = [];
        this.userinfoObj = this.userinfoObj || this.getUserInfoByUid(this.rankData.user_info_list);
        var i = 1;

        var list = this.findData(this.rankData.rank_list, key) || {};

        this.selfUserInfo = this.userinfoObj[this.arrayData.pk_room_info.creator_user_id];

        var ranklist = list.rank_item_list;
        var leiZhuScore = this.getLeizhuScore(ranklist);

        this.addTimeInfo(this.arrayData.pk_room_info.expire_time);

        if (this.arrayData.pk_room_info.creator_user_id !== this.arrayData.pk_room_info.my_user_id) {
            if (list.self_rank_item || typeof this.scores[key] !== 'undefined') {
                if (list.self_rank_item) {
                    var my_score = Math.max(list.self_rank_item.value, this.scores[key] || 0);
                    this.addTzInfo(leiZhuScore, my_score);
                    this.createShareInfo(my_score, leiZhuScore);
                } else {
                    this.addTzInfo(leiZhuScore, this.scores[key]);
                    this.createShareInfo(this.scores[key], leiZhuScore);
                }
                this.reStartBtn.visible = true;
                this.shareBtn.visible = true;
                this.reStartBtn.x = (gameConfig.GameWidth - this.reStartBtn.width) / 5;
            } else {
                this.reStartBtn.visible = true;
                this.shareBtn.visible = false;
                this.reStartBtn.x = (gameConfig.GameWidth - this.reStartBtn.width) / 2;
            }

            this.renderReplay(list.self_rank_item || typeof this.scores[key] !== 'undefined', this.arrayData.pk_room_info.expire_time * 1000 < Date.now());

            this.list.y = 432 * window.devicePixelRatio;
            this.timeInfoText.y = 400 * window.devicePixelRatio;
        } else {
            this.list.y = 352 * window.devicePixelRatio;
            this.timeInfoText.y = 330 * window.devicePixelRatio;
            this.reStartBtn.visible = true;
            this.shareBtn.visible = false;
            this.reStartBtn.x = (gameConfig.GameWidth - this.reStartBtn.width) / 2;
        }

        ranklist = this.parseList(ranklist, this.arrayData.pk_room_info.creator_user_id, this.scores[key]);
        var that = this;
        ranklist.forEach(function (it) {
            var user = that.getUserInfoByid(it.user_id);
            var temp = {
                index: it.index || i++,
                score: it.value + that.getDanWeiByKey(key),
                nick: strlen(user.nick_name || '', 12),
                src: (user.head_img_url || '').replace(/\/0$/, '/64') || 'res/default_head.png',
                status: it.value > leiZhuScore ? '成功' : it.value == leiZhuScore ? '平局' : '失败'
            };
            data.push(temp);
        });
        this.renderMySelf();
        if (!data.length) {
            this.addNoBody();
        }
        this.list.array = data;
        this.list.tweenTo(0, 0);
    }

    getUserInfoByid(id) {
        return this.userinfoObj[id] || {};
    }

    getLeizhuScore(list) {
        for (var i = 0; i < list.length; i++) {
            if (list[i].user_id === this.arrayData.pk_room_info.creator_user_id) {
                return list[i].value;
            }
        }
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

    parseList(list, create_uid, score) {
        list = list || [];
        if (!this.selfUserInfo) return list;

        var flag = false;
        for (var i = 0; i < list.length; i++) {
            if (list[i].user_id === this.arrayData.pk_room_info.my_user_id) {
                flag = true;
                if (score > list[i].value) {
                    list[i].value = score;
                }
            }
        }

        if (!flag && score !== undefined) {
            list.push({
                value: score,
                user_id: this.arrayData.pk_room_info.my_user_id,
                rank: 1
            });
        }

        var arr = [];
        for (var i = 0; i < list.length; i++) {
            if (list[i].user_id !== create_uid) {
                arr.push(list[i]);
            } else {
                this.createText(list[i].value);
            }
        }

        return arr.sort(function (a, b) {
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

export default PkRank;