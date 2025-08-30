/**
    * 微信请求队列管理器
    * 用于弥补wx.request的并发限制问题，特别是数据上报场景
    * 微信小程序限制同时最多只能发起5个网络请求
    * 这是一个全局模块，管理整个应用的网络请求
    */

// 获取全局的wx对象
const app = wx;

// 请求配置
const REQUEST_CONFIG = {
    MAX_REQUEST_COUNT: 5,        // 最大并发请求数
    RETRY_TIMES: 3,             // 请求失败重试次数
    RETRY_DELAY: 1000,          // 重试延迟时间（毫秒）
    TIMEOUT: 30000              // 请求超时时间（毫秒）
};

// 请求状态枚举
const REQUEST_STATUS = {
    PENDING: 'pending',         // 等待中
    RUNNING: 'running',         // 执行中
    COMPLETED: 'completed',     // 已完成
    FAILED: 'failed'            // 失败
};

// 初始化请求管理器
app.MAX_REQUEST_COUNT = REQUEST_CONFIG.MAX_REQUEST_COUNT;
app.currentRunning = 0;        // 当前正在执行的请求数量
app.requestQueue = [];         // 请求队列
app.requestStats = {            // 请求统计信息
    total: 0,
    success: 0,
    failed: 0,
    queued: 0
};

/**
 * 请求队列项结构
 */
class RequestQueueItem {
    constructor(data, context = app) {
        this.id = this.generateId();           // 唯一标识
        this.context = context;                // 请求上下文
        this.reqData = data;                   // 请求数据
        this.status = REQUEST_STATUS.PENDING;  // 请求状态
        this.createTime = Date.now();          // 创建时间
        this.retryCount = 0;                   // 重试次数
        this.priority = data.priority || 0;    // 请求优先级（数字越大优先级越高）
    }

    /**
     * 生成唯一ID
     */
    generateId() {
        return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * 更新状态
     */
    updateStatus(status) {
        this.status = status;
        if (status === REQUEST_STATUS.COMPLETED) {
            this.completeTime = Date.now();
        }
    }
}

/**
 * 请求队列管理器
 */
class RequestQueueManager {
    constructor() {
        this.isProcessing = false;
    }

    /**
     * 添加请求到队列
     * @param {Object} data - 请求数据
     * @param {Object} context - 请求上下文
     * @returns {RequestQueueItem} 请求队列项
     */
    addRequest(data, context = app) {
        const queueItem = new RequestQueueItem(data, context);

        // 根据优先级插入队列
        this.insertByPriority(queueItem);

        app.requestStats.total++;
        app.requestStats.queued++;

        console.log(`请求已入队，ID: ${queueItem.id}, 队列长度: ${app.requestQueue.length}`);

        // 尝试处理队列
        this.processQueue();

        return queueItem;
    }

    /**
     * 根据优先级插入队列
     * @param {RequestQueueItem} item - 请求项
     */
    insertByPriority(item) {
        const queue = app.requestQueue;
        let insertIndex = queue.length;

        // 找到合适的插入位置
        for (let i = 0; i < queue.length; i++) {
            if (queue[i].priority < item.priority) {
                insertIndex = i;
                break;
            }
        }

        queue.splice(insertIndex, 0, item);
    }

    /**
     * 处理请求队列
     */
    processQueue() {
        if (this.isProcessing) {
            return;
        }

        this.isProcessing = true;
        this.processNextRequest();
    }

    /**
     * 处理下一个请求
     */
    processNextRequest() {
        // 检查是否可以发起新请求
        if (app.currentRunning >= app.MAX_REQUEST_COUNT || app.requestQueue.length === 0) {
            this.isProcessing = false;
            return;
        }

        // 获取下一个请求
        const queueItem = app.requestQueue.shift();
        if (!queueItem) {
            this.isProcessing = false;
            return;
        }

        // 更新状态
        queueItem.updateStatus(REQUEST_STATUS.RUNNING);
        app.currentRunning++;
        app.requestStats.queued--;

        console.log(`开始执行请求，ID: ${queueItem.id}, 当前运行: ${app.currentRunning}`);

        // 执行请求
        this.executeRequest(queueItem);
    }

    /**
     * 执行单个请求
     * @param {RequestQueueItem} queueItem - 请求项
     */
    executeRequest(queueItem) {
        const { reqData, context } = queueItem;

        // 保存原始回调函数
        const originalComplete = reqData.complete;
        const originalSuccess = reqData.success;
        const originalFail = reqData.fail;

        // 重写complete回调
        reqData.complete = (res) => {
            // 调用原始回调
            if (originalComplete) {
                originalComplete.call(context, res);
            }

            // 更新统计信息
            if (res.statusCode >= 200 && res.statusCode < 300) {
                app.requestStats.success++;
                queueItem.updateStatus(REQUEST_STATUS.COMPLETED);
            } else {
                app.requestStats.failed++;
                queueItem.updateStatus(REQUEST_STATUS.FAILED);
            }

            // 减少运行中的请求数量
            app.currentRunning--;

            console.log(`请求完成，ID: ${queueItem.id}, 状态码: ${res.statusCode}, 当前运行: ${app.currentRunning}`);

            // 处理下一个请求
            this.processNextRequest();
        };

        // 重写success回调
        reqData.success = (res) => {
            if (originalSuccess) {
                originalSuccess.call(context, res);
            }
        };

        // 重写fail回调
        reqData.fail = (res) => {
            if (originalFail) {
                originalFail.call(context, res);
            }
        };

        // 发起请求
        try {
            wx.request(reqData);
        } catch (error) {
            console.error(`请求执行失败，ID: ${queueItem.id}`, error);

            // 处理请求异常
            this.handleRequestError(queueItem, error);
        }
    }

    /**
     * 处理请求错误
     * @param {RequestQueueItem} queueItem - 请求项
     * @param {Error} error - 错误信息
     */
    handleRequestError(queueItem, error) {
        app.currentRunning--;
        app.requestStats.failed++;
        queueItem.updateStatus(REQUEST_STATUS.FAILED);

        console.error(`请求异常处理，ID: ${queueItem.id}`, error);

        // 处理下一个请求
        this.processNextRequest();
    }

    /**
     * 获取队列状态
     * @returns {Object} 队列状态信息
     */
    getQueueStatus() {
        return {
            currentRunning: app.currentRunning,
            queueLength: app.requestQueue.length,
            maxRequestCount: app.MAX_REQUEST_COUNT,
            stats: { ...app.requestStats }
        };
    }

    /**
     * 清空队列
     */
    clearQueue() {
        app.requestQueue = [];
        app.requestStats.queued = 0;
        console.log('请求队列已清空');
    }

    /**
     * 设置最大并发请求数
     * @param {number} count - 最大请求数
     */
    setMaxRequestCount(count) {
        if (count > 0 && count <= 10) {
            app.MAX_REQUEST_COUNT = count;
            console.log(`最大并发请求数已设置为: ${count}`);
        } else {
            console.warn('最大并发请求数必须在1-10之间');
        }
    }
}

// 创建队列管理器实例
const queueManager = new RequestQueueManager();

/**
 * 封装的请求函数
 * @param {Object} data - 请求数据
 * @param {Object} context - 请求上下文
 * @returns {RequestQueueItem} 请求队列项
 */
function request(data, context) {
    return queueManager.addRequest(data, context);
}

// 扩展request函数，添加队列管理功能
request.getQueueStatus = () => queueManager.getQueueStatus();
request.clearQueue = () => queueManager.clearQueue();
request.setMaxRequestCount = (count) => queueManager.setMaxRequestCount(count);

// 模块导出
export default request;