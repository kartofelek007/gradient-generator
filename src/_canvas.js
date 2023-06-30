import {events} from './_events';
import {generateGradient} from './_functions';
import {panel} from './_panel';
import {storage} from './_storage';

let drag = false;
let dragElement = null;

const DOM = {};
DOM.dotsToggle = document.querySelector('.panel-toggle-dots');
DOM.canvasCnt = document.querySelector('.canvas');
DOM.canvas = document.querySelector('.canvas-inside');

/**
 * ustawia tło płótna
 */
function setCanvasBg() {
    DOM.canvasCnt.classList.toggle('transparent-color', storage.current.bgColor === null);
    DOM.canvas.style.background = generateGradient(
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
    DOM.canvas.append(dot);
    return dot;
}

/**
 * Tworzy wszystkie kropki na płótnie
 */
function generateDots() {
    DOM.canvas.innerHTML = '';
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
    DOM.canvasCnt.style.width = width + "px";
    DOM.canvasCnt.style.height = height + "px";
}

/**
 * ustawia rozmiar płótna jako dataset
 */
function onCanvasResize() {
    const box = DOM.canvasCnt.getBoundingClientRect();
    DOM.canvas.dataset.dimension = `${box.width}x${box.height}`;
    storage.current.dimension.width = DOM.canvas.offsetWidth;
    storage.current.dimension.height = DOM.canvas.offsetHeight;
}

DOM.canvas.addEventListener('mouseup', () => {
    drag = false;
    panel.unselectActiveRow()

    if (dragElement) {
        document.body.classList.remove('canvas-dot-moved');
        dragElement.classList.remove('canvas-dot-selected');
        dragElement = null;
    }
});

DOM.canvas.addEventListener('mousedown', (e) => {
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

DOM.canvas.addEventListener('mousemove', (e) => {
    if (dragElement && drag) {
        const x = (e.offsetX / DOM.canvas.offsetWidth) * 100;
        const y = (e.offsetY / DOM.canvas.offsetHeight) * 100;
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

DOM.dotsToggle.addEventListener('click', (e) => {
    DOM.canvas.classList.toggle('canvas-dots-hide');
    e.target.classList.toggle('is-active');
});

//nasłuchiwanie zmiany rozmiarów płótna
new ResizeObserver(onCanvasResize).observe(DOM.canvas);

events.deleteGradient.on(({gradientsCount, gradientCount}) => {
    generateDots();
    setCanvasBg();
});

events.setBg.on((color) => {
    setCanvasBg();
});

events.addNewGradient.on(() => {
    setCanvasBg();
    generateDots();
});

export const canvas = {
    setCanvasBg,
    generateDots,
    deleteDot,
    setDimension
};
