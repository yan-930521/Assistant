const { ipcRenderer } = require("electron");

window.onload = () => {


    const videoCanvas = document.getElementById("video");
    const ctx = videoCanvas.getContext('2d');

    let scaleFactor;
    let video;
    let img;
    let gif;
    let nowShowingEle = null;

    let setting;

    setSize();

    window.onresize = setSize;



    function setSize() {
        videoCanvas.width = window.innerWidth;
        videoCanvas.height = window.innerHeight;
    }

    function draw(ele) {
        nowShowingEle = ele;

        document.getElementById("canvas").className = "hidden";
        videoCanvas.className = "visible";

        window.isPlayingVideo = true;

        if (ele.videoHeight) {
            nowShowingEle.w = ele.videoWidth;
            nowShowingEle.h = ele.videoHeight;
        } else {
            nowShowingEle.w = ele.width;
            nowShowingEle.h = ele.height;
        }

        if (setting?.videoFullScreen) {
            scaleFactor = Math.max(videoCanvas.width / nowShowingEle.w, videoCanvas.height / nowShowingEle.h);
        } else {
            scaleFactor = Math.min(videoCanvas.width / nowShowingEle.w, videoCanvas.height / nowShowingEle.h);
        }

        nowShowingEle.w = nowShowingEle.w * scaleFactor;
        nowShowingEle.h = nowShowingEle.h * scaleFactor;

        nowShowingEle.x = (videoCanvas.width / 2) - (nowShowingEle.w / 2);
        nowShowingEle.y = (videoCanvas.height / 2) - (nowShowingEle.h / 2);

        if (nowShowingEle.isGif) nowShowingEle.play();
        drawCanvas();
    }
    function drawCanvas() {
        if (window.isPlayingVideo && nowShowingEle) {
            console.log("drawCanvas");
            requestAnimationFrame(drawCanvas);

            ctx.clearRect(0, 0, videoCanvas.width, videoCanvas.height);

            ctx.drawImage(
                nowShowingEle.isGif ? nowShowingEle.image : nowShowingEle,
                nowShowingEle.x,
                nowShowingEle.y,
                nowShowingEle.w,
                nowShowingEle.h
            );
        }
    }

    ipcRenderer.on("tool", async (event, data) => {
        console.log(data);

        if (!setting) setting = await ipcRenderer.invoke("tool", {
            type: "Get Setting",
            data: {}
        });

        if (data.type == "Call Wallpaper-reply") {
            data = data.data;
            console.log(data.message)
            if (data.message == "TOGGLE") {
                if (window.isPlayingVideo) {
                    window.isPlayingVideo = false;
                    nowShowingEle = null;
                    document.getElementById("video").className = "hidden";
                    document.getElementById("canvas").className = "visible";
                    img.src = "";
                    video.src = "";
                    video.load();
                } else {
                    if (data.fileType == "image") {
                        if (!data.fileSrc.endsWith(".gif")) {
                            img = document.createElement("img");
                            img.onload = () => {
                                console.log("onload");
                                draw(img);
                            }

                            img.src = data.fileSrc;
                        } else {
                            // is gif
                            gif = GIF();
                            gif.load(data.fileSrc);
                            gif.onload = () => {
                                console.log("onload");
                                gif.play();
                                gif.isGif = true;
                                draw(gif);
                            }
                        }
                    } else {
                        video = document.createElement("video");
                        video.muted = true;

                        let url = "http://localhost:3030/music.mp4?contentLength=" + data.Mp4Size;

                        if (data.isFile) url += "&fileSrc=" + encodeURIComponent(data.fileSrc);

                        console.log(url)
                        video.src = url;

                        video.load();

                        video.onloadeddata = () => {
                            console.log("onloadeddata");
                            video.currentTime = data.currentTime;
                            video.play();
                            draw(video);
                        }

                        video.onended = () => {
                            window.isPlayingVideo = false;
                            nowShowingEle = null;
                            document.getElementById("video").className = "hidden";
                            document.getElementById("canvas").className = "visible";
                        }
                    }
                }
            }
        }
    });

}
