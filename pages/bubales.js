import { settings } from "../settings";

const bubbles = [];
const bubbleCount = 20;
const bubbleRadius = 30;
let level = 1;
let remainingBubbles = bubbleCount;
let isSpecialLevel = false;
let specialBubbleInterval;
let nextLevelStart = false;
let canvas, context;
function Init(c, ctx) {
  canvas = c
  context = ctx;
  level = 1;
  remainingBubbles = bubbleCount;
  isSpecialLevel = false;
  specialBubbleInterval;
  nextLevelStart = false;
  bubbles.length = 0; // 清空泡泡数组
  //bubbleCount = 20;
  //bubbleRadius = 30;
  //console.log('Init',canvas,context);
  console.log('Init',canvas.width,canvas.height);
}

function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function isOverlapping(x, y, radius) {
  for (let bubble of bubbles) {
    const distance = Math.sqrt((x - bubble.x) ** 2 + (y - bubble.y) ** 2);
    if (distance < radius + bubble.radius) {
      return true;
    }
  }
  return false;
}

function touch(e) {
  const touch = e.touches[0];
  popBubble(touch.clientX, touch.clientY);
  drawBubbles();

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
    console.log('返回按钮被点击');
    wx.offTouchStart(touch); // 移除触摸事件监听
    wx.globalData.gameState = 999; // 假设 1 表示返回到主菜单
    
    return;
  }
}

function generateBubbles() {
  const audio = wx.createInnerAudioContext();
  audio.src = 'res/music/start1.mp3';
  audio.play();
  bubbles.length = 0; // 清空泡泡数组
  remainingBubbles = bubbleCount;
  isSpecialLevel = (level % 3 === 0);

  if (isSpecialLevel) {
    specialBubbleInterval = setInterval(() => {
      if (bubbles.length < bubbleCount) {
        const x = Math.random() * (canvas.width/wx.globalData.currentPixelRatio - 2 * bubbleRadius) + bubbleRadius;
        const y = canvas.height/wx.globalData.currentPixelRatio + Math.random() * canvas.height/wx.globalData.currentPixelRatio;
        bubbles.push({
          id: bubbles.length,
          x: x,
          y: y,
          color: getRandomColor(),  // 随机颜色
          alpha: Math.random() * 0.5 + 0.5,  // 随机透明度
          radius: bubbleRadius + Math.random() * 10 - 5,  // 随机半径变化
          popped: false,  // 标记泡泡是否被点击
          fadeOut: false  // 标记泡泡是否开始淡出
        });
      } else {
        clearInterval(specialBubbleInterval);
      }
    }, 500); // 每0.5秒生成一个泡泡
  } else {
    //console.log('generateBubbles',canvas.width,canvas.height,bubbleCount);
    for (let i = 0; i < bubbleCount; i++) {
      let x, y;
      do {
        x = Math.random() * (canvas.width/wx.globalData.currentPixelRatio * 0.75) + bubbleRadius + canvas.width/wx.globalData.currentPixelRatio * 0.1;
        y = Math.random() * (canvas.height/wx.globalData.currentPixelRatio * 0.7) + bubbleRadius + canvas.height/wx.globalData.currentPixelRatio * 0.2;
      } while (isOverlapping(x, y, bubbleRadius));
      bubbles.push({
        id: i,
        x: x,
        y: y,
        color: getRandomColor(),  // 随机颜色
        alpha: Math.random() * 0.5 + 0.5,  // 随机透明度
        radius: bubbleRadius + Math.random() * 10 - 5,  // 随机半径变化
        popped: false,  // 标记泡泡是否被点击
        fadeOut: false  // 标记泡泡是否开始淡出
      });
      //console.log('generateBubbles',i,x,y,bubbles[i].radius);
    }
  }
  wx.onTouchStart(touch);
}

function drawBackground() {
  //console.log('drawBackground');
  //context.clearRect(0, 0, canvas.width, canvas.height);
  const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, 'blue');
  gradient.addColorStop(1, 'white');
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);
}

function drawBubbles() {
  drawBackground();
  //删除透明的为0的泡泡
  bubbles.forEach((bubble, index) => {
    if (bubble.alpha === 0) {
      bubbles.splice(index, 1);
    }
  });
  bubbles.forEach(bubble => {
    context.beginPath();
    context.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
    context.fillStyle = bubble.color;
    context.globalAlpha = bubble.alpha;
    context.fill();
    context.lineWidth = 2;
    context.strokeStyle = 'white';
    context.stroke();
    context.closePath();
    //console.log('drawBubbles',bubble.x, bubble.y,bubble.alpha);
  });
  context.globalAlpha = 1.0;  // 重置透明度
  drawHUD();
  
}

