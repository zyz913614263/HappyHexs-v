// 导入依赖模块
import musicInstance from './music.js';
import GuideControls from './guide.js';
import Light from './light.js';
import Combo from './combo.js';
import { gameConfig } from './config.js';

// 游戏常量
const AIRPLANE_CONSTANTS = {
    EDGE_DISTANCE_OUTSIDE: 40 * window.devicePixelRatio,
    IMAGE_ZOOM: 2.5,
    IMG_HEIGHT: 90 * window.devicePixelRatio,
    IMG_WIDTH: 57 * window.devicePixelRatio,
    PLANE_RADIUS: 57 / 5 * window.devicePixelRatio,
    RADIUS: 388 / 4 * window.devicePixelRatio,
    ANIMATION_FRAME_RATE: 1,
    CHECK_FRAME_RATE: 3,
    DEAD_FRAME_RATE: 7,
    BUFFER_ANGLE: 10,
    START_INDEX: 7
};

// 运动方向枚举
const DIRECTION = {
    COUNTERCLOCKWISE: 1,  // 逆时针
    CLOCKWISE: 2           // 顺时针
};

// 轨道侧枚举
const SIDE = {
    INSIDE: 1,   // 内侧
    OUTSIDE: 2   // 外侧
};

/**
 * 飞机类
 * 游戏的核心角色，负责控制玩家飞机的所有行为
 */
class AirPlane extends Laya.Sprite {
    /**
     * 构造函数
     * @param {Object} block - 当前区块
     * @param {Array} blocks - 所有区块数组
     * @param {number} direction - 运动方向
     * @param {string} type - 飞机类型
     */
    constructor(block, blocks, direction, type) {
        super();

        this.type = type;
        this.initData(block, blocks, direction);
        this.initSelf();
    }

    /**
     * 初始化数据
     * @param {Object} block - 当前区块
     * @param {Array} blocks - 所有区块数组
     * @param {number} direction - 运动方向
     */
    initData(block, blocks, direction) {
        this.block = block;
        this.blocks = blocks;
        this.SPEED = 1.5;
        this.speed = this.SPEED;
        this.radius = block.circle.radius;
        this.direction = direction || DIRECTION.COUNTERCLOCKWISE;
        this._rotation = 0;
        this.planeRotation = 0;

        // 游戏状态
        this.lifes = 1;
        this.protectiveLayer = [];
        this.blockArr = [];
        this.level = 1;
        this.gemCount = 0;
        this.runCircleRotation = 0;
        this.playHistory = [];
        this.gameOver = false;
        this.isStopped = false;

        this.getNextPreBlockArr();
    }

    /**
     * 初始化自身
     */
    initSelf() {
        this.initUI();
        this.alpha = 0;
        this.start();

        if (this.type !== 'rewards') {
            this.bindEvents();
        }
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        window._Event.on('play_reward', () => {
            this.stop();
            this.playRewards();
            musicInstance.playZhuan();

            setTimeout(() => {
                if (this._light) {
                    this._light.reset();
                } else {
                    this._light = new Light();
                    window.stage.addChild(this._light);
                    this._light.createSp();
                }
            }, 300);
        });

        window._Event.on('go_on', () => {
            this.start();
        });
    }

    /**
     * 重置飞机
     * @param {Object} block - 新区块
     * @param {Array} blocks - 新区块数组
     * @param {number} direction - 新方向
     */
    reset(block, blocks, direction) {
        this.stop();
        this.zOrder = 1000;
        this.gameOver = false;
        this.initData(block, blocks, direction);
        this.setPlanePosition();
        this.loadImage();
        this.visible = true;
        this.plane.visible = true;
        this.start();

        if (this.deadSprite) {
            this.deadSprite.graphics.clear();
        }
    }

    /**
     * 设置飞机位置
     */
    setPlanePosition() {
        const x = this.block.point.currX - AIRPLANE_CONSTANTS.IMG_WIDTH / AIRPLANE_CONSTANTS.IMAGE_ZOOM / 2;
        const y = this.block.point.currY - AIRPLANE_CONSTANTS.IMG_HEIGHT / AIRPLANE_CONSTANTS.IMAGE_ZOOM / 2;

        this.plane.pivotX = AIRPLANE_CONSTANTS.IMG_WIDTH / AIRPLANE_CONSTANTS.IMAGE_ZOOM / 2;
        this.plane.pivotY = AIRPLANE_CONSTANTS.IMG_HEIGHT / AIRPLANE_CONSTANTS.IMAGE_ZOOM / 2;
        this.plane.x = x;
        this.plane.y = y;
    }

