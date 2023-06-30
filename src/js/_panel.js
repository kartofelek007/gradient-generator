import {storage} from './_storage';
import {canvas} from './_canvas';
import {generateGradient, getColorOfGradient} from './_functions';
import './color-picker/css/style.css';
import {ColorPicker} from './color-picker/js/colorpicker';
import {events} from './_events';
import {popup} from './_popup';
import {gsap} from "gsap";
import {Flip} from "gsap/Flip";
import {hex2rgb, rgb2hsl} from './lib/_colors-fn';

gsap.registerPlugin(Flip);

const DOM = {};
DOM.panel = document.querySelector('.panel');
DOM.panelList = DOM.panel.querySelector('.panel-list');
DOM.placeBgColor = DOM.panel.querySelector('.panel-bg-color-select');
DOM.btnAdd = document.querySelector('#panelAdd');
DOM.btnPanelToggle = document.querySelector('.panel-btn-toggle');
DOM.btnShowPopup = document.querySelector('.panel-btn-code');
DOM.btnBgColorClear = document.querySelector('.panel-btn-bg-color-clear');
DOM.btnClearAll = document.querySelector(".panel-btn-clear-all");
DOM.btnSaveToFile = document.querySelector(".panel-btn-save-to-file");
DOM.btnHelp = document.querySelector(".panel-btn-help");
DOM.popupHelp = document.querySelector("#popupHelp");
DOM.popupCode = document.querySelector("#popupCode");
DOM.finalCode = document.querySelector("#finalCode");

/**
 * generuje cały panel (wszystkie rzędy)
 */
function generatePanel() {
    DOM.panelList.innerHTML = '';
    for (let el of storage.current.gradients) {
        el.elements.row = generatePanelRow(el);
    }
}

/**
 * Generuje pojedynczy rząd panelu
 * @param {object} gradient
 * @returns HTMLElement
 */
function generatePanelRow(gradient) {
    const div = document.createElement('div');
    div.classList.add('panel-row');
    div.dataset.nr = gradient.nr;
    const color = getColorOfGradient(gradient, true);

    div.innerHTML = `
        <div class="panel-input-group panel-input-group-0">
            <div class="panel-row-color-select" style="background-color: ${color}"><span>${gradient.nr}</span></div>
        </div>
        <div class="panel-input-group panel-input-group-1">
            <span class="panel-label">x</span>
            <input class="panel-input-x" data-key="x" type="range" min="0" max="100" value="${gradient.x}">
        </div>
        <div class="panel-input-group panel-input-group-2">
            <span class="panel-label">y</span>
            <input class="panel-input-y" data-key="y" type="range" min="0" max="100" value="${gradient.y}">
        </div>
        <div class="panel-input-group panel-input-group-3">
            <span class="panel-label">size</span>
            <input class="panel-input-size" data-key="size" type="range" min="1" max="200" value="${gradient.size}" />
        </div>
        <div class="panel-input-group panel-input-group-4">
            <span class="panel-label">transparent</span>
            <input class="panel-input-transparent" data-key="transparent" type="range" min="0" max="100" value="${gradient.transparent}" />
        </div>
        <div class="panel-input-group panel-input-group-6">
            <span class="panel-label">blur</span>
            <input class="panel-input-blur" data-key="blur" type="range" min="0" max="100" value="${gradient.blur}" />
        </div>
        <div class="panel-input-group panel-input-group-buttons panel-input-5">
            <button class="btn-up panel-btn-row-up">up</button>
            <button class="btn-down panel-btn-row-down">down</button>
            <button class="btn-delete panel-btn-row-delete">x</button>
        </div>
    </div>
    `;
    DOM.panelList.prepend(div);

    const inputs = div.querySelectorAll(
        '.panel-input-x, .panel-input-y, .panel-input-size, .panel-input-transparent, .panel-input-blur'
    );
    for (let input of inputs) {
        input.addEventListener('input', (e) => {
            const data = storage.getGradientByNr(gradient.nr);
            data[input.dataset.key] = +e.target.value;
            if (input.dataset.key === 'x' || input.dataset.key === 'y') {
                //const dot = DOM.canvas.querySelector(`.canvas-dot[data-nr="${obGradient.nr}"]`);
                const dot = data.elements.dot;
                dot.style.left = `${data.x}%`;
                dot.style.top = `${data.y}%`;
            }
            canvas.setCanvasBg();
        });
    }

    const place = div.querySelector('.panel-row-color-select');
    const cp = new ColorPicker(place, {
        libraryID: 100,
        showLibrary: false,
        showInput: false,
        showButton: true,
    });

    const colorSelect = (color) => {
        const data = storage.getGradientByNr(gradient.nr);
        const rgb = hex2rgb(color);
        const hsl = rgb2hsl(rgb.r, rgb.g, rgb.b);
        place.style.background = `hsla(${hsl[0] * 360}, ${hsl[1] * 100}%, ${hsl[2] * 100}%, 1)`;
        data.color = {
            h: hsl[0] * 360,
            s: hsl[1] * 100,
            l: hsl[2] * 100,
        };
        canvas.setCanvasBg();
    };

    cp.onColorSelect.on((color) => {
        colorSelect(color);
    });
    cp.onHueSelect.on(color => {
        colorSelect(color);
    });
    cp.onButtonClick.on((color) => {
        place.classList.toggle('is-show');
    });
    place.querySelector('.color').addEventListener('click', (e) => {
        e.stopPropagation();
    });
    place.addEventListener('click', (e) => {
        e.currentTarget.classList.toggle('is-show');
    });

    return div;
}