function drawHUD() {
  const x = canvas.width/wx.globalData.currentPixelRatio / 2
  const y = canvas.height/wx.globalData.currentPixelRatio* 0.1;
  //console.log('drawHUD',x,y,wx.globalData.currentPixelRatio);
  //context.scale(wx.globalData.currentPixelRatio, wx.globalData.currentPixelRatio);
  context.font = '25px Arial';
  context.fillStyle = 'white';
  context.textAlign = 'center';
  context.fillText(`第${level}关`, x, y);
  context.fillStyle = 'orange';
  context.fillText(`剩余泡泡数: ${remainingBubbles}`, x, y + 60);

  // 绘制返回按钮
  const btnWidth = 100 * settings.scale;
  const btnHeight = 50 * settings.scale;
  const btnX = 20; // 按钮左上角 X 坐标
  const btnY = 20; // 按钮左上角 Y 坐标

  context.save();
  context.fillStyle = 'rgba(255, 255, 255, 0)'; // 按钮背景颜色
  context.fillRect(btnX, btnY, btnWidth, btnHeight);

  context.font = '20px Arial';
  context.fillStyle = '#bdc3c7'; // 按钮文字颜色
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText('返回', btnX + btnWidth / 2, btnY + btnHeight / 2);
  context.restore();

  // 将按钮位置存储到全局变量，供触摸事件使用
  wx.globalData.returnButton = { x: btnX, y: btnY, width: btnWidth, height: btnHeight };

}

function popBubble(x, y) {
  const bubleColor = 'black';
  let allPopped = true;
  bubbles.forEach(bubble => {
    const distance = Math.sqrt((x - bubble.x) ** 2 + (y - bubble.y) ** 2);
    if (distance < bubble.radius && !bubble.popped) {
      bubble.color = bubleColor;
      bubble.popped = true;
      remainingBubbles--;
      const audio = wx.createInnerAudioContext();
      audio.src = 'res/music/po.mp3';
      audio.play();
      setTimeout(() => {
        bubble.fadeOut = true;
      }, 1000); // 1秒后开始淡出
    }
    if (!bubble.popped) {
      allPopped = false;
    }
  });
}

function animate() {
  
  //console.log('animate',bubbles.length,canvas.width,canvas.height);
  //return
 
  bubbles.forEach(bubble => {
    if (!bubble.popped) {
      if (isSpecialLevel) {
        bubble.y -= 2; // 泡泡从下往上移动
        if (bubble.y + bubble.radius < 0) {
          bubble.popped = true; // 泡泡移出屏幕时标记为已点击
          remainingBubbles--;
        }
      } else {
        bubble.alpha += (Math.random() - 0.5) * 0.1;
        if (bubble.alpha < 0.5) bubble.alpha = 0.5;
        if (bubble.alpha > 1) bubble.alpha = 1;
        bubble.radius += (Math.random() - 0.5) * 2;
        if (bubble.radius < bubbleRadius - 5) bubble.radius = bubbleRadius - 5;
        if (bubble.radius > bubbleRadius + 5) bubble.radius = bubbleRadius + 5;
      }
    } else if (bubble.fadeOut) {
      bubble.alpha -= 0.05; // 每帧减少透明度
      if (bubble.alpha <= 0) {
        bubble.alpha = 0;
        bubble.fadeOut = false; // 停止淡出
      }
    }
  });
  drawBubbles();
  if (nextLevelStart == false && remainingBubbles <= 0) {
    remainingBubbles = 0;
    nextLevelStart = true;
    wx.offTouchStart(touch);
    const audio = wx.createInnerAudioContext();
    audio.src = 'res/music/end.mp3';
    audio.play();
    setTimeout(() => {
      nextLevelStart = false;
      level++;
      generateBubbles();
      drawBubbles();
      console.log('generateBubbles',bubbles.length,level)
    }, 4000); // 3秒后进入下一关
  }
  if (bubbles.length === 0 && level == 1 && nextLevelStart == false) {
    generateBubbles();
    console.log('generateBubbles',bubbles.length,level);
  }
  //requestAnimationFrame(animate);
}

//generateBubbles();
//animate();

export {generateBubbles,animate,Init}