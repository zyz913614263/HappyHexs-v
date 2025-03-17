const tt = wx
// 存储键名常量
const STORAGE_KEYS = {
    HIGH_SCORE: 'tetris_high_score',
    LAST_SCORE: 'tetris_last_score',
    TOTAL_GAMES: 'tetris_total_games'
};

// 保存最高分
export function saveHighScore(score) {
    try {
       
        wx.setStorageSync(STORAGE_KEYS.HIGH_SCORE, score);
        console.log('新的最高分已保存:', score);
        return true;
    } catch (error) {
        console.error('保存最高分失败:', error);
        return false;
    }
}

// 获取最高分
export function getHighScore() {
    try {
        const highScore = wx.getStorageSync(STORAGE_KEYS.HIGH_SCORE);
        return highScore || 0;  // 如果没有记录，返回0
    } catch (error) {
        console.error('获取最高分失败:', error);
        return 0;
    }
}

// 清除所有游戏数据
export function clearAllData() {
    try {
        Object.values(STORAGE_KEYS).forEach(key => {
            wx.removeStorageSync(key);
        });
        console.log('所有游戏数据已清除');
        return true;
    } catch (error) {
        console.error('清除游戏数据失败:', error);
        return false;
    }
}