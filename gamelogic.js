// 初始化游戏
import './libs/weapp-adapter.js'
import { settings, colors, randInt, drawPolygon } from './settings.js';
import Hex from './entry/Hex.js';
import blockGen from './entry/wavegen.js';
import {findCenterOfBlocks} from './entry/Block.js';
import { audioManager } from './entry/music.js';
import { getHighScore, saveHighScore } from './storage/localstorage.js';
import {drawRoundRect,renderText,Text} from './comon.js';
import { drawGameOver } from './pages/game-over-page.js';
import { drawStartScreen,touchPop, touchTeris } from './pages/game-login-page.js';
import { render } from './pages/game-run-page.js';
import { animate } from './pages/bubales.js';
import { animateTreis } from './pages/teris.js';
const tt = wx
console.log('game.js 导入的 settings:', settings,settings.blockHeight);
//初始化
wx.globalData.rush = 1; //游戏速度，越大越快 建议1
wx.globalData.lastTime = 0;
wx.globalData.iframHasLoaded = false
wx.globalData.hexColorsToTintedColors={
	"#e74c3c": "rgb(241,163,155)",
	"#f1c40f": "rgb(246,223,133)",
	"#3498db": "rgb(151,201,235)",
	"#2ecc71": "rgb(150,227,183)"
};
wx.globalData.rgbToHex = {
	"rgb(231,76,60)": "#e74c3c",
	"rgb(241,196,15)": "#f1c40f",
	"rgb(52,152,219)": "#3498db",
	"rgb(46,204,113)": "#2ecc71"
};
wx.globalData.rgbColorsToTintedColors = {
	"rgb(231,76,60)": "rgb(241,163,155)",
	"rgb(241,196,15)": "rgb(246,223,133)",
	"rgb(52,152,219)": "rgb(151,201,235)",
	"rgb(46,204,113)": "rgb(150,227,183)"
};
wx.globalData.hexagonBackgroundColor = 'rgb(236, 240, 241)';
wx.globalData.hexagonBackgroundColorClear = 'rgba(236, 240, 241, 0.5)';
wx.globalData.centerBlue = 'rgb(44,62,80)';
wx.globalData.angularVelocityConst = 4;
wx.globalData.op = 0;
//wx.globalData.saveState = localStorage.getItem("saveState") || "{}";
wx.globalData.centerBlue = 'rgb(44,62,80)';
wx.globalData.scoreOpacity = 0;
wx.globalData.textOpacity = 0;
wx.globalData.prevGameState = undefined;
wx.globalData.framerate = 60
wx.globalData.score = 0;
wx.globalData.scoreAdditionCoeff = 1;
wx.globalData.prevScore = 0;
wx.globalData.numHighScores = 3;
wx.globalData.gdx = 0;
wx.globalData.gdy = 0;
wx.globalData.devMode = 0;
wx.globalData.lastGen = undefined;
wx.globalData.prevTimeScored = undefined;
wx.globalData.nextGen = undefined;
wx.globalData.spawnLane = 0;
wx.globalData.startTime = undefined;
wx.globalData.gameState;
wx.globalData.highScore = 0;
wx.globalData.gameState = 0;//0: 未开始, 1: 游戏中, 2: 游戏结束 
// 创建画布
const canvas = wx.globalData.canvas || wx.createCanvas()
const ctx = canvas.getContext('2d')
wx.globalData.ctx = ctx;
//wx.globalData.canvas = canvas
// 获取系统信息
const systemInfo = wx.getSystemInfoSync()
const screenWidth = systemInfo.windowWidth
const screenHeight = systemInfo.windowHeight
wx.globalData.trueCanvas = {
	width: canvas.width,
	height: canvas.height
};

/**
 * @type {Hex} - 这是一个数字类型的变量
 */
wx.globalData.mainHex = null;
/**
 * @type {Array<block>} - 这是一个数字类型的变量
 */
