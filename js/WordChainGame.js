import sound from './sound.js';

class WordChainGame {
    constructor() {
        this.words = [];
        this.usedWords = [];
        this.currentWord = 'dog';
        this.score = 0;
        this.timer = null;
        this.timeLeft = 25;
        this.totalTimeLeft = 120;
        this.totalTimer = null;
        this.isGameStarted = false;
        this.isPaused = false;
        
        // 初始化事件处理函数
        this.submitHandler = this.submitHandler.bind(this);
        this.hintHandler = this.hintHandler.bind(this);
        this.startHandler = this.startHandler.bind(this);
        this.pauseHandler = this.pauseHandler.bind(this);
        this.exitHandler = this.exitHandler.bind(this);
        this.keyboardHandler = this.keyboardHandler.bind(this);
        
        // 确保DOM加载完成后再初始化
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.initializeElements();
                this.bindEvents();
                this.loadWordsFromAPI();
            });
        } else {
            this.initializeElements();
            this.bindEvents();
            this.loadWordsFromAPI();
        }
    }
    
    async loadWordsFromAPI() {
        try {
            // 首先尝试从localStorage加载缓存的词库
            const cachedWords = localStorage.getItem('wordChainGameWords');
            if (cachedWords) {
                this.words = JSON.parse(cachedWords);
                this.showMessage(`从缓存加载词库成功！共加载 ${this.words.length} 个单词`, 'correct');
                return;
            }

            // 如果没有缓存，直接使用本地词库
            await this.loadBackupWordList();

            // 不再默认尝试更新在线词库，避免在中国境内访问受限
            // 用户可以手动触发更新在线词库的功能（如果需要添加此功能）
        } catch (error) {
            console.error('加载词库失败:', error);
            this.showMessage('词库加载失败，请刷新页面重试', 'incorrect');
        }
    }

    // 移除在线更新词库的功能，完全依赖本地词库
    // 如果需要扩充词库，可以直接修改words.js文件
    async updateOnlineWords() {
        // 此功能已禁用，以提高在中国境内的访问性能
        console.log('在线词库更新功能已禁用，使用本地词库');
        return;
    }
    
    async loadBackupWordList() {
        try {
            const response = await import('./words.js');
            this.words = response.default;
            this.showMessage('已加载备用词库', 'correct');
        } catch (error) {
            console.error('加载备用词库失败:', error);
            this.showMessage('词库加载失败，请刷新页面重试', 'incorrect');
        }
    }

    initializeElements() {
        this.wordInput = document.getElementById('word-input');
        this.submitBtn = document.getElementById('submit-btn');
        this.hintBtn = document.getElementById('hint-btn');
        this.startBtn = document.getElementById('start-btn');
        this.pauseBtn = document.getElementById('pause-btn');
        this.exitBtn = document.getElementById('exit-btn');
        this.isGameStarted = false;
        this.isPaused = false;
        this.currentWordDisplay = document.getElementById('current-word');
        this.scoreDisplay = document.getElementById('score');
        this.messageDisplay = document.getElementById('message');
        this.wordsList = document.getElementById('correct-words-list');
        this.animation = document.getElementById('animation');
        this.timerDisplay = document.getElementById('timer');
        this.totalTimerDisplay = document.getElementById('total-timer');
        
        // 初始状态下禁用输入框和提交按钮，直到游戏开始
        this.wordInput.disabled = true;
        this.submitBtn.disabled = true;
        this.hintBtn.disabled = true;
        this.pauseBtn.disabled = true;
        this.timerDisplay.textContent = this.timeLeft;
        this.totalTimerDisplay.textContent = this.totalTimeLeft;
        this.showMessage('点击开始按钮开始游戏', 'loading');
    }
    submitHandler(e) {
        console.log('提交按钮被点击');
        e.preventDefault();
        this.submitWord();
    }

    hintHandler(e) {
        console.log('提示按钮被点击');
        e.preventDefault();
        this.getHint();
    }

    startHandler(e) {
        console.log('开始按钮被点击');
        e.preventDefault();
        this.toggleStart();
    }

    pauseHandler(e) {
        console.log('暂停按钮被点击');
        e.preventDefault();
        this.togglePause();
    }

    exitHandler(e) {
        console.log('退出按钮被点击');
        e.preventDefault();
        this.exit();
    }

    keyboardHandler(e) {
        // 回车键提交
        if (e.key === 'Enter' && this.isGameStarted && !this.isPaused) {
            console.log('回车键被按下');
            e.preventDefault();
            this.submitWord();
        }
        // 空格键暂停/继续
        if (e.key === ' ' && this.isGameStarted && !this.wordInput.value.trim()) {
            console.log('空格键被按下');
            e.preventDefault();
            this.togglePause();
        }
    }
    
    bindEvents() {
        // 添加调试信息
        console.log('正在绑定事件...');
        
        // 检查按钮元素是否存在
        if (!this.submitBtn || !this.hintBtn || !this.startBtn || !this.pauseBtn || !this.exitBtn) {
            console.error('按钮元素不存在，无法绑定事件');
            return;
        }
        
        console.log('按钮状态:', {
            submit: this.submitBtn,
            hint: this.hintBtn,
            start: this.startBtn,
            pause: this.pauseBtn,
            exit: this.exitBtn
        });
    
        // 移除可能存在的旧事件监听器
        this.submitBtn.removeEventListener('click', this.submitHandler);
        this.hintBtn.removeEventListener('click', this.hintHandler);
        this.startBtn.removeEventListener('click', this.startHandler);
        this.pauseBtn.removeEventListener('click', this.pauseHandler);
        this.exitBtn.removeEventListener('click', this.exitHandler);
        document.removeEventListener('keydown', this.keyboardHandler);
    
        // 重新绑定事件监听器
        this.submitBtn.addEventListener('click', this.submitHandler);
        this.hintBtn.addEventListener('click', this.hintHandler);
        this.startBtn.addEventListener('click', this.startHandler);
        this.pauseBtn.addEventListener('click', this.pauseHandler);
        this.exitBtn.addEventListener('click', this.exitHandler);
        document.addEventListener('keydown', this.keyboardHandler);
    
        console.log('事件绑定完成');
    }
    
    async submitWord() {
        // 检查游戏状态，如果游戏未开始或已暂停，则不处理提交
        if (!this.isGameStarted || this.isPaused) {
            this.showMessage('游戏未开始或已暂停', 'incorrect');
            sound.wrong.play();
            return;
        }
        
        const word = this.wordInput.value.toLowerCase().trim();
        if (!word) {
            this.showMessage('请输入单词！', 'incorrect');
            return;
        }

        // 检查是否只包含英文字母
        if (!/^[a-z]+$/.test(word)) {
            this.showMessage('请只输入英文字母！', 'incorrect');
            return;
        }

        // 检查单词长度，至少2个字母
        if (word.length < 2) {
            this.showMessage('单词长度至少需要2个字母！', 'incorrect');
            return;
        }

        if (this.usedWords.includes(word)) {
            this.showMessage('该单词已经使用过了！', 'incorrect');
            return;
        }

        if (word[0] !== this.currentWord[this.currentWord.length - 1]) {
            this.showMessage('单词首字母需要匹配上一个单词的尾字母！', 'incorrect');
            return;
        }
        
        // 检查本地词库
        if (this.words.includes(word)) {
            this.acceptWord(word);
            return;
        }
        
        // 如果单词不在本地词库中，但符合基本规则，也接受它
        // 这样可以避免依赖国外API，提高游戏在中国境内的可用性
        if (word.length >= 2 && /^[a-z]+$/.test(word)) {
            // 将新单词添加到本地词库
            this.words.push(word);
            // 更新本地存储
            try {
                localStorage.setItem('wordChainGameWords', JSON.stringify(this.words));
            } catch (e) {
                console.error('保存词库到本地存储失败:', e);
            }
            this.acceptWord(word);
            return;
        }
        
        this.showMessage('请输入有效的英文单词！', 'incorrect');
    }
    
    acceptWord(word) {
        this.score += word.length;
        this.usedWords.push(word);
        this.currentWord = word;
        this.updateDisplay();
        this.showMessage('答对了！', 'correct');
        this.wordInput.value = '';
        this.resetTimer();
    }

    async getHint() {
        const lastLetter = this.currentWord[this.currentWord.length - 1];
        
        // 直接使用本地词库提供提示，不再依赖国外API
        this.showMessage('正在获取提示...', 'loading');
        
        // 从本地词库中筛选出符合条件的单词
        const possibleWords = this.words.filter(word => 
            word[0] === lastLetter && !this.usedWords.includes(word)
        );

        if (possibleWords.length > 0) {
            // 随机选择一个提示词
            const randomIndex = Math.floor(Math.random() * Math.min(3, possibleWords.length));
            this.showMessage(`提示：可以使用 ${possibleWords[randomIndex]} 等单词`, 'correct');
        } else {
            this.showMessage('没有更多可用的单词了！', 'incorrect');
        }
    }

    toggleStart() {
        if (!this.isGameStarted) {
            this.isGameStarted = true;
            this.usedWords = [];
            this.currentWord = 'dog';
            this.score = 0;
            this.totalTimeLeft = 120;
            this.updateDisplay();
            this.showMessage('游戏开始！', 'correct');
            this.wordInput.value = '';
            this.wordInput.disabled = false;
            this.submitBtn.disabled = false;
            this.hintBtn.disabled = false;
            this.pauseBtn.disabled = false;
            this.startBtn.textContent = '重新开始';
            this.startTimer();
            this.startTotalTimer();
        } else {
            if (confirm('确定要重新开始游戏吗？')) {
                this.usedWords = [];
                this.currentWord = 'dog';
                this.score = 0;
                this.totalTimeLeft = 120;
                this.updateDisplay();
                this.showMessage('游戏已重新开始！', 'correct');
                this.wordInput.value = '';
                this.wordInput.disabled = false;
                this.submitBtn.disabled = false;
                this.hintBtn.disabled = false;
                this.pauseBtn.disabled = false;
                this.isPaused = false;
                this.pauseBtn.textContent = '暂停';
                this.startTimer();
                this.startTotalTimer();
                this.wordInput.focus();
            }
        }
    }

    togglePause() {
        if (!this.isGameStarted) return;
        
        this.isPaused = !this.isPaused;
        if (this.isPaused) {
            if (this.timer) {
                clearInterval(this.timer);
            }
            if (this.totalTimer) {
                clearInterval(this.totalTimer);
            }
            this.wordInput.disabled = true;
            this.submitBtn.disabled = true;
            this.pauseBtn.textContent = '继续';
            this.showMessage('游戏已暂停', 'loading');
        } else {
            this.wordInput.disabled = false;
            this.submitBtn.disabled = false;
            this.pauseBtn.textContent = '暂停';
            this.showMessage('游戏继续', 'correct');
            this.startTimer();
            this.startTotalTimer();
            this.wordInput.focus();
        }
    }

    exit() {
        if (confirm('确定要退出游戏吗？')) {
            if (this.timer) {
                clearInterval(this.timer);
            }
            if (this.totalTimer) {
                clearInterval(this.totalTimer);
            }
            window.close();
        }
    }

    startTimer() {
        this.timeLeft = 25;
        this.timerDisplay.textContent = this.timeLeft;
        if (this.timer) {
            clearInterval(this.timer);
        }
        this.timer = setInterval(() => {
            this.timeLeft--;
            this.timerDisplay.textContent = this.timeLeft;
            if (this.timeLeft <= 0) {
                clearInterval(this.timer);
                this.endGame('单词时间到！');
            }
        }, 1000);
    }

    resetTimer() {
        if (this.isGameStarted && !this.isPaused) {
            this.startTimer();
        }
    }

    startTotalTimer() {
        if (this.totalTimer) {
            clearInterval(this.totalTimer);
        }
        this.totalTimer = setInterval(() => {
            this.totalTimeLeft--;
            this.totalTimerDisplay.textContent = this.totalTimeLeft;
            if (this.totalTimeLeft <= 0) {
                this.endGame('总时间到！');
            }
        }, 1000);
    }

    endGame(message) {
        if (this.timer) {
            clearInterval(this.timer);
        }
        if (this.totalTimer) {
            clearInterval(this.totalTimer);
        }
        this.showMessage(`${message}最终得分：${this.score}`, 'incorrect');
        this.wordInput.disabled = true;
        this.submitBtn.disabled = true;
        this.hintBtn.disabled = true;
        this.pauseBtn.disabled = true;
        this.isGameStarted = false;
        this.startBtn.textContent = '重新开始';
    }

    updateDisplay() {
        this.currentWordDisplay.textContent = this.currentWord;
        this.scoreDisplay.textContent = this.score;
        this.totalTimerDisplay.textContent = this.totalTimeLeft;
        this.wordsList.innerHTML = this.usedWords
            .map(word => `<li>${word}</li>`)
            .join('');

    }

    showMessage(message, type) {
        this.messageDisplay.textContent = message;
        this.animation.className = `${type}-animation`;
        setTimeout(() => {
            if (type !== 'loading') {
                this.animation.className = '';
            }
        }, 1000);
    }
}
export default WordChainGame;