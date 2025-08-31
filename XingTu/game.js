import "./libs/weapp-adapter.js";
import "./libs/laya.core.js";
import "./libs/laya.wxmini.js";
import "./libs/laya.webgl.js";
import "./libs/laya.ani.js";
import "./libs/laya.filter.js";
import "./libs/laya.ui.js";
import { gameConfig, infoList } from "./js/config.js";
const protobuf = require('./libs/protobuf.js');
const EventEmitter = protobuf.util.EventEmitter;
import { MeteroManager } from './js/metero.js';
import Main from './js/main.js';
import Coordinate from './js/coordinate.js';
import { BackGround, Loading } from './js/background.js';

function xingtuinit() {
    window._shareInfo = {
        title: '星途，穿越未知银河道途',
        imageUrl: gameConfig.PREFIX_URL + 'share/share.png',
        query: 'share=1',
        success: function success(res) {
            console.error(res);
        },
        fail: function fail(res) {
            console.error(res);
        },
        complete: function complete(res) {
            console.error(res);
        }
    };
    window._GC = function () {
        Laya.ResourceManager._systemResourceManager.garbageCollection();
        wx.triggerGC && wx.triggerGC();
    };

    wx.showShareMenu && wx.showShareMenu({
        withShareTicket: true
    });

    wx.onShareAppMessage && wx.onShareAppMessage(function () {
        return window._shareInfo;
    });
    function getPreLoadResource() {
        const res = gameConfig.LOCAL_URL
        console.log(res)
        var urls = [res + '/fei1.png', res + '/new_bg1.png', res + '/start/logo.png', res + '/start/start_btn.png', //开始按钮
        res + '/little/baoshi_new.png', res + '/liuxing.png', // 流星
        res + '/bg1.png', // 循环背景
        res + '/871f2e463d2b893ba247f3062179b504.png', // 飞行尾巴
        res + '/53c914c3d30c663fe9c26819ef54882d.png', res + '/circle_nei.png', res + '/circle.png', res + '/result/kuang.png', res + '/jiantou.png', res + '/jiantou1.png', res + '/hand.png'
        ];
        console.log(urls)

        for (var i = 0; i < 7; i++) {
            urls.push(res + '/p/' + i + '.png'); // 动画人
        }

        for (var i = 1; i < 14; i++) {
            urls.push(res + '/fly/' + i + '.png');
        }
        return urls;
    }

    function loadSecondResource() {
        const res = gameConfig.LOCAL_URL
        var urls = [res + '/share/share.png', res + '/share/pk.png', res + '/share/baoshi.png', res + '/share/combo.png', res + '/rank/replay.png'];

        for (var i = 0; i < 13; i++) {
            urls.push(res + '/qiu/out' + i + '.png');
        }
        Laya.loader.load([{
            url: urls,
            type: Laya.Loader.IMAGE
        }]

        );
    }
    // 放第一的先加载
    function loadStaticDataLazy() {
        const res = gameConfig.LOCAL_URL
        var urls = [res + '/qiu/yun_group.png', res + '/qiu/yun3.png', res + '/qiu/yun4.png', res + '/qiu/tu.png', res + '/qiu/yun2.png', res + '/qiu/yun1.png', res + '/qiu/wei.png', res + '/qiu/tian.png', res + '/qiu/ming.png', res + '/qiu/di.png', res + '/qiu/mu.png', res + '/qiu/huo.png', res + '/qiu/shui.png', res + '/qiu/hai.png', res + '/qiu/hei.png', res + '/qiu/jin.png', res + '/qiu/ceres.png', res + '/0e10aaa60c459c91d5022bcdf2e5b822.png', // 障碍物流星
        res + '/result/circle2.png', res + '/bar/close.png', res + '/bar/bar1.png', res + '/bar/fen.png', res + '/bar/kuang2.png', res + '/bar/baoshi.png', res + '/kuang2.png', res + '/result/tiaozhan.png', res + '/rank/back.png', res + '/result/share_title.png', res + '/result/concent-new.png', res + '/result/pk.png', res + '/result/100.png', res + '/result/200.png', res + '/result/300.png', res + '/result/400.png', res + '/result/rank.png', res + '/default_head.png', res + '/result/defen.png', res + '/combos/1/combo.png', res + '/combos/2/combo.png', res + '/combos/3/combo.png', res + '/light/text.png', res + '/light/light.png', res + '/rewards/bg.png'
        ];

        for (var i = 1; i < 5; i++) {
            urls.push(res + "/rewards/" + i + ".png");
        }

        for (var i = 1; i < 7; i++) {
            urls.push(res + "/baoshi_bone/" + i + ".png"); // 爆炸1
        }

        for (var i = 1; i < 6; i++) {
            urls.push(res + "/light/" + i + ".png");
        }

        for (var i = 0; i < 11; i++) {
            urls.push(res + '/start/circle/' + (200 + i * 40) + '.png'); // 爆炸1
        }

        for (var i = 1; i < 6; i++) {
            urls.push(res + "/bone/" + i + ".png"); // 爆炸1
        }

        for (var i = 1; i < 6; i++) {
            urls.push(res + "/combos/light/" + i + ".png"); // 爆炸1
        }

        for (var i = 0; i < 10; i++) {
            urls.push(res + '/result_score_num/' + i + '.png');
            urls.push(res + '/bar_num/' + i + '.png');
            urls.push(res + '/combos/1/' + i + '.png');
            urls.push(res + '/combos/2/' + i + '.png');
            urls.push(res + '/combos/3/' + i + '.png');
        }


    }

    console.log("RUN")
    console.log(gameConfig)
    console.log(infoList)
    // 初始化 Laya 引擎

    Laya.MiniAdpter.init();



    // Laya.Config.isAntialias = true;
    // 0：正常，1：结果， 2：好友排行， 3：群排行， 4：pk
    //window._game_status = 0;

    Laya.init(gameConfig.GameWidth, gameConfig.GameHeight, Laya.WebGL);

    //musicInstance.playBg()
    //musicInstance.playStart();

    var scaleX = window.innerWidth * window.devicePixelRatio / gameConfig.GameWidth;
    var scaleY = window.innerHeight * window.devicePixelRatio / gameConfig.GameHeight;

    //设置适配模式
    Laya.stage.alignH = Laya.Stage.ALIGN_CENTER;
    Laya.stage.alignV = Laya.Stage.ALIGN_MIDDLE;
    Laya.stage.scaleMode = scaleY > scaleX ? Laya.Stage.SCALE_FIXED_WIDTH : Laya.Stage.SCALE_FIXED_HEIGHT;
    Laya.stage.screenMode = gameConfig.model;
    Laya.stage.bgColor = "#000";
    //Laya.Stat.show(0, 0);



    window._loading = new Loading();
    window.stage = Laya.stage;
    window.stage.addChild(window._loading);

    window._Event = new EventEmitter();


    var urls = getPreLoadResource();
    var _time = Date.now();

    Laya.loader.load([{
        url: urls,
        type: Laya.Loader.IMAGE
    }], Laya.Handler.create(this, showHandling));

    function showHandling() {
        console.log(Date.now() - _time);
        mainDraw();
        loadStaticDataLazy()
    }


    function mainDraw() {
        if (window.Main) {
            return;
        }
        window._loading.destroy();
        window._loading = null;

        window.BackGround = new BackGround();
        window.stage.addChild(window.BackGround);

        if (!window.isDIDUAN) {
            window.MeteorManager = new MeteroManager();
            window.stage.addChild(window.MeteorManager);
            // 随机流星
            window.MeteorManager.play();
        }

        window.Main = new Main();
        window.stage.addChild(window.Main);

        window.coordinate = new Coordinate();
        window.coordinate.visible = false;
        window.stage.addChild(window.coordinate);


        setTimeout(function () {
            loadSecondResource()
        }, 500);
    }

    Laya.timer.frameLoop(25000, undefined, function () {
        Laya.ResourceManager._systemResourceManager.garbageCollection();
        wx.triggerGC && wx.triggerGC();
    });

}
export { xingtuinit };