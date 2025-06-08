import { settings } from './settings.js';
const tt = wx
// 辅助函数：绘制圆角矩形
export function drawRoundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.arcTo(x + width, y, x + width, y + radius, radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
    ctx.lineTo(x + radius, y + height);
    ctx.arcTo(x, y + height, x, y + height - radius, radius);
    ctx.lineTo(x, y + radius);
    ctx.arcTo(x, y, x + radius, y, radius);
    ctx.closePath();
}

export function clearGameBoard(ctx) {
	drawPolygon(ctx,wx.globalData.trueCanvas.width / 2, wx.globalData.trueCanvas.height / 2, 6, wx.globalData.trueCanvas.width / 2, 30, wx.globalData.hexagonBackgroundColor, 0, 'rgba(0,0,0,0)');
}

// 添加随机整数函数
export function randInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}
export function rotatePoint(x, y, theta) {
	var thetaRad = theta * (Math.PI / 180);
	var rotX = Math.cos(thetaRad) * x - Math.sin(thetaRad) * y;
	var rotY = Math.sin(thetaRad) * x + Math.cos(thetaRad) * y;

	return {
		x: rotX,
		y: rotY
	};
}
export function drawPolygon(ctx,x, y, sides, radius, theta, fillColor, lineWidth, lineColor) {
	ctx.fillStyle = fillColor;
	ctx.lineWidth = lineWidth;
	ctx.strokeStyle = lineColor;

	ctx.beginPath();
	var coords = rotatePoint(0, radius, theta);
	ctx.moveTo(coords.x + x, coords.y + y);
	var oldX = coords.x;
	var oldY = coords.y;
	for (var i = 0; i < sides; i++) {
		coords = rotatePoint(oldX, oldY, 360 / sides);
		ctx.lineTo(coords.x + x, coords.y + y);
		oldX = coords.x;
		oldY = coords.y;
	}

	ctx.closePath();
	ctx.fill();
	ctx.stroke();
	ctx.strokeStyle = 'rgba(0,0,0,0)';
}

export function renderText(ctx,x, y, fontSize, color, text, font) {
	ctx.save();
	if (!font) {
		var font = 'px Exo';
	}

	fontSize *= settings.scale;
	ctx.font = fontSize + font;
	ctx.textAlign = 'center';
	ctx.fillStyle = color;
	ctx.shadowBlur = 15;
	ctx.stroke();
	ctx.fillText(text, x, y + (fontSize / 2) - 9 * settings.scale);
	ctx.restore();
}


class ScoreText{
	 constructor(x,y,text,color){
		this.x = x;
		this.y = y;
		//this.font = font;
		this.color = color;
		this.opacity =1;
		this.text = text;
		this.alive=1;
	}
	draw(ctx){
		if (this.alive>0) {
			
			ctx.save();
            ctx.globalAlpha = this.opacity;
            
            // 设置文字样式
            ctx.fillStyle = this.color;
            ctx.font = "bold 30px Arial"; // 添加 bold 使文字更醒目
            ctx.textAlign = "center";
            
            // 添加阴影效果
            ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            ctx.shadowBlur = 4;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;
            
            // 先绘制描边
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 3;
            ctx.strokeText(this.text, this.x + wx.globalData.gdx, this.y + wx.globalData.gdy);
            
            // 再绘制文字
            ctx.fillText(this.text, this.x + wx.globalData.gdx, this.y + wx.globalData.gdy);
            
			//ctx.globalAlpha =1;
			ctx.restore()
			// 降低透明度
			this.opacity -= 0.5*wx.globalData.mainHex.dt * Math.pow(Math.pow((1-this.opacity), 1/3)+1,3)/100;

			// 设置存活状态（当透明度为0时文本将被移除）
			this.alive = this.opacity;
			
			// 向上移动文本
			this.y -= 3 * wx.globalData.mainHex.dt;
			return true;
		}
		else {
			return false;
		}
	};
}

export {ScoreText as Text};

// 按钮类
class Button {
    constructor(id, x, y, width, height, text, options = {}) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.text = text;
        this.options = {
            backgroundColor: options.backgroundColor || '#4CAF50',
            hoverColor: options.hoverColor || '#45a049',
            textColor: options.textColor || '#FFFFFF',
            fontSize: options.fontSize || 24,
            borderRadius: options.borderRadius || 10,
            shadowBlur: options.shadowBlur || 10,
            shadowColor: options.shadowColor || '#000000',
            isCircle: options.isCircle || false,
            onClick: options.onClick || null
        };
    }

    draw(ctx) {
        ctx.save();
        
        if (this.options.isCircle) {
            // 绘制圆形按钮
            ctx.beginPath();
            ctx.arc(this.x + this.width/2, this.y + this.height/2, this.width/2, 0, Math.PI * 2);
            ctx.fillStyle = this.options.backgroundColor;
            ctx.fill();
        } else {
            // 绘制矩形按钮
            drawRoundRect(
                ctx, 
                this.x, 
                this.y, 
                this.width, 
                this.height, 
                this.options.borderRadius * settings.scale
            );
            
            // 创建渐变
            const gradient = ctx.createLinearGradient(
                this.x,
                this.y,
                this.x + this.width,
                this.y + this.height
            );
            gradient.addColorStop(0, this.options.backgroundColor);
            gradient.addColorStop(1, this.options.hoverColor);
            
            ctx.fillStyle = gradient;
            ctx.fill();
        }

        // 绘制文字
        ctx.font = `bold ${this.options.fontSize * settings.scale}px Arial`;
        ctx.fillStyle = this.options.textColor;
        ctx.shadowColor = this.options.shadowColor;
        ctx.shadowBlur = this.options.shadowBlur * settings.scale;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(
            this.text, 
            this.x + this.width/2, 
            this.y + this.height/2
        );
        
        ctx.restore();
    }

    isClicked(touch) {
        if (this.options.isCircle) {
            const centerX = this.x + this.width/2;
            const centerY = this.y + this.height/2;
            const distance = Math.sqrt(
                Math.pow(touch.clientX - centerX, 2) + 
                Math.pow(touch.clientY - centerY, 2)
            );
            return distance <= this.width/2;
        }
        
        return touch.clientX >= this.x && 
               touch.clientX <= this.x + this.width &&
               touch.clientY >= this.y && 
               touch.clientY <= this.y + this.height;
    }
}

// 按钮管理器
class ButtonManager {
    constructor() {
        this.buttons = new Map();
    }

    addButton(id, x, y, width, height, text, options = {}) {
        const button = new Button(id, x, y, width, height, text, options);
        this.buttons.set(id, button);
        return button;
    }

    removeButton(id) {
        this.buttons.delete(id);
    }

    getButton(id) {
        return this.buttons.get(id);
    }

    drawAll(ctx) {
        this.buttons.forEach(button => button.draw(ctx));
    }

    handleClick(touch) {
        this.buttons.forEach(button => {
            if (button.isClicked(touch) && button.options.onClick) {
                button.options.onClick(touch);
            }
        });
    }

    clear() {
        this.buttons.clear();
    }
}

export { Button, ButtonManager };