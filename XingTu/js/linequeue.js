/**
    * 队列类型枚举
    */
const QUEUE_TYPE = {
    SYNC: 'sync',           // 串行队列
    PARALLEL: 'parallel',   // 并行队列
    RELEVANT: 'relevant'    // 相关联队列
};

/**
 * 队列项结构
 */
class QueueItem {
    constructor(fn, backFn = null, context = null) {
        this.fn = fn;           // 执行函数
        this.backFn = backFn;   // 回调函数（用于Relevant模式）
        this.context = context; // 执行上下文
        this.called = false;    // 是否已被调用
        this.completed = false; // 是否已完成
    }
}

/**
 * 队列管理器类
 * 支持三种执行模式：串行、并行、相关联
 */
class LineQueue {
    constructor(queueType = QUEUE_TYPE.PARALLEL) {
        this.queueType = queueType;
        this.queue = [];
        this.injectData = null;     // 注入的数据
        this.isProcessing = false;  // 是否正在处理
        this.currentIndex = 0;      // 当前执行索引
    }

    /**
     * 设置为串行队列
     * 严格按顺序执行，前一个完成后才能执行下一个
     */
    setSync() {
        this.queueType = QUEUE_TYPE.SYNC;
        console.log('队列模式已设置为：串行执行');
    }

    /**
     * 设置为并行队列
     * 所有操作同时执行，不等待前一个完成
     */
    setParallel() {
        this.queueType = QUEUE_TYPE.PARALLEL;
        console.log('队列模式已设置为：并行执行');
    }

    /**
     * 设置为相关联队列
     * 多个相同操作只执行一次，结果共享
     */
    setRelevant() {
        this.queueType = QUEUE_TYPE.RELEVANT;
        console.log('队列模式已设置为：相关联执行');
    }

    /**
     * 获取当前队列类型
     * @returns {string} 队列类型
     */
    getQueueType() {
        return this.queueType;
    }

    /**
     * 添加任务到队列
     * @param {Function|Object} fn - 执行函数或任务对象
     */
    run(fn) {
        try {
            switch (this.queueType) {
                case QUEUE_TYPE.SYNC:
                case QUEUE_TYPE.RELEVANT:
                    this.runSync(fn);
                    break;
                case QUEUE_TYPE.PARALLEL:
                    this.runParallel(fn);
                    break;
                default:
                    throw new Error(`未知的队列类型: ${this.queueType}`);
            }
        } catch (error) {
            console.error('队列执行失败:', error);
            throw error;
        }
    }

    /**
     * 执行串行队列
     * @param {Function|Object} fn - 执行函数或任务对象
     */
    runSync(fn) {
        // 参数验证
        if (this.queueType === QUEUE_TYPE.RELEVANT) {
            if (typeof fn.fn !== 'function') {
                throw new Error('Relevant模式：fn.fn必须是函数');
            }
            if (typeof fn.backFn !== 'function') {
                throw new Error('Relevant模式：fn.backFn必须是函数');
            }
        } else if (this.queueType === QUEUE_TYPE.SYNC) {
            if (typeof fn !== 'function') {
                throw new Error('Sync模式：参数必须是函数');
            }
        }

        // 创建执行上下文
        const context = this.createContext();

        // 创建队列项
        let queueItem;
        if (this.queueType === QUEUE_TYPE.RELEVANT) {
            queueItem = new QueueItem(fn.fn, fn.backFn, context);
        } else {
            queueItem = new QueueItem(fn, null, context);
        }

        // 添加到队列
        this.queue.push(queueItem);

        // 如果是第一个任务，立即执行
        if (this.queue.length === 1) {
            this.executeQueueItem(queueItem);
        }
    }

    /**
     * 执行并行队列
     * @param {Function} fn - 执行函数
     */
    runParallel(fn) {
        if (typeof fn !== 'function') {
            throw new Error('Parallel模式：参数必须是函数');
        }

        const context = {};
        fn.call(context);
    }

