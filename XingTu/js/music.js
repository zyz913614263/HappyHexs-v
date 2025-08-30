import { gameConfig } from './config.js';

class Music {
    constructor() {
        // 单例模式逻辑
        if (Music.instance) {
            return Music.instance;
        }

        this.currIsMute = false;
        this.isInitialized = false;
        Music.instance = this;

        // 延迟初始化，等待Laya引擎准备就绪
        this.initWhenReady();
    }

    /**
     * 等待Laya引擎初始化完成后进行音频初始化
     */
    initWhenReady() {
        if (this.isLayaReady()) {
            this.initAudio();
        } else {
            // 延迟检查，避免阻塞主线程
            setTimeout(() => {
                this.initWhenReady();
            }, 100);
        }
    }

    /**
     * 检查Laya引擎是否已初始化
     */
    isLayaReady() {
        return !!(Laya && Laya.SoundManager && Laya.loader);
    }

    /**
     * 初始化音频设置
     */
    initAudio() {
        if (this.isInitialized) return;

        try {
            // 初始化音量和音乐音量
            Laya.SoundManager.setSoundVolume(1);
            Laya.SoundManager.setMusicVolume(1);
            this.isInitialized = true;
            console.log('音频系统初始化完成');
        } catch (error) {
            console.error('音频系统初始化失败:', error);
        }
    }

    /**
     * 切换音效和音乐静音状态
     */
    tmp3leMute() {
        if (!this.isLayaReady()) return false;

        try {
            Laya.SoundManager.musicMuted = !Laya.SoundManager.musicMuted;
            Laya.SoundManager.soundMuted = !Laya.SoundManager.soundMuted;
            return Laya.SoundManager.musicMuted;
        } catch (error) {
            console.error('切换静音状态失败:', error);
            return false;
        }
    }

    /**
     * 音乐和音效静音
     */
    mute() {
        if (!this.isLayaReady()) return;

        try {
            Laya.SoundManager.musicMuted = true;
            Laya.SoundManager.soundMuted = true;
            this.currIsMute = true;
        } catch (error) {
            console.error('设置静音失败:', error);
        }
    }

    /**
     * 取消静音
     */
    noMute() {
        if (!this.isLayaReady()) return;

        try {
            Laya.SoundManager.musicMuted = false;
            Laya.SoundManager.soundMuted = false;
            this.currIsMute = false;
        } catch (error) {
            console.error('取消静音失败:', error);
        }
    }

    /**
     * 播放背景音乐（开始）
     */
    playBg() {
        if (!this.isLayaReady()) {
            console.warn('Laya引擎未初始化，延迟播放背景音乐');
            setTimeout(() => this.playBg(), 200);
            return;
        }

        try {
            const audioUrl = gameConfig.PREFIX_URL + 'music/start-32.mp3';
            console.log('播放开始音乐:', audioUrl);

            Laya.SoundManager.playMusic(audioUrl, 0);
        } catch (error) {
            console.error('播放开始音乐失败:', error);
        }
    }

    /**
     * 播放背景音乐（游戏进行中）
     */
    playStart() {
        if (!this.isLayaReady()) {
            console.warn('Laya引擎未初始化，延迟播放游戏音乐');
            setTimeout(() => this.playStart(), 200);
            return;
        }

        try {
            // 销毁开始音乐，释放内存
            const startMusicUrl = gameConfig.PREFIX_URL + 'music/start-32.mp3';
            Laya.SoundManager.destroySound(startMusicUrl);

            // 播放游戏背景音乐
            const gameMusicUrl = gameConfig.PREFIX_URL + 'music/bg1.mp3';
            console.log('播放游戏音乐:', gameMusicUrl);

            Laya.SoundManager.playMusic(gameMusicUrl, 0);

            // 触发垃圾回收（微信小游戏）
            if (wx && wx.triggerGC) {
                wx.triggerGC();
            }
        } catch (error) {
            console.error('播放游戏音乐失败:', error);
        }
    }

    /**
     * 安全的音效播放方法
     */
    safePlaySound(url, loops = 1) {
        if (!this.isLayaReady()) {
            console.warn('Laya引擎未初始化，无法播放音效');
            return null;
        }

        try {
            const audioUrl = gameConfig.PREFIX_URL + url;
            return Laya.SoundManager.playSound(audioUrl, loops);
        } catch (error) {
            console.error('播放音效失败:', error);
            return null;
        }
    }

    /**
     * 播放成功音效
     */
    playSuccess() {
        this.safePlaySound('music/jump-32.mp3', 1);
    }

    /**
     * 播放能量音效
     */
    playEnergy() {
        this.safePlaySound('music/energy.mp3', 1);
    }

    /**
     * 播放连击音效
     */
    playCombo() {
        this.safePlaySound('music/combo-32.mp3', 1);
    }

    /**
     * 播放爆炸音效
     */
    playDead2() {
        this.safePlaySound('music/dead-32.mp3', 1);
    }

    /**
     * 播放按钮音效
     */
    playBtn() {
        this.safePlaySound('music/btn.mp3', 1);
    }

    playBtn1() {
        this.safePlaySound('music/btn.mp3', 0);
    }

    /**
     * 播放飞行音效
     */
    playFly() {
        this.safePlaySound('music/fly.mp3', 1);
    }

    /**
     * 播放死亡音效
     */
    playDead() {
        this.safePlaySound('music/dead-32.mp3', 1);
    }

    /**
     * 播放羁绊音效
     */
    playBond() {
        this.safePlaySound('music/dead-32.mp3', 1);
    }

    /**
     * 播放好友音效
     */
    playFriend() {
        this.safePlaySound('music/friend.mp3', 1);
    }

    /**
     * 播放时间音效
     */
    playTime() {
        this.safePlaySound('music/time1.mp3', 1);
    }

    /**
     * 播放结果音效
     */
    playResult() {
        this.safePlaySound('music/score1.mp3', 1);
    }

    /**
     * 播放转场音效（进入）
     */
    playZhuan() {
        this.safePlaySound('music/in1.mp3', 1);
    }

    /**
     * 播放转场音效（退出）
     */
    playZhuan1() {
        this.safePlaySound('music/out1.mp3', 1);
    }
}

// 创建单例实例
const musicInstance = new Music();

export default musicInstance;