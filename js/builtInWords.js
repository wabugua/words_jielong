// 内置单词库
const builtInWords = [
  // 日常用语
  "hello", "world", "good", "morning", "night", "thank", "please", "sorry", "welcome", "goodbye",
  "yes", "no", "okay", "fine", "well", "great", "nice", "wonderful", "amazing", "awesome",
  "excuse", "pardon", "bye", "hi", "hey", "how", "what", "when", "where", "who",
  "why", "which", "whose", "whom", "there", "here", "now", "then", "today", "tomorrow",
  
  // 动物
  "cat", "dog", "bird", "fish", "lion", "tiger", "bear", "wolf", "fox", "deer",
  "rat", "bat", "owl", "ape", "bull", "calf", "goose", "hen", "lamb", "mule",
  "duck", "goat", "horse", "mouse", "panda", "sheep", "snake", "whale", "zebra", "eagle",
  "elephant", "giraffe", "monkey", "rabbit", "turtle", "penguin", "koala", "kangaroo", "dolphin", "butterfly",
  "ant", "bee", "cow", "crab", "crow", "dove", "frog", "hawk", "owl", "pig",
  "seal", "shark", "swan", "worm", "camel", "chick", "mole", "moose", "squid", "wasp",
  
  // 食物
  "apple", "banana", "bread", "cake", "candy", "cheese", "chicken", "coffee", "cookie", "cream",
  "butter", "cereal", "dessert", "dinner", "flour", "garlic", "lunch", "noodle", "pepper", "potato",
  "egg", "fish", "fruit", "grape", "honey", "juice", "lemon", "meat", "milk", "orange",
  "pizza", "rice", "salad", "soup", "sugar", "tea", "tomato", "water", "yogurt", "hamburger",
  "beef", "corn", "curry", "lime", "mango", "pasta", "peach", "pear", "plum", "pork",
  "salt", "sauce", "spice", "steak", "sushi", "toast", "berry", "melon", "onion", "olive",
  
  // 职业
  "actor", "artist", "baker", "chef", "doctor", "driver", "farmer", "lawyer", "nurse", "pilot",
  "barber", "builder", "butcher", "carpenter", "designer", "director", "mechanic", "musician", "teacher", "vendor",
  "police", "singer", "student", "teacher", "writer", "dancer", "dentist", "engineer", "painter", "scientist",
  "agent", "clerk", "coach", "guard", "guide", "judge", "model", "priest", "sailor", "waiter",
  "banker", "butler", "cashier", "editor", "florist", "manager", "plumber", "reporter", "soldier", "trainer",
  
  // 物品
  "book", "chair", "clock", "door", "glass", "house", "knife", "light", "money", "paper",
  "brush", "card", "coin", "cup", "dish", "fork", "key", "lamp", "lock", "map",
  "plate", "ring", "rope", "soap", "spoon", "tape", "tool", "toy", "umbrella", "vase",
  "phone", "table", "watch", "window", "bottle", "camera", "pencil", "mirror", "screen", "wallet",
  
  // 地点
  "bank", "beach", "church", "hotel", "house", "market", "office", "park", "school", "shop",
  "store", "street", "temple", "theater", "airport", "hospital", "library", "museum", "station", "garden",
  "bridge", "castle", "clinic", "court", "desert", "forest", "island", "jungle", "palace", "prison",
  "ranch", "resort", "square", "studio", "subway", "tower", "tunnel", "valley", "village", "zoo",
  
  // 自然
  "cloud", "earth", "fire", "flower", "forest", "grass", "lake", "moon", "mountain", "ocean",
  "rain", "river", "snow", "star", "stone", "storm", "sun", "tree", "water", "wind",
  "beach", "cave", "cliff", "coast", "coral", "dawn", "dusk", "hill", "leaf", "plant",
  "rock", "sand", "seed", "sky", "soil", "space", "wave", "wood", "world", "spring",
  
  // 颜色
  "black", "blue", "brown", "green", "grey", "orange", "pink", "purple", "red", "white",
  "yellow", "golden", "silver", "dark", "light",
  
  // 衣物
  "belt", "coat", "dress", "glove", "hat", "jacket", "pants", "shirt", "shoe", "skirt",
  "sock", "suit", "tie", "watch", "scarf",
  
  // 运动
  "ball", "game", "golf", "race", "sport", "swim", "team", "tennis", "track", "walk",
  "dance", "jump", "run", "skip", "climb",
  
  // 天气
  "cold", "cool", "dry", "hot", "warm", "wet", "windy", "sunny", "rainy", "snowy",
  
  // 情感
  "angry", "happy", "love", "sad", "smile", "tired", "worry", "laugh", "cry", "fear",
  "afraid", "alone", "bored", "brave", "calm", "excited", "friendly", "glad", "lonely", "proud",
  "quiet", "scared", "shy", "strong", "sweet", "weak", "wild", "wise", "young", "old",
  
  // 时间
  "day", "hour", "month", "time", "week", "year", "today", "night", "morning", "evening",
  
  // 数字
  "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",
  
  // 家庭
  "baby", "child", "family", "father", "mother", "parent", "sister", "brother", "uncle", "aunt",
  
  // 身体部位
  "arm", "eye", "face", "foot", "hair", "hand", "head", "heart", "leg", "mouth",
  "nose", "tooth", "ear", "finger", "neck",
  
  // 交通工具
  "bike", "boat", "bus", "car", "plane", "ship", "train", "truck", "taxi", "metro",
  
  // 学习用品
  "book", "desk", "note", "page", "pen", "pencil", "ruler", "study", "test", "paper",
  
  // 电子产品
  "phone", "radio", "video", "camera", "computer", "laptop", "screen", "tablet", "watch", "wire",
  
  // 其他常用词
  "help", "idea", "life", "name", "part", "place", "point", "thing", "way", "work",
  "world", "year", "group", "home", "line", "order", "side", "space", "state", "word",
  "change", "force", "light", "move", "need", "play", "show", "sound", "start", "try",
  "turn", "use", "want", "water", "way",

  // 动词
  "accept", "add", "agree", "allow", "answer", "appear", "ask", "become", "begin", "believe",
  "break", "bring", "build", "buy", "call", "carry", "catch", "choose", "clean", "close",
  "come", "count", "cover", "cut", "decide", "do", "draw", "drink", "drive", "eat",
  "end", "enjoy", "enter", "explain", "feel", "fill", "find", "finish", "fit", "fly",
  "follow", "forget", "get", "give", "go", "grow", "hang", "happen", "have", "hear",
  "hide", "hit", "hold", "hope", "hurt", "keep", "know", "learn", "leave", "let",
  "like", "listen", "live", "look", "lose", "make", "mean", "meet", "mind", "miss",

  // 形容词
  "able", "bad", "beautiful", "best", "better", "big", "bright", "busy", "clear", "close",
  "common", "deep", "different", "difficult", "early", "easy", "empty", "equal", "exact", "fair",
  "false", "famous", "fast", "fat", "few", "final", "first", "free", "fresh", "full",
  "general", "good", "great", "hard", "heavy", "high", "hot", "important", "kind", "last",
  "late", "left", "little", "long", "loud", "low", "main", "many", "new", "next",
  "nice", "old", "only", "open", "other", "past", "poor", "possible", "present", "quick",
  "ready", "real", "rich", "right", "round", "same", "second", "serious", "sharp", "short",

  // 名词
  "ability", "action", "activity", "age", "air", "amount", "angle", "animal", "answer", "area",
  "art", "attention", "back", "base", "behavior", "belief", "birth", "bit", "blood", "body",
  "bone", "bottom", "box", "brain", "branch", "breath", "brother", "building", "business", "case",
  "cause", "chain", "chance", "choice", "circle", "class", "cloth", "color", "comfort", "control",
  "copy", "country", "course", "cover", "credit", "crime", "crush", "cry", "current", "curve"
];

export default builtInWords;