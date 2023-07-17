const { ipcRenderer } = require("electron");

let inputFocus = false;

window.onkeyup = (event) => {
    if (inputFocus && event.keyCode === 13) {
        let val = document.getElementById("input").value;
        if (val != "") {
            console.log("Input: ", val);
            document.getElementById("input").value = "";
            ipcRenderer.invoke("tool", {
                type: "Chat To AI",
                data: val
            });
        }
    }
}

window.onload = async () => {
    let setting = await ipcRenderer.invoke("tool", {
        type: "Get Setting",
        data: {}
    });
    document.getElementById("nameDisplay").innerHTML = "歡迎回來， " + setting.userName;
    document.getElementById("uptimeDisplay").innerHTML = "啟動時間 " + new Date(setting.startTime).toLocaleString().split(" ")[1];
    document.getElementById("input").onfocus = () => inputFocus = true;
    document.getElementById("input").onfocusout = () => {
        inputFocus = false;
        console.log("lose focus")
    }
    let i = 0, t = true;
    setInterval(() => {
        const txt = 'Typing something.....';
        if (i < txt.length && t) {
            let text = document.getElementById("input").placeholder;
            text += txt.charAt(i);
            document.getElementById("input").placeholder = text
            i++;
        } else if (i < txt.length && !t) {
            let text = document.getElementById("input").placeholder;
            text = text.slice(0, -1);
            document.getElementById("input").placeholder = text
            i--;
        }
        if((i == txt.length - 1 && t) || (i == 6 && !t)) t = !t;
    }, 300);


    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    let bars = 128;
    //let frequencyData = null;

    let WIDTH = canvas.width = window.innerWidth // 80 * window.innerWidth / 100;
    let HEIGHT = canvas.height = 100;

    let barWidth;
    let barHeight;

    const render = (frequencyData) => {
        /**
         * from https://github.com/gg-1414/music-visualizer/blob/master/script.js
         */
        //requestAnimationFrame(render);

        if (!frequencyData) return;

        barWidth = (WIDTH / (bars * 3));

        // ctx.fillStyle = "rgba(0,0,0,0.2)";
        ctx.clearRect(0, 0, WIDTH, HEIGHT);

        let r, g, b, a, x = 0;

        for (let i = 0; i < bars; i++) {
            let index = i //(i * (frequencyData.length / bars));
            let frequency = frequencyData[index];
            barHeight = (frequency / 255) * HEIGHT;

            if (frequency > 210) { // pink
                r = 250;
                g = 0;
                b = 255;
                a = 1;
            } else if (frequency > 200) { // yellow
                r = 250;
                g = 255;
                b = 0;
                a = 0.3;
                a = 0.95;
            } else if (frequency > 190) { // yellow/green
                r = 204;
                g = 255;
                b = 0;
                a = 0.3;
                a = 0.9;
            } else if (frequency > 180) { // blue/green
                r = 0;
                g = 219;
                b = 131;
                a = 0.3;
                a = 0.85;
            } else { // light blue
                r = 0;
                g = 199;
                b = 255;
                a = 0.7;
            }

            //ctx.fillStyle = `rgb(${r},${g},${b})`;
            ctx.fillStyle = `rgb(255, 255, 255,${a})`;
            ctx.fillRect(x, (HEIGHT - barHeight), barWidth, barHeight);

            x += barWidth * 3;
        }

    }

    ipcRenderer.on("tool", async (event, data) => {
        if (data.type == "Call Floor-reply") {
            data = data.data;
            if (data.message == "AUDIO SOURCE") {
                //frequencyData = data.frequencyData;
                render(data.frequencyData);
            }
        } else if (data.type == "Chat To AI-reply") {
            data = data.data;
            document.getElementById("ai").innerText = data;
            console.log(data)
        }
    });


}