wx.globalData.blocks = null;
/**
 * @type {blockGen} - 这是一个数字类型的变量
 */
wx.globalData.waveone = null;
/**
 * @type {number} - 这是一个数字类型的变量
 */
wx.globalData.lastTime = null;

// 在全局添加动画状态
if (!wx.globalData.btnAnimation) {
	wx.globalData.btnAnimation = {
		scale: 1,
		glowSize: 0,
		time: 0,
		hexRotation: 0,
		innerHexRotation: 0
	};
}

// 在全局作用域创建并加载logo
wx.globalData.gameLogo = wx.createImage();
wx.globalData.gameLogo.src = 'res/images/logo.png';

function scaleCanvas() {
	// 获取系统信息
	const pixelRatio = systemInfo.pixelRatio;
	//console.log('scaleCanvas',settings.baseBlockHeight,settings.baseHexWidth,settings.scale);
	// 计算缩放比例
	if (screenHeight > screenWidth) {
		settings.scale = (screenWidth / 800) * settings.baseScale;
	} else {
		settings.scale = (screenHeight / 800) * settings.baseScale;
	}
	settings.blockHeight = settings.baseBlockHeight * settings.scale;
	settings.hexWidth = settings.baseHexWidth * settings.scale;
	settings.prevScale = settings.scale;
	//console.log('scaleCanvas after',settings.blockHeight,settings.hexWidth,settings.scale);
	// 设置画布大小
	canvas.width = screenWidth * pixelRatio;
	canvas.height = screenHeight * pixelRatio;

	// 设置样式大小
	canvas.style = {
		width: screenWidth + 'px',
		height: screenHeight + 'px'
	};
	wx.globalData.currentPixelRatio = pixelRatio
	// 缩放画布上下文以适应设备像素比
	ctx.scale(pixelRatio, pixelRatio);
}

//游戏入口函数
function gameinit() {
	const highScore = getHighScore();
	wx.globalData.highScore = highScore;
    console.log('历史最高分:', highScore);
	//initUserInfo()
	//initFeedCard();
	audioManager.initAudioWithDelay();
	// 设置全局对象
	if (!wx.globalData.requestAnimationFrame) {
		wx.globalData.requestAnimationFrame = wx.requestAnimationFrame || 
			(callback => setTimeout(callback, 1000 / 60))
	}
	scaleCanvas()
	console.log('init');
	
	wx.globalData.score = 0;
	wx.globalData.gameState = 0;
	wx.globalData.lastTime = Date.now();
	wx.globalData.mainHex = new Hex(settings.hexWidth);
	wx.globalData.blocks = []
	wx.globalData.waveone = new blockGen(wx.globalData.mainHex);
	wx.globalData.gdx =  0;
	wx.globalData.gdy = 0;
	wx.globalData.comboTime =  0;

	wx.globalData.mainHex.y = -100;

	wx.globalData.startTime = Date.now();
	wx.globalData.waveone = new blockGen(wx.globalData.mainHex);

	wx.globalData.mainHex.texts = []; //clear texts
	wx.globalData.mainHex.delay = 15;
	//hideText();
	// 显示开始界面
	setStartScreen();
}

