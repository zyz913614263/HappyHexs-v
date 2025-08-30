// 导出所有工具函数

// 离屏画布缓存
let offScreenCanvas;

/**
 * 绘制圆形图片
 * @param {Image} obj - 图片对象
 * @returns {Laya.Image} 圆形图片对象
 */
function draw(obj) {
    // 创建离屏画布
    const canvas = wx.createCanvas();
    const context = canvas.getContext('2d');

    // 设置画布尺寸
    canvas.width = obj.width;
    canvas.height = obj.height;

    // 创建圆形裁剪路径
    context.beginPath();
    context.arc(
        obj.width / 2,
        obj.height / 2,
        Math.max(obj.width, obj.height) / 2,
        0,
        2 * Math.PI
    );
    context.clip();

    // 绘制图片到圆形区域
    context.drawImage(obj, 0, 0, obj.width, obj.height);

    // 创建Laya图片对象
    const img = new Laya.Image();
    img.skin = canvas.toDataURL();

    // 清理画布引用
    canvas = null;
    return img;
}

/**
 * 加载并显示圆形图片
 * @param {string} src - 图片源地址
 * @param {Laya.Sprite} sp - 父容器精灵
 * @param {number} height - 图片高度
 * @param {number} width - 图片宽度
 * @param {number} x - X坐标
 * @param {number} y - Y坐标
 */
function loadCircleImage(src, sp, height, width, x = 0, y = 0) {
    const image = new Image();

    image.onload = function () {
        const img = draw(this, height, width);
        img.height = height;
        img.width = width;
        img.x = x;
        img.y = y;
        sp.addChild(img);
    };

    image.src = src;
}

/**
 * 计算字符串字节长度（支持中英文混合）
 * @param {string} str - 输入字符串
 * @returns {number} 字节长度
 */
function getStrlen(str) {
    let len = 0;

    for (let i = 0; i < str.length; i++) {
        const c = str.charCodeAt(i);

        // 单字节字符（ASCII、半角字符）
        if ((c >= 0x0001 && c <= 0x007e) || (0xff60 <= c && c <= 0xff9f)) {
            len++;
        } else {
            // 多字节字符（中文、emoji等）
            len += 2;
        }
    }

    return len;
}

// Unicode字符范围正则表达式（支持emoji等复杂字符）
const astralRange = /\ud83c[\udffb-\udfff](?=\ud83c[\udffb-\udfff])|(?:[^\ud800-\udfff][\u0300-\u036f\ufe20-\ufe23\u20d0-\u20f0]?|[\u0300-\u036f\ufe20-\ufe23\u20d0-\u20f0]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\ud800-\udfff])[\ufe0e\ufe0f]?(?:[\u0300-\u036f\ufe20-\ufe23\u20d0-\u20f0]|\ud83c[\udffb-\udfff])?(?:\u200d(?:[^\ud800-\udfff]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff])[\ufe0e\ufe0f]?(?:[\u0300-\u036f\ufe20-\ufe23\u20d0-\u20f0]|\ud83c[\udffb-\udfff])?)*/g;

/**
 * 智能字符串截断（支持中英文混合和emoji）
 * @param {string} str - 输入字符串
 * @param {number} s_len - 最大长度限制
 * @returns {string} 截断后的字符串
 */
function strlen(str, s_len) {
    // 如果字符串长度未超过限制，直接返回
    if (getStrlen(str) <= s_len) {
        return str;
    }

    let len = 0;
    const ret = [];

    // 使用正则表达式匹配Unicode字符
    const matches = str.match(astralRange) || [];

    for (let i = 0; i < matches.length && len < s_len; i++) {
        const char = matches[i];

        // 计算当前字符的长度
        if (char.length > 1) {
            // 多字节字符（如emoji）
            len += char.length * 2;
        } else {
            const c = char.charCodeAt(0);
            // 单字节字符
            if ((c >= 0x0001 && c <= 0x007e) || (0xff60 <= c && c <= 0xff9f)) {
                len++;
            } else {
                // 多字节字符（如中文）
                len += 2;
            }
        }

        // 如果添加当前字符后长度未超过限制，则添加到结果中
        if (len < s_len) {
            ret.push(char);
        }
    }

    return ret.join('') + '...';
}

/**
 * 生成数据签名
 * @param {Array} data - 数据数组，每个元素包含key和value
 * @returns {number} 哈希签名
 */
function getSig(data) {
    const appId = 'wx7a727ff7d940bb3f';
    let str = appId;

    // 将数据转换为签名字符串
    data.forEach(item => {
        str += '_' + item.key + ':' + item.value;
    });

    return hash(str);
}

/**
 * 简单的字符串哈希函数
 * @param {string} str - 输入字符串
 * @returns {number} 哈希值
 */
function hash(str) {
    const seed = 31;
    let hash = 0;

    for (let i = 0; i < str.length; i++) {
        hash = hash * seed + str.charCodeAt(i);
        // 保持哈希值在32位范围内
        hash = hash & 0x3FFFFFF;
    }

    return hash;
}

export { loadCircleImage, getStrlen, getSig };