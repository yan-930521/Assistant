# Assistant
使用electron.js打造的桌面助理<br>

## 選單
<img src="./resource/1.png"><br>

### explore
<img src="./resource/2.png"><br>
- Get Weather<br>
    使用中央氣象局的api取的目前的天氣預報
    <img src="./resource/5.png"><br>
 
### device
<img src="./resource/4.png"><br>
- System Info<br>
    使用[systeminformation](https://github.com/sebhildebrandt/systeminformation)獲取系統訊息，並分批上傳前端，顯示在獨立畫面
- Device State<br>
    使用[systeminformation](https://github.com/sebhildebrandt/systeminformation)獲取狀態，每5秒更新一次

### music
<img src="./resource/3.png"><br>
- Input URL <br>
    播放輸入的youtube影片(目前不支援歌單)<br>
    在後端使用[ytdl](https://github.com/fent/node-ytdl-core)取得mp3影片，並且及時串流回前端(使用[express](https://github.com/<br>expressjs/express)、[ffmepg](https://ffmpeg.org/))，並控制canvas渲染頻率圖
    <img src="./resource/6.png"><br>
    <img src="./resource/8.png"><br>
- Pause
- Resume
- Restart
- Volume<br>
    觸發之後，畫面中心會出現音量調，使用滾輪來控制音量加減，步進單位為5%，最高100%
    <img src="./resource/7.png"><br>
- Wallpaper<br>
    切換背景，預設為星空
    <img src="./resource/9.png"><br>
  
## 已知問題
有時會在隨機時間後結束播放<br>
https://stackoverflow.com/questions/67888365/error-output-stream-closed-when-trying-to-stream-to-express-server-using-ffmpeg