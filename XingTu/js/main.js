
import { gameConfig, infoList } from "./config.js";
import musicInstance from "./music.js";
const protobuf = require('../libs/protobuf.js');
import { Metero, MeteroManager } from './metero.js';
import { getFriendRank } from './api.js';
import Coordinate from './coordinate.js';
import StartUp from './starup.js';
import GuideControls from './guide.js';
import UIRender from './uireder.js';
import Point from './point.js';
import Circle from './circle.js';
import Block from './block.js';
import Airplane from './airplane.js';
import CutOffPoint from './cutOffPoint.js';
import Result from './result.js';
import PkRank from './pk.js';





// 游戏常量
const IN_SIDE_EDGE_DISTANCE = 30 * window.devicePixelRatio; // 边界判断距离
const SPEED = 0.3 * window.devicePixelRatio;

// 私有属性符号
const privateProps = {
    uirender: Symbol('uirender'),
    blocks: Symbol('blocks'),
    block: Symbol('block'),
    next: Symbol('next'),
    preview: Symbol('preview'),
    hasOverReport: Symbol('hasOverReport')
};

// 星球列表
const planetList = ['shui', 'wei', 'jin', 'di', 'huo', 'ceres', 'mu', 'tu', 'tian', 'hai', 'ming'];
const yunList = ['yun1', 'yun2', 'yun3', 'yun4'];

// 星球映射表
const planetMap = {};
for (let i = 0; i < gameConfig.planets.length; i++) {
    planetMap[gameConfig.planets[i].url] = gameConfig.planets[i];
}

/**
 * 游戏主类
 */
class Main extends Laya.Sprite {
    constructor() {
        super();
        // 创建引导控制器实例
        this.guideControl = GuideControls;
        this._createCount = 0;
        this.Id = 0;
        this.maxQiu = 'shui';
        this[privateProps.blocks] = [];

        this.getFriendData();
        this.initStartUp();

    }

    /**
     * 初始化飞机和场景
     */
    initAirPlaneAndScenes() {
        this.currentBlock = this[privateProps.blocks][0];

        if (this[privateProps.uirender]) {
            this[privateProps.uirender].destroy();
            this[privateProps.uirender] = null;
        }

        this[privateProps.uirender] = new UIRender(this[privateProps.blocks]);
        this.addChild(this[privateProps.uirender]);
        this.initMoreBlocks();
    }

    /**
     * 获取好友数据
     */
    getFriendData(callback) {
        this._friendData = {};

        getFriendRank({
            appid: 'wx7a727ff7d940bb3f',
            rank_key_list: ['level', 'newscore', 'combo', 'baoshi']
        }).then(res => {
            window._allFriendData = res.data || {};
            const data = {};
            res.data = res.data || {};

            try {
                const userinfoObj = this.getUserInfoByUid(res.data.user_multi_rank.user_info_list);
                const d = this.findData(res.data.user_multi_rank.rank_list, 'level') || {};
            } catch (ex) {
                const userinfoObj = {};
                const d = {};
            }

            const list = d.rank_item_list || [];
            list.forEach(item => {
                data[item.value] = {
                    nick: (userinfoObj[item.user_id] || {}).nick_name,
                    src: (userinfoObj[item.user_id] || {}).head_img_url
                };
            });

            this._friendData = data;
            callback && callback();
        });
    }

    /**
     * 根据用户ID获取用户信息
     */
    getUserInfoByUid(list) {
        const obj = {};
        for (let i = 0; i < list.length; i++) {
            obj[list[i].user_id] = list[i];
        }
        return obj;
    }

    /**
     * 查找数据
     */
    findData(data, key) {
        for (let i = 0; i < data.length; i++) {
            if (data[i].key === key) {
                return data[i];
            }
        }
    }

