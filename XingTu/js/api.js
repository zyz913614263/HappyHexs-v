import login from './login.js';
import Promise from '../libs/es6-promise.js';
import { gameConfig } from './config.js';

// 应用实例
const app = {};

// API配置
const FETCH_URL = 'https://game.weixin.qq.com/cgi-bin/gametetrisws/';


// 微信小程序配置
const Config = {
    appid: gameConfig.APPID,
    app_name: '星轨',           // 小程序的名称
    weapp_type: 10,            // 业务登录唯一ID
    expiredLoginCodeMap: []    // 过期的登录码映射
};

// 检测是否在微信小程序环境
const isInWechatApp = !!(window.navigator.userAgent.indexOf('Ejecta') > -1);

// 导入登录模块


// 准备登录
//login.prepare(app, Config);
//console.log('当前用户openid:', app.session().openid);

/**
 * 同步游戏数据到服务器
 * @param {Object} data - 游戏数据
 * @returns {Promise} 返回Promise对象
 */
function syncGameData(data) {
    return new Promise((resolve, reject) => {
        app.request({
            url: `${FETCH_URL}syncgame`,
            data: data,
            method: "POST",
            header: {
                'content-type': 'application/json'
            },
            success: (response) => {
                console.log('游戏数据同步成功:', response);
                resolve(response);
            },
            fail: (error) => {
                console.warn('游戏数据同步失败:', error);
                resolve(error); // 注意：这里仍然resolve而不是reject
            },
            complete: (res) => {
                // 请求完成后的处理
            }
        });
    });
}

/**
 * 获取好友排行榜数据
 * @param {Object} data - 请求参数
 * @returns {Promise} 返回Promise对象
 */
function getFriendRank(data) {
    return new Promise((resolve, reject) => {
        app.request({
            url: `${FETCH_URL}getwxagfriendrankboard`,
            data: data,
            method: "POST",
            header: {
                'content-type': 'application/json'
            },
            success: (response) => {
                console.log('获取好友排行榜成功');
                resolve(response);
            },
            fail: (error) => {
                console.warn('获取好友排行榜失败:', error);
                resolve(error);
            },
            complete: (res) => {
                // 请求完成后的处理
            }
        });
    });
}

/**
 * 创建PK对战房间
 * @param {Object} data - 房间创建参数
 * @returns {Promise} 返回Promise对象
 */
function createPkRoom(data) {
    return new Promise((resolve, reject) => {
        app.request({
            url: `${FETCH_URL}createpkroom`,
            data: data,
            method: "POST",
            header: {
                'content-type': 'application/json'
            },
            success: (response) => {
                console.log('PK房间创建成功:', response);
                resolve(response);
            },
            fail: (error) => {
                console.warn('PK房间创建失败:', error);
                resolve(error);
            },
            complete: (res) => {
                // 请求完成后的处理
            }
        });
    });
}

/**
 * 获取PK房间信息
 * @param {Object} data - 房间查询参数
 * @returns {Promise} 返回Promise对象
 */
function getPkRoomInfo(data) {
    return new Promise((resolve, reject) => {
        app.request({
            url: `${FETCH_URL}getpkroominfo`,
            data: data,
            method: "POST",
            header: {
                'content-type': 'application/json'
            },
            success: (response) => {
                console.log('获取PK房间信息成功:', response);
                resolve(response);
            },
            fail: (error) => {
                console.warn('获取PK房间信息失败:', error);
                resolve(error);
            },
            complete: (res) => {
                // 请求完成后的处理
            }
        });
    });
}

/**
 * 获取群组排行榜数据
 * @param {Object} data - 请求参数
 * @returns {Promise} 返回Promise对象
 */
function getGroupRank(data) {
    return new Promise((resolve, reject) => {
        app.request({
            url: `${FETCH_URL}getwxaggrouprankboard`,
            data: data,
            method: "POST",
            header: {
                'content-type': 'application/json'
            },
            success: (response) => {
                console.log('获取群组排行榜成功');
                resolve(response);
            },
            fail: (error) => {
                console.warn('获取群组排行榜失败:', error);
                resolve(error);
            },
            complete: (res) => {
                // 请求完成后的处理
            }
        });
    });
}

/**
 * 上报PK对战结果
 * @param {Object} data - PK结果数据
 * @returns {Promise} 返回Promise对象
 */
function reportPKRank(data) {
    return new Promise((resolve, reject) => {
        app.request({
            url: `${FETCH_URL}reportsharepk`,
            data: data,
            method: "POST",
            header: {
                'content-type': 'application/json'
            },
            success: (response) => {
                console.log('PK结果上报成功:', response);
                resolve(response);
            },
            fail: (error) => {
                console.warn('PK结果上报失败:', error);
                resolve(error);
            },
            complete: (res) => {
                // 请求完成后的处理
            }
        });
    });
}

export { syncGameData, getFriendRank, createPkRoom, getPkRoomInfo, getGroupRank, reportPKRank, app };