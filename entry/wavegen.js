// 波形生成器 用于砖块的生成
import { settings} from '../settings.js';
import { randInt,rotatePoint } from '../comon.js';
import Block from './Block.js';

function blockDestroyed() {
	if (waveone.nextGen > 1350) {
		waveone.nextGen -= 30 * settings.creationSpeedModifier;
	} else if (waveone.nextGen > 600) {
		waveone.nextGen -= 8 * settings.creationSpeedModifier;
	} else {
		waveone.nextGen = 600;
	}

	if (waveone.difficulty < 35) {
		waveone.difficulty += 0.085 * settings.speedModifier;
	} else {
		waveone.difficulty = 35;
	}
}

class blockGen {
	constructor(hex) {
		this.lastGen = 0;
		this.last = 0;
		this.nextGen = 2700;
		this.start = 0;
		this.colors = settings.colors;
		this.ct = 0;
		this.hex = hex;
		this.difficulty = 1;
		this.dt = 0;
		this.update = function() {
			//console.log("waveGen update");
			this.currentFunction();
			this.dt =  14  * this.hex.ct;
			this.computeDifficulty();
			if ((this.dt - this.lastGen) * settings.creationSpeedModifier > this.nextGen) {
				if (this.nextGen > 600) {
					this.nextGen -= 11 * ((this.nextGen / 1300)) * settings.creationSpeedModifier;
				}
			}
		}
	}

	randomGeneration() {
		if (this.dt - this.lastGen > this.nextGen) {
			this.ct++;
			this.lastGen = this.dt;
			var fv = randInt(0, this.hex.sides);
			addNewBlock(this.hex,fv, this.colors[randInt(0, settings.colors.length)], 1.6 + (this.difficulty / 15) * 3);
			var lim = 5;
			if (this.ct > lim) {
				var nextPattern = randInt(0, 3 + 21);
				if (nextPattern > 15) {
					this.ct = 0;
					this.currentFunction = this.doubleGeneration;
				} else if (nextPattern > 10) {
					this.ct = 0;
					this.currentFunction = this.crosswiseGeneration;
				} else if (nextPattern > 7) {
					this.ct = 0;
					this.currentFunction = this.spiralGeneration;
				} else if (nextPattern > 4) {
					this.ct = 0;
					this.currentFunction = this.circleGeneration;
				} else if (nextPattern > 1) {
					this.ct = 0;
					this.currentFunction = this.halfCircleGeneration;
				}
			}
		}
	};

	computeDifficulty() {
		if (this.difficulty < 35) {
			var increment;
			if (this.difficulty < 8) {
				 increment = (this.dt - this.last) / (5166667) * settings.speedModifier;
			} else if (this.difficulty < 15) {
				increment = (this.dt - this.last) / (72333333) * settings.speedModifier;
			} else {
				increment = (this.dt - this.last) / (90000000) * settings.speedModifier;
			}

			this.difficulty += increment * (1/2);
		}
	};

	circleGeneration() {
		if (this.dt - this.lastGen > this.nextGen + 500) {
			var numColors = randInt(1, 4);
			if (numColors == 3) {
				numColors = randInt(1, 4);
			}

			var colorList = [];
			nextLoop: for (var i = 0; i < numColors; i++) {
				var q = randInt(0, settings.colors.length);
				for (var j in colorList) {
					if (colorList[j] == settings.colors[q]) {
						i--;
						continue nextLoop;
					}
				}
				colorList.push(settings.colors[q]);
			}

			for (var i = 0; i < this.hex.sides; i++) {
				addNewBlock(this.hex,i, colorList[i % numColors], 1.5 + (this.difficulty / 15) * 3);
			}

			this.ct += 15;
			this.lastGen = this.dt;
			this.shouldChangePattern(1);
		}
	};

