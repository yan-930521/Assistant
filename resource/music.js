var { ipcRenderer } = require('electron');
var audio = new Audio();
const music = {
    events: {
        "Input URL": () => {
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
                        ipcRenderer.on("music", (event, data) => {
                            data = data.data;
                            if (data.error) {
                                console.log(data.error);
                            }
                            if (data.info) {
                                console.log(data.info);
                                audio.src = "http:/localhost:3030/music2.mp3";
                                audio.load();
                                let ctx = new AudioContext();
                                let audioSrc = ctx.createMediaElementSource(audio);
                                let analyser = ctx.createAnalyser();

                                audioSrc.connect(analyser);

                                analyser.connect(ctx.destination);

                                analyser.fftSize = 512;

                                let frequencyData = new Uint8Array(analyser.frequencyBinCount);

                                window.musicVisualizer = (index) => {
                                    analyser.getByteFrequencyData(frequencyData);
                                    
                                    return (frequencyData[index] / 256);
                                }

                                window.logVisualizer = () => {
                                    analyser.getByteFrequencyData(frequencyData);
                                    console.log(frequencyData.length, frequencyData);
                                }

                                audio.addEventListener("ended", function(){
                                    audio.currentTime = 0;
                                    console.log("audio ended");
                               });

                                audio.play();
                            }
                        });

                        ipcRenderer.send("music", {
                            type: "Input URL",
                            data: val
                        });
                    }
                }
            }
        },
        "Pause": () => {
            console.log("Pause");
            if(audio && !audio.paused) audio.pause();
        },
        "Resume": () => {
            console.log("Resume");
            if(audio && audio.paused) audio.play();
        },
        "Restart": () => {
            console.log("Restart");
            if(audio) {
                music.events["Pause"]();
                audio.currentTime = 0;
                music.events["Resume"]();
            }
        },
        "Volume": () => {
            console.log("Volume");
            window.openMenu('.music-volume-container');
            window.onwheel = (event) => {
                if(event.deltaY < 0 )  audio.volume < 0.96 ? audio.volume += 0.05 : audio.volume = 1;
                else if(event.deltaY > 0) audio.volume > 0.04 ? audio.volume -= 0.05 : audio.volume = 0;
                document.querySelector(".music-volume").style.height = audio.volume * 100 + "%";
            }
        }
    },
    onEvent: (event) => {
        window.menuStatus = event;
        window.closeAllSubMenu();
        music.events[event]();
    },
    handleHTML: () => {
        const htmlTemplate = `<li id="EVENT" onclick='music.onEvent("EVENT");'>EVENT</li>`;
        let htmls = "";
        for (let event in music.events)
            htmls += htmlTemplate.replaceAll("EVENT", event);
        return htmls;
    }
}

window.music = music;
