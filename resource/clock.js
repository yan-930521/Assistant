/**
 * 參考：https://codepen.io/kaijulu/pen/bGELVrB?editors=0100
 */

const degToPi = Math.PI / 180;
class Clock {
    /**
     * 
     * @param {*} config
     * @param {Number} config.updateFPS 更新速度
     * @param {object} config.ctx canvas的ctx
     */
    constructor(config) {
        this.updateFPS = config.updateFPS || 60;
        this.ctx = config.ctx || null;
        // this.showMouse = config.showMouse || false;
        this.time = 0;

        this.mousePos = new Vec2(0, 0);;
        this.timer = null;
    
        this.cirs = [];
    }

    /**
     * 初始化時鐘
     */
    init = () => {
        // 實體圈
        let clock = this;
        this.cirs.push(
            new Circle({
                r: 100,
                color: "rgba(255,255,255,1)"
            })
        );
        //虛線圈
        this.cirs.push(
            new Circle({
                r: 170,
                lineTo: (obj, i) => {
                    return i % 2 == 0;
                },
                color: "rgba(255,255,255,1)"
            })
        );
        // 最內圈
        this.cirs.push(
            new Circle({
                r: 30,
                lineTo: (obj, i) => {
                    return !(i % 180 < 30);
                }
            })
        );
    
        //圈的某幾段有粗線
        this.cirs.push(
            new Circle({
                r: 140,
                getWidth: (obj, i) => {
                    return i % 150 < 50 ? 5 : 1;
                },
                color: "rgba(255,255,255,0.8)",
                anglePan: (obj, i) => {
                    return -40 * Math.sin(clock.time / 400);
                }
            })
        );
        //有刻度的圈
        this.cirs.push(
            new Circle({
                r: 250,
                lineTo: (obj, i) => {
                    return false;
                },
                anglePan: (obj, i) => {
                    return 40 * Math.sin(clock.time / 200);
                },
                vertical: true,
                getVerticalWidth: (obj, i) => {
                    if (i % 10 == 0) {
                        return 10;
                    }
                    if (i % 5 == 0) {
                        return 5;
                    }
                    return 2;
                },
                color: "rgba(255,255,255,0.8)"
            })
        );

        //只有七個刻度
        this.cirs.push(
            new Circle({
                r: 230,
                lineTo: function (obj, i) {
                    return i % 50 == 0;
                },
                getWidth: function (obj, i) {
                    return 10;
                },
                anglePan: function (obj, i) {
                    return (-clock.time / 20);
                },
                color: "rgba(255,255,255,0.8)"
            })
        );

        //音樂
        this.cirs.push(
            new Circle({
                r: 240,
                lineTo: function (obj, i) {
                    return false;
                },
                getWidth: function (obj, i) {
                    return 5;
                },
                vertical: true,
                getVerticalWidth(obj, i) {
                    if(i % 3 == 0) return window.musicVisualizer ? window.musicVisualizer(i / 3) * -50 : 0;
                    return 0;
                },
                anglePan: function (obj, i) {
                    
                    return (clock.time / 20);
                },
                color: "rgba(255,255,255,0.8)"
            })
        );
    }

    start = () => {
        this.init();
        requestAnimationFrame(this.draw);
        setInterval(this.update, 1000 / this.updateFPS);
    }

    update = () => {
        this.time++;
    }

    draw = () => {
        //清空背景
        this.ctx.clearRect(0, 0, ww, wh);

        //-------------------------
        //   在這裡繪製
        this.ctx.save();
        this.ctx.translate(ww / 2, wh / 2);
        this.cirs.forEach((cir) => {
            this.ctx.save();
            //滑鼠移動到圈圈時會偏移
            let pan = this.mousePos.sub(new Vec2(ww / 2, wh / 2)).mul(2 / cir.r);
            this.ctx.translate(pan.x, pan.y);
            cir.draw();
            this.ctx.restore();
        });
        this.ctx.fillStyle = "white";
        this.ctx.fillText(Date.now(), 5, -5);

        let h = new Date().getHours();
        let m = new Date().getMinutes();
        let s = new Date().getSeconds();

        let angleHour = ((degToPi * 360) / 12) * h - Math.PI / 2;
        let hourX = 35 * Math.cos(angleHour);
        let hourY = 35 * Math.sin(angleHour)
        this.ctx.beginPath();
        this.ctx.moveTo(hourX * 0.9, hourY * 0.9);
        this.ctx.lineTo(hourX, hourY);
        this.ctx.lineWidth = 10;
        this.ctx.strokeStyle = "white";
        this.ctx.stroke();

        let angleMinute = ((degToPi * 360) / 60) * m - Math.PI / 2;
        let minuteX = 50 * Math.cos(angleMinute);
        let minuteY = 50 * Math.sin(angleMinute)
        this.ctx.beginPath();
        this.ctx.moveTo(minuteX * 0.9, minuteY * 0.9);
        this.ctx.lineTo(minuteX, minuteY);
        this.ctx.lineWidth = 10;
        this.ctx.strokeStyle = "white";
        this.ctx.stroke();

        let angleSecond = ((degToPi * 360) / 60) * s - Math.PI / 2;
        let secondX = 90 * Math.cos(angleSecond);
        let secondY = 90 * Math.sin(angleSecond)
        this.ctx.beginPath();
        this.ctx.moveTo(secondX * 0.9, secondY * 0.9);
        this.ctx.lineTo(secondX, secondY);
        this.ctx.lineWidth = 10;
        this.ctx.strokeStyle = "white";
        this.ctx.stroke();

        this.ctx.restore();

        //-----------------------
        /* 繪製滑鼠座標
        if (showMouse) {
            ctx.fillStyle = "red";
            ctx.beginPath();
            ctx.circle(mousePos, 3);
            ctx.fill();

            ctx.save();
            ctx.beginPath();
            ctx.translate(mousePos.x, mousePos.y);
            ctx.strokeStyle = "red";
            let len = 20;
            ctx.line(new Vec2(-len, 0), new Vec2(len, 0));
            ctx.fillText(mousePos, 10, -10);
            ctx.rotate(Math.PI / 2);
            ctx.line(new Vec2(-len, 0), new Vec2(len, 0));
            ctx.stroke();
            ctx.restore();
        }*/

        requestAnimationFrame(this.draw);
    }