    /**
     * 初始化UI
     */
    initUI() {
        this.plane = new Laya.Sprite();
        this.loadImage();
        this.setPlanePosition();
        this.addChild(this.plane);
    }

    /**
     * 改变速度
     */
    changeSpeed() {
        this.speed = AIRPLANE_CONSTANTS.RADIUS / this._radius *
            (this.SPEED + Math.floor(this.level / 4) * 0.08);
    }

    /**
     * 加载图片
     */
    loadImage() {
        this.plane.graphics.clear();
        this.plane.graphics.loadImage(
            `${gameConfig.LOCAL_URL}/fei1.png`,
            0, 0,
            AIRPLANE_CONSTANTS.IMG_WIDTH / AIRPLANE_CONSTANTS.IMAGE_ZOOM,
            AIRPLANE_CONSTANTS.IMG_HEIGHT / AIRPLANE_CONSTANTS.IMAGE_ZOOM
        );
    }

    /**
     * 添加保护层
     */
    addProtectiveLayer() {
        const sp = new Laya.Sprite();
        sp.graphics.loadImage(
            `${gameConfig.LOCAL_URL}/baohuceng.png`,
            -AIRPLANE_CONSTANTS.IMG_WIDTH / AIRPLANE_CONSTANTS.IMAGE_ZOOM / 2 - 1,
            -AIRPLANE_CONSTANTS.IMG_HEIGHT / AIRPLANE_CONSTANTS.IMAGE_ZOOM / 2 + 1,
            106 / AIRPLANE_CONSTANTS.IMAGE_ZOOM,
            106 / AIRPLANE_CONSTANTS.IMAGE_ZOOM
        );

        this.plane.addChild(sp);
        this.protectiveLayer.push(sp);
        this.lifes++;
        console.warn("添加保护层，当前生命:", this.lifes);
    }

    /**
     * 移除保护层
     */
    removeProtectiveLayer() {
        const layer = this.protectiveLayer.pop();
        if (layer) {
            layer.destroy();
        }
        this.lifes--;
        console.warn("移除保护层，当前生命:", this.lifes);
    }

    /**
     * 跳跃到新轨道
     * @param {Object} block - 新区块
     * @param {Object} preBlock - 前一个区块
     */
    jumpCircle(block, preBlock) {
        this.block = block;
        this.getNextPreBlockArr();
        this.radius = block.circle.radius;
        this.direction = block.keyId % 2 ? DIRECTION.COUNTERCLOCKWISE : DIRECTION.CLOCKWISE;

        // 向上移动
        if ((preBlock?.keyId || -1) < block.keyId) {
            const angle = block.blockInfo.angle || 0;

            if (this.direction === DIRECTION.COUNTERCLOCKWISE) {
                this._rotation = 360 - angle + AIRPLANE_CONSTANTS.BUFFER_ANGLE;
            } else {
                this._rotation = 180 - angle - AIRPLANE_CONSTANTS.BUFFER_ANGLE;
            }

            if (this.type !== 'rewards') {
                const isReward = preBlock?.isRewardCircle || this.runCircleRotation < 360;
                this.playHistory.push(isReward ? 1 : 0);
                this.addScore(block, 0, this.plane.x, this.plane.y, this.direction);
            }

            this.runCircleRotation = 0;
        } else {
            // 向下移动
            const angle = preBlock?.blockInfo.angle || 0;

            if (this.direction === DIRECTION.CLOCKWISE) {
                this._rotation = 360 - angle - AIRPLANE_CONSTANTS.BUFFER_ANGLE;
            } else {
                this._rotation = 180 - angle + AIRPLANE_CONSTANTS.BUFFER_ANGLE;
            }
        }

        // 调整飞机姿态
        this.planeRotation = -this._rotation;
        this._radius = this.radius - this.block.circle.border - AIRPLANE_CONSTANTS.PLANE_RADIUS;

        if (this.type !== 'rewards') {
            window.coordinate.addLightYear(this.block.keyId);
            this.level++;
            this.destroyPassedBlocks();
        }
    }

    /**
     * 销毁已通过的区块
     */
    destroyPassedBlocks() {
        if (this.block.keyId > AIRPLANE_CONSTANTS.START_INDEX) {
            var blockToDestroy = this.blocks[this.block.keyId - AIRPLANE_CONSTANTS.START_INDEX - 1];

            if (blockToDestroy._destroy || !blockToDestroy.planetUI) {
                return;
            }

            // 销毁星球UI
            blockToDestroy.planetUI.destroy();
            blockToDestroy.planetUI = null;

            // 销毁好友头像
            blockToDestroy.friends.forEach(item => item.destroy());

            // 销毁障碍物
            blockToDestroy.obstacles.forEach(item => item.destroy());

            // 销毁能量点
            blockToDestroy.energyPoints.forEach(item => item.destroy());

            blockToDestroy = null;
        }
    }