/**
 * odznacza aktywy rząd (podczas przesuwania kropki na canvasie)
 */
function unselectActiveRow() {
    DOM.panel.querySelectorAll(`.panel-row`).forEach(row => row.classList.remove("panel-row-current"))
}

/**
 * zaznacza aktywy rząd (podczas przesuwania kropki na canvasie)
 * @param {object} gradient
 */
function selectActiveRow(gradient) {
    unselectActiveRow();
    gradient.elements.row.classList.add('panel-row-current');
}

/**
 * Aktualizuje rząd dla danego gradientu
 * @param {object} gradient
 */
function fillPanelRow(gradient) {
    const row = gradient.elements.row;
    row.querySelector('.panel-input-x').value = gradient.x.toFixed(2);
    row.querySelector('.panel-input-y').value = gradient.y.toFixed(2);
    row.querySelector('.panel-input-size').value = gradient.size;
}

/**
 * pokazuje / ukrywa przycisk czyszczenia płótna
 */
function setVisibilityBtnClearAll() {
    DOM.btnClearAll.hidden = (storage.current.bgColor === null && !storage.current.gradients.length);
}

/**
 * pokazuje / ukrywa przycisk do włączania krótkiego panelu
 */
function setVisibilityBtnPanelToggle() {
    DOM.btnPanelToggle.hidden = storage.current.gradients.length === 0;
}

function setVisibilityBtnSaveToFile() {
    DOM.btnSaveToFile.hidden = storage.current.gradients.length === 0;
}

/**
 * Ustawia kolor tła przycisku do wyboru tła całego płótna
 * @param {string} color
 */
function setButtonBgBackground(color) {
    if (color === 'transparent') {
        DOM.placeBgColor.style.background = '';
        DOM.placeBgColor.classList.add('transparent-color');
    } else {
        DOM.placeBgColor.style.background = color;
        DOM.placeBgColor.classList.remove('transparent-color');
    }
    DOM.btnBgColorClear.hidden = storage.current.bgColor === null;
}

const cp = new ColorPicker(DOM.placeBgColor, {
    libraryID: 100,
    showLibrary: false,
    showInput: false,
    showButton: true,
});
cp.onColorSelect.on((color) => {
    DOM.placeBgColor.style.background = color;
    storage.setBgColor(color);
});
cp.onButtonClick.on((color) => {
    DOM.placeBgColor.classList.toggle('is-show');
});

DOM.placeBgColor.querySelector('.color').addEventListener('click', (e) => {
    e.stopPropagation();
});

DOM.placeBgColor.addEventListener('click', (e) => {
    e.currentTarget.classList.toggle('is-show');
});

DOM.panel.addEventListener('click', (e) => {
    //uwaga - tablica w panelu jest odwrocona dla lepszej wizualizacji
    //wiec jezeli klikam w dol to przenosze w kierunku poczatku tablicy
    const btn = e.target.closest('.panel-row-solid');
    if (btn) {
        const row = btn.closest('.panel-row');
        const nr = +row.dataset.nr;
        const gradient = storage.current.gradients.find((el) => el.nr === nr);
        if (gradient === null) return;
        gradient.solid = !gradient.solid;
        btn.classList.toggle('is-active', gradient.solid);
        canvas.setCanvasBg();
    }
});

