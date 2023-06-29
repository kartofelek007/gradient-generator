import { PubSub } from "./pubsub.js";
import { rgb2hex } from "./functions.js";

export class ColorLibrary {
    constructor(place, libraryID, colorPicker) {
        this.onColorSelect = new PubSub();
        this.onColorsChange = new PubSub();

        this.colorPicker = colorPicker;
        this.libraryID = libraryID;
        this.place = place;
        this.colors = [];
        this.readColorsFromStorage();
        this.createElement();
    }

    readColorsFromStorage() {
        if (localStorage.getItem(`colorPicker-${this.libraryID}`)) this.colors = JSON.parse(localStorage.getItem(`colorPicker-${this.libraryID}`));
    }

    createElement() {
        this.el = document.createElement("div");
        this.el.classList.add("color-library");

        const btnAdd = document.createElement("button");
        btnAdd.classList.add("color-library-add");
        btnAdd.type = "button";
        btnAdd.textContent = "+";
        this.el.append(btnAdd);

        btnAdd.addEventListener("click", () => {
            const color = this.colorPicker.getColor();
            const hex = rgb2hex(color.r, color.g, color.b);
            this.addColor(hex);
        });

        this.colorsDiv = document.createElement("div");
        this.colorsDiv.classList.add("color-library-colors");
        this.el.append(this.colorsDiv);

        this.place.append(this.el);
        this.createColors();
    }

    createColors() {
        this.colorsDiv.textContent = "";
        this.colors.forEach(color => this.createColorElement(color));
    }

    deleteColor(index) {
        this.colors.splice(index, 1);
        localStorage.setItem(`colorPicker-${this.libraryID}`, JSON.stringify(this.colors));
        this.onColorsChange.emit(this.colors);
        this.createColors();
    }

    addColor(color) {
        this.colors.push(color);
        localStorage.setItem(`colorPicker-${this.libraryID}`, JSON.stringify(this.colors));
        this.createColors();
        this.onColorsChange.emit(this.colors);
    }

    createColorElement(color) {
        const el = document.createElement("div");
        el.classList.add("color-library-el");
        el.style.background = color;
        el.addEventListener("click", () => {
            this.onColorSelect.emit(color);
        });

        const elDel = document.createElement("button");
        elDel.classList.add("color-library-el-delete");
        elDel.type = "button";
        elDel.textContent = "usuń";
        el.append(elDel);

        elDel.addEventListener("click", e => {
            e.preventDefault();
            e.stopPropagation();

            const elements = [...this.colorsDiv.querySelectorAll(".color-library-el")];
            const index = elements.indexOf(el);
            if (index !== -1) {
                this.deleteColor(index);
            }
        });

        this.colorsDiv.append(el);
    }

    updateColors() {
        if (localStorage.getItem(`colorPicker-${this.libraryID}`)) {
            this.colors = JSON.parse(localStorage.getItem(`colorPicker-${this.libraryID}`));
        }
        console.log(this.libraryID, this.colors);
        this.createColors();
    }
}