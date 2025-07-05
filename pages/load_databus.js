
import Matter from '../libs/matter.min.js';
import GravityGame from './gravity_game.js';

//let instance;

/**
 * 全局状态管理器
 * 负责管理游戏的状态，包括帧数、分数、子弹、敌人和动画等
 */
export default class loadDataBus {
 
  gravityGame = null; // 重力游戏实例

  constructor(canvas) {
    // 确保单例模式
    //if (instance) return instance;

    //instance = this;
	//this.loadGameState();
	this.gravityGame = new GravityGame(canvas);
    this.reset();
  }

  // 重置游戏状态
  reset() {
    
    this.gravityGame.reset();
    
  }

  // 游戏结束
  gameOver() {
    this.isGameOver = true;
	this.saveGameState();
  }


  	saveGameState() {
		if (this.score > this.maxScore) {
			this.maxScore = this.score
		}
		wx.setStorage({
			key: 'plane_state',
			data: {
				maxScore: this.maxScore,
			}
		})
	}

	loadGameState() {
		wx.getStorage({
		key: 'plane_state',
			success: (res) => {
				const { maxScore } = res.data
				if (maxScore!=null && maxScore!=undefined) {
					this.maxScore = maxScore
				}
			}
		})
	}
}
