import { events } from './_events';
import { generateGradient } from './_functions';
import { panel } from './_panel';
import { storage } from './_storage';

let drag = false;
let dragElement = null;
let selectedGradient = null;

const DOM = {};
DOM.dotsToggle = document.querySelector('.panel-toggle-dots');
DOM.canvas = document.querySelector('.canvas');

function setCanvasBg() {
    document.body.classList.toggle(
        'transparent-color',
        storage.current.bgColor === null
    );
    const gradient = generateGradient(
        storage.current.gradients,
        storage.current.bgColor
    );
    DOM.canvas.style.background = gradient;
}

function generateDot(data) {
    const dot = document.createElement('div');
    dot.classList.add('canvas-dot');
    dot.dataset.nr = data.nr;
    dot.dataset.text = data.nr + 1;
    dot.style.left = `${data.x}%`;
    dot.style.top = `${data.y}%`;
    DOM.canvas.append(dot);
    return dot;
}

function generateDots() {
    DOM.canvas.innerHTML = '';
    for (let el of storage.current.gradients) {
        const dot = generateDot(el);
        el.elements.dot = dot;
    }
}

function deleteDot(nr) {
    const gradient = getGradientByNr(nr);
    gradient.elements.dot.remove();
}

DOM.canvas.addEventListener('mouseup', (e) => {
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
        const x = (e.pageX / DOM.canvas.offsetWidth) * 100;
        const y = (e.pageY / DOM.canvas.offsetHeight) * 100;
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

events.deleteGradient.on(({gradientsCount, gradientCount}) => {
    generateDots();
    setCanvasBg();
});

events.setBg.on((color) => {
    setCanvasBg();
});

events.addNewGradient.on((_) => {
    setCanvasBg();
    generateDots();
});

export const canvas = {
    setCanvasBg,
    generateDots,
    deleteDot,
};
