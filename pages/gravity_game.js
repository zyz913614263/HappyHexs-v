import Matter from '../libs/matter.min.js';
import {audioManager} from '../entry/music.js';

export default class PinballGame {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    const windowInfo = wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync();

    this.width = windowInfo.windowWidth;
    this.height = windowInfo.windowHeight;
    canvas.width = this.width;
    canvas.height = this.height;
    
    // 初始化物理引擎
    this.engine = Matter.Engine.create();
    this.world = this.engine.world;
    this.engine.world.gravity.y = 0.5; // 减小重力
    
    // 游戏状态
    this.score = 0;
    this.balls = [];
    this.flippers = [];
    this.obstacles = [];
    this.bumpers = [];
    this.maxBalls = 300;
    this.ballsRemaining = this.maxBalls;
    
    // 弹板状态
    this.leftFlipperUp = false;
    this.rightFlipperUp = false;
    
    // 发射器状态
    this.plunger = null;
    this.plungerPower = 0;
    this.isCharging = false;
    this.maxPower = 15;

    this.createGameElements();
    this.setupCollisions();
    this.bindEvents();
    this.gameLoop();
  }

  createGameElements() {
    this.createWalls();
    this.createBumpers();
    this.createFlippers();
    this.createPlunger();
  }

  createWalls() {
    const wallThickness = 10;
    const walls = [
      // 左边界
      Matter.Bodies.rectangle(
        wallThickness/2, 
        this.height/2, 
        wallThickness, 
        this.height, 
        { isStatic: true }
      ),
      // 右边界
      Matter.Bodies.rectangle(
        this.width - wallThickness/2, 
        this.height/2, 
        wallThickness, 
        this.height, 
        { isStatic: true }
      ),
      // 顶部
      Matter.Bodies.rectangle(
        this.width/2, 
        wallThickness/2, 
        this.width, 
        wallThickness, 
        { isStatic: true }
      )
    ];
    
    Matter.World.add(this.world, walls);
  }

  createBumpers() {// 障碍物
    const bumperRadius = 20;
    const bumperPositions = [
      { x: this.width * 0.3, y: this.height * 0.3 },
      { x: this.width * 0.7, y: this.height * 0.3 },
      { x: this.width * 0.5, y: this.height * 0.2 },
      { x: this.width * 0.4, y: this.height * 0.5 },
      { x: this.width * 0.6, y: this.height * 0.5 }
    ];

    bumperPositions.forEach(pos => {
      const bumper = Matter.Bodies.circle(pos.x, pos.y, bumperRadius, {
        isStatic: true,
        render: { fillStyle: '#FF4081' },
        restitution: 1.5,// 弹性
        label: 'bumper'
      });
      this.bumpers.push(bumper);
    });

    Matter.World.add(this.world, this.bumpers);
  }

  createFlippers() {
    // 弹板尺寸根据屏幕宽度调整
    const flipperLength = this.width * 0.23;
    const flipperThickness = this.width * 0.04; // 屏幕宽度的2%
    const flipperGap = this.width * 0.15; // 屏幕宽度的15%
    const flipperY = this.height * 0.8;
    
    // 左弹板
    const leftFlipper = Matter.Bodies.rectangle(
      this.width/2 - flipperGap,
      flipperY,
      flipperLength,
      flipperThickness,
      {
        density: 0.1,
        label: 'leftFlipper',
        angle: Math.PI * 0.15,
        render: { fillStyle: '#4CAF50' }
      }
    );

    // 弹板支点
    const leftPivot = Matter.Bodies.circle(
      this.width/2 - flipperGap - flipperLength/2,
      flipperY,
      flipperThickness/2,
      { 
        isStatic: true,
        render: { fillStyle: '#666' }
      }
    );

    // 创建约束
    const leftConstraint = Matter.Constraint.create({
      bodyA: leftFlipper,
      pointA: { x: -flipperLength/2, y: 0 },
      bodyB: leftPivot,
      pointB: { x: 0, y: 0 },
      stiffness: 1,
      length: 0
    });

    this.flippers = [leftFlipper];
    Matter.World.add(this.world, [
      leftFlipper,
      leftPivot,
      leftConstraint
    ]);
  }

  createPlunger() {// 发射器
    const plungerWidth = 30;
    const plungerHeight = 60;
    const plungerX = this.width - 40;
    const plungerY = this.height - plungerHeight/2 - 40;

    this.plunger = Matter.Bodies.rectangle(
      plungerX,
      plungerY,
      plungerWidth,
      plungerHeight,
      {
        isStatic: true,
        render: { fillStyle: '#4CAF50' }
      }
    );

    this.plungerPos = { x: plungerX, y: plungerY - plungerHeight/2 };
    Matter.World.add(this.world, this.plunger);
  }

  launchBall() {
    if (this.ballsRemaining <= 0) return;
    
    const ballRadius = 10;
    const ball = Matter.Bodies.circle(
      this.plungerPos.x,
      this.plungerPos.y,
      ballRadius,
      {
        restitution: 0.5,
        friction: 0.05,
        density: 0.002,
        render: { fillStyle: '#2196F3' }
      }
    );

    const velocity = {
      x: -3,
      y: -this.plungerPower * 2
    };

    Matter.Body.setVelocity(ball, velocity);
    Matter.World.add(this.world, ball);
    this.balls.push(ball);
    this.ballsRemaining--;

	audioManager.move2();
  }

  setupCollisions() {
    Matter.Events.on(this.engine, 'collisionStart', (event) => {
      event.pairs.forEach((pair) => {
        const bodyA = pair.bodyA;
        const bodyB = pair.bodyB;
        
        if (bodyA.label === 'bumper' || bodyB.label === 'bumper') {
          this.score += 100;
          // 播放撞击音效
          audioManager.good();
        }
      });
    });
  }

  bindEvents() {
    wx.onTouchStart((e) => {
      const touch = e.touches[0];
      const x = touch.clientX;
      
      if (x < this.width/2) {
        this.leftFlipperUp = true;
        Matter.Body.setAngularVelocity(this.flippers[0], 0.5);
      }/* else {
        this.rightFlipperUp = true;
        Matter.Body.setAngularVelocity(this.flippers[1], 0.5);
      }*/

      if (x > this.width * 0.8) {
        this.isCharging = true;
      }
    });

    wx.onTouchEnd((e) => {
      /*if (this.leftFlipperUp) {
        this.leftFlipperUp = false;
        Matter.Body.setAngularVelocity(this.flippers[0], 0.5);
      }*/
      /*if (this.rightFlipperUp) {
        this.rightFlipperUp = false;
        Matter.Body.setAngularVelocity(this.flippers[1], -0.5);
      }*/

      if (this.isCharging) {
        this.isCharging = false;
        this.launchBall();
        this.plungerPower = 0;
      }
    });
  }

  update() {
    Matter.Engine.update(this.engine);

    // 更新发射器力量
    if (this.isCharging && this.plungerPower < this.maxPower) {
      this.plungerPower += 0.5;
    }

    // 检查球是否掉出界外
    this.balls = this.balls.filter(ball => {
      if (ball.position.y > this.height + 50) {
        Matter.World.remove(this.world, ball);
        return false;
      }
      return true;
    });
  }

  render() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.fillStyle = '#FFF';
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    // 绘制所有物理物体
    const bodies = Matter.Composite.allBodies(this.world);
    bodies.forEach(body => {
      this.ctx.fillStyle = body.render.fillStyle || '#666';
      this.ctx.beginPath();
      
      const vertices = body.vertices;
      this.ctx.moveTo(vertices[0].x, vertices[0].y);
      for (let j = 1; j < vertices.length; j++) {
        this.ctx.lineTo(vertices[j].x, vertices[j].y);
      }
      
      this.ctx.closePath();
      this.ctx.fill();
      
      // 为圆形物体（球和弹力球）添加边框
      if (body.label === 'Circle Body' || body.label === 'bumper') {
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
      }
    });
    
    // 绘制分数
    this.ctx.fillStyle = '#000';
    this.ctx.font = '24px Arial';
    this.ctx.fillText(`分数: ${this.score}`, 20, 40);
    this.ctx.fillText(`剩余球数: ${this.ballsRemaining}`, 20, 70);

    // 绘制蓄力条
    if (this.isCharging) {
      const powerBarHeight = 100;
      const powerBarWidth = 10;
      const powerPercentage = this.plungerPower / this.maxPower;
      
      this.ctx.fillStyle = '#666';
      this.ctx.fillRect(
        this.width - 60,
        this.height - powerBarHeight - 40,
        powerBarWidth,
        powerBarHeight
      );
      
      this.ctx.fillStyle = '#4CAF50';
      this.ctx.fillRect(
        this.width - 60,
        this.height - 40 - (powerBarHeight * powerPercentage),
        powerBarWidth,
        powerBarHeight * powerPercentage
      );
    }
  }

  gameLoop() {
    this.update();
    this.render();
    //requestAnimationFrame(() => this.gameLoop());
  }

  reset() {
    // 清除所有球
    this.balls.forEach(ball => {
      Matter.World.remove(this.world, ball);
    });
    this.balls = [];
    
    // 重置游戏状态
    this.score = 0;
    this.ballsRemaining = this.maxBalls;
    this.plungerPower = 0;
    this.isCharging = false;
  }
} 