    onMouseMove = (eX, eY) => {
        if(Math.pow(((ww / 2) - eX), 2) + Math.pow(((wh / 2) - eY), 2) < 40000) {
            clearInterval(this.timer);
            this.timer = null;
            this.mousePos.set(eX, eY);
        } else {
            if(this.timer) return;
            let x = eX, targetX = ww / 2;
            let y = eY, targetY = wh / 2;
            this.timer = setInterval(() => {
                if(targetX > x) x += (targetX - x) * 0.02;
                if(targetX < x) x += (targetX - x) * 0.02;
                if(targetY > y) y += (targetY - y) * 0.02;
                if(targetY < y) y += (targetY - y) * 0.02;
                this.mousePos.set(x, y);
            }, 10);
        }
    }
}

class Vec2 {
    constructor(x, y) {
        this.x = x || 0;
        this.y = y || 0;
    }
    set(x, y) {
        this.x = x;
        this.y = y;
    }
    move(x, y) {
        this.x += x;
        this.y += y;
    }
    add(v) {
        return new Vec2(this.x + v.x, this.y + v.y);
    }
    sub(v) {
        return new Vec2(this.x - v.x, this.y - v.y);
    }
    mul(s) {
        return new Vec2(this.x * s, this.y * s);
    }
    get length() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    set length(nv) {
        let temp = this.unit.mul(nv);
        this.set(temp.x, temp.y);
    }
    clone() {
        return new Vec2(this.x, this.y);
    }
    toString() {
        return `(${this.x}, ${this.y})`;
    }
    equal(v) {
        return this.x == v.x && this.y == v.y;
    }
    //計算角度
    get angle() {
        return Math.atan2(this.y, this.x);
    }
    //計算單位向量
    get unit() {
        return this.mul(1 / this.length);
    }
}

class Circle {
    constructor(args) {
        let def = {
            p: new Vec2(0, 0),
            r: 100,
            color: "white",
            lineTo: function (obj, i) {
                return true;
            },
            getWidth: function (obj, i) {
                return 1;
            },
            anglePan: function (obj, i) {
                return 0;
            },
            vertical: false,
            getVerticalWidth: function (obj, i) {
                return 2;
            },
            ramp: 0
        };
        Object.assign(def, args);
        Object.assign(this, def);
    }
    draw() {
        ctx.beginPath();
        for (var i = 1; i <= 360; i++) {
            let angle1 = i + this.anglePan();
            let angle2 = i - 1 + this.anglePan();
            let use_r = this.r + this.ramp * Math.sin(i / 10);
            let use_r2 = this.r + this.ramp * Math.sin((i - 1) / 10);

            let x1 = use_r * Math.cos(angle1 * degToPi);
            let y1 = use_r * Math.sin(angle1 * degToPi);
            let x2 = use_r2 * Math.cos(angle2 * degToPi);
            let y2 = use_r2 * Math.sin(angle2 * degToPi);

            if (this.lineTo(this, i)) {
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.strokeStyle = this.color;
                ctx.lineWidth = this.getWidth(this, i);
                ctx.stroke();
            }
            if (this.vertical) {
                let l = this.getVerticalWidth(this, i);
                let x3 = (use_r + l) * Math.cos(angle1 * degToPi);
                let y3 = (use_r + l) * Math.sin(angle1 * degToPi);

                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x3, y3);
                ctx.strokeStyle = this.color;
                ctx.stroke();
            }
        }
    }
}