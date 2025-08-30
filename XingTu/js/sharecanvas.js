import { gameConfig } from './config.js';


var bgWidth = 420 * window.devicePixelRatio;

function drawShareCanvas(config, type) {
    try {
        return draw(config, type);
    } catch (ex) {
        return gameConfig.PREFIX_URL + 'result/sharebanner2.png';
    }
}

function draw(config, type) {
    var offScreenCanvas = wx.createCanvas();

    var offScreenContext = offScreenCanvas.getContext('2d');
    offScreenCanvas.width = 420 * window.devicePixelRatio;
    offScreenCanvas.height = 335 * window.devicePixelRatio;

    // 如果要绘制一个圆，使用下面代码
    var img = new Image();
    img.src = type === 1 ? 'res/share/pk.png' : 'res/share/share.png';
    offScreenContext.drawImage(img, 0, 0, bgWidth, 335 * window.devicePixelRatio);

    if (type === 1) {
        if (config.my_head_url) {
            drawPkShareImage(config, offScreenContext, offScreenCanvas);
        } else {
            offScreenContext.font = "bold " + 36 * window.devicePixelRatio + "px Agency FB Bold";
            offScreenContext.textAlign = "center";
            offScreenContext.fillStyle = '#7ff3fd';
            offScreenContext.textBaseline = "Middle";
            offScreenContext.fillText('得分', bgWidth / 2, 75 * window.devicePixelRatio);
        }
        createText(config.score, offScreenContext);
    } else {
        commonShareImage(config, offScreenContext);
    }

    // 6.5.22 才能调用
    if (isBigVerion('6.5.21')) {
        return offScreenCanvas.toTempFilePathSync({
            width: offScreenCanvas.width,
            height: offScreenCanvas.height
        });
    } else {
        return gameConfig.PREFIX_URL + 'result/sharebanner2.png';
    }
}

function commonShareImage(config, offScreenContext) {
    var height = 260 * window.devicePixelRatio;
    var widthImg = 258 / 1.4 * window.devicePixelRatio;
    var heightImg = 67 / 1.4 * window.devicePixelRatio;
    var img = new Image();
    img.src = 'res/share/baoshi.png';
    offScreenContext.drawImage(img, 15 * window.devicePixelRatio, height, widthImg, heightImg);

    var img = new Image();
    img.src = 'res/share/combo.png';
    offScreenContext.drawImage(img, widthImg + 30 * window.devicePixelRatio, height, widthImg, heightImg);

    offScreenContext.font = "bold " + 36 * window.devicePixelRatio + "px Agency FB Bold";
    offScreenContext.textAlign = "center";
    offScreenContext.fillStyle = '#7ff3fd';
    offScreenContext.textBaseline = "Middle";
    offScreenContext.fillText(config.score + '分', bgWidth / 2, 150 * window.devicePixelRatio);

    offScreenContext.textAlign = "center";
    offScreenContext.font = "bold " + 20 * window.devicePixelRatio + "px Agency FB Bold";
    offScreenContext.fillText("我在星途游戏中得分：" + config.score + '，获得宝石：' + config.energeNum, bgWidth / 2, 200 * window.devicePixelRatio);
    offScreenContext.fillText("已经超过" + config.percent + "%好友，不服来战啊", bgWidth / 2, 230 * window.devicePixelRatio);

    drawShareNumber(offScreenContext, config.energeNum, widthImg / 2 + 30 * window.devicePixelRatio, height + heightImg / 2);

    drawShareNumber(offScreenContext, config.maxCombo, 235 * window.devicePixelRatio + widthImg / 2, height + heightImg / 2);
}

function drawPkShareImage(config, offScreenContext) {
    console.error(config);
    var img = new Image();
    img.src = config.my_head_url;

    var widthImg = 60 * window.devicePixelRatio;
    var heightImg = 60 * window.devicePixelRatio;
    var height = 30 * window.devicePixelRatio;

    offScreenContext.save();
    offScreenContext.beginPath();
    offScreenContext.arc(widthImg + 30 * window.devicePixelRatio + widthImg / 2, height + widthImg / 2, widthImg / 2, 0, 2 * Math.PI);
    offScreenContext.clip();

    offScreenContext.drawImage(img, widthImg + 30 * window.devicePixelRatio, height, widthImg, heightImg);
    offScreenContext.restore();

    offScreenContext.font = 24 * window.devicePixelRatio + "px Agency FB";
    offScreenContext.textAlign = "center";
    offScreenContext.fillStyle = '#7ff3fd';
    offScreenContext.textBaseline = "Middle";
    offScreenContext.fillText('挑战', bgWidth / 2, 75 * window.devicePixelRatio);

    var img = new Image();
    img.src = config.own_head_url;
    offScreenContext.save();
    offScreenContext.beginPath();
    offScreenContext.arc(widthImg + 210 * window.devicePixelRatio + widthImg / 2, height + widthImg / 2, widthImg / 2, 0, 2 * Math.PI);
    offScreenContext.clip();
    offScreenContext.drawImage(img, widthImg + 210 * window.devicePixelRatio, height, widthImg, heightImg);
    offScreenContext.restore();

    offScreenContext.font = "bold " + 28 * window.devicePixelRatio + "px Agency FB Bold";
    offScreenContext.textAlign = "center";
    offScreenContext.fillStyle = '#7ff3fd';
    offScreenContext.textBaseline = "Middle";
    offScreenContext.fillText(config.isSuccess ? '挑战成功' : '打成平手', bgWidth / 2, 200 * window.devicePixelRatio);
}

function createText(num, offScreenContext) {
    var width = 0;
    var numStr = num.toString().split('');
    var height = 120 * window.devicePixelRatio;
    var widthImg = 27 * window.devicePixelRatio;
    var heightImg = 42 * window.devicePixelRatio;
    for (var i = 0; i < numStr.length; i++) {
        var img = new Image();
        img.src = `${gameConfig.LOCAL_URL}/result_score_num/${numStr[i]}.png`;
        offScreenContext.drawImage(img, 420 * window.devicePixelRatio / 2 - numStr.length * 15 * window.devicePixelRatio + i * 30 * window.devicePixelRatio, height, widthImg, heightImg);
    }
}

function isBigVerion(t_version) {
    var t_versionArr = t_version.split('.');
    var version = wx.getSystemInfoSync().version;
    var versionArr = version.split('.');

    for (var i = 0; i < t_versionArr.length; i++) {
        t_versionArr[i] = +t_versionArr[i];
        versionArr[i] = +versionArr[i];
    }
    if (versionArr[0] > t_versionArr[0]) {
        return true;
    }
    if (versionArr[0] === t_versionArr[0] && versionArr[1] > t_versionArr[1]) {
        return true;
    }
    if (versionArr[0] === t_versionArr[0] && versionArr[1] === t_versionArr[1] && versionArr[2] > t_versionArr[2]) {
        return true;
    }
    return false;
}

function drawShareNumber(offScreenContext, num, x, y) {
    var numStr = num.toString().split('');
    for (var i = numStr.length - 1; i > -1; i--) {
        var img = new Image();
        img.src = `${gameConfig.LOCAL_URL}/bar_num/${numStr[i]}.png`;
        offScreenContext.drawImage(img, x + 15 * i * window.devicePixelRatio, y - 8 * window.devicePixelRatio, 16 / 1.2 * window.devicePixelRatio, 21 / 1.2 * window.devicePixelRatio);
    }
}

export { drawShareCanvas, drawShareNumber, createText };