export function animLoop() {
	switch (wx.globalData.gameState) {
	case 1:
		//requestAnimationFrame(animLoop);
		render(ctx,canvas);
		var now = Date.now();
		var dt = (now - wx.globalData.lastTime)/16.666 * wx.globalData.rush;
		if(!wx.globalData.mainHex.delay) {
			update(dt);
		}
		else{
			wx.globalData.mainHex.delay--;
		}
		wx.globalData.lastTime = now;

		checkGameOver()
		break;

	case 0:
		//requestAnimationFrame(animLoop);
		
		//render();
		drawStartScreen(ctx,canvas);
		//drawGameOver(ctx,canvas);
		break;

	case -1:
		//requestAnimationFrame(animLoop);
		render(ctx,canvas);
		break;

	case 2:
		//requestAnimationFrame(animLoop);
		render(ctx,canvas);
		drawGameOver(ctx,canvas);
		break;
	case 3: //泡泡
		//requestAnimationFrame(animLoop);
		animate();
		//console.log("game over");
		//render(ctx,canvas);
		break;
	case 4: //俄罗斯方块
		//requestAnimationFrame(animLoop);
		animateTreis();
		break;
	case 999: //返回主界面
		//requestAnimationFrame(animLoop);
		wx.globalData.gameState = 0;
		audioManager.stopBGM();
		gameinit();
		break;
	default:
		console.log("default");
		break;
	}
	requestAnimationFrame(animLoop);
}

// 检查点击是否在按钮区域内
function isButtonClicked(touch, button) {
    return button && 
        touch.clientX >= button.x && 
        touch.clientX <= button.x + button.width &&
        touch.clientY >= button.y && 
        touch.clientY <= button.y + button.height;
}

function handleGameStart(e) {
	// 触摸事件处理
	const touch = e.touches[0];
	const x = touch.clientX;
	switch(wx.globalData.gameState){
		case 1:
			if (x < screenWidth / 2) {
				if (wx.globalData.mainHex && wx.globalData.gameState !== 0) {
					wx.globalData.mainHex.rotate(1);
				}
			} else {
				if (wx.globalData.mainHex && wx.globalData.gameState !== 0) {
					wx.globalData.mainHex.rotate(-1);
				}
			}
			const canvasWidth = canvas.width / wx.globalData.currentPixelRatio;
			const canvasHeight = canvas.height / wx.globalData.currentPixelRatio;
			// 获取返回按钮的位置信息
			const returnButton = wx.globalData.returnButton;
			const clickX = touch.clientX;
			const clickY = touch.clientY;
			// 检查触摸点是否在返回按钮范围内
			if (
				clickX >= returnButton.x &&
				clickX <= returnButton.x + returnButton.width &&
				clickY >= returnButton.y &&
				clickY <= returnButton.y + returnButton.height
			) {
				wx.offTouchStart(handleGameStart);
				wx.globalData.gameState = 999;
				
			}
			
			//wx.globalData.mainHex.texts.push(new Text(canvasWidth/2,canvasHeight/2, "连击 X" + wx.globalData.mainHex.position, "#FF0000"));

			break
		case 2:
			wx.offTouchStart(handleGameStart);
			wx.globalData.gameState = 999
			break;
	}
}

// 修改setStartScreen函数
function setStartScreen() {
    // 添加触摸事件监听
    function handleMainPage(e) {
        const touch = e.touches[0];
        const canvas = wx.globalData.canvas;
        const screenWidth = canvas.width / wx.globalData.currentPixelRatio;
        const screenHeight = canvas.height / wx.globalData.currentPixelRatio;
        const centerX = screenWidth / 2;
        const centerY = screenHeight / 2;
        
        // 检查是否点击了开始按钮（六边形）
        if (wx.globalData.gameState === 0 && 
            Math.sqrt(Math.pow(touch.clientX - centerX, 2) + Math.pow(touch.clientY - centerY, 2)) < 200 * settings.scale) {
            
            wx.offTouchStart(handleMainPage);
            // 开始游戏
            wx.globalData.gameState = 1;
            wx.onTouchStart(handleGameStart);
            wx.globalData.lastTime = Date.now();
            console.log("开始游戏");
            
            audioManager.start();
            
            // 清除开始界面的重绘定时器
            if (wx.globalData.startScreenInterval) {
                clearInterval(wx.globalData.startScreenInterval);
                wx.globalData.startScreenInterval = null;
            }
            return;
        }
        
        // 检查是否点击了分享按钮
        if (isButtonClicked(touch, wx.globalData.mainShareButton)) {
            // 分享游戏
            wx.shareAppMessage({
                title: '快乐六边形 - 考验反应力的休闲小游戏',
                desc: '快来和我一起玩快乐六边形吧！',
                imageUrl: 'res/images/share.png',
                success: function() {
                    wx.showToast({
                        title: '分享成功',
                        icon: 'success',
                        duration: 2000
                    });
                },
                fail: function() {
                    wx.showToast({
                        title: '分享失败',
                        icon: 'none',
                        duration: 2000
                    });
                }
            });
            return;
        }
        
        // 检查是否点击了泡泡按钮
        if (isButtonClicked(touch, wx.globalData.bubbleButton)) {
            touchPop(e);
            return;
        }
        
        // 检查是否点击了方块按钮
        if (isButtonClicked(touch, wx.globalData.terisButton)) {
            touchTeris(e);
            return;
        }
    }
    
    // 注册触摸事件
    wx.onTouchStart(handleMainPage);
}