DOM.panel.addEventListener('click', (e) => {
    //uwaga - tablica w panelu jest odwrocona dla lepszej wizualizacji
    //wiec jezeli klikam w dol to przenosze w kierunku poczatku tablicy
    {
        const btn = e.target.closest('.panel-row-down');
        if (btn) {
            const rows = DOM.panel.querySelectorAll(".panel-row");
            const state = Flip.getState(rows);

            const row = btn.closest('.panel-row');
            const nr = +row.dataset.nr;
            const index = storage.current.gradients.findIndex((el) => el.nr === nr);

            if (index <= 0) return;
            row.nextElementSibling.after(row);

            const g = storage.current.gradients;
            const temp = {...g[index - 1]};
            g[index - 1] = {...g[index]};
            g[index] = temp;

            Flip.from(state, {duration: 0.2});

            storage.recalculateGradientsNumbers();
            canvas.setCanvasBg();
            canvas.generateDots();
        }
    }

    {
        const btn = e.target.closest('.panel-row-up');
        if (btn) {
            const rows = DOM.panel.querySelectorAll(".panel-row");
            const state = Flip.getState(rows);

            const row = btn.closest('.panel-row');
            const nr = +row.dataset.nr;
            const index = storage.current.gradients.findIndex((el) => el.nr === nr);

            if (index >= storage.current.gradients.length - 1) return;
            row.previousElementSibling.before(row);

            const g = storage.current.gradients;
            const temp = {...g[index]};
            g[index] = {...g[index + 1]};
            g[index + 1] = temp;

            Flip.from(state, {duration: 0.2});

            storage.recalculateGradientsNumbers();
            canvas.setCanvasBg();
            canvas.generateDots();
        }
    }

    {
        const del = e.target.closest('.panel-row-delete');
        if (del) {
            const rows = DOM.panel.querySelectorAll(".panel-row");
            const state = Flip.getState(rows);

            const row = del.closest('.panel-row');
            const nr = +row.dataset.nr;
            DOM.btnPanelToggle.hidden = !storage.current.gradients.length;
            row.remove();

            Flip.from(state, {duration: 0.2});

            storage.deleteGradient(nr);
            storage.recalculateGradientsNumbers();
            canvas.setCanvasBg();
        }
    }
});

DOM.btnAdd.addEventListener('click', () => {
    storage.addNewGradient();
    storage.recalculateGradientsNumbers();
});

DOM.btnPanelToggle.addEventListener('click', () => {
    DOM.panel.classList.toggle('panel-mini');
});

DOM.btnShowPopup.addEventListener('click', () => {
    let bg;
    if (!storage.current.gradients.length) {
        bg = `background: ${storage.getCurrentBgColor()};`;
    } else {
        bg = `background: ${generateGradient(
            storage.current.gradients,
            storage.getCurrentBgColor()
        )};`;
    }
    DOM.finalCode.innerHTML = bg;
    popup.showPopup(DOM.popupCode);
});

DOM.btnBgColorClear.addEventListener('click', () => {
    storage.setBgColor('transparent');
});

DOM.btnHelp.addEventListener("click", () => {
    popup.showPopup(DOM.popupHelp);
})

DOM.btnClearAll.addEventListener("click", () => {
    if (confirm("Clear all current work?")) {
        storage.current.gradients = [];
        storage.setBgColor("transparent");
        generatePanel();
        canvas.generateDots();
        canvas.setCanvasBg();
        setVisibilityBtnPanelToggle();
        setVisibilityBtnSaveToFile();
    }
})

DOM.btnSaveToFile.addEventListener('click', async (e) => {
    e.target.disable = true;
    await canvas.saveCanvasToPng();
    e.target.disable = false;
});

events.deleteGradient.on(({gradientsCount, gradientCount}) => {
    setVisibilityBtnPanelToggle();
    generatePanel();
    setVisibilityBtnClearAll();
    setVisibilityBtnSaveToFile();
});

events.setBg.on((color) => {
    setButtonBgBackground(color);
    setVisibilityBtnClearAll();
    setVisibilityBtnSaveToFile();
});

events.addNewGradient.on((_) => {
    generatePanel();
    setVisibilityBtnPanelToggle();
    setVisibilityBtnClearAll();
    setVisibilityBtnSaveToFile();
});

export const panel = {
    generatePanel,
    generatePanelRow,
    setButtonBgBackground,
    fillPanelRow,
    unselectActiveRow,
    selectActiveRow
};
