import { canvas } from './_canvas';
import { events } from './_events';
import { library } from './_library';
import { panel } from './_panel';

let currentId = 0;

let current = {
    bgColor: null,
    gradients: [],
};

function getGradientByNr(nr) {
    return current.gradients.find((el) => el.nr === +nr);
}

function getCurrentBgColor() {
    return current.bgColor === null ? 'transparent' : current.bgColor;
}

function generateNewGradientObj() {
    currentId++;

    return {
        nr: currentId,
        x: 50,
        y: 50,
        color: {
            h: Math.random() * 360,
            s: 100,
            l: 60,
        },
        transparent: 50,
        size: 50,
        solid: false,
        blur: 100,
        elements: {
            dot: null,
            row: null,
        },
    };
}

function recalculateGradientsNumbers() {
    return
    current.gradients.forEach((el, i) => (el.nr = i));
}

function deleteGradient(nr) {
    current.gradients = current.gradients.filter((el) => el.nr !== nr);
    recalculateGradientsNumbers();
    events.deleteGradient.emit({
        deleteGradientNr: nr,
        gradientsCount: current.gradients.length,
    });
}

function addNewGradient(gradientData) {
    let obGradient = null;
    if (gradientData) {
        obGradient = gradientData;
    } else {
        obGradient = storage.generateNewGradientObj();
    }

    current.gradients.push(obGradient);

    recalculateGradientsNumbers();

    events.addNewGradient.emit();
}

function setBgColor(color) {
    current.bgColor = color === 'transparent' ? null : color;
    events.setBg.emit(color);
}

export const storage = {
    current,
    setBgColor,
    getGradientByNr,
    getCurrentBgColor,
    generateNewGradientObj,
    recalculateGradientsNumbers,
    addNewGradient,
    deleteGradient,
};
