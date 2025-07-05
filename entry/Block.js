import { settings} from '../settings.js';
import { rotatePoint } from '../comon.js';
console.log('Block.js 导入的 settings:', settings,settings.blockHeight);
const tt = wx
class Block {
	constructor(hex,fallingLane, color, iter, distFromHex, settled) {
		//console.log("Block",hex,fallingLane,color,iter,distFromHex,settled);
		/**
		 * @type {Hex}
		 */
		this.hex = hex;
		this.canvas = wx.globalData.canvas;
		this.ctx = wx.globalData.ctx;
		// 是否已安置在中心六边形或其他块上
		this.settled = (settled === undefined) ? 0 : 1;
		// 块的高度
		this.height = settings.blockHeight;
		// 块从哪个通道掉落
		this.fallingLane = fallingLane;
		// 块是否已检查
		this.checked = 0;
		// 块掉落的角度
		this.angle = 90 - (30 + 60 * fallingLane);
		// 用于计算附加到中心六边形的块的旋转
		this.angularVelocity = 0;
		this.targetAngle = this.angle;
		// 块的颜色
		this.color = color;
		// 标记为删除的块
		this.deleted = 0;
		// 标记为从掉落中移除并添加到六边形的块
		this.removed = 0;
		// 用于绘制在掉落块上的白色块的不透明度值，以使其在附加到六边形时发光
		this.tint = 0;
		// 用于删除动画的不透明度值
		this.opacity = 1;
		// 块是否正在初始化，从小变大
		this.initializing = 1;
		// 当前时间
		this.ict = hex.ct;
		// 块的速度
		this.iter = iter;
		// 在开始掉落之前的初始化时间
		this.initLen = settings.creationDt;
		// 块附加到的边
		this.attachedLane = 0;
		// 距离中心六边形的距离
		this.distFromHex = distFromHex || settings.startDist * settings.scale;
	
	}
	// 增加不透明度
    incrementOpacity() {
        if (this.deleted) {
            // 添加震动效果
            if (this.opacity >= 0.925) {
                var tLane = this.attachedLane - this.hex.position;
                tLane = this.hex.sides - tLane;
                while (tLane < 0) {
                    tLane += this.hex.sides;
                }

                tLane %= this.hex.sides;
                this.hex.shakes.push({lane: tLane, magnitude: 3 * (wx.globalData.currentPixelRatio ? wx.globalData.currentPixelRatio : 1) * (settings.scale)});
            }
            // 渐隐不透明度
            this.opacity = this.opacity - 0.075 * this.hex.dt;
            if (this.opacity <= 0) {
                // 标记为最终删除
                this.opacity = 0;
                this.deleted = 2;
                if (wx.globalData.gameState == 1 || wx.globalData.gameState == 0) {
                    //localStorage.setItem("saveState", exportSaveState());
                }
            }
        }
    };
	// 获取块在其堆栈中的索引
    getIndex() {
        var parentArr = this.hex.blocks[this.attachedLane];
        for (var i = 0; i < parentArr.length; i++) {
            if (parentArr[i] == this) {
                return i;
            }
        }
    };


		// 计算四个顶点
		//       p1 -------- p2     ← width
			//   /          \
			//  /            \     ← 斜边
			// /              \
			//p4 -------------- p3   ← widthWide
		 // 绘制块

