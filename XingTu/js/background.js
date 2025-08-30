import { gameConfig } from './config.js';
class Loading extends Laya.Sprite {
    constructor() {
        super();
        this.init();
    }

    init() {
        this.renderBg();
        this.createText();
        // this.cacheAs = 'bitmap';
    }

    renderBg() {
        this.graphics.drawRect(0, 0, gameConfig.GameWidth, gameConfig.GameHeight, "#000000");
    }

    createText() {
        const title = new Laya.Sprite();

        const text = new Laya.Text();
        text.overflow = Laya.Text.HIDDEN;
        text.color = "#82b9c7";
        text.fontSize = 14 * window.devicePixelRatio;
        text.text = '拼命加载中...';
        title.addChild(text);

        const width = title.getBounds().width;
        title.x = (gameConfig.GameWidth - width) / 2;
        title.y = (gameConfig.GameHeight - title.getBounds().height) / 2;

        this.addChild(title);
    }
}

class BackGround extends Laya.Sprite {
    constructor() {
        super();

        this.width = gameConfig.GameWidth;
        this.height = gameConfig.GameHeight;
        this.SPEED = 3 * window.devicePixelRatio;

        this.init();
    }

    init() {
        this.renderBg();
        this.renderCycleBg();
        this.renderCycleBg2();
    }

    renderBg() {
        const bgImg = new Laya.Image();
        const res = gameConfig.LOCAL_URL
        bgImg.skin = res + '/new_bg1.png';

        bgImg.height = gameConfig.GameWidth / (bgImg.width / bgImg.height);
        bgImg.width = gameConfig.GameWidth;

        this.y = gameConfig.GameHeight - bgImg.height;

        this.addChild(bgImg);
    }

    renderCycleBg() {
        const bgImg = new Laya.Image();
        const res = gameConfig.LOCAL_URL
        bgImg.skin = res + '/bg1.png';

        bgImg.height = gameConfig.GameWidth / (bgImg.width / bgImg.height);
        bgImg.width = gameConfig.GameWidth;

        this.bgImgHeight = -bgImg.height + 1;
        bgImg.y = this.bgImgHeight;

        this.bg1 = bgImg;

        this.addChild(bgImg);
    }

    renderCycleBg2() {
        const bgImg = new Laya.Image();
        const res = gameConfig.LOCAL_URL
        bgImg.skin = res + '/bg1.png';

        bgImg.height = gameConfig.GameWidth / (bgImg.width / bgImg.height);
        bgImg.width = gameConfig.GameWidth;

        this.bgImgHeight = -bgImg.height + 1;

        bgImg.y = this.bgImgHeight * 2;
        this.bg2 = bgImg;

        this.addChild(bgImg);
    }

    animation() {
        if (this.bg1.y + this.y >= -this.bgImgHeight) {
            this.bg1.y += this.bgImgHeight * 2;
        }
        if (this.bg2.y + this.y >= -this.bgImgHeight) {
            this.bg2.y += this.bgImgHeight * 2;
        }

        this.y += this.SPEED;
    }

    stop() {
        Laya.timer.clear(this, this.animation);
    }

    start() {
        Laya.timer.frameLoop(1, this, this.animation);
    }
}

export { BackGround, Loading };