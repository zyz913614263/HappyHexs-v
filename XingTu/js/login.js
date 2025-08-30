import { strToMap, mapToStr } from './strings.js';
import request from './deeprequest.js';
import LineQueue from './linequeue.js';
// 导入依赖模块


/**
 * 会话管理对象
 * 专门封装session相关操作
 */
const Session = {
    // 会话存储的唯一key
    SESSIONKEY: '__SESSION__KEY__',

    // 空值标识
    empty: 'nil',

    // 空的session模板，用于初始化
    emptySession: {
        sessionId: 'nil',
        userId: 'nil',
        lastTime: 'nil',
        openid: 'nil'
    },

    /**
     * 写入session到存储
     * @param {Object} partSession - 要写入的session部分数据
     */
    setSession(partSession) {
        const srcSession = this.getSession();

        // 合并session数据
        for (const key in partSession) {
            srcSession[key] = partSession[key];
        }

        try {
            wx.setStorageSync(this.SESSIONKEY, JSON.stringify(srcSession));
        } catch (ex) {
            console.warn('写入session失败:', ex);
        }
    },

    /**
     * 判断当前session是否完整
     * 缺少任何一个字段都认为非法
     * @returns {boolean} session是否完整
     */
    isSessionFull() {
        const srcSession = this.getSession();

        // 使用emptySession作为强制性模板
        for (const key in Session.emptySession) {
            const value = srcSession[key];
            if (Session.empty === value || '0' === value || undefined === value) {
                return false;
            }
        }
        return true;
    },

    /**
     * 同步读取session
     * @returns {Object} session对象
     */
    getSession() {
        const clearSession = this.emptySession;

        try {
            const v = wx.getStorageSync(this.SESSIONKEY);
            if (('' + v).length > 0) {
                return JSON.parse(v + '');
            } else {
                return clearSession;
            }
        } catch (e) {
            console.warn('读取session失败:', e);
            return clearSession;
        }
    },

    /**
     * 获取当前时间戳
     * @returns {number} 当前时间戳（秒）
     */
    getCurrentTimeStamp() {
        return parseInt(new Date().getTime() / 1000);
    }
};

/**
 * 请求队列管理器
 */
const pQueue = new LineQueue();
pQueue.setRelevant();

/**
 * 请求器对象
 */