	draw(attached, index) {
		//console.log("draw block",this.height,settings.blockHeight);
		
		if (Math.abs(settings.scale - settings.prevScale) > 0.000000001) {
			this.distFromHex *= (settings.scale/settings.prevScale);
		}

		this.incrementOpacity();
		if(attached === undefined)
			attached = false;

		if(this.angle > this.targetAngle) {
			this.angularVelocity -= wx.globalData.angularVelocityConst * this.hex.dt;
		}
		else if(this.angle < this.targetAngle) {
			this.angularVelocity += wx.globalData.angularVelocityConst * this.hex.dt;
		}

		if (Math.abs(this.angle - this.targetAngle + this.angularVelocity) <= Math.abs(this.angularVelocity)) { //do better soon
			this.angle = this.targetAngle;
			this.angularVelocity = 0;
		}
		else {
			this.angle += this.angularVelocity;
		}
		
		this.width = 2 * this.distFromHex / Math.sqrt(3);
		this.widthWide = 2 * (this.distFromHex + this.height) / Math.sqrt(3);
		//this.widthWide = this.width + this.height + 3;
		var p1;
		var p2;
		var p3;
		var p4;
		//从小到大的动画
		if (this.initializing) {
			var rat = ((this.hex.ct - this.ict)/this.initLen);
			if (rat > 1) {
				rat = 1;
			}
			p1 = rotatePoint((-this.width / 2) * rat, this.height / 2, this.angle);
			p2 = rotatePoint((this.width / 2) * rat, this.height / 2, this.angle);
			p3 = rotatePoint((this.widthWide / 2) * rat, -this.height / 2, this.angle);
			p4 = rotatePoint((-this.widthWide / 2) * rat, -this.height / 2, this.angle);
			if ((this.hex.ct - this.ict) >= this.initLen) {
				this.initializing = 0;
			}
		} else {
			p1 = rotatePoint(-this.width / 2, this.height / 2, this.angle);
			p2 = rotatePoint(this.width / 2, this.height / 2, this.angle);
			p3 = rotatePoint(this.widthWide / 2, -this.height / 2, this.angle);
			p4 = rotatePoint(-this.widthWide / 2, -this.height / 2, this.angle);
		}

		if (this.deleted) {
			this.ctx.fillStyle = "#FFF";
		}
		else {
			this.ctx.fillStyle = this.color;
		}

		this.ctx.globalAlpha = this.opacity;
		var baseX = wx.globalData.trueCanvas.width / 2 + Math.sin((this.angle) * (Math.PI / 180)) * (this.distFromHex + this.height / 2) + wx.globalData.gdx;
		var baseY = wx.globalData.trueCanvas.height / 2 - Math.cos((this.angle) * (Math.PI / 180)) * (this.distFromHex + this.height / 2) + wx.globalData.gdy;
		this.ctx.beginPath();
		this.ctx.moveTo(baseX + p1.x, baseY + p1.y);
		this.ctx.lineTo(baseX + p2.x, baseY + p2.y);
		this.ctx.lineTo(baseX + p3.x, baseY + p3.y);
		this.ctx.lineTo(baseX + p4.x, baseY + p4.y);
		//ctx.lineTo(baseX + p1.x, baseY + p1.y);
		this.ctx.closePath();
		this.ctx.fill();

		// 添加黑色边框
		this.ctx.strokeStyle = '#000000';  // 设置边框颜色为黑色
		this.ctx.lineWidth = 1;  // 设置边框宽度
		this.ctx.stroke();  // 绘制边框

		if (this.tint) {
			if (this.opacity < 1) {
				this.iter = 2.25;
				this.tint = 0;
			}

			this.ctx.fillStyle = "#FFF";
			this.ctx.globalAlpha = this.tint;
			this.ctx.beginPath();
			this.ctx.moveTo(baseX + p1.x, baseY + p1.y);
			this.ctx.lineTo(baseX + p2.x, baseY + p2.y);
			this.ctx.lineTo(baseX + p3.x, baseY + p3.y);
			this.ctx.lineTo(baseX + p4.x, baseY + p4.y);
			this.ctx.lineTo(baseX + p1.x, baseY + p1.y);
			this.ctx.closePath();
			this.ctx.fill();
			this.tint -= 0.02 * this.hex.dt;
			if (this.tint < 0) {
				this.tint = 0;
			}
		}

		this.ctx.globalAlpha = 1;
	};
}
/**
 * @param {Array<Block>} arr 
 * @returns {{x: number, y: number}}
 */
function findCenterOfBlocks(arr) {
	var avgDFH = 0;
	var avgAngle = 0;
	for (var i = 0; i < arr.length; i++) {
		avgDFH += arr[i].distFromHex;
		var ang = arr[i].angle;
		while (ang < 0) {
			ang += 360;
		}
		
		avgAngle += ang % 360;
	}

	avgDFH /= arr.length;
	avgAngle /= arr.length;

	return {
		x:wx.globalData.trueCanvas.width/2 + Math.cos(avgAngle * (Math.PI / 180)) * avgDFH,
		y:wx.globalData.trueCanvas.height/2 + Math.sin(avgAngle * (Math.PI / 180)) * avgDFH
	};
}

export default Block;
export {findCenterOfBlocks}