    /**
     * 添加分数
     * @param {Object} block - 区块
     * @param {number} num - 分数
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {number} direction - 方向
     */
    addScore(block, num, x, y, direction) {
        const score = num || this.getFlyScore(x, y, direction);

        if (this.type !== 'rewards') {
            this.drawScoreNumber(score, x || block.point.currX, y || block.point.currY);
        }

        window.coordinate.addScore(score);
    }

    /**
     * 获取飞行分数
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {number} direction - 方向
     * @returns {number} 分数
     */
    getFlyScore(x, y, direction) {
        const playCombo = () => {
            if (combo > 1) {
                const comboObj = Laya.Pool.getItemByClass("Combo", Combo);
                const offsetX = direction === DIRECTION.COUNTERCLOCKWISE ? -20 : 20;

                comboObj.pos(
                    x + offsetX * window.devicePixelRatio,
                    y - 40 * window.devicePixelRatio
                );

                this.addChild(comboObj);
                comboObj.renderCombo(combo - 1, direction);
                musicInstance.playCombo();
                window.coordinate.setCombo(combo - 1);
            } else {
                musicInstance.playSuccess();
            }
        };

        let score = 100;
        let combo = 0;

        // 计算连击数
        for (let i = this.playHistory.length - 1; i >= 0; i--) {
            if (this.playHistory[i]) {
                combo += 1;
                score = 200;

                if (combo > 31) {
                    score = 400;
                } else if (combo > 16) {
                    score = 300;
                }
            } else {
                playCombo();
                return score;
            }
        }

        playCombo();
        return score;
    }

    /**
     * 绘制分数数字
     * @param {number} num - 分数
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     */
    drawScoreNumber(num, x, y) {
        const scoreSprite = Laya.Pool.getItemByClass("scoreSp", Laya.Sprite);
        scoreSprite.graphics.clear();
        scoreSprite.scaleX = 1;
        scoreSprite.scaleY = 1;
        scoreSprite.alpha = 1;

        scoreSprite.graphics.loadImage(
            `${gameConfig.LOCAL_URL}/result/${num}.png`,
            -10 * window.devicePixelRatio,
            -40 * window.devicePixelRatio,
            69 / 2 * window.devicePixelRatio,
            26 / 2 * window.devicePixelRatio
        );

        scoreSprite.pos(x, y);
        this.addChild(scoreSprite);

        // 分数动画
        Laya.Tween.to(scoreSprite, {
            y: scoreSprite.y - 50 * window.devicePixelRatio,
            alpha: 0,
            scaleX: 1.2,
            scaleY: 1.2
        }, 1000, Laya.Ease.linearNone, Laya.Handler.create(this, () => {
            Laya.Pool.recover('scoreSp', scoreSprite);
        }));
    }

    /**
     * 启动飞机
     */
    start() {
        // 根据引导状态设置初始轨道
        if (GuideControls._guide) {
            this._radius = this.radius + this.block.circle.border + AIRPLANE_CONSTANTS.PLANE_RADIUS;
        } else {
            this._radius = this.radius + this.block.circle.border - AIRPLANE_CONSTANTS.PLANE_RADIUS;
        }

        Laya.timer.frameLoop(AIRPLANE_CONSTANTS.ANIMATION_FRAME_RATE, this, this.animate);
        Laya.timer.frameLoop(AIRPLANE_CONSTANTS.CHECK_FRAME_RATE, this, this.checkAnimation);
        this.isStopped = false;
    }

    /**
     * 重新启动
     */
    reStart() {
        this.status = '';
        Laya.timer.frameLoop(AIRPLANE_CONSTANTS.ANIMATION_FRAME_RATE, this, this.animate);
        Laya.timer.frameLoop(AIRPLANE_CONSTANTS.CHECK_FRAME_RATE, this, this.checkAnimation);
        this.isStopped = false;
    }

    /**
     * 停止飞机
     * @param {boolean} isGuideStop - 是否为引导停止
     */
    stop(isGuideStop = false) {
        Laya.timer.clear(this, this.animate);
        Laya.timer.clear(this, this.checkAnimation);

        if (!isGuideStop) {
            this.isStopped = true;
        }
    }

