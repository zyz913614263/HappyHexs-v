import Pool from './base/pool'

let instance

/**
 * 全局状态管理器
 */
export default class DataBus {
  constructor() {
    if (instance)
      return instance

    instance = this

    //this.pool = new Pool()

    this.reset()
  }

  reset() {
    this.frame = 0
    this.score = 0
    this.enemys = []
    this.animations = []
    this.gameOver = false
	this.loadGameState() 
  }

  /**
   * 回收敌人，进入对象池
   * 此后不进入帧循环
   */
  removeEnemey(enemy) {
    let temp = this.enemys.find(item => item === enemy)
    if (temp) {
      this.enemys = this.enemys.filter(item => item !== enemy)
      temp.visible = false
      //this.pool.recover('enemy', enemy)
    }
  }
  saveGameState(score) {
		wx.setStorage({
		key: 'bird_state',
		data: {
			score: score,
		}
		})
	}

	loadGameState() {
		wx.getStorage({
		key: 'bird_state',
		success: (res) => {
			const { score } = res.data
			if (score!=null && score!=undefined) {
				this.score = score
			}
		}
		})
	}
}
