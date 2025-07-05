import Block from './Block.js';
import { settings} from '../settings.js';
import { drawPolygon } from '../comon.js';
import { audioManager } from './music.js';
import { Text } from '../comon.js';
console.log('hex.js 导入的 settings:', settings,settings.blockHeight);
const tt = wx
// 主六边形类
class Hex {
	constructor(sideLength) {
		this.playThrough = 0;
		// 填充颜色
		this.fillColor = [44,62,80];
		// 临时颜色
		this.tempColor = [44,62,80];
		// 角速度
		this.angularVelocity = 0;
		// 旋转的次数
		this.position = 0;
		// 垂直位移
		this.dy = 0;
		// 时间增量
		this.dt = 1;
		// 六边形的边数
		this.sides = 6;
		// 每个角的角度
		this.angle = 180 / this.sides;
		// 目标角度
		this.targetAngle = this.angle;
		// 存储震动效果的数组
		this.shakes = [];
		// 六边形的边长
		this.sideLength = sideLength;
		// 描边颜色
		this.strokeColor = 'blue';
		// 六边形的中心x坐标
		this.x = wx.globalData.trueCanvas.width / 2;
		// 六边形的中心y坐标
		this.y = wx.globalData.trueCanvas.height / 2;
		// 当前时间
		this.ct = 0;
		// 上次连击的时间
		this.lastCombo = this.ct - settings.comboTime;
		// 上次得分的颜色
		this.lastColorScored = "#000";
		// 连击时间
		this.comboMultiplier = 1;
		// 存储文本对象的数组
		/**
		 * @type {Array<Text>} - 这是一个数组类型的变量
		 */
		this.texts = [];
		// 上次旋转的时间
		this.lastRotate = Date.now();
		/**
		 * @type {Array<Array<Block>>} - 这是一个数组类型的变量
		 */
		// 存储每个边上的块
		this.blocks = [[],[],[],[],[],[]];
		this.delay = 1;
	}
	shake(obj) { //lane as in particle lane
		// 计算震动的角度
		var angle = 30 + obj.lane * 60;
		// 将角度转换为弧度
		angle *= Math.PI / 180;
		// 计算震动的水平位移
		var dx = Math.cos(angle) * obj.magnitude;
		// 计算震动的垂直位移
		var dy = Math.sin(angle) * obj.magnitude;
		// 更新全局水平位移
		wx.globalData.gdx -= dx;
		// 更新全局垂直位移
		wx.globalData.gdy += dy;
		// 减少震动的幅度
		obj.magnitude /= 2 * (this.dt + 0.5);
		// 如果震动幅度小于1
		if (obj.magnitude < 1) {
			// 遍历震动数组
			for (var i = 0; i < this.shakes.length; i++) {
				// 如果找到了当前震动对象
				if (this.shakes[i] == obj) {
					// 从震动数组中移除当前震动对象
					this.shakes.splice(i, 1);
				}
			}
		}
	};
	/**
	 * @param {Block} block 
	 */
	addBlock(block) {
		//audioManager.fall();
       // 如果游戏状态不是进行中或暂停，直接返回
		if (!(wx.globalData.gameState == 1)) return;
	
		// 将block标记为已安置
		block.settled = 1;
		// 设置block的颜色透明度
		block.tint = 0.6;
	
		// 计算block所在的lane
		var lane = this.sides - block.fallingLane;
		// 添加震动效果
		this.shakes.push({lane: block.fallingLane, magnitude: 4.5 * (wx.globalData.currentPixelRatio ? wx.globalData.currentPixelRatio : 1) * (settings.scale)});
		// 根据主六边形的旋转位置调整lane
		lane += this.position;
		lane = (lane + this.sides) % this.sides;
	
		// 计算block距离主六边形中心的距离
		block.distFromHex = this.sideLength / 2 * Math.sqrt(3) + block.height * this.blocks[lane].length;
		// 将block添加到对应的lane中
		this.blocks[lane].push(block);
	
		// 设置block的附加lane
		block.attachedLane = lane;
		// 标记block为已检查
		block.checked = 1;
    };
	doesBlockCollide(block, position, tArr) {
		// 如果block已经安置，直接返回
		if (block.settled) {
			return;
		}

		// 如果提供了position参数
		if (position !== undefined) {
			arr = tArr;
			// 如果position小于等于0
			if (position <= 0) {
				// 检查block是否与主六边形的边缘碰撞
				if (block.distFromHex - block.iter * this.dt * settings.scale - (this.sideLength / 2) * Math.sqrt(3) <= 0) {
					// 将block的位置设置为主六边形的边缘
					block.distFromHex = (this.sideLength / 2) * Math.sqrt(3);
					block.settled = 1;
					block.checked = 1;
				} else {
					block.settled = 0;
					block.iter = 1.5 + (wx.globalData.waveone.difficulty / 15) * 3;
				}
			} else {
				// 检查block是否与前一个block碰撞
				if (arr[position - 1].settled && block.distFromHex - block.iter * this.dt * settings.scale - arr[position - 1].distFromHex - arr[position - 1].height <= 0) {
					// 将block的位置设置为前一个block的顶部
					block.distFromHex = arr[position - 1].distFromHex + arr[position - 1].height;
					block.settled = 1;
					block.checked = 1;
				} else {
					block.settled = 0;
					block.iter = 1.5 + (wx.globalData.waveone.difficulty / 15) * 3;
				}
			}
		} else {
			// 计算block所在的lane
			var lane = this.sides - block.fallingLane;
			lane += this.position;
			lane = (lane + this.sides) % this.sides;
			var arr = this.blocks[lane];
			//console.log(block,lane,arr);
			// 如果当前lane中有blocks
			if (arr.length > 0) {
				// 检查block是否与当前lane中的最后一个block碰撞
				if (block.distFromHex + block.iter * this.dt * settings.scale - arr[arr.length - 1].distFromHex - arr[arr.length - 1].height <= 0) {
					// 将block的位置设置为当前lane中最后一个block的顶部
					block.distFromHex = arr[arr.length - 1].distFromHex + arr[arr.length - 1].height;
					this.addBlock(block);
				}
			} else {
				// 检查block是否与主六边形的边缘碰撞
				if (block.distFromHex + block.iter * this.dt * settings.scale - (this.sideLength / 2) * Math.sqrt(3) <= 0) {
					// 将block的位置设置为主六边形的边缘
					block.distFromHex = (this.sideLength / 2) * Math.sqrt(3);
					this.addBlock(block);
				}
			}
		}
	};
	rotate(steps) {
		
		//console.log("rotate",steps);
		//if(Date.now()-this.lastRotate<75 && !(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) ) return;
		if (!(wx.globalData.gameState === 1)) return;
		this.position += steps;
		

		while (this.position < 0) {
			this.position += 6;
		}

		this.position = this.position % this.sides;
		this.blocks.forEach(function(blocks) {
			blocks.forEach(function(block) {
				block.targetAngle = block.targetAngle - steps * 60;
			});
		});

		this.targetAngle = this.targetAngle - steps * 60;
		this.lastRotate = Date.now();
		audioManager.move();
	};