    /**
     * 动画更新
     */
    animate() {
        GuideControls.showGuideStep1(this);
        GuideControls.showGuideStep2(this);

        this.setPosition();
        this.alpha = 1;

        // 飞机自身旋转
        this.plane.rotation = this.planeRotation + 90;
        this.changeSpeed();

        // 根据方向更新旋转
        if (this.direction === DIRECTION.CLOCKWISE) {
            this.planeRotation += this.speed;
            this._rotation -= this.speed;
        } else {
            this.planeRotation -= this.speed;
            this._rotation += this.speed;
        }

        this.runCircleRotation += this.speed;
    }

    /**
     * 检查动画
     */
    checkAnimation() {
        this.isGameOver();
        this.checkEnergyCollision();
        this.checkObstacleCollision();
        this.checkFriendCollision();
    }

    /**
     * 检查能量点碰撞
     */
    checkEnergyCollision() {
        const { x, y } = this.plane;

        this.blockArr.forEach(block => {
            block.energyPoints.forEach(energyPoint => {
                if (!energyPoint.isDestroyed && energyPoint.checkCollision(x, y)) {
                    energyPoint.isDestroyed = true;
                    this.addScore({}, 300, x, y);

                    if (this.type === 'rewards') {
                        window.coordinate.addRewardEnergyNum(1);
                    } else {
                        window.coordinate.addEnergyNum(1);
                    }

                    musicInstance.playEnergy();
                    this.gemCount++;
                }
            });
        });
    }

    /**
     * 检查障碍物碰撞
     */
    checkObstacleCollision() {
        const { x, y } = this.plane;

        this.blockArr.forEach(block => {
            block.obstacles.forEach(obstacle => {
                if (!obstacle.isDestroyed && obstacle.checkCollision(x, y)) {
                    obstacle.isDestroyed = true;
                    this.destroy();
                    musicInstance.playBond();
                    obstacle.visible = false;
                }
            });
        });
    }

    /**
     * 检查好友头像碰撞
     */
    checkFriendCollision() {
        const { x, y } = this.plane;

        this.blockArr.forEach(block => {
            block.friends.forEach(friend => {
                if (!friend.isDestroyed && friend.checkCollision(x, y)) {
                    this.addScore({}, 400, x, y);
                    friend.isDestroyed = true;
                    musicInstance.playFriend();
                }
            });
        });
    }

    /**
     * 获取前后区块数组
     */
    getNextPreBlockArr() {
        let index = 0;

        if (this.block.keyId === 1) {
            this.blockArr = this.blocks.slice(index, index + 2);
        } else {
            index = this.block.keyId - 1;
            this.blockArr = this.blocks.slice(index - 1, index + 2);
        }
    }

    /**
     * 设置位置
     */
    setPosition() {
        // 根据轨道侧调整半径
        this.getSideState() === SIDE.INSIDE ? this.moveToInside() : this.moveToOutside();

        let rotation = this._rotation;

        if (this.direction === DIRECTION.CLOCKWISE) {
            rotation += 180;
        }

        const centerPoint = this.block.circle.point;
        const x = this._radius * Math.sin(Math.PI * rotation / 180) + centerPoint.currX;
        const y = this._radius * Math.cos(Math.PI * rotation / 180) + centerPoint.currY;

        this.plane.pos(x, y);
    }

    /**
     * 设置方向
     * @param {number} direction - 新方向
     */
    setDirection(direction) {
        this.direction = direction;
    }

    /**
     * 切换轨道侧
     */
    changeSide() {
        this._radius > this.radius ? this.moveToInside() : this.moveToOutside();
    }

    /**
     * 移动到外侧
     */
    moveToOutside() {
        this._radius = this.radius + this.block.circle.border + AIRPLANE_CONSTANTS.PLANE_RADIUS;
    }

    /**
     * 移动到内侧
     */
    moveToInside() {
        this._radius = this.radius - this.block.circle.border - AIRPLANE_CONSTANTS.PLANE_RADIUS;
    }

    /**
     * 获取轨道侧状态
     * @returns {number} 轨道侧 (1:内侧, 2:外侧)
     */
    getSideState() {
        return this._radius > this.radius ? SIDE.OUTSIDE : SIDE.INSIDE;
    }

    /**
     * 检查外侧边界碰撞
     * @returns {boolean} 是否碰撞
     */
    checkOutsideEdge() {
        const cutOffPoints = this.block.cutOffPoints;

        for (let i = 0; i < cutOffPoints.length; i++) {
            const distance = Math.sqrt(
                Math.pow(this.plane.x - cutOffPoints[i].currX, 2) +
                Math.pow(this.plane.y - cutOffPoints[i].currY, 2)
            );

            if (distance < AIRPLANE_CONSTANTS.EDGE_DISTANCE_OUTSIDE) {
                musicInstance.playBond();
                return true;
            }
        }

        return false;
    }

