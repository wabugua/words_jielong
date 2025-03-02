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
        
        this.initializeElements();
        this.bindEvents();
        this.loadWordsFromAPI();
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

            // 在后台异步更新在线词库
            this.updateOnlineWords();
        } catch (error) {
            console.error('加载词库失败:', error);
            this.showMessage('词库加载失败，请刷新页面重试', 'incorrect');
        }
    }

    async updateOnlineWords() {
        try {
            const response = await axios.get('https://api.datamuse.com/words?max=1000&md=d');
            if (response.data && response.data.length > 0) {
                const onlineWords = response.data
                    .filter(item => item.defs && item.defs.length > 0)
                    .map(item => item.word);
                
                if (onlineWords.length > 0) {
                    // 合并在线词库和本地词库
                    this.words = [...new Set([...this.words, ...onlineWords])];
                    // 缓存到localStorage
                    localStorage.setItem('wordChainGameWords', JSON.stringify(this.words));
                }
            }
        } catch (error) {
            console.error('更新在线词库失败:', error);
        }
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

    bindEvents() {
        // 添加调试信息
        console.log('正在绑定事件...');
        console.log('按钮状态:', {
            submit: this.submitBtn,
            hint: this.hintBtn,
            start: this.startBtn,
            pause: this.pauseBtn,
            exit: this.exitBtn
        });

        // 使用具名函数来绑定事件，便于调试
        const submitHandler = (e) => {
            console.log('提交按钮被点击');
            e.preventDefault();
            this.submitWord();
        };

        const hintHandler = (e) => {
            console.log('提示按钮被点击');
            e.preventDefault();
            this.getHint();
        };

        const startHandler = (e) => {
            console.log('开始按钮被点击');
            e.preventDefault();
            this.toggleStart();
        };

        const pauseHandler = (e) => {
            console.log('暂停按钮被点击');
            e.preventDefault();
            this.togglePause();
        };

        const exitHandler = (e) => {
            console.log('退出按钮被点击');
            e.preventDefault();
            this.exit();
        };

        // 移除可能存在的旧事件监听器
        this.submitBtn.removeEventListener('click', submitHandler);
        this.hintBtn.removeEventListener('click', hintHandler);
        this.startBtn.removeEventListener('click', startHandler);
        this.pauseBtn.removeEventListener('click', pauseHandler);
        this.exitBtn.removeEventListener('click', exitHandler);

        // 重新绑定事件监听器
        this.submitBtn.addEventListener('click', submitHandler);
        this.hintBtn.addEventListener('click', hintHandler);
        this.startBtn.addEventListener('click', startHandler);
        this.pauseBtn.addEventListener('click', pauseHandler);
        this.exitBtn.addEventListener('click', exitHandler);
        
        // 全局键盘事件处理
        const keyboardHandler = (e) => {
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
        };

        // 移除旧的事件监听器
        document.removeEventListener('keydown', keyboardHandler);
        // 添加新的事件监听器到document级别
        document.addEventListener('keydown', keyboardHandler);

        console.log('事件绑定完成');
    }
    
    async submitWord() {
        // 检查游戏状态，如果游戏未开始或已暂停，则不处理提交
        if (!this.isGameStarted || this.isPaused) {
            this.showMessage('游戏未开始或已暂停', 'incorrect');
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
        
        // 先检查本地词库
        if (this.words.includes(word)) {
            this.acceptWord(word);
            return;
        }
        
        // 如果本地词库没有，尝试在线验证单词
        try {
            this.showMessage('正在验证单词...', 'loading');
            // 使用更精确的查询参数：sp=完全匹配 + md=d获取定义
            const response = await axios.get(`https://api.datamuse.com/words?sp=${word}&md=d&max=1&exact=1`);
            
            if (response.data && response.data.length > 0 && 
                response.data[0].word === word && 
                response.data[0].defs && 
                response.data[0].defs.length > 0) {
                // 如果API确认单词存在且有词典定义，添加到本地词库并接受
                this.words.push(word);
                this.acceptWord(word);
            } else {
                // 尝试使用备用API进行二次验证
                try {
                    const backupResponse = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
                    if (backupResponse.data && backupResponse.data.length > 0) {
                        // 如果备用API确认单词存在，添加到本地词库并接受
                        this.words.push(word);
                        this.acceptWord(word);
                    } else {
                        this.showMessage('请输入有效的英文单词！', 'incorrect');
                    }
                } catch (backupError) {
                    // 如果备用API也失败，则认为单词无效
                    this.showMessage('请输入有效的英文单词！', 'incorrect');
                }
            }
        } catch (error) {
            console.error('验证单词失败:', error);
            this.showMessage('验证单词失败，请重试！', 'incorrect');
        }
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
        
        try {
            // 先尝试从在线API获取以特定字母开头的单词，并且要求有定义
            this.showMessage('正在获取提示...', 'loading');
            const response = await axios.get(`https://api.datamuse.com/words?sp=${lastLetter}*&md=d&max=30`);
            
            if (response.data && response.data.length > 0) {
                // 过滤出有定义且未使用过的单词
                const apiWords = response.data
                    .filter(item => item.defs && item.defs.length > 0)
                    .map(item => item.word);
                const possibleWords = apiWords.filter(word => !this.usedWords.includes(word));
                
                if (possibleWords.length > 0) {
                    // 随机选择一个提示词，增加游戏趣味性
                    const randomIndex = Math.floor(Math.random() * Math.min(3, possibleWords.length));
                    this.showMessage(`提示：可以使用 ${possibleWords[randomIndex]} 等单词`, 'correct');
                    return;
                }
            }
            
            // 如果API没有返回合适的单词，使用本地词库
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
        } catch (error) {
            console.error('获取提示失败:', error);
            
            // 如果API请求失败，回退到本地词库
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