	halfCircleGeneration() {
		if (this.dt - this.lastGen > (this.nextGen + 500) / 2) {
			var numColors = randInt(1, 3);
			var c = settings.colors[randInt(0, settings.colors.length)];
			var colorList = [c, c, c];
			if (numColors == 2) {
				colorList = [c, settings.colors[randInt(0, settings.colors.length)], c];
			}

			var d = randInt(0, 6);
			for (var i = 0; i < 3; i++) {
				addNewBlock(this.hex,(d + i) % 6, colorList[i], 1.5 + (this.difficulty / 15) * 3);
			}

			this.ct += 8;
			this.lastGen = this.dt;
			this.shouldChangePattern();
		}
	};

	crosswiseGeneration() {
		if (this.dt - this.lastGen > this.nextGen) {
			var ri = randInt(0, settings.colors.length);
			var i = randInt(0, settings.colors.length);
			addNewBlock(this.hex,i, settings.colors[ri], 0.6 + (this.difficulty / 15) * 3);
			addNewBlock(this.hex,(i + 3) % this.hex.sides, settings.colors[ri], 0.6 + (this.difficulty / 15) * 3);
			this.ct += 1.5;
			this.lastGen = this.dt;
			this.shouldChangePattern();
		}
	};

	spiralGeneration() {
		var dir = randInt(0, 2);
		if (this.dt - this.lastGen > this.nextGen * (2 / 3)) {
			if (dir) {
				addNewBlock(this.hex,5 - (this.ct % this.hex.sides), settings.colors[randInt(0, settings.colors.length)], 1.5 + (this.difficulty / 15) * (3 / 2));
			} else {
				addNewBlock(this.hex,this.ct % this.hex.sides, settings.colors[randInt(0, settings.colors.length)], 1.5 + (this.difficulty / 15) * (3 / 2));
			}
			this.ct += 1;
			this.lastGen = this.dt;
			this.shouldChangePattern();
		}
	};

	doubleGeneration() {
		if (this.dt - this.lastGen > this.nextGen) {
			var i = randInt(0, 	settings.colors.length);
			addNewBlock(this.hex,i, settings.colors[randInt(0, settings.colors.length)], 1.5 + (this.difficulty / 15) * 3);
			addNewBlock(this.hex,(i + 1) % this.hex.sides, settings.colors[randInt(0, settings.colors.length)], 1.5 + (this.difficulty / 15) * 3);
			this.ct += 2;
			this.lastGen = this.dt;
			this.shouldChangePattern();
		}
	};

	setRandom(){
		this.ct = 0;
		this.currentFunction = this.randomGeneration;
	};

	shouldChangePattern(x) {
		if (x) {
			var q = randInt(0, 4);
			this.ct = 0;
			switch (q) {
				case 0:
					this.currentFunction = this.doubleGeneration;
					break;
				case 1:
					this.currentFunction = this.spiralGeneration;
					break;
				case 2:
					this.currentFunction = this.crosswiseGeneration;
					break;
			}
		} else if (this.ct > 8) {
			if (randInt(0, 2) === 0) {
				this.setRandom();
				return 1;
			}
		}

		return 0;
	};
	blockDestroyed() {
		if (this.nextGen > 1350) {
			this.nextGen -= 30 * settings.creationSpeedModifier;
		} else if (this.nextGen > 600) {
			this.nextGen -= 8 * settings.creationSpeedModifier;
		} else {
			this.nextGen = 600;
		}
	
		if (this.difficulty < 35) {
			this.difficulty += 0.085 * settings.speedModifier;
		} else {
			this.difficulty = 35;
		}
	}

	// rest of generation functions

	currentFunction = this.randomGeneration;
}

function addNewBlock(MainHex,blocklane, color, iter, distFromHex, settled) { //last two are optional parameters
    //console.log("addNewBlock",MainHex,blocklane,color,iter,distFromHex,settled);
	// 调整块的速度，乘以速度修正系数
    iter *= settings.speedModifier;
	//TODO test
	//color = '#FF0000';
    // 创建一个新的块对象，并将其添加到块数组中
    wx.globalData.blocks.push(new Block(MainHex,blocklane, color, iter, distFromHex, settled));
}
export default blockGen;