import { ColorSlider } from "./color-slider.js";
import { HueSlider } from "./hue-slider.js";
import { rgb2hex } from "./functions.js";
import { PubSub } from "./pubsub.js";
import { ColorLibrary } from "./color-library.js";

const allPickers = {};

export class ColorPicker {
    constructor(place, opts) {
        this.onButtonClick = new PubSub();
        this.onColorSelect = new PubSub();
        this.onLibraryColorsChange = new PubSub();
        this.onHueSelect = new PubSub();

        this.place = place; //miejsce do którego wstawimy nasz color-picker
        this.color = "#FF0000";

        this.options = {...{
            libraryID : "colors"
        }, ...opts};

        this.createElement();
        this.setColor(this.color);

        if (allPickers[this.options.libraryID] === undefined) allPickers[this.options.libraryID] = [];
        allPickers[this.options.libraryID].push(this);
    }

    createElement() {
        this.el = document.createElement("div");
        this.el.classList.add("color");

        this.place.append(this.el);

        this.hue = new HueSlider(this.el);
        this.canvas = new ColorSlider(this.el);

        //tworzę input
        this.input = document.createElement("input");
        this.input.classList.add("color-input");
        this.el.append(this.input);

        //po wpisaniu koloru do inputa sprawdzam czy jest on w poprawnym formacie
        //i w razie czego aktualizuję kolor w sliderach
        this.input.addEventListener("keyup", e => {
            if (e.key === "Enter") {
                if (/^#[a-fA-F0-9]{6}$/.test(this.input.value)) {
                    this.setColor(`${this.input.value}`);
                }
            }
        });

        //tworzę button
        this.button = document.createElement("button");
        this.button.classList.add("color-btn");
        this.button.textContent = "OK";
        this.button.type = "button";
        this.el.append(this.button);
        this.button.addEventListener("click", () => {
            this.onButtonClick.emit(this.color);
        });

        this.hue.onHueSelect.on(color => {
            const hex = rgb2hex(color.r, color.g, color.b);
            this.canvas.setBgGradient(hex);
            this.canvas.updatePickerColor();
            this.onHueSelect.emit(hex);
        });

        this.canvas.onColorSelect.on(color => {
            const hex = rgb2hex(color.r, color.g, color.b);
            this.color = hex;
            this.input.value = hex;
            this.onColorSelect.emit(this.color);
        });

        this.library = new ColorLibrary(this.el, this.options.libraryID, this.canvas);
        this.library.onColorSelect.on(color => {
            this.input.value = color;
            this.setColor(color);
        });
        this.library.onColorsChange.on(colors => {
            this.onLibraryColorsChange.emit(colors);
        });

        this.library.onColorsChange.on(colors => {
            this.onLibraryColorsChange.emit(colors);
            allPickers[this.options.libraryID].forEach(cp => cp.updateLibrary());
        });
    }

    setColor(color) {
        this.color = color;
        this.hue.setColor(color);
        this.canvas.setColor(color);
        this.input.value = color;
    }

    updateLibrary() {
        console.log("up");
        this.library.updateColors();
    }
}