    /**
     * 初始化启动界面
     */
    initStartUp() {
        console.log('initStartUp1');
        this.startUpSprite = new StartUp(
            // 开始游戏回调
            () => {
                console.log('initStartUp');
                this.initBlocks();
                this.initAirPlaneAndScenes();
                this.guideControl.initGuide(this);
                this.start();
            },
            // 游戏开始回调
            () => {
                console.log('initStartUp2');
                window.coordinate.visible = true;
                window.coordinate.use_time = Date.now();
                this.initAirPlane();
                this.startUpSprite.destroy();
                this.startUpSprite = null;
                this.bindEvent();
            }
        );

        this.addChild(this.startUpSprite);

        // 绑定游戏事件
        window._Event.on('dead', (res) => {
            console.error(Date.now() - res);
            this.renderResult(res);
        });

        window._Event.on('play_reward', () => {
            this.stop();
        });

        window._Event.on('go_on', () => {
            const level = this.air.level;
            if (level > 20) {
                this.air.level -= 15;
            } else if (level > 10) {
                this.air.level -= 5;
            } else {
                this.air.level = 4;
            }
            this.start();
        });
    }

    /**
     * 游戏主循环
     */
    main_animation() {
        //console.log('animation');
        if (this.air) {
            if (this.air.gameOver) {
                this.stop();
                return;
            } else {
                this.addMoreBlock();
                this.checkPlanetIsOutScreen();
            }
        }

        if (!this.air) {
            this.y += 3 * window.devicePixelRatio;
        } else {
            const level = this.air.level;
            const plane = this.air.plane;

            if (level > 3) {
                const speed = 200 / (this.y / window.devicePixelRatio + plane.y / window.devicePixelRatio) * 4 * window.devicePixelRatio;

                if (level > 50) {
                    this.y += this.getSpeed(speed, 3);
                } else if (level > 40) {
                    this.y += this.getSpeed(speed, 2.5);
                } else if (level > 30) {
                    this.y += this.getSpeed(speed, 2.2);
                } else if (level > 10) {
                    this.y += this.getSpeed(speed, 1.8);
                } else if (level > 3) {
                    this.y += this.getSpeed(speed, 1.5);
                }
            } else if (level > 2) {
                this.y += 1 * window.devicePixelRatio;
            }
        }
    }

    /**
     * 获取速度
     */
    getSpeed(speed, max) {
        speed = +speed.toFixed(2);
        return +(speed < max * window.devicePixelRatio ? max * window.devicePixelRatio : speed).toFixed(2);
    }

    /**
     * 渲染游戏结果
     */
    renderResult(time) {
        window.coordinate.uploadScore();
        window.coordinate.visible = false;

        if (window._pk_user_game_id) {
            if (!window._pkRank) {
                window._pkRank = new PkRank();
                window.stage.addChild(window._pkRank);
            }
            window._pkRank.initData(window.query, window.group_info, () => { }, {
                newscore: window.coordinate.score
            });
            return;
        }

        const resultData = {
            score: window.coordinate.score,
            type: this.maxQiu,
            baoshi: window.coordinate.energeNum + window.coordinate.rewardEnergeNum,
            combo: window.coordinate.maxCombo,
            level: window.coordinate.lightYear
        };

        if (this.resultSprite) {
            this.resultSprite.reset(resultData);
            this.resultSprite.visible = true;
        } else {
            this.resultSprite = new Result(resultData);
            window.stage.addChild(this.resultSprite);
        }
    }

    /**
     * 重置游戏
     */
    reset() {
        this.y = 600 * window.devicePixelRatio;
        this.x = 0;
        this.Id = 0;
        this._createCount = 0;
        this._passHeiDong = false;

        this.guideControl.resetGuide();
        window._shareInfo.imageUrl = gameConfig.PREFIX_URL + 'result/sharebanner2.png';
        this.maxQiu = 'shui';

        planetList.length = 0;
        planetList.push('shui', 'wei', 'jin', 'di', 'huo', 'ceres', 'mu', 'tu', 'tian', 'hai', 'ming');

        this[privateProps.blocks] = [];
        window.coordinate.reset();
        window.coordinate.visible = true;
        window._GC();
    }

    /**
     * 重新开始游戏
     */
    reStart() {
        window._shareInfo.query = 'share=1';
        window._shareInfo.title = '星途，穿越未知银河道途';

        this.stop();
        this.getFriendData();
        this.reset();
        this.initBlocks();
        this.initAirPlaneAndScenes();
        this.air.reset(this.currentBlock, this[privateProps.blocks]);
        this.start();
        window.coordinate.use_time = Date.now();
    }

