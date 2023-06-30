import { rgb2hsl, clamp, hex2rgb } from "./functions.js";
import { PubSub } from "./pubsub.js";

export class HueSlider {
    constructor(place) {
        this.onHueSelect = new PubSub();

        this.place = place; //miejsce do którego wrzucimy element
        this.dragged = false; //czy rozpoczęto przeciąganie suwaka
        this.cursorPos = {x : 0, y : 0}; //pozycja wskaźnika

        this.createElement(); //tworzymy wszystkie elementy
        this.setBgGradient(); //ustawiamy gradient dla tła suwaka
        this.bindEvents(); //podpinamy zdarzenia
    }

    createElement() {
        this.el = document.createElement("div");
        this.el.classList.add("color-hue");

        //gradientowe tło
        this.canvas = document.createElement("canvas");
        this.canvas.classList.add("color-hue-canvas");
        this.el.append(this.canvas);

        //wskaźnik
        this.dragEl = document.createElement("div");
        this.dragEl.classList.add("color-hue-drag");
        this.el.append(this.dragEl);

        this.place.append(this.el);

        //ustawiamy szerokość i pobieramy kontekst canvasu
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
        this.ctx = this.canvas.getContext("2d");
    }

    setBgGradient() {
        const gradientHue = this.ctx.createLinearGradient(0, 0, this.canvas.width, 0);
        gradientHue.addColorStop(0, "red");
        gradientHue.addColorStop(0.17, "yellow");
        gradientHue.addColorStop(0.33, "lime");
        gradientHue.addColorStop(0.5, "cyan");
        gradientHue.addColorStop(0.66, "blue");
        gradientHue.addColorStop(0.83, "magenta");
        gradientHue.addColorStop(1, "red");
        this.ctx.fillStyle = gradientHue;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    bindEvents() {
        this.canvas.addEventListener("mousedown", e => {
            this.dragged = true;
            this.drag(e);
        });

        document.addEventListener("mousemove", e => {
            if (this.dragged) this.drag(e);
        });

        document.addEventListener("mouseup", e => {
            this.dragged = false;
        });
    }

    drag(e) {
        const g = this.canvas.getBoundingClientRect();

        let x = clamp(e.pageX - (g.left + window.scrollX), 0, g.width);

        this.cursorPos.x = Math.abs(x);

        if (this.cursorPos.x > this.canvas.width - 1) {
            this.cursorPos.x = this.canvas.width - 1;
        }

        this.cursorPos.y = g.height / 2;

        const color = this.getColor();

        this.dragEl.style.left = `${x}px`;
        this.dragEl.style.background = color.rgb;
        this.onHueSelect.emit(color);
    }

    setColor(color) {
        const colorRGB = hex2rgb(color);
        const hslColor = rgb2hsl(colorRGB.r, colorRGB.g, colorRGB.b);

        const hue = hslColor[0] * 360;
        const percent = hue / 360 * 100;

        this.cursorPos.x = Math.round(this.canvas.width * percent / 100);
        this.dragEl.style.left = `${this.cursorPos.x}px`;

        const colorGet = this.getColor();
        this.dragEl.style.background = colorGet.rgb;
        this.onHueSelect.emit(colorGet);
    }

    getColor() {
        const pixel = this.ctx.getImageData(this.cursorPos.x, this.cursorPos.y, 1,1).data;
        const rgb = `rgb(${pixel[0]},${pixel[1]},${pixel[2]})`;
        return {
            rgb : rgb,
            r : pixel[0],
            g : pixel[1],
            b : pixel[2]
        };
    }
}