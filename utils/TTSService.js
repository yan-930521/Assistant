const { WebSocket } = require("ws");
class TTSService {
    constructor(config) {
        this.port = config.port || 3033;
        this.baseURL = config.baseURL || ("ws://localhost:" + this.port)

        this.bufferList = []
        this.audio = new Audio();
        this.audio.onended = () => {
            
        }
    }

    getURL = (r) => {
        let url = new URL(r, this.baseURL);
        return url;
    }

    initWs = () => {
        this.client = new WebSocket(this.baseURL);

        this.client.on('open', (error) => {
            console.log("connect to tts server.");
            this.client.send(JSON.stringify({
                text: "你好挖"
            }))
        });
      
        this.client.on('message', (data)  => {
            this.bufferList.push(data);
        });
    }
}

tts = new TTSService({
    port: 3033
})

tts.initWs()