    /**
     * 检查星球是否超出屏幕
     */
    checkPlanetIsOutScreen() {
        if (this.air.plane.y + this.y > gameConfig.GameHeight) {
            this.air._destory();
            musicInstance.playDead();
            this.stop();
        }
    }

    /**
     * 创建新的随机障碍星球
     */
    createNewRandomOutPlant() {
        return {
            url: 'out' + this.getRandomNumber(12, 1),
            radius: this.getRandomNumber(20, 100) * window.devicePixelRatio,
            correction: { x: 0, y: 0 },
            img: {
                width: 290 * window.devicePixelRatio,
                height: 290 * window.devicePixelRatio,
                coefficient: this.getRandomNumber(50, 150) * window.devicePixelRatio
            }
        };
    }

    /**
     * 添加更多星球块
     */
    addMoreBlock(flag, planet) {
        if (flag || this.y > -this._lastBlock.point.currY) {
            if (!flag && !planet) {
                this._createCount++;
                if (this._createCount > this.getRandomNumber(5, 5)) {
                    this._createCount = 0;
                    planet = planetMap[planetList.shift()] || this.createNewRandomOutPlant();
                }
            }

            if (planet) {
                planet.angle = planet.url !== 'yun2' ? this.getAngleForNextAngle(this._lastBlock, planet) : planet.angle;
            } else {
                if (this._lastBlock.blockInfo.url === 'ming') {
                    planet = planetMap['yun'];
                } else if (this._lastBlock.blockInfo.url === 'yun') {
                    planet = planetMap['hei'];
                } else {
                    planet = this.getRandomPlanetByLastBlock(this._lastBlock);
                }
            }

            const planetCopy = JSON.parse(JSON.stringify(planet));
            this.addBaoshiRandom(planetCopy);

            if (this._passHeiDong && planetCopy.url !== 'out0') {
                this.addObstacleRandom(planetCopy);
            }

            const block = this.createBlock(planetCopy, this.Id++);
            if (block.blockInfo.url === 'hei') {
                this._passHeiDong = true;
            }
            this[privateProps.uirender].renderOnePlanet(block);
        }
    }

    /**
     * 获取下一个角度
     */
    getAngleForNextAngle(block, nextBlockInfo) {
        const result = [];
        for (let i = -30; i < 30; i++) {
            const nextPoint = this.getNextPoint(block.circle, nextBlockInfo.radius, i).nextPoint;
            const max_X = nextPoint.currX + nextBlockInfo.radius;
            const min_x = nextPoint.currX - nextBlockInfo.radius;

            if (max_X < gameConfig.GameWidth - 20 && min_x > 20) {
                result.push(i >= 0 ? i : 360 + i);
            }
        }
        return result.length ? result[this.getRandomNumber(result.length)] : 0;
    }

    /**
     * 根据上一个星球获取随机星球
     */
    getRandomPlanetByLastBlock(block) {
        let nextBlockInfo;
        if (this._passHeiDong) {
            nextBlockInfo = planetMap['out0']; // 黑洞之后
        } else {
            const randomYun = yunList[this.getRandomNumber(yunList.length)];
            nextBlockInfo = planetMap[randomYun];
        }

        nextBlockInfo.radius = this.getRandomNumber(35, 45) * window.devicePixelRatio;
        nextBlockInfo.angle = this.getAngleForNextAngle(block, nextBlockInfo);
        return nextBlockInfo;
    }

    /**
     * 获取随机数
     */
    getRandomNumber(max, step) {
        return ~~(Math.random() * max) + (step || 0);
    }

    /**
     * 停止游戏
     */
    stop() {
        Laya.timer.clear(this, this.main_animation);
    }

    /**
     * 开始游戏
     */
    start() {
        console.log('start callback');
        Laya.timer.frameLoop(1, this, this.main_animation);
        // 验证定时器是否启动
        console.log('定时器已启动');
    }

    /**
     * 初始化飞机
     */
    initAirPlane() {
        this.air = new Airplane(this.currentBlock, this[privateProps.blocks]);
        this.addChild(this.air);
    }

