const ColorPicker = (() => {
    function clamp(nr, min, max) {
        return Math.min(Math.max(nr, min), max);
    }

    function disableSelect(disable = false) {
        document.body.style.userSelect = disable ? "none" : "auto";
    }

    function rgb2hex(r, g, b) {
        return "#" + ( ( 1 << 24 ) + ( r << 16 ) + ( g << 8 ) + b ).toString(16).slice(1);
    }

    function hex2rgb(hex) {
        hex = parseInt(( ( hex.indexOf('#') > -1 ) ? hex.substring(1) : hex ), 16);
        return {
            r: hex >> 16,
            g: ( hex & 0x00FF00 ) >> 8,
            b: ( hex & 0x0000FF )
        };
    }

    function rgb2hsl(r, g, b) {
        r /= 255, g /= 255, b /= 255;
        let max = Math.max(r, g, b),
            min = Math.min(r, g, b);
        let h, s, l = ( max + min ) / 2;

        if (max == min) {
            h = s = 0; // achromatic
        } else {
            let d = max - min;
            s = l > 0.5 ? d / ( 2 - max - min ) : d / ( max + min );
            switch (max) {
                case r:
                    h = ( g - b ) / d + ( g < b ? 6 : 0 );
                    break;
                case g:
                    h = ( b - r ) / d + 2;
                    break;
                case b:
                    h = ( r - g ) / d + 4;
                    break;
            }
            h /= 6;
        }

        return [h, s, l];
    }

    function hsl2rgb(h, s, l) {
        let r, g, b;

        if (s == 0) {
            r = g = b = l; // achromatic
        } else {
            let hue2rgb = function hue2rgb(p, q, t) {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1 / 6) return p + ( q - p ) * 6 * t;
                if (t < 1 / 2) return q;
                if (t < 2 / 3) return p + ( q - p ) * ( 2 / 3 - t ) * 6;
                return p;
            }

            let q = l < 0.5 ? l * ( 1 + s ) : l + s - l * s;
            let p = 2 * l - q;
            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
        }
        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    }

    function hex2hsb(hex) {
        const hsb = rgb2hsb(hex2rgb(hex));
        if (hsb.s === 0) hsb.h = 360;
        return hsb;
    }

    function rgb2hsb(rgb) {
        const hsb = {
            h: 0,
            s: 0,
            b: 0
        };
        const min = Math.min(rgb.r, rgb.g, rgb.b);
        const max = Math.max(rgb.r, rgb.g, rgb.b);
        const delta = max - min;
        hsb.b = max;
        hsb.s = max !== 0 ? 255 * delta / max : 0;
        if (hsb.s !== 0) {
            if (rgb.r === max) {
                hsb.h = ( rgb.g - rgb.b ) / delta;
            } else if (rgb.g === max) {
                hsb.h = 2 + ( rgb.b - rgb.r ) / delta;
            } else {
                hsb.h = 4 + ( rgb.r - rgb.g ) / delta;
            }
        } else {
            hsb.h = -1;
        }
        hsb.h *= 60;
        if (hsb.h < 0) {
            hsb.h += 360;
        }
        hsb.s *= 100 / 255;
        hsb.b *= 100 / 255;
        return hsb;
    }

    class PubSub {
        constructor() {
            this.subscribers = [];
        }

        on(fn) {
            this.subscribers.push(fn);
        }

        off(fn) {
            this.subscribers = this.subscribers.filter(el => el !== fn);
        }

        emit(data) {
            this.subscribers.forEach(el => el(data));
        }
    }

    class HueSlider {
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
            })

            document.addEventListener("mousemove", e => {
                if (this.dragged) this.drag(e);
            })

            document.addEventListener("mouseup", e => {
                this.dragged = false;
            })
        }

        drag(e) {
            const g = this.canvas.getBoundingClientRect();

            let x = clamp(e.pageX - g.left, 0, g.width);
            let y = clamp(e.pageY - g.top, 0, g.height);

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

    class ColorSlider {
        constructor(place) {
            this.onColorSelect = new PubSub();

            this.place = place;
            this.dragged = false;
            this.cursorPos = {x : 0, y : 0};
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
            this.ctx.fillStyle = bgColor; //wpierw nakładamy odpowiedni kolor

            //potem pionowy gradient - od białego do przezroczystego
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            let gradientH = this.ctx.createLinearGradient(0, 0, this.canvas.width, 0);
            gradientH.addColorStop(0.01, "#fff");
            gradientH.addColorStop(0.99, "rgba(255,255,255, 0)");
            this.ctx.fillStyle = gradientH;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            //potem pionowy gradient - od przezroczystości do czarnego
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
            this.canvas.addEventListener('mousedown', e => {
                this.dragged = true;
                this.drag(e);
            })

            document.addEventListener("mousemove", e => {
                if (this.dragged) this.drag(e);
            })

            document.addEventListener("mouseup", e => {
                this.dragged = false;
            })
        }

        setColor(color) {
            this.color = color;

            const colorRGB = hex2rgb(color);
            const hslColor = rgb2hsl(colorRGB.r, colorRGB.g, colorRGB.b);
            const hue = hslColor[0] * 360;
            const newHueRgb = hsl2rgb(hue/360, 1, 0.5);
            const newHueRgbText = `rgb(${newHueRgb.join(',')})`;

            this.setBgGradient(newHueRgbText);

            const hsb = hex2hsb(color);
            const x = clamp(Math.ceil(hsb.s / (100 / this.canvas.width)), 0, this.canvas.width - 1);
            const y = clamp(this.canvas.height - Math.ceil(hsb.b / (100 / this.canvas.height)), 0, this.canvas.height);

            this.cursorPos = {x, y}

            this.updatePickerColor();
        }

        getColor() {
            const pixel = this.ctx.getImageData(this.cursorPos.x, this.cursorPos.y, 1, 1).data;   // Read pixel Color
            const rgb = `rgb(${pixel[0]},${pixel[1]},${pixel[2]})`;
            return {
                rgb : rgb,
                r : pixel[0],
                g : pixel[1],
                b : pixel[2]
            };
        }
    }

    class ColorLibrary {
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

            btnAdd.addEventListener("click", e => {
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
            this.colors.forEach(color => this.createColorElement(color))
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
            el.addEventListener("click", e => {
                this.onColorSelect.emit(color);
            })

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
                    this.deleteColor(index)
                }
            })

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

    const allPickers = {}

    class ColorPicker {
        constructor(place, opts) {
            this.onButtonClick = new PubSub();
            this.onColorSelect = new PubSub();
            this.onLibraryColorsChange = new PubSub();

            this.place = place; //miejsce do którego wstawimy nasz color-picker
            this.color = "#FF0000";

            this.options = {...{
                libraryID : "colors",
                showLibrary : true,
                showInput : true,
                showButton : true
            }, ...opts}

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
            if (this.options.showInput) {
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
                })
            }

            //tworzę button
            if (this.options.showButton) {
                this.button = document.createElement("button");
                this.button.classList.add("color-btn");
                this.button.textContent = "Close";
                this.button.type = "button";
                this.el.append(this.button);
                this.button.addEventListener("click", e => {
                    this.onButtonClick.emit(this.color);
                })
            }

            this.hue.onHueSelect.on(color => {
                this.canvas.setBgGradient(rgb2hex(color.r, color.g, color.b));
                this.canvas.updatePickerColor();
            })

            this.canvas.onColorSelect.on(color => {
                const hex = rgb2hex(color.r, color.g, color.b);
                this.color = hex;
                if (this.options.showInput) this.input.value = hex;
                this.onColorSelect.emit(this.color);
            })

            if (this.options.showLibrary) {
                this.library = new ColorLibrary(this.el, this.options.libraryID, this.canvas);
                this.library.onColorSelect.on(color => {
                    this.input.value = color;
                    this.setColor(color);
                });
                this.library.onColorsChange.on(colors => {
                    this.onLibraryColorsChange.emit(colors);
                })
                this.library.onColorsChange.on(colors => {
                    this.onLibraryColorsChange.emit(colors);
                    allPickers[this.options.libraryID].forEach(cp => cp.updateLibrary())
                })
            }
        }

        setColor(color) {
            this.color = color;
            this.hue.setColor(color);
            this.canvas.setColor(color);
            if (this.options.showInput) this.input.value = color;
        }

        updateLibrary() {
            if (this.options.showLibrary) this.library.updateColors();
        }
    }

    return ColorPicker;
})();