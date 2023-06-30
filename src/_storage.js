import {events} from './_events';

let currentId = 0;

let current = {
    bgColor: null,
    gradients: [],
};

/**
 * Pobiera z aktualnej kolekcji gradient o danym numerze
 * @param {number} nr
 * @returns
 */
function getGradientByNr(nr) {
    return current.gradients.find((el) => el.nr === +nr);
}

/**
 * Pobiera kolor tła płótna
 * @returns string
 */
function getCurrentBgColor() {
    return current.bgColor === null ? 'transparent' : current.bgColor;
}

/**
 * Tworzy pojedynczy obiekt gradientu
 * @returns {solid: boolean, nr: number, color: {s: number, h: number, l: number}, size: number, elements: {dot: null, row: null}, x: number, y: number, blur: number, transparent: number}
 */
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

/**
 * Przelicza numery gradientów w kolekcji
 * @returns
 */
function recalculateGradientsNumbers() {
    return false;
    //current.gradients.forEach((el, i) => (el.nr = i));
}

/**
 * Usuwa z kolekcji gradient o danym numerze
 * @param {number} nr
 */
function deleteGradient(nr) {
    current.gradients = current.gradients.filter((el) => el.nr !== nr);
    recalculateGradientsNumbers();
    events.deleteGradient.emit({
        deleteGradientNr: nr,
        gradientsCount: current.gradients.length,
    });
}

/**
 * Dodaje nowy gradient do aktualnej kolekcji
 * @param {*} gradient
 */
function addNewGradient(gradient) {
    let obGradient = (gradient) ? gradient : storage.generateNewGradientObj();
    current.gradients.push(obGradient);
    recalculateGradientsNumbers();
    events.addNewGradient.emit();
}

/**
 * Ustawia kolor tła płótna
 * @param {string} color
 */
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
