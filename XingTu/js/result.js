
import { getFriendRank, createPkRoom, reportPKRank, app } from './api.js';
import Rank from './rank.js';
import { gameConfig } from './config.js';
import musicInstance from './music.js';
import { drawShareCanvas } from './sharecanvas.js';
import { getSig } from './util.js';



// 行星描述文本常量
const textObj = {
    'shui': '水星，Mercury，太阳系最小的行星。旅途才刚刚开始，别灰心重新来过。',
    'jin': '金星，Venus，夜空中最亮的星，等你去采撷',
    'di': '地球，Earth，唯一存在生命的的天体，人类最美的家园',
    'huo': '火星，Mars，荧荧火光，离离乱惑。不要被他所困，朝着目标进发吧',
    'mu': '木星，Jupiter，太阳系中最大的行星已被你飞越，不要停下探索的脚步',
    'tu': '土星，Saturn，仅次于木星的第二大行星，keep going',
    'tian': '天王星，Uranus，灰蓝色是他的代表色，也是你探索星空的幸运色',
    'hai': '海王星，Neptune，南半球上的大黑斑，与地球同样大小，加油',
    'ming': '冥王星，Pluto，2006年被降级为"矮行星"，但依然屹立于行星之林',
    'ceres': '谷神星，Ceres，虽然体内冰封刺骨，但仍爱你如故；别了，回不去的故土。'
};

const DEFAULT_TEXT = '千万年来，人类总试图解开宇宙运行的秘密，在不断地探索中，人类意识到需要走出地球，开启对未知宇宙的探索之旅。';
var margin = 40 * window.devicePixelRatio;

class Result extends Laya.Sprite {
    constructor(params) {
        super();

        this.width = gameConfig.GameWidth - margin;
        this.height = gameConfig.GameHeight - margin;

        this.score = params.score;
        this.qiuType = params.type;
        this.baoshi = params.baoshi;
        this.combo = params.combo;
        this.level = params.level;
        this.initUI();
    }

    initUI() {
        this.renderBg();
        this.renderStartBtn();
        //this.renderShareBtn();
        //this.renderRankBtn();
        this.renderShareText();
        this.bind();

        this.qiuSpParent = new Laya.Sprite();
        this.addChild(this.qiuSpParent);

        this.qiuSp = new Laya.Sprite();
        this.qiuSpParent.addChild(this.qiuSp);

        this.createRijiPanle();
        this.renderCombo();
        this.renderTextSp();
        this.renderBaoshi();
        this.addQiu();
        this.resetUI();
    }

    reset(params) {
        this.stop();
        this.score = params.score;
        this.qiuType = params.type;
        this.baoshi = params.baoshi;
        this.combo = params.combo;
        this.level = params.level;
        this.room_id = null;
        this.resetUI();
    }

    start() {
        Laya.timer.frameLoop(1, this, this.animation);
    }

    stop() {
        Laya.timer.clear(this, this.animation);
    }

    animation() {
        // 黑洞缩放动画
        this.qiuSp.rotation += 0.05;
    }

    resetUI() {
        this.renderQiu(this.qiuType);
        this.createText(this.score);
        this.createRijiText();
        this.drawNumber(this.baosiSp, this.baoshi || 0, 145 * window.devicePixelRatio, 480 * window.devicePixelRatio);
        this.drawNumber(this.comboSp, this.combo || 0, 320 * window.devicePixelRatio, 480 * window.devicePixelRatio);
        this.renderData();
    }

    renderData() {
        if (window._allFriendData) {
            this.renderFriendData(window._allFriendData);
            return;
        }
        getFriendRank({
            appid: gameConfig.APPID,
            rank_key_list: ['newscore', 'combo', 'baoshi']
        }).then(function (res) {
            if (res.errcode === 0) {
                _this2.renderFriendData(res.data);
            } else { }
        });
    }

