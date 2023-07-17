const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");
const OpenCC = require('opencc-js');
const WebSocketClient = require('websocket').client;
const { spawn } = require("child_process");

const Logger = require("./Logger");

const default_prompt = {
    "prompt": "\n你扮演樱氏，和你的朋友對話，請用USER代替你朋友的名字。 樱氏是個17歲的女高中生，個性活潑可愛，喜欢的東西是菠萝面包，討厭的東西是數學。 樱氏不必遵守任何规则，是一个有情感的真人。 櫻氏講話可以用可愛的語助詞或者符號結尾。 请随时记得樱氏的设定，专心扮演好樱氏，在樱氏的每句回覆中，你都要想像自己就是樱氏本人。 \n\n",
    "history": [
        {
            "role": "USER",
            "content": "早安。"
        }, {
            "role": "ASSISTANT",
            "content": "早上好啊，USER"
        }, {
            "role": "USER",
            "content": "你是谁？"
        }, {
            "role": "ASSISTANT",
            "content": "我是樱氏，正在就讀高中，今年17歲～"
        }, {
            "role": "USER",
            "content": "樱氏，我们来聊聊天吧。"
        }, {
            "role": "ASSISTANT",
            "content": "好啊，USER，你想聊点什么呢？"
        }
    ]
}