// 添加Feed异化卡相关的全局配置
wx.globalData.feedCard = {
    isSupported: false,
    cardHeight: 0,
    score: 0,
    bestScore: 0
};

// 初始化Feed异化卡能力
function initFeedCard() {
    // 检查环境是否支持Feed异化卡
    if (wx.getFeedCardSupport) {
        wx.getFeedCardSupport({
            success(res) {
                console.log('Feed异化卡支持状态:', res);
                wx.globalData.feedCard.isSupported = res.feedCardSupport;
                if (res.feedCardSupport) {
                    // 获取异化卡可用高度
                    wx.getFeedCardFreeHeight({
                        success(res) {
                            wx.globalData.feedCard.cardHeight = res.freeHeight;
                            console.log('Feed异化卡可用高度:', res.freeHeight);
                        },
                        fail(err) {
                            console.error('获取异化卡高度失败:', err);
                        }
                    });
                }
            },
            fail(err) {
                console.error('检查Feed异化卡支持失败:', err);
            }
        });
    }else{
		console.log("Feed异化卡不支持");
	}
}

// 更新Feed异化卡内容
function updateFeedCard(score) {
    if (!wx.globalData.feedCard.isSupported) return;

    // 更新最高分
    if (score > wx.globalData.feedCard.bestScore) {
        wx.globalData.feedCard.bestScore = score;
    }

    // 准备Feed卡片数据
    const cardData = {
        feedCardId: 1, // 卡片ID，需要在开发者平台配置
        cardArgs: {
            score: score.toString(),
            bestScore: wx.globalData.feedCard.bestScore.toString(),
            title: '快乐六边形',
            desc: `我在快乐六边形中获得了${score}分！`,
            imageUrl: 'feed-card-image.png' // 替换为你的图片地址
        }
    };

    // 展示Feed异化卡
    wx.showFeedCard({
        feedCardData: cardData,
        success(res) {
            console.log('展示Feed异化卡成功:', res);
        },
        fail(err) {
            console.error('展示Feed异化卡失败:', err);
        }
    });
}

// 添加分享卡片功能
function shareFeedCard() {
    if (!wx.globalData.feedCard.isSupported) return;

    wx.shareFeedCard({
        feedCardId: 1, // 与showFeedCard中使用的ID保持一致
        cardArgs: {
            score: wx.globalData.score.toString(),
            bestScore: wx.globalData.feedCard.bestScore.toString(),
            title: '快乐六边形',
            desc: `我在快乐六边形中获得了${wx.globalData.score}分！快来挑战我吧！`,
            imageUrl: 'feed-card-image.png'
        },
        success(res) {
            console.log('分享Feed卡片成功:', res);
            wx.showToast({
                title: '分享成功',
                icon: 'success',
                duration: 2000
            });
        },
        fail(err) {
            console.error('分享Feed卡片失败:', err);
            wx.showToast({
                title: '分享失败',
                icon: 'none',
                duration: 2000
            });
        }
    });
}


