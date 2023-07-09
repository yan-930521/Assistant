const { ipcRenderer } = require("electron");

const videoCanvas = document.getElementById("video");
const ctx = videoCanvas.getContext('2d');

let status = false;
let ratio;
let video;

function drawVideo() {
    if(status) {
        console.log("drawVideo")
        requestAnimationFrame(drawVideo);
        ctx.drawImage(
            video,
            0,
            0,
            videoCanvas.width,
            videoCanvas.width * ratio
        );
    }
}
ipcRenderer.on("tool", (event, data) => {
    console.log(data);
    if (data.type == "Call Wallpaper-reply") {
        data = data.data;
        console.log(data.message)
        if (data.message == "START") {
            video = document.createElement("video");

            document.getElementById("canvas").className = "hidden";
            videoCanvas.className = "visible";

            video.src = "http://localhost:3030/music2.mp4";
            video.load();

            window.stopThreeJs = true;

            video.onloadeddata = () => {
                console.log("onloadeddata");
                videoCanvas.width = video.videoWidth;
                videoCanvas.height = video.videoHeight;

                ratio = video.videoHeight / video.videoWidth;

                status = true;
                video.currentTime = data.currentTime;
                video.play();
                drawVideo();
            }
        }
        if (data.message == "CLOSE") {
            status = false;
            window.stopThreeJs = false;
            document.getElementById("video").className = "hidden";
            document.getElementById("canvas").className = "visible";
        }
    }
});

