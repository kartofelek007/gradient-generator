import { rgb2hsl, hsl2rgb, hex2hsb, hex2rgb, clamp } from "./functions.js";
import { PubSub } from "./pubsub.js";

export class ColorSlider {
    constructor(place) {
        this.onColorSelect = new PubSub();

        this.place = place;
        this.dragged = false;
        this.cursorPos = {x: 0, y: 0};
        this.createElement();
        this.setBgGradient();
        this.bindEvents();
    }

    createElement() {
        this.el = document.createElement("div");
        this.el.classList.add("color-canvas");

        this.canvas = document.createElement("canvas");
        this.canvas.classList.add("color-canvas-canvas");
        this.el.append(this.canvas);

        this.dragEl = document.createElement("div");
        this.dragEl.classList.add("color-canvas-drag");
        this.el.append(this.dragEl);

        this.place.append(this.el);

        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
        this.ctx = this.canvas.getContext("2d");
    }

    setBgGradient(bgColor) {
        this.ctx.fillStyle = bgColor; // wpierw nakładamy odpowiedni kolor

        // potem pionowy gradient - od białego do przezroczystego
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        let gradientH = this.ctx.createLinearGradient(0, 0, this.canvas.width, 0);
        gradientH.addColorStop(0.01, "#fff");
        gradientH.addColorStop(0.99, "rgba(255,255,255, 0)");
        this.ctx.fillStyle = gradientH;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // potem pionowy gradient - od przezroczystości do czarnego
        let gradientV = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradientV.addColorStop(0.1, "rgba(0,0,0,0)");
        gradientV.addColorStop(0.99, "#000");
        this.ctx.fillStyle = gradientV;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    updatePickerColor() {
        this.dragEl.style.left = `${this.cursorPos.x}px`;
        this.dragEl.style.top = `${this.cursorPos.y}px`;
        this.color = this.getColor();
        this.dragEl.style.background = this.color.rgb;
    }

    drag(e) {
        const g = this.canvas.getBoundingClientRect();

        let x = clamp(e.pageX - (g.left + window.scrollX), 0, g.width);
        let y = clamp(e.pageY - (g.top + window.scrollY), 0, g.height);

        this.cursorPos.y = Math.abs(y);
        this.cursorPos.x = Math.abs(x);

        if (this.cursorPos.x > this.canvas.width - 1) {
            this.cursorPos.x = this.canvas.width - 1;
        }

        this.color = this.getColor();
        this.updatePickerColor();

        this.onColorSelect.emit(this.color);
    }

    bindEvents() {
        this.canvas.addEventListener("mousedown", e => {
            this.dragged = true;
            this.drag(e);
        });

        document.addEventListener("mousemove", e => {
            if (this.dragged) this.drag(e);
        });

        document.addEventListener("mouseup", () => {
            this.dragged = false;
        });
    }

    setColor(color) {
        this.color = color;

        const colorRGB = hex2rgb(color);
        const hslColor = rgb2hsl(colorRGB.r, colorRGB.g, colorRGB.b);
        const hue = hslColor[0] * 360;
        const newHueRgb = hsl2rgb(hue/360, 1, 0.5);
        const newHueRgbText = `rgb(${newHueRgb.join(",")})`;

        this.setBgGradient(newHueRgbText);

        const hsb = hex2hsb(color);
        const x = clamp(Math.ceil(hsb.s / (100 / this.canvas.width)), 0, this.canvas.width - 1);
        const y = clamp(this.canvas.height - Math.ceil(hsb.b / (100 / this.canvas.height)), 0, this.canvas.height);

        this.cursorPos = {x, y};

        this.updatePickerColor();
    }

    getColor() {
        const pixel = this.ctx.getImageData(this.cursorPos.x, this.cursorPos.y, 1, 1).data;
        const rgb = `rgb(${pixel[0]},${pixel[1]},${pixel[2]})`;
        return {
            rgb: rgb,
            r: pixel[0],
            g: pixel[1],
            b: pixel[2]
        };
    }
}