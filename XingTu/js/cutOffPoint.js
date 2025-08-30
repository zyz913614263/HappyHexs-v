import Point from './point.js';

/**
 * 切断点类 - 继承自Point，用于管理关联的方块
 * CutOffPoint class - extends Point, manages associated blocks
 */

// 私有属性符号定义
const PRIVATE_PROPS = {
    block: Symbol('block')  // 方块数组的私有符号
};

/**
 * 切断点类
 * 继承自Point类，增加了方块管理功能
 */
class CutOffPoint extends Point {
    /**
     * 构造函数
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {Array} blockArr - 初始方块数组，默认为空数组
     */
    constructor(x, y, blockArr = []) {
        super(x, y);
        this[PRIVATE_PROPS.block] = blockArr;
    }

    /**
     * 添加方块到切断点
     * @param {*} block - 要添加的方块
     */
    addBlock(block) {
        this[PRIVATE_PROPS.block].push(block);
    }

    /**
     * 获取所有关联的方块
     * @returns {Array} 方块数组
     */
    get blocks() {
        return this[PRIVATE_PROPS.block];
    }

    /**
     * 获取方块数量
     * @returns {number} 方块数量
     */
    get blockCount() {
        return this[PRIVATE_PROPS.block].length;
    }

    /**
     * 检查是否有关联的方块
     * @returns {boolean} 是否有关联方块
     */
    hasBlocks() {
        return this[PRIVATE_PROPS.block].length > 0;
    }

    /**
     * 清空所有关联的方块
     */
    clearBlocks() {
        this[PRIVATE_PROPS.block] = [];
    }

    /**
     * 移除指定的方块
     * @param {*} block - 要移除的方块
     * @returns {boolean} 是否成功移除
     */
    removeBlock(block) {
        const index = this[PRIVATE_PROPS.block].indexOf(block);
        if (index > -1) {
            this[PRIVATE_PROPS.block].splice(index, 1);
            return true;
        }
        return false;
    }
}

// 导出类
export default CutOffPoint;