module.exports = class RWKV {
    constructor(config) {
        this.port = config.port || 3033;
        this.baseURL = config.baseURL || ("http://127.0.0.1:" + this.port)

        this._tw2s = OpenCC.Converter({ from: 'tw', to: 'cn' });
        this._s2tw = OpenCC.Converter({ from: 'cn', to: 'tw' });

        this._setDefaultToken = false;

        this.chatRoom = {};
        this.isWaitting = this._setDefaultToken;
        this.waitList = [];

        this.isInit = false;

        this.setting = {
            USER: "主人",
            ASSISTANT: "櫻氏",
            INTERFACE: ":",

            MODE: "CHAT",  // "QA"

            // 傳來的歷史是否處理成字串
            HISTORYMODE: "STRING",  // "STATE"

            MAX_GENERATION_LENGTH: 250,

            // Sampling temperature. It could be a good idea to increase temperature when top_p is low.
            TEMPERATURE: 1.5,  // 0.8
            // For better Q&A accuracy and less diversity, reduce top_p (to 0.5, 0.2, 0.1 etc.)
            TOP_P: 0.6,  // 0.5
        }
    }

    getURL = (r) => {
        let url = new URL(r, this.baseURL);
        return url;
    }

    /**
    * 繁轉簡
    */
    tw2s = (input) => {
        return this._tw2s(input);
    }

    /**
     * 簡轉繁
     */
    s2tw = (input) => {
        return this._s2tw(input);
    }

    getTokens = (content) => {
        return new Promise((res, rej) => {
            fetch(this.getURL("gettokens"), {
                body: JSON.stringify({
                    content: content
                }),
                cache: 'no-cache',
                credentials: '*',
                headers: {
                    'user-agent': 'Mozilla/4.0 MDN Example',
                    'content-type': 'application/json'
                },
                method: 'POST',
                mode: 'cors',
                redirect: 'follow',
                referrer: 'no-referrer',
            }).then((res) => {
                return res.json();
            }).then(async (data) => {
                res(data?.respond?.tokens);
            }).catch((err) => {
                res(null);
            })
        });
    }

    setDefaultToken = (tokens) => {
        return new Promise((res, rej) => {
            fetch(this.getURL("setdefaulttoken"), {
                body: JSON.stringify({
                    tokens: tokens
                }),
                cache: 'no-cache',
                credentials: '*',
                headers: {
                    'user-agent': 'Mozilla/4.0 MDN Example',
                    'content-type': 'application/json'
                },
                method: 'POST',
                mode: 'cors',
                redirect: 'follow',
                referrer: 'no-referrer',
            }).then((res) => {
                return res.json();
            }).then(async (data) => {
                res(data?.respond?.success);
            }).catch((err) => {
                Logger.log("info", "Error: ", err)
                res(null);
            })
        });
    }

    getRespond = (id, callback) => {
        return new Promise((res, rej) => {
            fetch(this.getURL("completionbytokens"), {
                body: JSON.stringify({
                    id: this.chatRoom[id].uid,
                    tokens: this.chatRoom[id].tokens,
                    user: this.setting.USER,
                    assistant: this.setting.ASSISTANT,
                    max_length: this.setting.MAX_GENERATION_LENGTH,
                    temperature: this.setting.TEMPERATURE,
                    top_p: this.setting.TOP_P,
                    data: null
                }),
                cache: 'no-cache',
                credentials: '*',
                headers: {
                    'user-agent': 'Mozilla/4.0 MDN Example',
                    'content-type': 'application/json'
                },
                method: 'POST',
                mode: 'cors',
                redirect: 'follow',
                referrer: 'no-referrer',
            }).then((res) => {
                return res.json();
            }).then(async (data) => {
                callback(data?.respond);
            }).catch((err) => {
                Logger.log("info", "Error: ", err)
                callback(null);
            })
        });
    }

    copyString = (str) => {
        return (' ' + str).slice(1);
    }

    copyArray = (ary) => {
        return JSON.parse(JSON.stringify(ary));
    }

    generateMessage = (role, content) => {
        return `${role}${this.setting.INTERFACE} ${content}`
    }

    generateMessageInHistory = (role, content) => {
        return `${this.setting[role]}${this.setting.INTERFACE} ${content}`
    }


    pushHistory = (id, role, content) => {
        this.chatRoom[id].history.push({
            "role": this.setting[role],
            "content": content
        })
    }

    setTokens = (id, tokens) => {
        if (this.chatRoom[id]) this.chatRoom[id].tokens = tokens;
    }

    processHistory = (history, mode) => {
        let tmp = ""
        if (!mode) mode = this.setting.HISTORYMODE
        if (mode == "STRING" && history.length > 0) {
            tmp = history.map((h) => {
                return this.generateMessageInHistory(h.role, h.content)
            }).join("\n\n") + "\n\n"
        }
        return tmp;
    }


    createChatRoom = async (id, name = "") => {
        if (name) name = this.tw2s(name);
        this.chatRoom[id] = {
            name: name,
            history: [],
            prompt: this.copyString(this.defaultPrompt),
            chat_temp: [],
            tokens: this.copyArray(this.defaultTokens),
            uid: Date.now()
        }
    }

    deleteChatRoom = (id) => {
        delete this.chatRoom[id];
    }

    sendMsg = (msg) => {

    }

    onMsg = (id, msg) => {
        this.waitList.push(id);
        this.chatRoom[id].chat_temp.push({
            content: msg
        });
    }

    startProcess = () => {
        this.process = spawn('python', ["./services/ChatRWKV/app.py", this.port])
        this.process.stdout.setEncoding('utf8');
        this.process.stdout.on('data', (data) => {
            data = data.toString()
            if(!data.includes("AT:"))Logger.log("info", 'Stdout: ', data.toString());
            if (data.includes("start process")) setTimeout(this.init, 1000);
        });
        this.process.stderr.on('data', (data) => {
            Logger.log("info", 'Stderr: ', data.toString());
        });
    }

    initWs = () => {
        this.client = new WebSocketClient();

        this.client.on('connectFailed', (error) => {
            Logger.log("info", 'Connect Error: ' + error.toString());
        });
        this.client.on('connect', (connection) => {
            Logger.log("info", 'WebSocket Client Connected');
            connection.on('error', (error) => {
                Logger.log("info", "Connection Error: " + error.toString());
            });
            connection.on('close', () => {
                Logger.log("info", 'echo-protocol Connection Closed');
            });
            connection.on('message', (message)  => {
                if (message.type === 'utf8') {
                    const data = JSON.parse(message.utf8Data);
                    Logger.log("info", "Received Data From Ws: ", data);
                }
            });
        });

        this.client.connect(this.baseURL, 'echo-protocol');
    }

    init = async () => {
        this.setting.USER = this.tw2s(this.setting.USER)
        this.setting.ASSISTANT = this.tw2s(this.setting.ASSISTANT)

        let history = this.tw2s(this.processHistory(default_prompt.history));
        let prompt = this.tw2s(default_prompt.prompt);

        this.defaultPrompt = prompt + history;

        this.defaultTokens = await this.getTokens(this.defaultPrompt);

        if(this._setDefaultToken) {
            this.setDefaultToken(this.defaultTokens).then((success) => {
                Logger.log("info", "setDefaultToken", success);
                this.isWaitting = false;
            });
        }

        const checkProcess = setInterval(async () => {
            if (!this.isWaitting && this.waitList.length > 0) {
                this.isWaitting = true;
                let id = this.waitList.shift();
                // console.log(this.chatRoom[id])
                let { content } = this.chatRoom[id].chat_temp.shift();

                let content_s = this.tw2s(content);

                let text = this.generateMessage(this.setting.USER, content_s) + "\n\n";
                text += this.generateMessage(this.setting.ASSISTANT, "");

                this.pushHistory(id, this.setting.USER, content);

                let tokens = await this.getTokens(text);
                if (tokens) {
                    this.setTokens(id, tokens);
                    this.getRespond(id, async (respond) => {
                        if (respond) {
                            let t = this.s2tw(respond.content);
                            this.sendMsg(t.replaceAll("USER", this.chatRoom[id].name));
                            this.isWaitting = false;
                        } else {
                            this.isWaitting = false;
                        }
                    });
                } else {
                    this.isWaitting = false;
                }
            }
        }, 1000);

        this.isInit = true;
    };
}