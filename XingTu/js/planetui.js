// 导入依赖模块
import { gameConfig } from "./config.js";
//const config = __webpack_require__(0);

// 游戏常量
const PLANET_UI_CONSTANTS = {
    SCALE: 0.001,
    CLOUD_ASPECT_RATIO: 152 / 547,
    FONT_SIZE: 14 * window.devicePixelRatio,
    TEXT_COLOR: '#82b9c7',
    TEXT_OFFSET_Y: 35 * window.devicePixelRatio,
    ROTATION_SPEED: 0.2,
    ANIMATION_FRAME_RATE: 1
};

// 星球名称映射
const PLANET_NAMES = {
    'shui': '水星',
    'wei': '',
    'jin': '金星',
    'di': '地球',
    'huo': '火星',
    'ceres': '谷神星',
    'mu': '木星',
    'tu': '土星',
    'tian': '天王星',
    'hai': '海王星',
    'ming': '冥王星'
};

/**
 * 星球UI类
 * 负责渲染游戏中的星球界面元素
 */
class PlanetUI extends Laya.Sprite {
    /**
     * 构造函数
     */
    constructor() {
        super();

        // 初始化状态
        this.scaleState = 1; // 1：放大   2：缩小
        this.scaleDelta = 1;

        // 初始化精灵
        this.initSprites();
    }

    /**
     * 初始化数据
     * @param {Object} block - 星球块对象
     */
    initData(block) {
        this.planetUrl = block.blockInfo.url;
        this.stayTime = block.blockInfo.stayTime;

        this.setPosition(block.circle);
        this.addPlanet(block);
        this.drawCircleImage(block.circle);
        this.addPlanetText(this.planetUrl, block.circle);
    }

    /**
     * 设置位置
     * @param {Object} circle - 圆圈对象
     */
    setPosition(circle) {
        this.pos(circle.point.currX, circle.point.currY);
    }

    /**
     * 初始化精灵
     */
    initSprites() {
        // 云朵背景图片
        this.cloudImage = new Laya.Image();
        this.cloudImage.width = gameConfig.GameWidth;
        this.cloudImage.height = gameConfig.GameWidth * PLANET_UI_CONSTANTS.CLOUD_ASPECT_RATIO;
        this.addChild(this.cloudImage);

        // 星球主图片
        this.planetImage = new Laya.Image();
        this.addChild(this.planetImage);

        // 圆圈容器
        this.circleContainer = new Laya.Sprite();
        this.addChild(this.circleContainer);

        // 星球名称标签
        this.planetLabel = new Laya.Text();
        this.planetLabel.fontSize = PLANET_UI_CONSTANTS.FONT_SIZE;
        this.planetLabel.color = PLANET_UI_CONSTANTS.TEXT_COLOR;
        this.addChild(this.planetLabel);
    }

    /**
     * 重置星球UI
     * @param {Object} block - 星球块对象
     */
    reset(block) {
        this.initData(block);
    }

    /**
     * 创建圆圈
     * @param {Object} circle - 圆圈对象
     */
    createOneCircle(circle) {
        this.circleContainer.graphics.clear();
        this.circleContainer.graphics.save();

        // 绘制圆圈
        this.circleContainer.graphics.drawCircle(
            0, 0, circle.radius,
            'rgba(255,255,255,0)',
            circle.color,
            circle.border
        );

        this.circleContainer.graphics.restore();
    }

    /**
     * 绘制圆圈图片
     * @param {Object} circle - 圆圈对象
     */
    drawCircleImage(circle) {
        this.circleContainer.graphics.clear();

        // 加载圆圈资源
        const circleResource = this.getCircleResource(circle.radius);
        this.circleContainer.graphics.loadImage(
            circleResource,
            0, 0,
            circle.radius * 2 - 1,
            circle.radius * 2 - 1
        );

        // 设置位置
        this.circleContainer.pos(-circle.radius, -circle.radius);
    }

    /**
     * 获取圆圈资源路径
     * @param {number} radius - 半径
     * @returns {string} 资源路径
     */
    getCircleResource(radius) {
        const size = Math.floor(radius / 10 / window.devicePixelRatio) * 10 * 4;
        return `${gameConfig.LOCAL_URL}/start/circle/${size}.png`;
    }

    /**
     * 添加星球名称文本
     * @param {string} type - 星球类型
     * @param {Object} circle - 圆圈对象
     */
    addPlanetText(type, circle) {
        const planetName = PLANET_NAMES[type] || '';
        this.planetLabel.text = planetName;

        // 设置文本位置
        this.planetLabel.pos(
            -this.planetLabel.width / 2,
            circle.radius - PLANET_UI_CONSTANTS.TEXT_OFFSET_Y
        );
    }

    /**
     * 添加星球
     * @param {Object} block - 星球块对象
     */
    addPlanet(block) {
        const planet = block.blockInfo;

        // 设置星球图片
        if (/^res\/rewards/i.test(planet.url)) {
            // 奖励类星球
            this.planetImage.skin = planet.url;
        } else if (planet.url === 'hei') {
            // 黑洞
            this.planetImage.skin = `${gameConfig.LOCAL_URL}/qiu/yun.png`;
        } else {
            // 普通星球
            this.planetImage.skin = `${gameConfig.LOCAL_URL}/qiu/${planet.url}.png`;
        }

        // 特殊星球的动画处理
        if (/(yun|wei|out|hei)/i.test(planet.url)) {
            if (!window.isDIDUAN) {
                this.start();
            }
        }

        // 设置图片尺寸
        const imgInfo = planet.img;
        this.planetImage.width = imgInfo.coefficient;
        this.planetImage.height = imgInfo.coefficient / (imgInfo.width / imgInfo.height);

        // 设置锚点
        this.planetImage.pivot(
            this.planetImage.width / 2 + planet.correction.x,
            this.planetImage.height / 2 + planet.correction.y
        );

        // 云朵组处理
        if (planet.url === 'yun') {
            this.createCloudGroup();
        } else {
            this.cloudImage.visible = false;
        }
    }

    /**
     * 创建云朵组
     */
    createCloudGroup() {
        this.cloudImage.skin = `${gameConfig.LOCAL_URL}/qiu/yun_group.png`;
        this.cloudImage.pos(-this.x, -this.cloudImage.height / 2);
    }

    /**
     * 启动动画
     */
    start() {
        Laya.timer.frameLoop(
            PLANET_UI_CONSTANTS.ANIMATION_FRAME_RATE,
            this,
            this.animate
        );
    }

    /**
     * 停止动画
     * @param {number} time - 停止时间（可选）
     */
    stop(time) {
        Laya.timer.clear(this, this.animate);
    }

    /**
     * 动画更新
     */
    animate() {
        // 黑洞旋转动画
        this.planetImage.rotation += PLANET_UI_CONSTANTS.ROTATION_SPEED;
    }

    /**
     * 销毁星球UI
     */
    destroy() {
        this.stop();
        super.destroy();
    }

    /**
     * 设置缩放状态
     * @param {number} state - 缩放状态 (1:放大, 2:缩小)
     */
    setScaleState(state) {
        this.scaleState = state;
    }

    /**
     * 获取星球名称
     * @returns {string} 星球名称
     */
    getPlanetName() {
        return this.planetLabel.text;
    }

    /**
     * 检查是否为特殊星球
     * @returns {boolean} 是否为特殊星球
     */
    isSpecialPlanet() {
        return /(yun|wei|out|hei)/i.test(this.planetUrl);
    }
}

// 导出PlanetUI类
export default PlanetUI;