import './bird/libs/weapp-adapter'
import Player from './bird/player/index'
import Enemy from './bird/npc/enemy'
import BackGround from './bird/runtime/background'
import GameInfo from './bird/runtime/gameinfo'
import DataBus from './bird/databus'
import Enemy2 from './bird/npc/enemy2'

let databus = new DataBus()
let game = null

/**
 * 游戏主函数
 */
export default class Main {
  constructor(canvas1,ctx1) {
    this.canvas = canvas1
    this.ctx = ctx1
    this.restart()
  }
  

  restart() {
    databus.reset()
    this.bg = new BackGround(this.ctx)
    this.player = new Player(this.ctx)
    this.gameinfo = new GameInfo()
  }

  /**
   * 随着帧数变化的敌机生成逻辑
   * 帧数取模定义成生成的频率
   */
  enemyGenerate() {
    if (databus.frame % 120 === 0) {
		this.player.score += 10
		console.log('enemyGenerate')
		let enemy = new Enemy()
      	enemy.init(2)
      	databus.enemys.push(enemy)
		enemy = new Enemy2()
      	enemy.init(2)
      	databus.enemys.push(enemy)
    }
  }

  // 全局碰撞检测
  collisionDetection() {
    for (let i = 0, il = databus.enemys.length; i < il; i++) {
      let enemy = databus.enemys[i]

      if (this.player.isCollideWith(enemy)) {
        this.player.GameOver()

        break
      }
    }
  }

  /**
   * canvas重绘函数
   * 每一帧重新绘制所有的需要展示的元素
   */
  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    this.bg.render(this.ctx)
    databus.enemys.forEach((item) => {
      item.drawToCanvas(this.ctx)
    })

    this.player.draw(this.ctx)

    /*databus.animations.forEach((ani) => {
      if (ani.isPlaying) {
        ani.aniRender(ctx)
      }
    })*/

    this.gameinfo.renderGameScore(this.ctx, databus.score,this.player.score)
  }

  // 游戏逻辑更新主函数
  update() {
    databus.frame++
    this.bg.update()
    databus.enemys.forEach((item) => {
      item.update()
    })
    this.player.update()
    this.enemyGenerate()
    this.collisionDetection()
  }

 
}

export function InitLoad(canvas,ctx) {
    game = new Main(canvas,ctx)
    //load.restart()
    //return load
}
 // 实现游戏帧循环
export function animateLoad() {
    if (databus.gameOver) {
      return
    }
    game.update()
    game.render()
  }
//InitLoad,animateLoad