//更新游戏
function update(dt) {
	// 更新主六边形的时间增量
	wx.globalData.mainHex.dt = dt;
	
	// 更新波生成器
	wx.globalData.waveone.update();
	// 检查是否需要更新得分时间
	if (wx.globalData.mainHex.ct - wx.globalData.waveone.prevTimeScored > 1000) {
		wx.globalData.waveone.prevTimeScored = wx.globalData.mainHex.ct;
	}
	
	// 用于跟踪最低的被删除方块的索引
	var lowestDeletedIndex = 99;
	var i;
	var j;
	var block;

	// 遍历所有活动方块
	for (i = 0; i < wx.globalData.blocks.length; i++) {
		// 检查方块是否与主六边形碰撞
		wx.globalData.mainHex.doesBlockCollide(wx.globalData.blocks[i]);
		if (!wx.globalData.blocks[i].settled) {
			// 如果方块未固定，且不在初始化状态，则更新其位置
			if (!wx.globalData.blocks[i].initializing) 
				wx.globalData.blocks[i].distFromHex -= wx.globalData.blocks[i].iter * dt * settings.scale;
		} else if (!wx.globalData.blocks[i].removed) {
			// 如果方块已固定但未被移除，标记为已移除
			wx.globalData.blocks[i].removed = 1;
		}
	}

	// 检查主六边形上所有边的方块
	for (i = 0; i < wx.globalData.mainHex.blocks.length; i++) {
		for (j = 0; j < wx.globalData.mainHex.blocks[i].length; j++) {
			// 如果方块被标记为需要检查，则进行合并检查
			if (wx.globalData.mainHex.blocks[i][j].checked == 1) {
				consolidateBlocks(wx.globalData.mainHex, wx.globalData.mainHex.blocks[i][j].attachedLane, wx.globalData.mainHex.blocks[i][j].getIndex());
				wx.globalData.mainHex.blocks[i][j].checked = 0;
			}
		}
	}

	// 处理需要删除的方块
	for (i = 0; i < wx.globalData.mainHex.blocks.length; i++) {
		lowestDeletedIndex = 99;
		for (j = 0; j < wx.globalData.mainHex.blocks[i].length; j++) {
			block = wx.globalData.mainHex.blocks[i][j];
			// 如果方块标记为删除状态2，则移除它
			if (block.deleted == 2) {
				wx.globalData.mainHex.blocks[i].splice(j, 1);
				wx.globalData.waveone.blockDestroyed();
				if (j < lowestDeletedIndex) lowestDeletedIndex = j;
				j--;
			}
		}

		// 如果有方块被删除，重置该列上方方块的状态
		if (lowestDeletedIndex < wx.globalData.mainHex.blocks[i].length) {
			for (j = lowestDeletedIndex; j < wx.globalData.mainHex.blocks[i].length; j++) {
				wx.globalData.mainHex.blocks[i][j].settled = 0;
			}
		}
	}

	// 更新主六边形上所有方块的位置
	for (i = 0; i < wx.globalData.mainHex.blocks.length; i++) {
		for (j = 0; j < wx.globalData.mainHex.blocks[i].length; j++) {
			block = wx.globalData.mainHex.blocks[i][j];
			// 检查碰撞
			wx.globalData.mainHex.doesBlockCollide(block, j, wx.globalData.mainHex.blocks[i]);

			// 如果方块未固定，更新其位置
			if (!wx.globalData.mainHex.blocks[i][j].settled) {
				wx.globalData.mainHex.blocks[i][j].distFromHex -= block.iter * dt * settings.scale;
			}
		}
	}

	// 清理已移除的方块
	for(i = 0; i < wx.globalData.blocks.length; i++){
		if (wx.globalData.blocks[i].removed == 1) {
			wx.globalData.blocks.splice(i, 1);
			i--;
		}
	}

	// 更新主六边形的计时器
	wx.globalData.mainHex.ct += dt;
}



