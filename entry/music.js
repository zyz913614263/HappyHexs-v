const tt = wx
class AudioManager {
    constructor() {
        // 检查音频API
        if (!wx.createInnerAudioContext) {
            console.warn('当前环境不支持音频API');
            return;
        }
		 // 音频实例缓存
		this.audioInstances = {};
        // 为每种音效创建独立的音频上下文
        
		this.moveTimer = null;
		this.combotimer = null;

        // 创建背景音乐上下文
        this.bgmContext = null;

        // 默认开启音乐
        wx.globalData.musicEnabled = false;

        // 标记是否已经播放过开始音乐
        this.hasPlayedStart = false;
		this.goodTimer = null;
		this.greatTimer = null;
		this.unbleaveableTimer = null;

        this.audioContexts = null
    }

	    // 延迟初始化音频
	initAudioWithDelay() {
		if (wx.globalData.musicEnabled){
			this.playBGM();
			console.log('initAudioWithDelay 播放背景音乐');
			return	
		}
		setTimeout(() => {
			wx.globalData.musicEnabled = true;
			wx.getFileSystemManager('background.mp3')

			this.bgmContext = this.createAudioContext('res/music/background.mp3', true);
			if(!wx.globalData.musicEnabled){
				console.log('加载失败，正在重试');
				
				return
			}
			
			
			
			
			this.audioContexts = {
				start: this.createAudioContext('res/music/start.mp3'),
				clear: this.createAudioContext('res/music/teris.mp3'),
				fall: this.createAudioContext('res/music/teris.mp3'),
				gameover: this.createAudioContext('res/music/newcord.mp3'),
				rotate: this.createAudioContext('res/music/teris.mp3'),
				combotime: this.createAudioContext('res/music/time.mp3',true),
				move: this.createAudioContext('res/music/move.mp3'),
				good: this.createAudioContext('res/music/good.mp3'),
				great: this.createAudioContext('res/music/great.mp3'),
				unbleaveable: this.createAudioContext('res/music/unbleaveable.mp3'),
				move2: this.createAudioContext('res/music/teris.mp3'),
				gameover2: this.createAudioContext('res/music/teris.mp3'),
				start2: this.createAudioContext('res/music/teris.mp3'),
	
				//perfect: this.createAudioContext('./music/perfect.mp3'),
			};
			this.initAudioWithDelay();
		}, 200);
	}

    // 创建音频上下文的辅助方法
    createAudioContext(src, loop = false) {
        const audio = wx.createInnerAudioContext();
        audio.src = src;
        audio.loop = loop;
        return audio;
    }

    // 播放背景音乐
    playBGM() {
        if (!wx.globalData.musicEnabled) return;
		this.setVolume('bgm', 0.35); 
        this.bgmContext.play();
    }

    // 停止背景音乐
    stopBGM() {
        this.bgmContext.stop();
    }

    // 播放指定片段
    playSegment(type, startTime, duration) {
        if (!wx.globalData.musicEnabled) return;
        
        const context = this.audioContexts[type];
        if (!context) return;

        context.stop();
        context.seek(startTime);
        context.play();
        
        return setTimeout(() => {
            context.stop();
        }, duration * 1000);
    }

    // 游戏开始音效
    start() {
        this.playSegment('start', 0, 2.5);
    }

	// 游戏开始音效
    start2() {
        this.playSegment('start2', 3.7202, 3.6224);
    }

    // 清除音效
    clear() {
        this.playSegment('clear', 0, 0.7675);
    }

    // 下落音效
    fall() {
        this.playSegment('fall', 1.2558, 0.3546);
    }

	 // 下落音效
	move2() {
        this.playSegment('move2',2.9088, 0.1437);
    }

	rotate() {
        this.playSegment('rotate', 2.2471, 0.0807);
    }

	gameover2() {
        this.playSegment('gameover2',  8.1276, 1.1437);
    }

    // 游戏结束音效
    gameover() {
        this.playSegment('gameover', 0, 1.2);
        //this.stopBGM();  // 游戏结束时停止背景音乐
    }
	// 组合时间音效
	combotime(t) {
		//this.setVolume('combotime', 0.5)
		if (this.combotimer) {
            clearTimeout(this.combotimer);
            this.combotimer = null;
        }
        this.combotimer = this.playSegment('combotime', 0, t);
    }
    // 移动音效
    move() {
		// 清除之前的定时器（如果存在）
        if (this.moveTimer) {
            clearTimeout(this.moveTimer);
            this.moveTimer = null;
        }
		this.setVolume('move', 0.5)

        this.moveTimer = this.playSegment('move', 0, 0.2);
    }

	good() {
		// 清除之前的定时器（如果存在）
        if (this.goodTimer) {
            clearTimeout(this.goodTimer);
            this.goodTimer = null;
        }
        this.setVolume('good', 0.5);

        this.goodTimer = this.playSegment('good', 0, 1);
	}
	great() {
		// 清除之前的定时器（如果存在）
        if (this.greatTimer) {
            clearTimeout(this.greatTimer);
            this.greatTimer = null;
        }
        this.setVolume('great', 0.5);

        this.greatTimer = this.playSegment('great', 0, 1.5);
	}
	unbleaveable() {
		// 清除之前的定时器（如果存在）
        if (this.unbleaveableTimer) {
            clearTimeout(this.unbleaveableTimer);
            this.unbleaveableTimer = null;
        }
        this.setVolume('unbleaveable', 0.5);

        this.unbleaveableTimer = this.playSegment('unbleaveable', 0, 1.6);
	}
    // 重置开始音乐状态
    resetStart() {
        this.hasPlayedStart = false;
    }

    // 设置音乐开关
    setEnabled(enabled) {
        wx.globalData.musicEnabled = enabled;
        if (!enabled) {
            // 停止所有音频
            Object.values(this.audioContexts).forEach(context => {
                context.stop();
            });
            this.stopBGM();  // 停止背景音乐
        } else {
            // 如果游戏正在进行，重新开始播放背景音乐
            if (wx.globalData.gameState === 1) {
                this.playBGM();
            }
        }
    }
	 // 设置指定音效的音量
	setVolume(type, volume) {
        if (type === 'bgm') {
            this.bgmContext.volume = Math.max(0, Math.min(1, volume));
        } else if (this.audioContexts[type]) {
            this.audioContexts[type].volume = Math.max(0, Math.min(1, volume));
        }
    }
    // 获取音乐开关状态
    isEnabled() {
        return wx.globalData.musicEnabled;
    }
}
/**
 * @type {AudioManager}
 */
// 创建单例实例
export const audioManager = new AudioManager();
export const hasAudio = true;