    /**
     * 创建执行上下文
     * @returns {Object} 执行上下文
     */
    createContext() {
        const context = {
            ended: false,
            injectData: null
        };

        // 定义end属性
        Object.defineProperty(context, 'end', {
            get() {
                return this.ended;
            },
            set(newValue) {
                this.ended = newValue;
                if (newValue === true) {
                    this.processQueueAfterComplete();
                }
            }
        });

        // 定义done方法
        context.done = function (injectData) {
            if (injectData !== undefined) {
                this.injectData = injectData;
            }
            this.end = true;
        };

        // 绑定processQueueAfterComplete方法
        context.processQueueAfterComplete = () => {
            this.processQueueAfterComplete();
        };

        return context;
    }

    /**
     * 执行队列项
     * @param {QueueItem} queueItem - 队列项
     */
    executeQueueItem(queueItem) {
        if (!queueItem || typeof queueItem.fn !== 'function') {
            throw new Error('无效的队列项');
        }

        try {
            queueItem.called = true;
            queueItem.fn.call(queueItem.context);
        } catch (error) {
            console.error('队列项执行失败:', error);
            queueItem.context.end = true;
        }
    }

    /**
     * 队列完成后处理后续任务
     */
    processQueueAfterComplete() {
        if (this.queueType === QUEUE_TYPE.RELEVANT) {
            this.processRelevantQueue();
        } else if (this.queueType === QUEUE_TYPE.SYNC) {
            this.processSyncQueue();
        }
    }

    /**
     * 处理相关联队列
     */
    processRelevantQueue() {
        // 执行所有等待的回调函数
        while (this.queue.length > 0) {
            const queueItem = this.queue.shift();
            if (queueItem.backFn && typeof queueItem.backFn === 'function') {
                try {
                    queueItem.backFn.call(queueItem.context, this.injectData);
                } catch (error) {
                    console.error('回调函数执行失败:', error);
                }
            }
        }
    }

    /**
     * 处理串行队列
     */
    processSyncQueue() {
        // 找到下一个未执行的任务
        let nextItem = null;
        for (let i = 0; i < this.queue.length; i++) {
            if (!this.queue[i].called) {
                nextItem = this.queue[i];
                break;
            }
        }

        // 执行下一个任务
        if (nextItem && nextItem.fn) {
            this.executeQueueItem(nextItem);
        }
    }

    /**
     * 获取队列状态
     * @returns {Object} 队列状态信息
     */
    getStatus() {
        return {
            type: this.queueType,
            length: this.queue.length,
            isProcessing: this.isProcessing,
            injectData: this.injectData
        };
    }

    /**
     * 清空队列
     */
    clear() {
        this.queue = [];
        this.injectData = null;
        this.isProcessing = false;
        this.currentIndex = 0;
        console.log('队列已清空');
    }

    /**
     * 获取队列长度
     * @returns {number} 队列长度
     */
    getLength() {
        return this.queue.length;
    }

    /**
     * 检查队列是否为空
     * @returns {boolean} 是否为空
     */
    isEmpty() {
        return this.queue.length === 0;
    }
}

// 模块导出
export default LineQueue;

/**
 * 使用示例和说明
 * 
 * 1. 串行队列（Sync）- 严格按顺序执行
 * const queue = new LineQueue();
 * queue.setSync();
 * 
 * queue.run(function() {
 *     setTimeout(() => {
 *         console.log('第一个任务完成');
 *         this.done('传递给下一个任务的数据');
 *     }, 2000);
 * });
 * 
 * queue.run(function(data) {
 *     setTimeout(() => {
 *         console.log('第二个任务完成，收到数据:', data);
 *         this.done();
 *     }, 1000);
 * });
 * 
 * 2. 相关联队列（Relevant）- 多个调用共享结果
 * const queue = new LineQueue();
 * queue.setRelevant();
 * 
 * queue.run({
 *     fn: function() {
 *         // 执行一次，结果共享
 *         setTimeout(() => {
 *             this.done({ result: 'success' });
 *         }, 1000);
 *     },
 *     backFn: function(data) {
 *         console.log('收到结果:', data);
 *     }
 * });
 * 
 * 3. 并行队列（Parallel）- 同时执行
 * const queue = new LineQueue();
 * queue.setParallel();
 * 
 * queue.run(() => console.log('任务A'));
 * queue.run(() => console.log('任务B'));
 * // 两个任务同时执行
 */