    renderFriendData(data) {
        this.arrayData = data;
        var percent = this.getRankPercent(this.score) || 0;
        this.renderFriendTxt(percent);
        // Android低端机造成阻塞延时
        setTimeout(function () {
            try {
                window._shareInfo.imageUrl = drawShareCanvas({
                    score: this.score || 0,
                    energeNum: this.baoshi || 0,
                    maxCombo: this.combo || 0,
                    percent: percent || 0
                });
            } catch (ex) {
                window._shareInfo.imageUrl = gameConfig.PREFIX_URL + 'result/sharebanner2.png';
            }
        }.bind(this), 800);
        this.renderMySelf();
    }
    findData() {
        for (var i = 0; i < data.length; i++) {
            if (data[i].key === key) {
                return data[i];
            }
        }
    }
    getRankPercent(score) {
        if (!this.arrayData) return 0;
        if (!this.arrayData.user_multi_rank) return;
        var userinfoObj = this.getUserInfoByUid(this.arrayData.user_multi_rank.user_info_list);

        var Obj = this.findData(this.arrayData.user_multi_rank.rank_list, 'newscore') || {};

        var self_rank_item = Obj.self_rank_item || {};
        var uid = app.session().userId;
        this.self_user_info = userinfoObj[self_rank_item.user_id || uid] || {};

        var listObj = JSON.parse(JSON.stringify(Obj));
        var list = listObj.rank_item_list || [];

        if (!listObj.friend_play_cnt) {
            return 100;
        }
        var flag = false;
        for (var i = 0; i < list.length; i++) {
            if (list[i].user_id === this.self_user_info.user_id) {
                var flag = true;
                list[i].value = score;
            }
        }

        if (!flag) {
            list.push({
                value: score,
                user_id: this.self_user_info.user_id,
                rank: 1
            });
            listObj.friend_play_cnt += 1;
        }

        list = list.sort(function (a, b) {
            return b.value - a.value;
        });

        var rank = 0;
        for (var i = 0; i < list.length; i++) {
            rank++;
            if (list[i].user_id === this.self_user_info.user_id) {
                break;
            }
        }
        var friendTotal = listObj.friend_play_cnt;
        return Math.round((listObj.friend_play_cnt + 1 - rank) / friendTotal * 100);
    }
    renderFriendTxt(num) {
        if (this.percentSp) {
            this.percentSp.text = "您已超过" + num + '%的好友';
            this.percentSp.x = (gameConfig.GameWidth - this.percentSp.width) / 2;
            return;
        }
        var label1 = new Laya.Text();
        label1.text = "您已超过" + num + '%的好友';
        label1.fontBold = true;
        label1.fontSize = 14 * window.devicePixelRatio;
        label1.color = '#82b9c7';
        label1.x = (gameConfig.GameWidth - label1.width) / 2;
        label1.y = 300 * window.devicePixelRatio;
        this.addChild(label1);
        this.percentSp = label1;
    }
    getUserInfoByUid(list) {
        var obj = {};
        for (var i = 0; i < list.length; i++) {
            obj[list[i].user_id] = list[i];
        }
        return obj;
    }
    renderBg() {
        var sp = new Laya.Sprite();
        sp.graphics.loadImage(`${gameConfig.LOCAL_URL}/bg1.png`, 0, 0, gameConfig.GameWidth, gameConfig.GameWidth * (1500 / 443));
        this.addChild(sp);
    }
    addQiu() {
        this.tipsSp = new Laya.Text();
        this.tipsSp.fontSize = 16 * window.devicePixelRatio;
        this.tipsSp.color = '#2b93ca';
        this.tipsSp.width = (547 / 1.55 - 80) * window.devicePixelRatio;
        this.tipsSp.wordWrap = true;
        this.tipsSp.leading = 10 * window.devicePixelRatio;
        this.addChild(this.tipsSp);

        this.comboSp = new Laya.Sprite();
        this.addChild(this.comboSp);

        this.baosiSp = new Laya.Sprite();
        this.addChild(this.baosiSp);
    }
    renderQiu(type) {
        type = type || 'shui';
        this.qiuSp.rotation = 0;
        this.qiuSp.graphics.clear();
        var url;
        var x = -290,
            y = -470,
            width = 989;
        if (type.indexOf('out') > -1) {
            var x = -65,
                y = -270,
                width = 540;
            url = `${gameConfig.LOCAL_URL}/qiu/${type}.png`;
            this.qiuSp.graphics.loadImage(url, 0, 0, width * window.devicePixelRatio, width * window.devicePixelRatio);
            this.start();
        } else {
            url = gameConfig.PREFIX_URL + 'result/qiu/' + type + '.png';
            this.qiuSp.graphics.loadImage(url, 0, 0, width * window.devicePixelRatio, width * window.devicePixelRatio);
        }
        this.qiuSp.pivot(width * window.devicePixelRatio / 2, width * window.devicePixelRatio / 2);
        this.qiuSpParent.pos(width * window.devicePixelRatio / 2 + x * window.devicePixelRatio, width * window.devicePixelRatio / 2 + y * window.devicePixelRatio);
    }
    createText(num) {
        this.txtSp.graphics.clear();
        var width = 5;
        this.txtSp.graphics.loadImage(`${gameConfig.LOCAL_URL}/result_score_num/fen.png`, 15 * window.devicePixelRatio, -2 * window.devicePixelRatio, 51 / 1.5 * window.devicePixelRatio, 51 / 1.5 * window.devicePixelRatio);

        var numStr = num.toString().split('');
        for (var i = numStr.length - 1; i > -1; i--) {
            this.txtSp.graphics.loadImage(`${gameConfig.LOCAL_URL}/result_score_num/${numStr[i]}.png`, (i - numStr.length + 0.5) * 20 * window.devicePixelRatio, 0 * window.devicePixelRatio, 27 / 1.5 * window.devicePixelRatio, 42 / 1.5 * window.devicePixelRatio);
            width += 9;
        }
        this.txtSp.pos((177 + width) * window.devicePixelRatio, 255 * window.devicePixelRatio);
    }
    lightTab(tab) {
        tab.graphics.clear();
        tab.graphics.loadImage(gameConfig.PREFIX_URL + 'result/1.png', 0, 0, 160 * window.devicePixelRatio, 40 * window.devicePixelRatio);
    }
    changeTab(tab) {
        tab.graphics.clear();
        tab.graphics.loadImage(gameConfig.PREFIX_URL + 'result/2.png', 0, 0, 160 * window.devicePixelRatio, 40 * window.devicePixelRatio);
    }
    createRijiPanle() {
        var btn = new Laya.Sprite();
        var h = 214 / 1.15;
        btn.loadImage(`${gameConfig.LOCAL_URL}/result/concent-new.png`, 0, 0, 547 / 1.55 * window.devicePixelRatio, (389 / 2 + 30) * window.devicePixelRatio);

        this.addChild(btn);
        btn.x = 30 * window.devicePixelRatio;
        btn.y = 320 * window.devicePixelRatio;

        this.rijiSprite = btn;
        return btn;
    }
    renderBaoshi() {
        var img = new Laya.Sprite();
        img.loadImage(`${gameConfig.LOCAL_URL}/share/baoshi.png`, 0, 0, 258 / 1.8 * window.devicePixelRatio, 68 / 1.8 * window.devicePixelRatio);
        img.x = 55 * window.devicePixelRatio;
        img.y = 480 * window.devicePixelRatio;
        this.addChild(img);
    }
    renderCombo() {
        var img = new Laya.Sprite();
        img.loadImage(`${gameConfig.LOCAL_URL}/share/combo.png`, 0, 0, 258 / 1.8 * window.devicePixelRatio, 68 / 1.8 * window.devicePixelRatio);
        img.x = 215 * window.devicePixelRatio;
        img.y = 480 * window.devicePixelRatio;

        this.addChild(img);
    }
    drawNumber(sp, num, x, y) {
        sp.graphics.clear();
        var numStr = num.toString().split('');
        for (var i = numStr.length - 1; i > -1; i--) {
            sp.graphics.loadImage(`${gameConfig.LOCAL_URL}/bar_num/${numStr[i]}.png`, (i - numStr.length + 0.5) * 12 * window.devicePixelRatio, 12 * window.devicePixelRatio, 16 / 1.5 * window.devicePixelRatio, 21 / 1.5 * window.devicePixelRatio);
        }
        sp.pos(x + 5 * (numStr.length - 1), y);
    }
    createRijiText() {

        this.tipsSp.text = textObj[this.qiuType] || DEFAULT_TEXT;
        this.tipsSp.pos((gameConfig.GameWidth - this.tipsSp.width) / 2 + 5 * window.devicePixelRatio, 360 * window.devicePixelRatio);
    }
    renderTextSp() {
        this.txtSp = new Laya.Sprite();
        this.txtSp.pos(190 * window.devicePixelRatio, 255 * window.devicePixelRatio);
        this.addChild(this.txtSp);
    }
    renderStartBtn() {
        var btn = new Laya.Sprite();
        btn.loadImage(`${gameConfig.LOCAL_URL}/result/replay.png`, 0, 0, 185 / 1.8 * window.devicePixelRatio, 151 / 1.8 * window.devicePixelRatio);

        this.addChild(btn);

        var width = btn.getBounds().width;

        btn.x = (this.width - 185 / 2 * window.devicePixelRatio) / 2 + 15 * window.devicePixelRatio;
        btn.y = (530 + 50) * window.devicePixelRatio;

        this.btnSprite = btn;

        return btn;
    }
    renderRankBtn() {
        var btn = new Laya.Sprite();
        btn.loadImage(`${gameConfig.LOCAL_URL}/result/rank.png`, 0, 0, 158 / 1.8 * window.devicePixelRatio, 129 / 1.8 * window.devicePixelRatio);

        this.addChild(btn);

        var width = btn.getBounds().width;

        btn.x = (this.width - 185 / 2 * window.devicePixelRatio) / 2 - 95 * window.devicePixelRatio;

        btn.y = (540 + 50) * window.devicePixelRatio;

        btn.on('click', this, function () {
            musicInstance.playBtn();
            if (window.rankUI) {
                window.rankUI.refresh({
                    newscore: this.score,
                    combo: this.combo,
                    baoshi: this.baoshi
                }, this.arrayData);
                return;
            }
            window.rankUI = new Rank({
                newscore: this.score,
                combo: this.combo,
                baoshi: this.baoshi
            }, this.arrayData, this);
            window.stage.addChild(window.rankUI);
        });

        return btn;
    }
    renderShareText() {
        var btn = new Laya.Image();
        btn.skin = `${gameConfig.LOCAL_URL}/result/share_title.png`;
        btn.width = 297 / 2 * window.devicePixelRatio;
        btn.height = 25 / 2 * window.devicePixelRatio;
        this.addChild(btn);
        btn.x = (gameConfig.GameWidth - btn.width) / 2;
        btn.y = 685 * window.devicePixelRatio;

        btn.on('click', this, function () {
            try {
                window._shareInfo.imageUrl = drawShareCanvas({
                    score: this.score || 0,
                    energeNum: this.baoshi || 0,
                    maxCombo: this.combo || 0,
                    percent: this.getRankPercent(this.score) || 0
                });
            } catch (ex) {
                window._shareInfo.imageUrl = gameConfig.PREFIX_URL + 'result/sharebanner2.png';
            }

            window._shareInfo.query = 'modal=qun';
            window._shareInfo.title = '星途，穿越未知银河道途';
            musicInstance.playBtn();
            if (!wx.shareAppMessage) {
                return;
            }
            wx.shareAppMessage(window._shareInfo);
        });

        return btn;
    }
    renderShareBtn() {
        var btn = new Laya.Sprite();
        btn.loadImage(`${gameConfig.LOCAL_URL}/result/pk.png`, 0, 0, 169 / 1.8 * window.devicePixelRatio, 129 / 1.8 * window.devicePixelRatio);

        this.addChild(btn);

        var width = btn.getBounds().width;

        btn.x = (this.width - 185 / 2 * window.devicePixelRatio) / 2 + 140 * window.devicePixelRatio;
        btn.y = (540 + 50) * window.devicePixelRatio;

        btn.on('click', this, function () {
            this.shareFunc();
        });
        return btn;
    }
    shareFunc() {
        var _this3 = this;

        musicInstance.playBtn();
        if (!wx.shareAppMessage) {
            return;
        }
        var data = [{
            key: 'newscore',
            value: this.score
        }, {
            key: 'level',
            value: this.level
        }, {
            key: 'baoshi',
            value: this.baoshi
        }, {
            key: 'combo',
            value: this.combo
        }];
        var that = this;
        window._shareInfo.success = function () {
            if (that.room_id) {
                (0, reportPKRank)({
                    appid: gameConfig.APPID,
                    game_behav_list: data,
                    sig: getSig(data)
                }).then(function (res) {
                    console.log(res);
                });
            }
        };

        try {
            window._shareInfo.imageUrl = drawShareCanvas({
                score: this.score || 0,
                energeNum: this.baoshi || 0,
                maxCombo: this.combo || 0
            }, 1);
        } catch (ex) {
            window._shareInfo.imageUrl = gameConfig.PREFIX_URL + 'result/sharebanner2.png';
        }

        window._shareInfo.title = '不服来战';

        if (this.room_id) {
            window._shareInfo.query = 'room_id=' + this.room_id + '&share_user_openid=' + this.self_user_info.user_id;
            wx.shareAppMessage(window._shareInfo);
            return;
        }

        createPkRoom({
            appid: gameConfig.APPID,
            my_behav_list: data,
            sig: getSig(data)
        }).then(function (res) {
            if (res.errcode === 0) {
                window._shareInfo.query = 'room_id=' + res.data.room_id + '&share_user_openid=' + _this3.self_user_info.user_id;
                wx.shareAppMessage(window._shareInfo);
                _this3.room_id = res.data.room_id;
            } else {
                wx.getNetworkType({
                    success: function success(res) {
                        // 返回网络类型, 有效值：
                        // wifi/2g/3g/4g/unknown(Android下不常见的网络类型)/none(无网络)
                        var txt = '服务器开小差啦，无法PK好友' + (res.errcode || '');
                        if (res.networkType === 'none') {
                            txt = '当前无网络，请联网再PK好友';
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
    bind() {
        this.btnSprite.on('click', this, function () {
            musicInstance.playBtn();
            this.reStart();
        });
    }
    reStart() {
        window.Main.reStart();
        this.visible = false;
    }
    renderMySelf() {
        if (this._renderMySelf) return;
        if (!this.self_user_info) return;
        var mySprite = new Laya.Sprite();

        loadCircleImage(this.self_user_info.head_img_url || `${gameConfig.LOCAL_URL}/default_head.png`, mySprite, 80 * window.devicePixelRatio, 80 * window.devicePixelRatio);

        var label1 = new Laya.Label();
        label1.text = this.self_user_info.nick_name;
        label1.fontBold = true;
        label1.fontSize = 18 * window.devicePixelRatio;
        label1.color = '#82b9c7';
        label1.x = (gameConfig.GameWidth - label1.width) / 2;
        label1.y = 220 * window.devicePixelRatio;

        mySprite.x = (this.width - 40 * window.devicePixelRatio) / 2;
        mySprite.y = 135 * window.devicePixelRatio;

        this.addChild(label1);
        this.addChild(mySprite);
        this._renderMySelf = true;
    }


    bindEvents() {
        this.btnSprite.on('click', this, () => {
            musicInstance.playBtn();
            this.reStart();
        });
    }
}

export default Result;