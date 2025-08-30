/**
   * 字符串处理工具模块
   * 提供常用的字符串和对象操作功能
   */

/**
 * 去除字符串两端的空格
 * @param {string} str - 要去除空格的字符串
 * @returns {string} 去除两端空格后的字符串
 * @example
 * const text = '  hello world  ';
 * const result = trim(text); // result = 'hello world'
 */
function trim(str) {
    if (!str || typeof str.replace !== 'function') {
        return '';
    }
    return str.replace(/(^\s*)|(\s*$)/g, '');
}

/**
 * 将对象转换为查询字符串格式
 * @param {Object} map - 目标对象，如 {'name': 'john', 'age': 25}
 * @param {string} outerSeparator - 外层分隔符，默认为 '&'
 * @param {string} innerSeparator - 内层分隔符，默认为 '='
 * @returns {string} 转换后的查询字符串
 * @example
 * const obj = {'name': 'john', 'age': 25};
 * const result = mapToStr(obj); // result = 'name=john&age=25'
 */
function mapToStr(map, outerSeparator = '&', innerSeparator = '=') {
    try {
        if (!map || typeof map !== 'object') {
            return '';
        }

        const arr = [];
        for (const key in map) {
            if (map.hasOwnProperty(key)) {
                arr.push(`${key}${innerSeparator}${map[key]}`);
            }
        }
        return arr.join(outerSeparator);
    } catch (error) {
        console.error('mapToStr转换失败:', error);
        return '';
    }
}

/**
 * 将查询字符串转换为对象
 * @param {string} str - 查询字符串，如 'name=john&age=25'
 * @param {string} outerSeparator - 外层分隔符，默认为 '&'
 * @param {string} innerSeparator - 内层分隔符，默认为 '='
 * @returns {Object} 转换后的对象
 * @example
 * const queryStr = 'name=john&age=25';
 * const result = strToMap(queryStr); // result = {name: 'john', age: '25'}
 */
function strToMap(str, outerSeparator = '&', innerSeparator = '=') {
    if (!str || typeof str !== 'string') {
        return {};
    }

    try {
        const pairs = str.split(outerSeparator);
        const result = {};

        for (const pair of pairs) {
            const [key, value] = pair.split(innerSeparator);
            if (key && value !== undefined) {
                result[key] = value;
            }
        }

        return result;
    } catch (error) {
        console.error('strToMap转换失败:', error);
        return {};
    }
}

/**
 * 从URL中提取指定参数的值
 * @param {string} name - 参数名
 * @param {string} url - URL字符串，默认为当前页面的location.search
 * @returns {string} 参数值，如果不存在则返回空字符串
 * @example
 * const value = getQueryStr('id', '?id=123&name=john'); // value = '123'
 */
function getQueryStr(name, url) {
    if (!name) {
        return '';
    }

    let searchStr = url || location.search;

    // 去除hash和转义字符
    searchStr = ('' + searchStr)
        .replace(/#(.*)$/g, '')
        .replace(/&amp;/g, '&');

    try {
        const regex = new RegExp(`[?&]${name}=([^&]+)`, 'i');
        const match = searchStr.match(regex);

        if (!match || match.length <= 1) {
            return '';
        }

        // 应用XSS过滤
        return filterXSS(match[1], true);
    } catch (error) {
        console.error('getQueryStr执行失败:', error);
        return '';
    }
}

/**
 * XSS防护函数（简化版）
 * @param {string} str - 需要过滤的字符串
 * @param {boolean} strict - 是否严格模式
 * @returns {string} 过滤后的安全字符串
 */
function filterXSS(str, strict = false) {
    if (!str || typeof str !== 'string') {
        return '';
    }

    try {
        let result = str;

        // 基本的XSS防护
        const xssPatterns = [
            /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
            /javascript:/gi,
            /on\w+\s*=/gi,
            /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi
        ];

        xssPatterns.forEach(pattern => {
            result = result.replace(pattern, '');
        });

        // 严格模式：移除所有HTML标签
        if (strict) {
            result = result.replace(/<[^>]*>/g, '');
        }

        return result;
    } catch (error) {
        console.error('XSS过滤失败:', error);
        return '';
    }
}

/**
 * 安全的对象属性访问
 * @param {Object} obj - 目标对象
 * @param {string} path - 属性路径，如 'user.profile.name'
 * @param {*} defaultValue - 默认值
 * @returns {*} 属性值或默认值
 * @example
 * const user = {profile: {name: 'john'}};
 * const name = safeGet(user, 'profile.name', 'unknown'); // name = 'john'
 */
function safeGet(obj, path, defaultValue = undefined) {
    if (!obj || !path) {
        return defaultValue;
    }

    try {
        const keys = path.split('.');
        let result = obj;

        for (const key of keys) {
            if (result && typeof result === 'object' && key in result) {
                result = result[key];
            } else {
                return defaultValue;
            }
        }

        return result;
    } catch (error) {
        console.error('safeGet执行失败:', error);
        return defaultValue;
    }
}

/**
 * 深度克隆对象
 * @param {*} obj - 要克隆的对象
 * @returns {*} 克隆后的对象
 * @example
 * const original = {a: 1, b: {c: 2}};
 * const cloned = deepClone(original);
 */
function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    if (obj instanceof Date) {
        return new Date(obj.getTime());
    }

    if (obj instanceof Array) {
        return obj.map(item => deepClone(item));
    }

    if (typeof obj === 'object') {
        const cloned = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                cloned[key] = deepClone(obj[key]);
            }
        }
        return cloned;
    }

    return obj;
}

// 模块导出
export default {
    mapToStr,
    strToMap,
    trim,
    getQueryStr,
    filterXSS,
    safeGet,
    deepClone
};