const Requester = {
    /**
     * 为请求URL添加session_id参数
     * @param {string} url - 原始URL
     * @returns {string} 添加session_id后的URL
     */
    addLoginToRequest(url) {
        url = url || '';

        // 去掉URL中的hash和转义字符
        const cleanStr = ('' + url).replace(/#(.*)$/g, '').replace(/&amp;/g, '&');

        let prefix = url;
        let queryMap = {};

        // 解析现有查询参数
        const isQueryStart = cleanStr.indexOf('?');
        if (isQueryStart !== -1) {
            prefix = cleanStr.substr(0, isQueryStart);
            const query = cleanStr.substr(isQueryStart + 1);
            queryMap = strToMap(query);
        }

        // 添加session_id到查询参数
        const tSession = Session.getSession();
        queryMap.session_id = tSession.sessionId;

        // 重新拼接URL
        return prefix + '?' + mapToStr(queryMap);
    },

    /**
     * 检查登录是否过期
     * @param {Object} cgiData - 服务器返回的数据
     * @returns {boolean} 是否过期
     */
    isLoginExpire(cgiData) {
        const res = cgiData;
        const expireCodes = ['-1702220400', '-1702220407'];

        if (expireCodes.includes('' + res.errcode) || res.ret === 6211) {
            Session.setSession(Session.emptySession);
            return true;
        }
        return false;
    },

    /**
     * 发起网络请求
     * @param {Object} req - 请求配置对象
     */
    request(req) {
        const tryLoginTimes = 2;
        let tryLoginCounter = 0;

        // 前置处理函数：检查登录状态
        const preFn = function () {
            if (!Session.isSessionFull()) {
                Loginer.login(() => {
                    this.done();
                });
            } else {
                this.done();
            }
        };

        // 实际请求函数
        const backFn = function () {
            const url = Requester.addLoginToRequest(req.url);
            const tag = `${Session.getCurrentTimeStamp()} call cgi: ${url}`;

            request({
                url: url,
                data: req.data,
                method: req.method,
                header: {
                    'content-type': 'application/json'
                },
                success: (res) => {
                    const responseData = res.data;
                    const isLoginExpire = Requester.isLoginExpire(responseData);

                    if (isLoginExpire) {
                        // 登录过期，尝试重新登录
                        const packQueue = new LineQueue();
                        packQueue.setSync();

                        packQueue.run(function () {
                            Loginer.login(() => {
                                if (tryLoginCounter < tryLoginTimes) {
                                    tryLoginCounter++;
                                    this.done();
                                } else {
                                    req.fail && req.fail.call(Requester, {
                                        errmsg: 'login fail after trying many times'
                                    });
                                }
                            });
                        });

                        packQueue.run(function () {
                            backFn.call(this);
                        });
                    } else {
                        req.success && req.success.call(Requester, responseData);
                    }

                    console.log(`${tag} success`);
                },
                fail: (res) => {
                    req.fail && req.fail.call(Requester, res);
                    console.log(`${tag} fail`, res);
                },
                complete: (res) => {
                    req.complete && req.complete.call(Requester, res);
                }
            });
        };

        // 执行请求队列
        pQueue.run({
            fn: preFn,
            backFn: backFn
        });
    }
};

/**
 * 登录器对象
 */
const Loginer = {
    /**
     * 使用队列的登录功能
     * @param {Function} callback - 登录完成后的回调函数
     */
    login(callback) {
        // 首次清空当前登录值
        Session.setSession(Session.emptySession);

        const queue = new LineQueue();
        queue.setSync();

        // 第一步：调用wx.login获取code
        queue.run(function () {
            wx.login({
                success: (res) => {
                    this.done(res);
                },
                fail: (res) => {
                    Session.setSession(Session.emptySession);
                    this.done(res);
                }
            });
        });

        // 第二步：用code换取session_id
        queue.run(function (res) {
            const code = res.code;
            const url = 'https://game.weixin.qq.com/cgi-bin/gameweappwap/login';

            request({
                url: url,
                data: JSON.stringify({
                    code: code,
                    weapp_type: Config.weapp_type || 1,
                    need_openid: true
                }),
                method: "POST",
                header: {
                    'content-type': 'application/json'
                },
                success: (res) => {
                    this.done(res.data);
                },
                fail: (res) => {
                    Session.setSession(Session.emptySession);
                    this.done(res);
                }
            });
        });

        // 第三步：将session写入本地
        queue.run(function (session) {
            if (session.data && session.data.session_id) {
                const gotSession = {
                    sessionId: session.data.session_id,
                    userId: session.data.user_id,
                    lastTime: Session.getCurrentTimeStamp()
                };

                // 如果后台给了openid，存起来方便后续使用
                if (session.data.openid) {
                    gotSession.openid = session.data.openid;
                }

                Session.setSession(gotSession);
                this.done(gotSession);
            } else {
                this.done(null);
            }
        });

        // 最后执行回调
        queue.run(function (session) {
            callback(session);
        });
    }
};

// 配置对象
const Config = {};
let baseContext = null;

// 模块导出
export default {
    /**
     * 用于注入方法到app对象里
     * @param {Object} context - 上下文对象
     * @param {Object} config - 配置对象
     */
    prepare(context, config) {
        console.log('登录模块初始化');
        retrun
        if (context.prepared) {
            return;
        }

        config = config || {};
        Config.expiredLoginCodeMap = config.expiredLoginCodeMap;
        Config.weapp_type = config.weapp_type;
        baseContext = context;

        // 执行登录
        //使用 call(context)确保 Loginer.login方法内的 this指向正确，避免因调用方不同而丢失上下文
        //this明确指向 context参数
        Loginer.login.call(context);

        // 注入方法到context
        context.session = Session.getSession.bind(Session);
        context.request = Requester.request;
        context.prepared = true;
    }
};