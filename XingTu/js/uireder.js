// 导入依赖模块
import ObstaclePoint from './obstacle.js';
import EnergyPoint from './energypoint.js';
import PlanetUI from './planetui.js';
import Friend from './friend.js';


/**
 * UI渲染器类
 * 负责渲染游戏中的所有星球界面元素
 */
class UIRender extends Laya.Sprite {
    /**
     * 构造函数
     * @param {Array} blocks - 星球块数组
     */
    constructor(blocks) {
        super();

        this.blocks = blocks;
        this.initSelf();
    }

    /**
     * 初始化自身
     */
    initSelf() {
        this.initUI();
    }

    /**
     * 重置渲染器
     * @param {Array} blocks - 新的星球块数组
     */
    reset(blocks) {
        this.blocks = blocks;
        this.initSelf(blocks);
    }

    /**
     * 渲染障碍物
     * @param {Object} block - 星球块对象
     */
    renderObstacles(block) {
        const planet = block.blockInfo;
        const obstacles = planet.obstacles || [];

        obstacles.forEach(item => {
            // 从对象池获取障碍物实例
            const obstacle = Laya.Pool.getItemByClass("Obstacle", ObstaclePoint);

            // 初始化障碍物
            obstacle.init(block, item.side, item.angle, item.move);
            obstacle.visible = true;

            // 添加到星球块和渲染器
            block.addObstacle(obstacle);
            this.addChild(obstacle);
        });
    }

    /**
     * 渲染能量点
     * @param {Object} block - 星球块对象
     */
    renderEnergyPoints(block) {
        const planet = block.blockInfo;
        const energyPoints = planet.energyPoints || [];

        energyPoints.forEach(item => {
            // 创建新的能量点实例
            const energyPoint = new EnergyPoint();

            // 初始化能量点
            energyPoint.init(block, item.side, item.angle);
            energyPoint.visible = true;

            // 添加到星球块和渲染器
            block.addEnergyPoints(energyPoint);
            energyPoint.zOrder = 10000; // 设置层级
            this.addChild(energyPoint);
        });
    }

    /**
     * 渲染好友头像
     * @param {Object} block - 星球块对象
     */
    renderFriend(block) {
        const planet = block.blockInfo;
        const friends = planet.friends || [];

        friends.forEach(item => {
            // 从对象池获取好友头像实例
            const friend = Laya.Pool.getItemByClass("Friend", Friend);

            // 初始化好友头像
            friend.init(block, item);
            friend.visible = true;

            // 添加到星球块和渲染器
            block.addFriend(friend);
            friend.zOrder = 10000; // 设置层级
            this.addChild(friend);
        });
    }

    /**
     * 初始化界面
     * 为所有星球块创建UI元素
     */
    initUI() {
        this.blocks.forEach(block => {
            // 创建星球UI
            block.planetUI = Laya.Pool.getItemByClass("PlanetUI", PlanetUI);
            block.planetUI.reset(block);
            block.planetUI.visible = true;
            this.addChild(block.planetUI);

            // 渲染各种元素
            this.renderObstacles(block);
            this.renderEnergyPoints(block);
            this.renderFriend(block);
        });
    }

    /**
     * 渲染单个星球
     * @param {Object} block - 星球块对象
     */
    renderOnePlanet(block) {
        // 创建星球UI
        block.planetUI = Laya.Pool.getItemByClass("PlanetUI", PlanetUI);
        block.planetUI.reset(block);
        block.planetUI.visible = true;
        this.addChild(block.planetUI);

        // 渲染各种元素
        this.renderObstacles(block);
        this.renderEnergyPoints(block);
        this.renderFriend(block);
    }

    /**
     * 渲染单个能量点
     * @param {Object} block - 星球块对象
     * @param {Object} point - 能量点数据
     */
    renderOneEnergyPoint(block, point) {
        const planet = block.blockInfo;

        // 创建新的能量点
        const energyPoint = new EnergyPoint();
        energyPoint.init(block, point.side, point.angle);

        // 添加到星球块和渲染器
        block.addEnergyPoints(energyPoint);
        energyPoint.zOrder = 10000;
        this.addChild(energyPoint);
    }

    /**
     * 清理资源
     */
    destroy() {
        // 清理所有子元素
        this.removeChildren();

        // 清理引用
        this.blocks = null;

        // 调用父类销毁方法
        super.destroy();
    }
}

// 导出UIRender类
export default UIRender;