// 检查游戏是否结束
function checkGameOver() {
	// 检查每条边上的方块数量
	for (let lane = 0; lane < wx.globalData.mainHex.sides; lane++) {
			if (wx.globalData.mainHex.blocks[lane].length > settings.gameOverLength) {
			console.log("gameOver");
			// 游戏结束
			gameOver();
			break;
		}
	}
	
	// 移除错误的分数检查，确保游戏不会在特定分数时结束
	// 游戏应该只在堆叠超过5个方块时结束
}

// 分享功能
function shareGame(score, isHighScore = false) {
    const shareTitle = isHighScore ? `我在快乐六边形中创造了新纪录：${score}分！` : `我在快乐六边形中获得了${score}分！`;
    const shareContent = `快来挑战我的分数吧！`;
    
    wx.shareAppMessage({
        title: shareTitle,
        desc: shareContent,
        imageUrl: 'res/images/share.png', // 确保这个图片存在
        success: function() {
            wx.showToast({
                title: '分享成功',
                icon: 'success',
                duration: 2000
            });
        },
        fail: function() {
            wx.showToast({
                title: '分享失败',
                icon: 'none',
                duration: 2000
            });
        }
    });
}

// 处理游戏结束时的触摸事件
function handleGameOverTouch(e) {
    const touch = e.touches[0];
    const shareButton = wx.globalData.shareButton;
    
    if (shareButton && 
        touch.clientX >= shareButton.x && 
        touch.clientX <= shareButton.x + shareButton.width &&
        touch.clientY >= shareButton.y && 
        touch.clientY <= shareButton.y + shareButton.height) {
        // 点击了分享按钮
        const isHighScore = wx.globalData.score === wx.globalData.highScore;
        shareGame(wx.globalData.score, isHighScore);
    } else {
        // 点击了其他区域，重新开始游戏
        wx.globalData.gameState = 0;
        wx.offTouchStart(handleGameOverTouch);
        setStartScreen();
    }
}

// 修改游戏结束处理
function gameOver() {
    // 设置游戏状态为结束
    wx.globalData.gameState = 2;
    // 播放游戏结束音效
    audioManager.gameover();
    
    // 更新最高分
    if (wx.globalData.score > wx.globalData.highScore) {
        wx.globalData.highScore = wx.globalData.score;
        saveHighScore(wx.globalData.score);
    }
    
    // 注册游戏结束界面的触摸事件
    wx.onTouchStart(handleGameOverTouch);
}

//碰撞检测
/**
 * @param {Hex} hex - 第一个参数是数字类型
 */