    /**
     * 销毁飞机
     */
    destroy() {
        if (this.type === 'rewards') {
            this._times = 0;
            this.rewardsDead();
        } else {
            this.plane.graphics.clear();
            this.startDead();
        }

        this.gameOver = true;
        this.stop();

        setTimeout(() => {
            const eventName = this.type === 'rewards' ? 'end_rewards' : 'dead';
            window._Event.emit(eventName, Date.now());
        }, 400);
    }

    /**
     * 奖励模式死亡
     */
    rewardsDead() {
        if (this._times >= 2) {
            this.plane.visible = false;
            this.visible = true;
            return;
        }

        Laya.Tween.to(this.plane, {
            alpha: 0
        }, 300, Laya.Ease.linearNone, Laya.Handler.create(this, () => {
            this.showPlane();
            this._times++;
        }));
    }

    /**
     * 显示飞机
     */
    showPlane() {
        Laya.Tween.to(this.plane, {
            alpha: 1
        }, 300, Laya.Ease.linearNone, Laya.Handler.create(this, () => {
            this.rewardsDead();
        }));
    }

    /**
     * 开始死亡动画
     */
    startDead() {
        this._index = 1;

        if (!this.deadSprite) {
            this.deadSprite = new Laya.Sprite();
            this.plane.addChild(this.deadSprite);
        }

        Laya.timer.frameLoop(AIRPLANE_CONSTANTS.DEAD_FRAME_RATE, this, this.animateDead);
    }

    /**
     * 停止死亡动画
     */
    stopDead() {
        Laya.timer.clear(this, this.animateDead);
        this.deadSprite.graphics.clear();
        this.plane.visible = false;
        this.visible = true;
    }

    /**
     * 死亡动画
     */
    animateDead() {
        this._index++;
        this.deadSprite.graphics.clear();

        this.deadSprite.graphics.loadImage(
            `${gameConfig.LOCAL_URL}/bone/${this._index}.png`,
            -129 * window.devicePixelRatio / 2 + 40,
            -112 * window.devicePixelRatio / 2 + 40,
            129 * window.devicePixelRatio,
            112 * window.devicePixelRatio
        );

        if (this._index >= 5) {
            this.deadSprite.graphics.clear();
            this.stopDead();
        }
    }

    /**
     * 检查游戏是否结束
     * @returns {boolean} 是否结束
     */
    isGameOver() {
        if (this.getSideState() === SIDE.OUTSIDE && this.checkOutsideEdge()) {
            this.destroy();
            return true;
        }
        return false;
    }

    /**
     * 设置锚点
     * @param {Object} block - 新区块
     */
    setAnchor(block) {
        this.block = block;
        this.radius = block.circle.radius;
    }

    /**
     * 获取锚点
     * @returns {Object} 当前区块
     */
    getAnchor() {
        return this.block;
    }

    /**
     * 播放奖励效果
     */
    playRewards() {
        this.currentBlock.isRewardCircle = true;

        if (this.light) {
            this.light.alpha = 1;
            this.light.scaleX = 1;
            this.light.scaleY = 1;

            Laya.Tween.to(this.light, {
                scaleX: 4,
                scaleY: 4,
                alpha: 0
            }, 500);
            return;
        }

        this.light = new Laya.Sprite();
        this.light.loadImage(`${gameConfig.LOCAL_URL}/light/light.png`);

        Laya.Tween.to(this.light, {
            scaleX: 4,
            scaleY: 4,
            alpha: 0
        }, 500);

        this.plane.addChild(this.light);
        this.light.pivot(282 / 2, 282 / 2);
    }

    /**
     * 获取当前区块
     */
    get currentBlock() {
        return this.block;
    }

    /**
     * 获取下一个区块
     */
    get nextBlock() {
        for (let i = 0; i < this.blocks.length; i++) {
            if (this.blocks[i].keyId === this.block.keyId + 1) {
                return this.blocks[i];
            }
        }
        return null;
    }
    reRender(block, preBlock) {
        this.jumpCircle(block, preBlock);
    }
    _destory() {
        if (this.type == 'rewards') {
            this._times = 0;
            this.rewardsDead();
        } else {
            this.plane.graphics.clear();
            this.startDead();
        }
        this.gameOver = 1;

        this.stop();
        setTimeout(function (res) {
            window._Event.emit(this.type == 'rewards' ? 'end_rewards' : 'dead', Date.now());
        }, 400);
    }
}

// 导出AirPlane类
export default AirPlane;