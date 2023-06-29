import { uniqueKey } from './lib/_unique-key';
import { storage } from './_storage';
import { generateGradient } from './_functions';
import { canvas } from './_canvas';
import { panel } from './_panel';
import { events } from './_events';

const libraryStorage = {
    gradients: [],
};

const DOM = {};
DOM.library = document.querySelector('.library');
DOM.libraryList = document.querySelector('.library-list');
DOM.librarySave = document.querySelector('.library-btn-save');
DOM.btnShowLibrary = document.querySelector('.btn-show-library');

function saveCurrentToLibrary() {
    const stripCurrentGradientsData = [];

    for (let el of storage.current.gradients) {
        const { elements, ...stripData } = el;
        const copy = structuredClone(stripData); //klonuję
        stripCurrentGradientsData.push(copy);
    }

    const gradientToSave = {
        id: uniqueKey(),
        data: stripCurrentGradientsData,
        bgColor: storage.current.bgColor,
    };
    libraryStorage.gradients.push(gradientToSave);
    const json = JSON.stringify(libraryStorage);
    localStorage.setItem('library', json);
}

function deleteGradientFromLibrary(id) {
    libraryStorage.gradients = libraryStorage.gradients.filter(
        (el) => el.id !== id
    );
    const json = JSON.stringify(libraryStorage);
    localStorage.setItem('library', json);
}

function loadLibraryGradients() {
    const json = localStorage.getItem('library');
    if (json) {
        return JSON.parse(json);
    }
    return false;
}

function loadGradientFromLibrary(id) {
    const loadData = libraryStorage.gradients.find((el) => el.id === id);

    if (loadData) {
        const clonedData = structuredClone(loadData);
        storage.current.gradients = clonedData.data;
        storage.setBgColor(clonedData.bgColor);
        storage.current.gradients.forEach(
            (el) => (el.elements = { row: null, dot: null })
        );
        panel.generatePanel();
        canvas.generateDots();
        canvas.setCanvasBg();
        storage.recalculateGradientsNumbers();
    }
}

function generateLibrary() {
    DOM.libraryList.innerHTML = '';

    for (let el of libraryStorage.gradients) {
        const thumb = document.createElement('div');
        thumb.dataset.id = el.id;
        thumb.classList.add('library-element');

        const thumbInside = document.createElement('div');
        thumbInside.style.background = generateGradient(el.data, el.bgColor);
        if (el.bgColor === null) {
            thumb.classList.add('transparent-color');
        }
        thumb.append(thumbInside);

        const btnDelete = document.createElement('button');
        btnDelete.classList.add('library-element-delete');
        btnDelete.innerText = 'Delete';
        btnDelete.addEventListener('click', (e) => {
            const id = el.id;
            deleteGradientFromLibrary(id);
            generateLibrary();
        });

        thumb.append(btnDelete);

        thumb.addEventListener('click', (e) => {
            const id = thumb.dataset.id;
            loadGradientFromLibrary(id);
        });
        DOM.libraryList.prepend(thumb);
    }
}

