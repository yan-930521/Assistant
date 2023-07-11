const { ipcRenderer } = require("electron");

const videoCanvas = document.getElementById("video");
const ctx = videoCanvas.getContext('2d');

let ratio;
let video;

function drawVideo() {
    if (window.isPlayingVideo) {
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
        if (data.message == "TOGGLE") {
            if (window.isPlayingVideo) {
                window.isPlayingVideo = false;
                document.getElementById("video").className = "hidden";
                document.getElementById("canvas").className = "visible";
                video.src = "";
                video.load();
            } else {
                video = document.createElement("video");
                video.muted = true;

                let url = "http://localhost:3030/music.mp4?contentLength=" + data.Mp4Size;

                if (data.isFile) url += "&musicSrc=" + encodeURIComponent(data.musicSrc);

                console.log(url)
                video.src = url;

                video.load();

                video.onloadeddata = () => {
                    console.log("onloadeddata");
                    videoCanvas.width = video.videoWidth;
                    videoCanvas.height = video.videoHeight;

                    ratio = video.videoHeight / video.videoWidth;

                    document.getElementById("canvas").className = "hidden";
                    videoCanvas.className = "visible";


                    window.isPlayingVideo = true;

                    video.currentTime = data.currentTime;
                    video.play();
                    drawVideo();
                }

                video.onended = () => {
                    window.isPlayingVideo = false;
                    document.getElementById("video").className = "hidden";
                    document.getElementById("canvas").className = "visible";
                }
            }
        }
    }
});