	draw() {
		this.x = wx.globalData.trueCanvas.width/2;

		if (wx.globalData.gameState != -2) {
			this.y = wx.globalData.trueCanvas.height/2;
		}
		//this.sideLength = settings.hexWidth;
		wx.globalData.gdx = 0;
		wx.globalData.gdy = 0;
		for (var i = 0; i < this.shakes.length; i++) {
			this.shake(this.shakes[i]);
		}
		if (this.angle > this.targetAngle) {
			this.angularVelocity -= wx.globalData.angularVelocityConst * this.dt;
		}
		else if(this.angle < this.targetAngle) {
			this.angularVelocity += wx.globalData.angularVelocityConst * this.dt;
		}

		if (Math.abs(this.angle - this.targetAngle + this.angularVelocity) <= Math.abs(this.angularVelocity)) { //do better soon
			this.angle = this.targetAngle;
			this.angularVelocity = 0;
		}
		else {
			this.angle += this.angularVelocity;
		}
		//console.log("draw hex",this.sideLength,settings.baseHexWidth);
		drawPolygon(wx.globalData.ctx,this.x + wx.globalData.gdx, this.y + wx.globalData.gdy + this.dy, this.sides, this.sideLength, this.angle,arrayToColor(this.fillColor) , 0, 'rgba(0,0,0,0)');
	
		  // 添加分数显示
		  const ctx = wx.globalData.ctx;
		  ctx.save();
		  
		  // 计算合适的字体大小
		  const score = wx.globalData.score.toString();
		  const maxWidth = this.sideLength * 1.2;  // 六边形宽度的 60%
		  let fontSize = 36 * settings.scale;
		  
		  // 设置初始字体来测量文本宽度
		  ctx.font = `bold ${fontSize}px Arial`;
		  let textWidth = ctx.measureText(score).width;
		  
		  // 如果文本太宽，调整字体大小
		  if (textWidth > maxWidth) {
			  fontSize = fontSize * (maxWidth / textWidth);
		  }
		  
		  // 应用最终的文本样式
		  ctx.fillStyle = '#FFA500';  // 橙色
		  ctx.textAlign = 'center';
		  ctx.textBaseline = 'middle';
		  
		  // 添加描边使文字更清晰
		  ctx.strokeStyle = '#000000';
		  ctx.lineWidth = Math.max(2, fontSize / 15);  // 描边宽度随字体大小调整
		  
		  // 在六边形中心绘制分数
		  const x = this.x + wx.globalData.gdx;
		  const y = this.y + wx.globalData.gdy + this.dy;
		  
		  // 先绘制描边
		  ctx.strokeText(score, x, y);
		  // 再绘制文字
		  ctx.fillText(score, x, y);
		  
		  ctx.restore();
	};
}
function arrayToColor(arr){
	return 'rgb(' + arr[0]+ ','+arr[1]+','+arr[2]+')';
}
export default Hex;