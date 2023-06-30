import {events} from './_events';
import {generateGradient} from './_functions';
import {panel} from './_panel';
import {storage} from './_storage';
import html2canvas from 'html2canvas';

let drag = false;
let dragElement = null;
let timeShowDimension = null;

const DOM = {};
DOM.canvas = document.querySelector('.canvas');
DOM.canvasInside = document.querySelector('.canvas-inside');
DOM.canvasBg = document.querySelector(".canvas-bg");

async function saveCanvasToPng() {
    const leadZero = (i) => `${i}`.padStart(2, "0");

    try {
        const canvas = await html2canvas(DOM.canvasBg, {
            backgroundColor: storage.current.bgColor
        });
        const link = document.createElement("a");
        document.body.append(link);
        const date = new Date();
        const dateText = `${leadZero(date.getDay())}-${leadZero(date.getMonth()+1)}-${date.getFullYear()}`;
        link.setAttribute('download', `gradient-${dateText}.png`);
        link.setAttribute('href', canvas.toDataURL("image/png").replace("image/png", "image/octet-stream"));
        link.click();
    } catch (err) {
        alert("Nie można zapisać do pliku :(");
    }
}

/**
 * ustawia tło płótna
 */
function setCanvasBg() {
    DOM.canvas.classList.toggle('transparent-color', storage.current.bgColor === null);
    DOM.canvasBg.style.background = generateGradient(
        storage.current.gradients,
        storage.current.bgColor
    );
}


/**
 * Tworzy pojedynczą kropkę na płótnie
 * @param {object} gradient
 * @returns HTMLElement
 */
function generateDot(gradient) {
    const dot = document.createElement('div');
    dot.classList.add('canvas-dot');
    dot.dataset.nr = gradient.nr;
    dot.dataset.text = gradient.nr + 1;
    dot.style.left = `${gradient.x}%`;
    dot.style.top = `${gradient.y}%`;
    DOM.canvasInside.append(dot);
    return dot;
}

/**
 * Usuwa wszystkie kropki na płótnie
 */
function removeAllDots() {
    DOM.canvasInside.innerHTML = '';
}

/**
 * Tworzy wszystkie kropki na płótnie
 */
function generateAllDots() {
    removeAllDots();
    for (let el of storage.current.gradients) {
        el.elements.dot = generateDot(el);
    }
}

/**
 * Usuwa kropkę dla gradientu o danym numerze
 * @param {number} nr
 */
function deleteDot(nr) {
    const gradient = getGradientByNr(nr);
    gradient.elements.dot.remove();
}

/**
 * ustawia rozmiar płótna
 * @param {number} width
 * @param {number} height
 */
function setDimension(width, height) {
    storage.current.dimension.width = width;
    storage.current.dimension.height = height;
    DOM.canvas.style.width = width + "px";
    DOM.canvas.style.height = height + "px";
}

/**
 * ustawia rozmiar płótna jako dataset
 */
function onCanvasResize() {
    const box = DOM.canvas.getBoundingClientRect();
    DOM.canvasInside.dataset.dimension = `${box.width}x${box.height}`;
    DOM.canvasInside.classList.add("is-show-dimension");
    clearInterval(timeShowDimension);
    timeShowDimension = setTimeout(() => {
        DOM.canvasInside.classList.remove("is-show-dimension");
    }, 2000)
    storage.current.dimension.width = DOM.canvasInside.offsetWidth;
    storage.current.dimension.height = DOM.canvasInside.offsetHeight;
}

DOM.canvasInside.addEventListener('mouseup', () => {
    drag = false;
    panel.unselectActiveRow()

    if (dragElement) {
        document.body.classList.remove('canvas-dot-moved');
        dragElement.classList.remove('canvas-dot-selected');
        dragElement = null;
    }
});

DOM.canvasInside.addEventListener('mousedown', (e) => {
    const dot = e.target.closest('.canvas-dot');
    if (dot) {
        drag = true;
        dragElement = dot;
        dragElement.classList.add('canvas-dot-selected');
        document.body.classList.add('canvas-dot-moved');

        const nr = +dragElement.dataset.nr;
        const gradient = storage.getGradientByNr(nr);
        panel.selectActiveRow(gradient)
    }
});

DOM.canvasInside.addEventListener('mousemove', (e) => {
    if (dragElement && drag) {
        const x = (e.offsetX / DOM.canvasInside.offsetWidth) * 100;
        const y = (e.offsetY / DOM.canvasInside.offsetHeight) * 100;
        const nr = +dragElement.dataset.nr;
        const gradient = storage.getGradientByNr(nr);
        dragElement.style.left = `${x}%`;
        dragElement.style.top = `${y}%`;
        gradient.x = x;
        gradient.y = y;
        setCanvasBg();
        panel.fillPanelRow(gradient);
    }
});

//nasłuchiwanie zmiany rozmiarów płótna
new ResizeObserver(onCanvasResize).observe(DOM.canvasInside);

events.deleteGradient.on(({gradientsCount, gradientCount}) => {
    generateAllDots();
    setCanvasBg();
});

events.setBg.on((color) => {
    setCanvasBg();
});

events.addNewGradient.on(() => {
    setCanvasBg();
    generateAllDots();
});

export const canvas = {
    setCanvasBg,
    generateDots: generateAllDots,
    deleteDot,
    setDimension,
    saveCanvasToPng
};