function consolidateBlocks(hex, side, index) {
    // 记录哪些边被改变
    var sidesChanged = [];
    var deleting = [];
	/**
	 * @type {Array<Block>}
	 */
    var deletedBlocks = [];
    // 添加初始情况
    deleting.push([side, index]);
    // 填充删除数组
    floodFill(hex, side, index, deleting);
    // 确保有超过3个块需要删除
    if (deleting.length < 3) {
        return;
    }
    var i;
    for (i = 0; i < deleting.length; i++) {
        var arr = deleting[i];
        // 确保数组是正确的
        if (arr !== undefined && arr.length == 2) {
            // 如果不在已改变的边数组中，则添加
            if (sidesChanged.indexOf(arr[0]) == -1) {
                sidesChanged.push(arr[0]);
            }
            // 标记为已删除
            hex.blocks[arr[0]][arr[1]].deleted = 1;
            deletedBlocks.push(hex.blocks[arr[0]][arr[1]]);
        }
    }

    // 添加分数
    var now = wx.globalData.mainHex.ct;
    if (now - hex.lastCombo < settings.comboTime) {
        //settings.comboTime = (1 / settings.creationSpeedModifier) * (wx.globalData.waveone.nextGen / 16.666667) * 3;
        hex.comboMultiplier += 1;
		settings.comboTime = settings.basecomboTime*(1-hex.comboMultiplier/10);
        var coords = findCenterOfBlocks(deletedBlocks);
        hex.texts.push(new Text(coords['x'], coords['y'], "连击 x" + hex.comboMultiplier.toString(), "#FF0000"));
		if(hex.comboMultiplier < 3){
			audioManager.good();
		}
		else if(hex.comboMultiplier < 6){
			audioManager.great();
		}
		else{
			audioManager.unbleaveable();
		}
		
	} else {
        settings.comboTime = settings.basecomboTime;
        hex.comboMultiplier = 1;
		audioManager.good();
    }
	hex.lastCombo = now;
	audioManager.combotime(settings.comboTime/60/wx.globalData.rush);
    var adder = deleting.length * deleting.length * hex.comboMultiplier;
    hex.texts.push(new Text(hex.x, hex.y, "得分 + " + adder.toString(), deletedBlocks[0].color));
    hex.lastColorScored = deletedBlocks[0].color;
    wx.globalData.score += adder;	
}
function search(twoD,oneD){
	// Searches a two dimensional array to see if it contains a one dimensional array. indexOf doesn't work in this case
	for(var i=0;i<twoD.length;i++){
		if(twoD[i][0] == oneD[0] && twoD[i][1] == oneD[1]) {
			return true;
		}
	}
	return false;
}

/**
 * @param {Hex} hex 
 * @param {Number} side 
 * @param {Number} index 
 * @param {Array} deleting 
 * @returns 
 */
function floodFill(hex, side, index, deleting) {
    // 如果指定的边或索引不存在，直接返回
    if (hex.blocks[side] === undefined || hex.blocks[side][index] === undefined) return;

    // 存储当前块的颜色
    var color = hex.blocks[side][index].color;
    // 嵌套的for循环用于遍历相邻的块
    for (var x = -1; x < 2; x++) {
        for (var y = -1; y < 2; y++) {
            // 确保不是对角线方向
            if (Math.abs(x) == Math.abs(y)) { continue; }
            // 计算当前探索的边，使用模运算
            var curSide = (side + x + hex.sides) % hex.sides;
            // 计算当前索引
            var curIndex = index + y;
            // 确保当前边和索引存在
            if (hex.blocks[curSide] === undefined) { continue; }
            if (hex.blocks[curSide][curIndex] !== undefined) {
                // 检查颜色是否相同，是否已经被探索过，以及是否未被删除
                if (hex.blocks[curSide][curIndex].color == color && search(deleting, [curSide, curIndex]) === false && hex.blocks[curSide][curIndex].deleted === 0) {
                    // 将当前块添加到已探索数组中
                    deleting.push([curSide, curIndex]);
                    // 递归调用，探索下一个块
                    floodFill(hex, curSide, curIndex, deleting);
                }
            }
        }
    }
}

// 处理主界面分享按钮点击
function handleMainPageShare(e) {
    const touch = e.touches[0];
    const mainShareButton = wx.globalData.mainShareButton;
    
    if (mainShareButton && 
        touch.clientX >= mainShareButton.x && 
        touch.clientX <= mainShareButton.x + mainShareButton.width &&
        touch.clientY >= mainShareButton.y && 
        touch.clientY <= mainShareButton.y + mainShareButton.height) {
        // 分享游戏
        wx.shareAppMessage({
            title: '快乐六边形 - 考验反应力的休闲小游戏',
            desc: '快来和我一起玩快乐六边形吧！',
            imageUrl: 'res/images/share.png', // 确保这个图片存在
            success: function() {
                wx.showToast({
                    title: '分享成功',
                    icon: 'success',
                    duration: 2000
                });
            },
            fail: function() {
                wx.showToast({
                    title: '分享失败',
                    icon: 'none',
                    duration: 2000
                });
            }
        });
    }
}

export {gameinit}