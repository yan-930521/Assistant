var audio = new Audio();
var audioContext = new AudioContext();
var audioSrc = audioContext.createMediaElementSource(audio);
var analyser = audioContext.createAnalyser();

var video = document.createElement("video");
var videoSrc = audioContext.createMediaElementSource(video);

audioSrc.connect(analyser);
videoSrc.connect(analyser);

analyser.connect(audioContext.destination);

// analyser.fftSize = 512;
analyser.fftSize = 16384;

var volume = 0.4;

const playStatus = {
    Mp4Size: 0,
    Mp3Size: 0,
    isFile: false,
    fileSrc: "",
    fileType: "",
    isAudio: null,
}

const getCurrentTime = () => {
    if (playStatus.isAudio) return audio.currentTime;
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

const initSetting = async () => {
    window.setting = await ipcRenderer.invoke("tool", {
        type: "Get Setting",
        data: {}
    });
}

initSetting();

const playFromAudio = (url = null) => {
    playStatus.fileSrc = url || window.setting ? ( "http:/localhost:port/musicrange.mp3".replace("port", window.setting.port)) : "http:/localhost:port/musicrange.mp3";

    if (playStatus.isAudio == false && !video.paused) {
        video.pause();
        video.currentTime = 0;
    }

    playStatus.isAudio = true;

    audio.src = url + "?contentLength=" + playStatus.Mp3Size;
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

    window.sendAudioData = () => {
        analyser.getByteFrequencyData(frequencyData);
        ipcRenderer.invoke("tool", {
            type: "Call Floor",
            data: {
                message: "AUDIO SOURCE",
                frequencyData
            }
        });
    }
    


    audio.onended = () => {
        audio.currentTime = 0;
        console.log("audio ended");
    };

    audio.play();
}

const playFromVideo = (url) => {
    playStatus.fileSrc = url;

    if (playStatus.isAudio && !audio.paused) {
        audio.pause();
        audio.currentTime = 0;
    }

    playStatus.isAudio = false;

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

    window.sendAudioData = () => {
        analyser.getByteFrequencyData(frequencyData);
        ipcRenderer.invoke("tool", {
            type: "Call Floor",
            data: {
                message: "AUDIO SOURCE",
                frequencyData
            }
        });
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
            let fileObj = document.getElementById("field-input-FILE").files[0];
            console.log(fileObj)
            document.getElementById('file-status').innerText = fileObj.name;
            console.log("Input File: ", fileObj.path);
            window.closeMenu('.menu-input-file');
            //plugin.send("Input File", fileObj.path);
            let type = fileObj.type.split("/")[0];

            playStatus.Mp4Size = fileObj.size;
            playStatus.isFile = true;
            playStatus.fileType = type;

            if (type == "audio") {
                playFromAudio(fileObj.path);
            }
            if (type == "video") {
                playFromVideo(fileObj.path);
            }

            if (type == "image") {
                playStatus.fileSrc = fileObj.path;
            }
        }
        window.openMenu('.menu-input-file');
    })
    .register("Pause", (plugin) => {
        console.log("Pause");
        if (playStatus.isAudio && !audio.paused) audio.pause();
        if (!playStatus.isAudio && !video.paused) video.pause();
    })
    .register("Resume", (plugin) => {
        console.log("Resume");
        if (playStatus.isAudio && audio.paused) audio.play();
        if (!playStatus.isAudio && video.paused) video.play();
    })
    .register("Restart", (plugin) => {
        console.log("Restart");

        music.events["Pause"]();

        if (playStatus.isAudio) audio.currentTime = 0;
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
        if (!playStatus.isFile || (playStatus.isFile && playStatus.fileType != "audio")) {
            ipcRenderer.invoke("tool", {
                type: "Call Wallpaper",
                data: {
                    message: "TOGGLE",
                    currentTime: getCurrentTime(),
                    Mp4Size: playStatus.Mp4Size,
                    isFile: playStatus.isFile,
                    fileSrc: playStatus.fileSrc,
                    fileType: playStatus.fileType
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
            playStatus.Mp4Size = data.format.video.contentLength;
            playStatus.Mp3Size = data.format.audio.contentLength;
            playStatus.isFile = false;
            playStatus.fileType = "video"
            playFromAudio();
        }
    });