    /**
     * 绑定事件
     */
    bindEvent() {
        document.addEventListener('touchstart', (e) => {
            if (e.touches[0].clientY < 50) return; // 点击顶部bar
            if (!this.air || this.air.gameOver || this.air.stoped) return;
            if (!this.guideControl.getGuideClickStatus()) return;

            if (this.guideControl.status) {
                this.air.reStart();
                this.guideControl.switchGuide();
            }

            const currentCutOffPoint = this.air.getSideState() === 1 ? this.checkInSideEdge() : null;

            if (currentCutOffPoint) {
                const nextBlock = this.getNextBlock(currentCutOffPoint);
                this.air.reRender(nextBlock, this.currentBlock, currentCutOffPoint);

                const url = nextBlock.blockInfo.url;
                if (yunList.indexOf(url) === -1 && ['wei', 'out0', 'hei', 'yun'].indexOf(url) === -1) {
                    this.maxQiu = url;
                }
                this.currentBlock = nextBlock;
            } else {
                this.air.changeSide();
            }
        }, false);
    }

    /**
     * 获取下一个星球块
     */
    getNextBlock(currentCutOffPoint) {
        for (let i = 0; i < currentCutOffPoint.blocks.length; i++) {
            const blockId = currentCutOffPoint.blocks[i];
            if (blockId !== this.currentBlock.keyId) {
                return this.getBlockByKeyId(blockId);
            }
        }
    }

    /**
     * 根据ID获取星球块
     */
    getBlockByKeyId(id) {
        for (let i = 0; i < this[privateProps.blocks].length; i++) {
            if (id === this[privateProps.blocks][i].keyId) {
                return this[privateProps.blocks][i];
            }
        }
    }

    /**
     * 检查内部边缘
     */
    checkInSideEdge() {
        for (let i = 0; i < this.currentBlock.cutOffPoints.length; i++) {
            const distance = Math.sqrt(
                Math.pow(this.air.plane.x - this.currentBlock.cutOffPoints[i].currX, 2) +
                Math.pow(this.air.plane.y - this.currentBlock.cutOffPoints[i].currY, 2)
            );
            //点击自动跳到下一个
            //if (i == this.currentBlock.cutOffPoints.length - 1) {
            //    return this.currentBlock.cutOffPoints[i];
            //}
            if (distance < IN_SIDE_EDGE_DISTANCE) {
                return this.currentBlock.cutOffPoints[i];
            }
        }
        return false;
    }

    /**
     * 初始化星球块
     */
    initBlocks() {
        const type = planetList.shift();
        if (!type) return;
        console.log('initBlocks', type);
        //console.log('planetMap', planetMap);
        const planet = JSON.parse(JSON.stringify(planetMap[type]));
        console.log('planet', planet);
        this.createBlock(planet, this.Id++);
    }

    /**
     * 初始化更多星球块
     */
    initMoreBlocks() {
        let planet = JSON.parse(JSON.stringify(planetMap['yun2']));
        this.addBaoshiRandom(planet);
        this.addMoreBlock(1, planet);

        for (let i = 1; i < 5; i++) {
            this.addMoreBlock(1);
        }

        const type = planetList.shift();
        if (!type) return;

        planet = JSON.parse(JSON.stringify(planetMap[type]));
        this.addBaoshiRandom(planet);
        this.addMoreBlock(1, planet);
    }

    /**
     * 添加宝石随机点
     */
    addBaoshiRandom(planet) {
        planet.energyPoints = [];
        if (this.getRandomNumber(4) > (window.isDIDUAN ? 2 : 1)) {
            planet.energyPoints.push({
                side: this.getRandomNumber(2, 1),
                angle: this.getRandomNumber(2, 1) % 2 ? this.getRandomNumber(20, 260) : this.getRandomNumber(20, 80)
            });
        }
        return planet;
    }

    /**
     * 添加障碍物随机点
     */
    addObstacleRandom(planet) {
        if (this.getRandomNumber(2)) {
            planet.obstacles = [];
            planet.obstacles.push({
                side: this.getRandomNumber(3, 2) % 2,
                angle: this.getRandomNumber(2, 1) % 2 ? this.getRandomNumber(20, 260) : this.getRandomNumber(20, 80)
            });
        }
        return planet;
    }

