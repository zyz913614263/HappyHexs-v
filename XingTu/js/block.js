/**
    * 区块类
    * 代表游戏中的一个完整区域，管理该区域内的所有游戏元素
    */
class Block {
    /**
     * 构造函数
     * @param {Object} circle - 圆圈对象，定义区块的边界
     * @param {Object} point - 中心点对象
     * @param {Array} cutOffPoints - 切断点数组
     * @param {Object} blockInfo - 区块配置信息
     * @param {number} index - 区块索引
     */
    constructor(circle, point, cutOffPoints, blockInfo, index) {
        // 初始化元素集合
        this.cutOffPoints = [];      // 切断点集合
        this.energyPoints = [];      // 能量点集合
        this.obstacles = [];         // 障碍物集合
        this.friends = [];           // 好友头像集合

        // 添加初始切断点
        if (cutOffPoints) {
            this.cutOffPoints.push(cutOffPoints);
        }

        // 设置基本属性
        this.circle = circle;        // 圆圈边界
        this.point = point;          // 中心点
        this.blockInfo = blockInfo;  // 区块配置信息
        this.keyId = index + 1;      // 唯一标识ID

        // 状态标记
        this.isDestroyed = false;
    }

    /**
     * 销毁区块
     * 清理所有引用和资源
     */
    destroy() {
        // 清理元素集合
        this.friends = null;
        this.cutOffPoints = null;
        this.energyPoints = null;
        this.obstacles = null;

        // 清理基本属性
        this.circle = null;
        this.point = null;
        this.blockInfo = null;

        // 标记已销毁
        this.isDestroyed = true;
    }

    /**
     * 设置圆圈边界
     * @param {Object} circle - 新的圆圈对象
     * @returns {Object} 当前圆圈对象
     */
    setCircle(circle) {
        this.circle = circle;
        return this.circle;
    }

    /**
     * 添加切断点
     * @param {Object} point - 切断点对象
     * @returns {Array} 切断点集合
     */
    addCutOffPoints(point) {
        this.cutOffPoints.push(point);
        return this.cutOffPoints;
    }

    /**
     * 添加好友头像
     * @param {Object} friend - 好友头像对象
     * @returns {Array} 好友头像集合
     */
    addFriend(friend) {
        this.friends.push(friend);
        return this.friends;
    }

    /**
     * 添加能量点
     * @param {Object} energyPoint - 能量点对象
     * @returns {Array} 能量点集合
     */
    addEnergyPoints(energyPoint) {
        this.energyPoints.push(energyPoint);
        return this.energyPoints;
    }

    /**
     * 添加障碍物
     * @param {Object} obstacle - 障碍物对象
     * @returns {Array} 障碍物集合
     */
    addObstacle(obstacle) {
        this.obstacles.push(obstacle);
        return this.obstacles;
    }

    /**
     * 设置中心点
     * @param {Object} point - 新的中心点对象
     * @returns {Object} 当前中心点对象
     */
    setPoint(point) {
        this.point = point;
        return this.point;
    }

    /**
     * 获取区块信息
     * @returns {Object} 区块信息对象
     */
    getBlockInfo() {
        return {
            keyId: this.keyId,
            centerPoint: this.point,
            circle: this.circle,
            cutOffPointsCount: this.cutOffPoints.length,
            energyPointsCount: this.energyPoints.length,
            obstaclesCount: this.obstacles.length,
            friendsCount: this.friends.length,
            isDestroyed: this.isDestroyed
        };
    }

    /**
     * 检查区块是否为空
     * @returns {boolean} 是否为空
     */
    isEmpty() {
        return this.cutOffPoints.length === 0 &&
            this.energyPoints.length === 0 &&
            this.obstacles.length === 0 &&
            this.friends.length === 0;
    }

    /**
     * 获取所有游戏元素
     * @returns {Array} 所有游戏元素的数组
     */
    getAllElements() {
        return [
            ...this.cutOffPoints,
            ...this.energyPoints,
            ...this.obstacles,
            ...this.friends
        ];
    }

    /**
     * 移除指定类型的元素
     * @param {string} elementType - 元素类型
     * @param {Object} element - 要移除的元素
     * @returns {boolean} 是否成功移除
     */
    removeElement(elementType, element) {
        let collection;

        switch (elementType) {
            case 'cutOffPoint':
                collection = this.cutOffPoints;
                break;
            case 'energyPoint':
                collection = this.energyPoints;
                break;
            case 'obstacle':
                collection = this.obstacles;
                break;
            case 'friend':
                collection = this.friends;
                break;
            default:
                return false;
        }

        const index = collection.indexOf(element);
        if (index > -1) {
            collection.splice(index, 1);
            return true;
        }

        return false;
    }

    /**
     * 检查区块是否包含指定元素
     * @param {Object} element - 要检查的元素
     * @returns {boolean} 是否包含
     */
    containsElement(element) {
        return this.getAllElements().includes(element);
    }

    /**
     * 清理所有元素
     */
    clearAllElements() {
        this.cutOffPoints.length = 0;
        this.energyPoints.length = 0;
        this.obstacles.length = 0;
        this.friends.length = 0;
    }
}

// 导出Block类
export default Block;