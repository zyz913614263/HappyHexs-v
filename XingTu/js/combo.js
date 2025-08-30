import { gameConfig } from './config.js';
var IMG_WIDTH = 161 * window.devicePixelRatio,
    IMG_HEIGHT = 161 * window.devicePixelRatio;

var IMAGE_ZOOM = 2.5;

var IMG_TXT_HEIGHT = 54 * window.devicePixelRatio,
    IMG_TXT_WIDTH = 152 * window.devicePixelRatio;

var IMG_NUM_HEIGHT = 81 * window.devicePixelRatio,
    IMG_NUM_WIDTH = 68 * window.devicePixelRatio;

IMG_WIDTH = IMG_WIDTH / IMAGE_ZOOM;
IMG_HEIGHT = IMG_HEIGHT / IMAGE_ZOOM;
IMG_TXT_WIDTH = IMG_TXT_WIDTH / IMAGE_ZOOM;
IMG_TXT_HEIGHT = IMG_TXT_HEIGHT / IMAGE_ZOOM;
IMG_NUM_HEIGHT = IMG_NUM_HEIGHT / IMAGE_ZOOM;
IMG_NUM_WIDTH = IMG_NUM_WIDTH / IMAGE_ZOOM;

var UP_TIME = 50,
    DOWN_TIME = 300;

class Combo extends Laya.Sprite {
    constructor() {
        super();

        this.width = IMG_WIDTH;
        this.height = IMG_HEIGHT;

        this.index = 1;

        this.txtSp = new Laya.Sprite();
        this.bgSp = new Laya.Sprite();

        this.addChild(this.txtSp);
        this.addChild(this.bgSp);
        return this;
    }

    hideCombo() {
        this.bgSp.visible = false;
        this.txtSp.graphics.clear();
    }

    renderCombo(num) {
        this.bgSp.visible = true;
        this.index = 1;
        this.bgSp.x = 0;
        this.bgSp.alpha = 1;
        this.alpha = 1;
        this.txtSp.x = 0;
        this.txtSp.graphics.clear();
        this.drawNumber(num);
    }

    loadAnimation() {
        this.bgSp.graphics.clear();

        this.bgSp.graphics.loadImage(`${gameConfig.LOCAL_URL}/combos/light/${this.index}.png`, -50 * window.devicePixelRatio, -30 * window.devicePixelRatio, 603 / 2 * window.devicePixelRatio, 260 / 2 * window.devicePixelRatio);
        this.index++;
        this.bgSp.x -= 2 * window.devicePixelRatio;
        if (this.index === 6) {
            this.index = 1;
            Laya.timer.clear(this, this.loadAnimation);
        }
    }

    doAnimation(direction) {
        var _this2 = this;

        if (window.isDIDUAN) {
            setTimeout(function (res) {
                _this2.alpha = 0;
                Laya.Pool.recover("Combo", _this2);
            }, 1000);
            return;
        }
        Laya.timer.frameLoop(2, this, this.loadAnimation);

        Laya.Tween.to(this.bgSp, {
            x: -150 * window.devicePixelRatio,
            alpha: 0
        }, 300, Laya.Ease.linearNone, Laya.Handler.create(this, function () {
            // tween.clear();
            Laya.Tween.to(this, {
                alpha: 0
            }, 300, Laya.Ease.linearNone, Laya.Handler.create(this, function () {
                // tween2.clear();
                Laya.Pool.recover("Combo", this);
            }), 200);
        }));

        Laya.Tween.to(this.txtSp, {
            x: -20 * window.devicePixelRatio
        }, 50, Laya.Ease.linearNone, Laya.Handler.create(this, function () {
            // tween1.clear();
        }));
    }

    drawNumber(num, direction) {
        this.doAnimation(direction);
        var type = 1;

        if (num > 15) {
            type = 2;
        } else if (num > 30) {
            type = 3;
        }

        this.txtSp.graphics.loadImage(`${gameConfig.LOCAL_URL}/combos/${type}/combo.png`, 15 * window.devicePixelRatio, (IMG_HEIGHT - IMG_TXT_HEIGHT) / 2, IMG_TXT_WIDTH, IMG_TXT_HEIGHT);

        var numStr = num.toString().split('');
        for (var i = numStr.length - 1; i > -1; i--) {
            this.txtSp.graphics.loadImage(`${gameConfig.LOCAL_URL}/combos/${type}/${numStr[i]}.png`, (i - numStr.length + 0.5) * 15 * window.devicePixelRatio, (IMG_HEIGHT - IMG_NUM_HEIGHT) / 2.7, IMG_NUM_WIDTH, IMG_NUM_HEIGHT);
        }
    }
}

export default Combo;