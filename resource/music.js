var audio = new Audio();
var audioContext = new AudioContext();
var audioSrc = audioContext.createMediaElementSource(audio);
var analyser = audioContext.createAnalyser();

audioSrc.connect(analyser);
analyser.connect(audioContext.destination);

analyser.fftSize = 512;


window.music = new MenuPlugin("music")
    .register("Input URL", (plugin) => {
        console.log("Input URL");
        window.changeMenuInput("Input URL");
        window.openMenu('.menu-input');
        window.onkeyup = (event) => {
            if (window.menuStatus == "Input URL" && event.keyCode === 13) {
                let val = document.getElementById("field-input").value;
                if (val != "") {
                    console.log("Input URL: ", val);
                    document.getElementById("field-input").value = "";
                    window.closeMenu('.menu-input');
                    plugin.send("Input URL", val);
                }
            }
        }
    })
    .register("Pause", (plugin) => {
        console.log("Pause");
        if (audio && !audio.paused) audio.pause();
    })
    .register("Resume", (plugin) => {
        console.log("Resume");
        if (audio && audio.paused) audio.play();
    })
    .register("Restart", (plugin) => {
        console.log("Restart");
        if (audio) {
            music.events["Pause"]();
            audio.currentTime = 0;
            music.events["Resume"]();
        }
    })
    .register("Volume", (plugin) => {
        console.log("Volume");
        window.openMenu('.music-volume-container');
        window.onwheel = (event) => {
            if (event.deltaY < 0) audio.volume < 0.96 ? audio.volume += 0.05 : audio.volume = 1;
            else if (event.deltaY > 0) audio.volume > 0.04 ? audio.volume -= 0.05 : audio.volume = 0;
            document.querySelector(".music-volume").style.height = audio.volume * 100 + "%";
        }
    })
    .onData((event, data) => {
        data = data.data;
        if (data.error) {
            console.log(data.error);
        }
        if (data.info) {
            console.log(data.info);
            audio.src = "http:/localhost:3030/music2.mp3";
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
    });