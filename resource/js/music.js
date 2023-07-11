var audio = new Audio();
var audioContext = new AudioContext();
var audioSrc = audioContext.createMediaElementSource(audio);
var analyser = audioContext.createAnalyser();

var video = document.createElement("video");
var videoSrc = audioContext.createMediaElementSource(video);

audioSrc.connect(analyser);
videoSrc.connect(analyser);

analyser.connect(audioContext.destination);

analyser.fftSize = 512;

var volume = 0.4;
var Mp4Size = 0;
var isFile = false;
var hasVideo = false;
var musicSrc = "";
var isAudio = null;

const getCurrentTime = () => {
    if (isAudio) return audio.currentTime;
    else return video.currentTime;
}

const setVolume = (v) => {
    audio.volume = v;
    video.volume = v;
}

const addVolume = (v) => {
    volume += v;
    setVolume(volume);
}

const playFromAudio = (url = "http:/localhost:3030/musicffmepg.mp3") => {
    musicSrc = url;

    if(isAudio == false && !video.paused) {
        video.pause();
        video.currentTime = 0;
    }

    isAudio = true;

    audio.src = url;
    audio.load();

    let frequencyData = new Uint8Array(analyser.frequencyBinCount);

    window.musicVisualizer = (index) => {
        analyser.getByteFrequencyData(frequencyData);

        return (frequencyData[index] / 256);
    }

    window.logVisualizer = () => {
        analyser.getByteFrequencyData(frequencyData);
        console.log(frequencyData.length, frequencyData);
    }

    audio.onended = () => {
        audio.currentTime = 0;
        console.log("audio ended");
    };

    audio.play();
}

const playFromVideo = (url) => {
    musicSrc = url;

    if(isAudio && !audio.paused) {
        audio.pause();
        audio.currentTime = 0;
    }

    isAudio = false;

    video.src = url;
    video.load();

    let frequencyData = new Uint8Array(analyser.frequencyBinCount);

    window.musicVisualizer = (index) => {
        analyser.getByteFrequencyData(frequencyData);

        return (frequencyData[index] / 256);
    }

    window.logVisualizer = () => {
        analyser.getByteFrequencyData(frequencyData);
        console.log(frequencyData.length, frequencyData);
    }

    video.onended = () => {
        audio.currentTime = 0;
        console.log("audio ended");
    };

    video.play();
}

window.addEventListener("load", () => {
    setVolume(0.4);
    document.querySelector(".music-volume").style.height = volume * 100 + "%";
})

window.music = new MenuPlugin("music")
    .register("Input URL", (plugin) => {
        console.log("Input URL");
        window.changeMenuInputURL("Input URL");
        window.openMenu('.menu-input');
        window.onkeyup = (event) => {
            if (window.menuStatus == "Input URL" && event.keyCode === 13) {
                let val = document.getElementById("field-input-URL").value;
                if (val != "") {
                    console.log("Input URL: ", val);
                    document.getElementById("field-input-URL").value = "";
                    window.closeMenu('.menu-input');
                    plugin.send("Input URL", val);
                }
            }
        }
    })
    .register("Input File", (plugin) => {
        console.log("Input File");
        const inputFile = document.getElementById('field-input-FILE');
        window.changeMenuInputFILE("Input File");
        inputFile.onchange = () => {
            let url = null;
            let fileObj = document.getElementById("field-input-FILE").files[0];
            console.log(fileObj)
            document.getElementById('file-status').innerText = fileObj.name;
            console.log("Input File: ", fileObj.path);
            window.closeMenu('.menu-input-file');
            //plugin.send("Input File", fileObj.path);
            let type = fileObj.type.split("/")[0];

            Mp4Size = fileObj.size;

            isFile = true;

            if (type == "audio") {
                hasVideo = false;
                playFromAudio(fileObj.path);
            }
            if (type == "video") {
                hasVideo = true;
                playFromVideo(fileObj.path);
            }
        }
        window.openMenu('.menu-input-file');
    })
    .register("Pause", (plugin) => {
        console.log("Pause");
        if (isAudio && !audio.paused) audio.pause();
        if (!isAudio && !video.paused) video.pause();
    })
    .register("Resume", (plugin) => {
        console.log("Resume");
        if (isAudio && audio.paused) audio.play();
        if (!isAudio && video.paused) video.play();
    })
    .register("Restart", (plugin) => {
        console.log("Restart");

        music.events["Pause"]();

        if (isAudio) audio.currentTime = 0;
        else video.currentTime = 0;

        music.events["Resume"]();
    })
    .register("Volume", (plugin) => {
        console.log("Volume");
        window.openMenu('.music-volume-container');
        window.onwheel = (event) => {
            if (event.deltaY < 0) volume < 0.96 ? addVolume(0.05) : setVolume(1);
            else if (event.deltaY > 0) volume > 0.04 ? addVolume(-0.05) : setVolume(0);
            document.querySelector(".music-volume").style.height = volume * 100 + "%";
        }
    })
    .register("Wallpaper", (plugin) => {
        console.log("Wallpaper");
        if (!isFile || (isFile && hasVideo)) {
            ipcRenderer.invoke("tool", {
                type: "Call Wallpaper",
                data: {
                    message: "TOGGLE",
                    currentTime: getCurrentTime(),
                    Mp4Size: Mp4Size,
                    isFile: isFile,
                    musicSrc: musicSrc
                }
            });
        }
    })
    .onData((event, data) => {
        data = data.data;
        if (data.error) {
            console.log(data.error);
        }
        if (data.info) {
            console.log(data.info);
            Mp4Size = data.format.contentLength;
            hasVideo = true;
            isFile = false;
            playFromAudio();
        }
    });