export default class WordChainGame {
    constructor() {
        this.words = [];
        this.usedWords = [];
        this.currentWord = 'dog';
        this.score = 0;
        
        this.initializeElements();
        this.bindEvents();
        this.loadWordsFromAPI();
    }
    
    async loadWordsFromAPI() {
        try {
            this.showMessage('正在加载在线词库...', 'loading');
            // 使用免费的在线词典API
            const response = await axios.get('https://api.datamuse.com/words?max=1000');
            if (response.data && response.data.length > 0) {
                // 提取单词列表
                this.words = response.data.map(item => item.word);
                this.showMessage('在线词库加载成功！', 'correct');
            } else {
                throw new Error('API返回数据为空');
            }
        } catch (error) {
            console.error('加载在线词库失败:', error);
            this.showMessage('加载在线词库失败，使用备用词库', 'incorrect');
            // 加载失败时使用本地备用词库
            this.loadBackupWordList();
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
        this.restartBtn = document.getElementById('restart-btn');
        this.exitBtn = document.getElementById('exit-btn');
        this.currentWordDisplay = document.getElementById('current-word');
        this.scoreDisplay = document.getElementById('score');
        this.messageDisplay = document.getElementById('message');
        this.wordsList = document.getElementById('correct-words-list');
        this.animation = document.getElementById('animation');
    }

    bindEvents() {
        this.submitBtn.addEventListener('click', () => this.submitWord());
        this.hintBtn.addEventListener('click', () => this.getHint());
        this.restartBtn.addEventListener('click', () => this.restart());
        this.exitBtn.addEventListener('click', () => this.exit());
        this.wordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.submitWord();
        });
    }

    async submitWord() {
        const word = this.wordInput.value.toLowerCase().trim();
        if (!word) {
            this.showMessage('请输入单词！', 'incorrect');
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
            const response = await axios.get(`https://api.datamuse.com/words?sp=${word}&max=1`);
            
            if (response.data && response.data.length > 0 && response.data[0].word === word) {
                // 如果API确认单词存在，添加到本地词库并接受
                this.words.push(word);
                this.acceptWord(word);
            } else {
                this.showMessage('单词不在词库中！', 'incorrect');
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
    }

    async getHint() {
        const lastLetter = this.currentWord[this.currentWord.length - 1];
        
        try {
            // 先尝试从在线API获取以特定字母开头的单词
            this.showMessage('正在获取提示...', 'loading');
            const response = await axios.get(`https://api.datamuse.com/words?sp=${lastLetter}*&max=20`);
            
            if (response.data && response.data.length > 0) {
                // 过滤出未使用过的单词
                const apiWords = response.data.map(item => item.word);
                const possibleWords = apiWords.filter(word => !this.usedWords.includes(word));
                
                if (possibleWords.length > 0) {
                    this.showMessage(`提示：可以使用 ${possibleWords[0]} 等单词`, 'correct');
                    return;
                }
            }
            
            // 如果API没有返回合适的单词，使用本地词库
            const possibleWords = this.words.filter(word => 
                word[0] === lastLetter && !this.usedWords.includes(word)
            );

            if (possibleWords.length > 0) {
                this.showMessage(`提示：可以使用 ${possibleWords[0]} 等单词`, 'correct');
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
                this.showMessage(`提示：可以使用 ${possibleWords[0]} 等单词`, 'correct');
            } else {
                this.showMessage('没有更多可用的单词了！', 'incorrect');
            }
        }
    }

    restart() {
        this.usedWords = [];
        this.currentWord = 'dog';
        this.score = 0;
        this.updateDisplay();
        this.showMessage('游戏已重新开始！', 'correct');
        this.wordInput.value = '';
    }

    exit() {
        if (confirm('确定要退出游戏吗？')) {
            window.close();
        }
    }

    updateDisplay() {
        this.currentWordDisplay.textContent = this.currentWord;
        this.scoreDisplay.textContent = this.score;
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