    /**
 * 创建游戏区块
 * @param {Object} planet - 行星数据
 * @param {number} index - 区块索引
 * @returns {Block} 创建的区块对象
 */
    createBlock(planet, index) {
        // 深拷贝行星数据，避免修改原始数据
        //const planet = JSON.parse(JSON.stringify(s_planet));

        // 处理好友数据
        this.processFriendData(planet, index);

        // 创建或获取连接点
        const { point, circle, pointObj } = this.createConnectionPoint(planet, index);

        // 创建区块
        const block = new Block(circle, point, '', planet, index);

        // 处理区块连接
        this.handleBlockConnection(block, index, pointObj);

        // 添加到区块列表
        this[privateProps.blocks].push(block);
        this._lastBlock = block;

        return block;
    }
    /**
 * 处理好友数据
 * @param {Object} planet - 行星对象
 * @param {number} index - 区块索引
 */
    processFriendData(planet, index) {
        const friend = (this._friendData || {})[index + 100];
        if (friend) {
            // 随机分配好友角度
            const angles = [90, 270, 120, 240];
            friend.angle = angles[this.getRandomNumber(4)];
            planet.friends = [friend];
        }
    }
    /**
     * 创建连接点
     * @param {Object} planet - 行星对象
     * @param {number} index - 区块索引
     * @returns {Object} 包含point、circle和pointObj的对象
     */
    createConnectionPoint(planet, index) {
        let point, circle, pointObj;

        if (this[privateProps.blocks].length > 0) {
            // 已有区块，创建连接点
            pointObj = this.getNextPoint(
                this._lastBlock.circle,
                planet.radius,
                planet.angle
            );
            point = pointObj.nextPoint;
            circle = this.createCircle(point, planet.radius);
        } else {
            // 第一个区块，创建初始点
            point = this.createPoint();
            circle = this.createCircle(point, planet.radius);
        }

        return { point, circle, pointObj };
    }
    /**
     * 处理区块连接
     * @param {Block} block - 当前区块
     * @param {number} index - 区块索引
     * @param {Object} pointObj - 连接点对象
     */
    handleBlockConnection(block, index, pointObj) {
        if (index <= 0) return;

        const preBlock = this.getPreBlock(index);
        if (!preBlock) return;

        // 创建切断点
        const cutOffPoint = this.createCutOffPoint(
            pointObj.cutOffPoint.currX,
            pointObj.cutOffPoint.currY,
            [preBlock.keyId, block.keyId]
        );

        // 为前后区块添加切断点
        preBlock.addCutOffPoints(cutOffPoint);
        block.addCutOffPoints(cutOffPoint);
    }
    /**
     * 获取前一个区块
     * @param {number} index - 当前区块索引
     * @returns {Block|null} 前一个区块或null
     */
    getPreBlock(index) {
        if (index <= 0 || index >= this[privateProps.blocks].length) {
            return null;
        }
        return this[privateProps.blocks][index - 1];
    }

    /**
     * 获取最后一个星球块
     */
    getLastBlock() {
        return this[privateProps.blocks][this[privateProps.blocks].length - 1];
    }

    /**
     * 获取前一个星球块
     */
    getPreBlock(index) {
        return this[privateProps.blocks][index - 1];
    }

    /**
     * 获取下一个点
     */
    getNextPoint(preCircle, radius, angle) {
        const sin = Math.sin(Math.PI * (angle || 0) / 180);
        const cos = Math.cos(Math.PI * (angle || 0) / 180);

        const dis = preCircle.radius + radius - preCircle.border;
        const x = sin * dis;
        const cutOffDis = preCircle.radius;
        const cutOffX = sin * cutOffDis;
        const y = -cos * dis;
        const cutOffY = -cos * cutOffDis;

        return {
            nextPoint: new Point(preCircle.point.currX + x, preCircle.point.currY + y),
            cutOffPoint: new Point(preCircle.point.currX + cutOffX, preCircle.point.currY + cutOffY)
        };
    }

    /**
     * 创建点
     */
    createPoint(x = gameConfig.startX, y = gameConfig.startY) {
        return new Point(x, y);
    }

    /**
     * 创建圆形
     */
    createCircle(point, radius) {
        return new Circle(point, radius);
    }

    /**
     * 创建连接点
     */
    createCutOffPoint(x, y, blockArrID) {
        return new CutOffPoint(x, y, blockArrID);
    }
}

export default Main;