class Settings{
	constructor(){
		this.scale = 1,         // 缩放比例
		this.prevScale = 1,      // 上一次缩放比例  
		this.colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'],
		this.os = "other",
		this.platform = "mobile",
		this.startDist = 227,
		this.creationDt = 60, //砖块初始化时长
		this.baseScale = 1.4,
		this.baseHexWidth = 87,
		this.hexWidth = 87,
		this.baseBlockHeight = 15,
		this.blockHeight = this.baseBlockHeight,
		this.rows = 10,
		this.speedModifier = 0.73,
		this.creationSpeedModifier = 0.73,
		this.gameOverLength = 9,
		this.basecomboTime = 600,
		this.comboTime = this.basecomboTime
	}
};
export const settings = new Settings();
export const colors = settings.colors;
