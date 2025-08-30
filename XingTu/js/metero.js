import { gameConfig } from "./config.js";
const WID = 91 * window.devicePixelRatio;
const HEI = 207 * window.devicePixelRatio;

/**
 * 流星类
 */
class Metero extends Laya.Sprite {
    constructor() {
        super();
    }

    init() {
        this.SPEED = (~~(Math.random() * 3) + 1) * window.devicePixelRatio; // 随机速度
        this.zoom = ~~(Math.random() * 5) + 2; // 随机缩小大小
        this._alpha = 1;
        this.alpha = 0;
        this.visible = true;
        this.x = ~~(Math.random() * gameConfig.GameWidth); // 位置随机
        this.y = ~~(Math.random() * gameConfig.GameHeight);

        // 随机开始动画
        this.graphics.clear();
        this.graphics.loadImage(`${gameConfig.LOCAL_URL}/liuxing.png`, 0, 0, WID / this.zoom, HEI / this.zoom);

        setTimeout(() => {
            this.start();
        }, ~~(Math.random() * 10) * 800);
    }

    animation() {
        this.y += this.SPEED;
        this.x += this.SPEED * (WID / HEI);
        this._alpha = this._alpha - this.SPEED * 0.0004;
        this.alpha = this._alpha;

        if (this.y > gameConfig.GameHeight || this.x > gameConfig.GameWidth) {
            this.stop();
        }
    }

    stop() {
        this.visible = false;
        Laya.timer.clear(this, this.animation);
        Laya.Pool.recover("Metero", this);
    }

    start() {
        Laya.timer.frameLoop(1, this, this.animation);
    }
}

/**
 * 流星管理器类
 */
class MeteroManager extends Laya.Sprite {
    constructor() {
        super();
    }

    play() {
        for (let i = 0; i < 10; i++) {
            const item = Laya.Pool.getItemByClass("Metero", Metero);
            item.init();
            this.addChild(item);
        }
    }
}

// 导出类
export { Metero, MeteroManager };