function initLibrary() {
    if (localStorage.getItem('library') === null) {
        const startLibrary = `{"gradients":[{"id":"116676225bb","data":[{"nr":0,"x":89.73958333333333,"y":50.112359550561806,"color":{"h":208.23529411764707,"s":100,"l":50},"transparent":50,"size":99,"solid":false,"blur":100},{"nr":1,"x":8.710106382978724,"y":50.337078651685395,"color":{"h":330.51544913047854,"s":100,"l":60},"transparent":50,"size":99,"solid":false,"blur":100},{"nr":2,"x":49.21875,"y":92.69662921348315,"color":{"h":122.45945294136882,"s":100,"l":60},"transparent":50,"size":50,"solid":false,"blur":100},{"nr":3,"x":48.95833333333333,"y":6.404494382022471,"color":{"h":57.41176470588236,"s":100,"l":50},"transparent":45,"size":47,"solid":false,"blur":100}],"bgColor":"#000000"},{"id":"16c62fb29ee","data":[{"nr":0,"x":8.909574468085106,"y":91.91011235955057,"color":{"h":311.29411764705884,"s":100,"l":50},"transparent":50,"size":92,"solid":false,"blur":100},{"nr":1,"x":90.72916666666667,"y":9.775280898876403,"color":{"h":71.42857142857143,"s":100,"l":50.588235294117645},"transparent":50,"size":93,"solid":false,"blur":100}],"bgColor":"#000000"},{"id":"e3babe3dc7","data":[{"nr":0,"x":47.552083333333336,"y":97.30337078651685,"color":{"h":0,"s":0,"l":100},"transparent":21,"size":71,"solid":false,"blur":100}],"bgColor":"#060822"},{"id":"175aa105057","data":[{"nr":0,"x":83.69791666666667,"y":24.382022471910112,"color":{"h":231.40957417171418,"s":100,"l":60},"transparent":10,"size":57,"solid":false,"blur":0},{"nr":1,"x":90.10416666666666,"y":14.831460674157304,"color":{"h":218.58823529411762,"s":100,"l":50},"transparent":22,"size":54,"solid":false,"blur":0},{"nr":2,"x":95.26041666666667,"y":6.292134831460674,"color":{"h":199.05882352941174,"s":100,"l":50},"transparent":11,"size":50,"solid":false,"blur":0},{"nr":3,"x":92.76041666666667,"y":9.775280898876403,"color":{"h":178.11764705882354,"s":100,"l":50},"transparent":29,"size":77,"solid":false,"blur":91}],"bgColor":"#11143a"},{"id":"9a556b5e5","data":[{"nr":0,"x":8.645833333333334,"y":85.0561797752809,"color":{"h":240.71984908016748,"s":100,"l":60},"transparent":50,"size":34,"solid":false,"blur":0},{"nr":1,"x":47.552083333333336,"y":92.92134831460675,"color":{"h":275.38826213186616,"s":100,"l":60},"transparent":48,"size":36,"solid":false,"blur":0},{"nr":2,"x":82.29166666666666,"y":10.337078651685392,"color":{"h":265.1060985098618,"s":100,"l":60},"transparent":47,"size":21,"solid":false,"blur":0},{"nr":3,"x":84.01041666666667,"y":80.56179775280899,"color":{"h":337.07803770855264,"s":100,"l":60},"transparent":50,"size":49,"solid":false,"blur":0},{"nr":4,"x":13.020833333333334,"y":10.224719101123595,"color":{"h":162.5120885270305,"s":100,"l":60},"transparent":50,"size":24,"solid":false,"blur":0},{"nr":5,"x":48.28125,"y":16.741573033707866,"color":{"h":353.12270464778766,"s":100,"l":60},"transparent":28,"size":40,"solid":false,"blur":0}],"bgColor":"#11143a"},{"id":"1c46d15793","data":[{"nr":0,"x":50,"y":50,"color":{"h":291.52941176470586,"s":100,"l":50},"transparent":41,"size":88,"solid":false,"blur":100},{"nr":1,"x":50.10416666666667,"y":50.44943820224719,"color":{"h":180.47058823529412,"s":100,"l":50},"transparent":29,"size":40,"solid":false,"blur":74}],"bgColor":"#11143a"}]}`;
        localStorage.setItem('library', startLibrary);
    }

    document.body.classList.add('animation-init');
    const data = loadLibraryGradients();
    if (data) {
        libraryStorage.gradients = data.gradients;
        generateLibrary();
    }
}

initLibrary();

function toggleLibrary() {
    document.body.classList.toggle('library-show');
    DOM.library.classList.toggle('is-show');
}

DOM.librarySave.addEventListener('click', (e) => {
    saveCurrentToLibrary();
    generateLibrary();
});

DOM.btnShowLibrary.addEventListener('click', (e) => {
    toggleLibrary();
});

events.deleteGradient.on(({gradientsCount, gradientCount}) => {
    DOM.librarySave.hidden = gradientsCount === 0;
});

export const library = {
};
