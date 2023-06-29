import "./style.scss";
import "./color-picker/css/style.css";
import {ColorPicker} from "./color-picker/js/colorpicker";
import {hex2rgb, rgb2hsl} from "./_colors-functions";

let drag = false;
let dragElement = null;
let selectedGradient = null;
let currentId = 0;

const DOM = {};

DOM.dots = document.querySelectorAll(".dot");
DOM.canvas = document.querySelector(".canvas");
DOM.panel = document.querySelector(".panel");
DOM.panelList = DOM.panel.querySelector(".panel-list");
DOM.placeBgColor = DOM.panel.querySelector(".panel-bg-color");
DOM.btnAdd = document.querySelector("#panelAdd");
DOM.panelToggle = document.querySelector(".panel-toggle");
DOM.panelCode = document.querySelector(".panel-code");
DOM.panelBgColorClear = document.querySelector(".panel-bg-color-clear");
DOM.dotsToggle = document.querySelector(".panel-toggle-dots");
DOM.popup = document.querySelector(".popup");
DOM.popupClose = DOM.popup.querySelector(".popup-close");
DOM.popupBtn = DOM.popup.querySelector(".popup-btn");
DOM.popupCode = DOM.popup.querySelector(".popup-code");

let current = {
    bgColor: null,
    gradients : [
    ]
}

init();

function init() {
    setCanvasBg();

    if (current.bgColor === null) {
        DOM.placeBgColor.style.backgroundColor = "";
        DOM.placeBgColor.classList.add("transparent-color");
    } else {
        DOM.placeBgColor.style.backgroundColor = current.bgColor;
        DOM.placeBgColor.classList.remove("transparent-color");
    }
}


function getCurrentBgColor() {
    return current.bgColor === null ? "transparent" : current.bgColor
}


function generateGradient(data, bgColor) {
    let gradientsArr = [];
    let bgSize = `0 0 / 100% 100%`;

    if (bgColor !== null) {
        gradientsArr.push(`linear-gradient(${bgColor}, ${bgColor}) ${bgSize}`);
    }

    for (let gr of data) {
        const color = getColorOfGradient(gr);
        const blur = gr.size - gr.size * (gr.blur / 100);
        gradientsArr.push(`radial-gradient(circle at ${gr.x}% ${gr.y}%, ${color}, ${color} ${blur}%, transparent ${gr.size}%) ${bgSize}`);
    }

    const arr = [...gradientsArr].reverse();

    return arr.join(",");
}


function getGradientByNr(nr) {
    return current.gradients.find(el => el.nr === +nr);
}


function getColorOfGradient(gradient, withAlpha = true) {
    if (withAlpha) {
        return `hsla(${gradient.color.h}, ${gradient.color.s}%, ${gradient.color.l}%, ${gradient.transparent / 100})`;
    } else {
        return `hsla(${gradient.color.h}, ${gradient.color.s}%, ${gradient.color.l}%, 1)`;
    }
}


function fillPanel(gradient) {
    const row = gradient.elements.row;
    console.log(row);
    row.querySelector(".panel-input-x").value = gradient.x.toFixed(2);
    row.querySelector(".panel-input-y").value = gradient.y.toFixed(2);
    row.querySelector(".panel-input-size").value = gradient.size;
}


function setCanvasBg() {
    document.body.classList.toggle("transparent-color", current.bgColor === null);
    DOM.panelBgColorClear.hidden = current.bgColor === null
    const gradient = generateGradient(current.gradients, current.bgColor);
    DOM.canvas.style.background = gradient;
}


function setBgColor(color) {
    if (color === "transparent") {
        current.bgColor = null;
        DOM.placeBgColor.style.background = "";
        current.bgColor = null;
        DOM.placeBgColor.classList.add("transparent-color");
        document.body.classList.add("transparent-color");
    } else {
        current.bgColor = color;
        DOM.placeBgColor.style.background = color;
    }
    DOM.panelBgColorClear.hidden = current.bgColor !== null;
    setCanvasBg();
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
            l: 60
        },
        transparent: 50,
        size: 50,
        solid : false,
        blur: 100,
        elements: {
            dot: null,
            row : null
        }
    }
}


function generateGradientDot(data) {
    const dot = document.createElement("div");
    dot.classList.add("canvas-dot");
    dot.dataset.nr = data.nr;
    dot.dataset.text = data.nr + 1;
    dot.style.left = `${data.x}%`;
    dot.style.top = `${data.y}%`;
    DOM.canvas.append(dot);
    return dot;
}


function generateDots() {
    DOM.canvas.innerHTML = "";
    for (let el of current.gradients) {
        const dot = generateGradientDot(el);
        el.elements.dot = dot;
    }
}


function addNewGradient(gradientData) {
    let obGradient = null;
    if (gradientData) {
        obGradient = gradientData;
    } else {
        obGradient = generateNewGradientObj();
    }
    console.log(obGradient);

    current.gradients.push(obGradient);
    DOM.panelToggle.hidden = current.gradients.length === 0;
    DOM.dotsToggle.hidden = current.gradients.length === 0;
    DOM.librarySave.hidden = current.gradients.length === 0;

    recalculateNumbers();
    generateDots();
    generatePanel();
    setCanvasBg();
}


function generatePanel() {
    DOM.panelList.innerHTML = "";
    for (let el of current.gradients) {
        const row = generatePanelRow(el);
        el.elements.row = row;
    }
}


function generatePanelRow(obGradient) {
    const div = document.createElement("div");
    div.classList.add("panel-row");
    div.dataset.nr = obGradient.nr;
    const indexInGradients = current.gradients.indexOf(obGradient);
    const color = getColorOfGradient(obGradient, true);

    div.innerHTML = `
        <div class="panel-input-group panel-input-group-0">
            <div class="panel-color" style="background-color: ${color}"><span>${indexInGradients + 1}</span></div>
        </div>
        <div class="panel-input-group panel-input-group-1">
            <span class="panel-label">x</span>
            <input class="panel-input-x" data-key="x" type="range" min="0" max="100" value="${obGradient.x}">
        </div>
        <div class="panel-input-group panel-input-group-2">
            <span class="panel-label">y</span>
            <input class="panel-input-y" data-key="y" type="range" min="0" max="100" value="${obGradient.y}">
        </div>
        <div class="panel-input-group panel-input-group-3">
            <span class="panel-label">size</span>
            <input class="panel-input-size" data-key="size" type="range" min="1" max="200" value="${obGradient.size}" />
        </div>
        <div class="panel-input-group panel-input-group-4">
            <span class="panel-label">transparent</span>
            <input class="panel-input-transparent" data-key="transparent" type="range" min="0" max="100" value="${obGradient.transparent}" />
        </div>
        <div class="panel-input-group panel-input-group-6">
            <span class="panel-label">blur</span>
            <input class="panel-input-blur" data-key="blur" type="range" min="0" max="100" value="${obGradient.blur}" />
        </div>
        <div class="panel-input-group panel-input-group-buttons panel-input-5">
            <button class="panel-row-up">up</button>
            <button class="panel-row-down">down</button>
            <button class="panel-row-delete">x</button>
        </div>
    </div>
    `;
    DOM.panelList.prepend(div);

    const inputs = div.querySelectorAll(".panel-input-x, .panel-input-y, .panel-input-size, .panel-input-transparent, .panel-input-blur");
    for (let input of inputs) {
        input.addEventListener("input", e => {
            const gradient = getGradientByNr(obGradient.nr);
            gradient[input.dataset.key] = +e.target.value;
            if (input.dataset.key === "x" || input.dataset.key === "y") {
                //const dot = DOM.canvas.querySelector(`.canvas-dot[data-nr="${obGradient.nr}"]`);
                const dot = gradient.elements.dot;
                dot.style.left = `${gradient.x}%`;
                dot.style.top = `${gradient.y}%`;
            }
            setCanvasBg();
        })
    }

    const place = div.querySelector(".panel-color");
    const cp = new ColorPicker(place, {
        libraryID: 100,
        showLibrary: false,
        showInput: false,
        showButton: true
    });

    const colorSelect = color => {
        const gradient = getGradientByNr(obGradient.nr);
        const rgb = hex2rgb(color);
        const hsl = rgb2hsl(rgb.r, rgb.g, rgb.b);
        const newColor = `hsla(${hsl[0] * 360}, ${hsl[1] * 100}%, ${hsl[2] * 100}%, 1)`;
        place.style.background = newColor;
        gradient.color = {
            h: hsl[0] * 360,
            s: hsl[1] * 100,
            l: hsl[2] * 100,
        }
        setCanvasBg();
    }

    cp.onColorSelect.on(color => {
        colorSelect(color);
    });
    // cp.onHueSelect.on(color => {
    //     colorSelect(color);
    // });
    cp.onButtonClick.on(color => {
        place.classList.toggle("is-show");
    });
    place.querySelector(".color").addEventListener("click", e => {
        e.stopPropagation();
    })
    place.addEventListener("click", e => {
        e.currentTarget.classList.toggle("is-show");
    })

    return div;
}


function recalculateNumbers() {
    current.gradients.forEach((el, i) => el.nr = i);
}


function deleteGradient(nr) {
    current.gradients = current.gradients.filter(el => el.nr !== nr);
    DOM.panelToggle.hidden = current.gradients.length === 0;
    DOM.dotsToggle.hidden = current.gradients.length === 0;
    DOM.librarySave.hidden = current.gradients.length === 0;
    recalculateNumbers();
    generateDots();
    generatePanel();
    setCanvasBg();
}


function deleteDot(nr) {
    const dots = DOM.canvas.querySelectorAll(".canvas-dot");
    for (let dot of dots) {
        if (+dot.dataset.nr === nr) dot.remove();
    }
}


const cp = new ColorPicker(DOM.placeBgColor, {
    libraryID: 100,
    showLibrary: false,
    showInput: false,
    showButton: true
});
cp.onColorSelect.on(color => {
    DOM.placeBgColor.style.background = color;
    current.bgColor = color;
    setCanvasBg();
});
cp.onButtonClick.on(color => {
    DOM.placeBgColor.classList.toggle("is-show");
});


DOM.canvas.addEventListener("mouseup", e => {
    drag = false;
    DOM.panel.querySelectorAll(`.panel-row`).forEach(row => row.classList.remove("panel-row-current"));

    if (dragElement) {
        document.body.classList.remove("canvas-dot-moved");
        dragElement.classList.remove("canvas-dot-selected");
        dragElement = null;
    }
});


DOM.canvas.addEventListener("mousedown", e => {
    const dot = e.target.closest(".canvas-dot");
    if (dot) {
        drag = true;
        dragElement = dot;
        dragElement.classList.add("canvas-dot-selected");
        document.body.classList.add("canvas-dot-moved");

        const nr = +dragElement.dataset.nr;
        const gradient = getGradientByNr(nr);
        DOM.panel.querySelectorAll(`.panel-row`).forEach(row => row.classList.remove("panel-row-current"))
        gradient.elements.row.classList.add("panel-row-current");
    }
});


DOM.canvas.addEventListener("mousemove", e => {
    if (dragElement && drag) {
        const x = e.pageX / DOM.canvas.offsetWidth * 100;
        const y = e.pageY / DOM.canvas.offsetHeight * 100;
        const nr = +dragElement.dataset.nr;
        const gradient = getGradientByNr(nr);
        dragElement.style.left = `${x}%`;
        dragElement.style.top = `${y}%`;
        gradient.x = x;
        gradient.y = y;
        setCanvasBg();
        fillPanel(gradient);
    }
});


DOM.placeBgColor.querySelector(".color").addEventListener("click", e => {
    e.stopPropagation();
})


DOM.placeBgColor.addEventListener("click", e => {
    e.currentTarget.classList.toggle("is-show");
})


DOM.panel.addEventListener("click", e => {
    //uwaga - tablica w panelu jest odwrocona dla lepszej wizualizacji
    //wiec jezeli klikam w dol to przenosze w kierunku poczatku tablicy
    const btn = e.target.closest(".panel-row-solid");
    if (btn) {
        const row = btn.closest(".panel-row");
        const nr = +row.dataset.nr;
        const gradient = gradients.find(el => el.nr === nr);
        if (gradient === null) return;
        gradient.solid = !gradient.solid;
        btn.classList.toggle("is-active", gradient.solid);
        setCanvasBg();
    }
})


DOM.panel.addEventListener("click", e => {
    //uwaga - tablica w panelu jest odwrocona dla lepszej wizualizacji
    //wiec jezeli klikam w dol to przenosze w kierunku poczatku tablicy
    const btn = e.target.closest(".panel-row-down");
    if (btn) {
        const row = btn.closest(".panel-row");
        const nr = +row.dataset.nr;
        const index = current.gradients.findIndex(el => el.nr === nr);
        if (index <= 0) return;
        row.nextElementSibling.after(row);
        const g = current.gradients;
        const temp = {...g[index - 1]};
        g[index - 1] = {...g[index]};
        g[index] = temp;
        recalculateNumbers();
        setCanvasBg();
    }
})


DOM.panel.addEventListener("click", e => {
    const btn = e.target.closest(".panel-row-up");
    if (btn) {
        const row = btn.closest(".panel-row");
        const nr = +row.dataset.nr;
        const index = current.gradients.findIndex(el => el.nr === nr);
        if (index >= current.gradients.length - 1) return;
        row.previousElementSibling.before(row);

        const g = current.gradients;
        const temp = {...g[index]};
        g[index] = {...g[index+1]};
        g[index+1] = temp;

        recalculateNumbers();
        setCanvasBg();
    }
})


DOM.btnAdd.addEventListener("click", e => {
    addNewGradient();
    recalculateNumbers();
})


DOM.panelList.addEventListener("click", e => {
    const del = e.target.closest(".panel-row-delete");
    if (del) {
        const row = del.closest(".panel-row");
        const nr = +row.dataset.nr;
        row.remove();
        deleteGradient(nr);
        recalculateNumbers();
        setCanvasBg();
    }
})


DOM.panelToggle.addEventListener("click", e => {
    DOM.panel.classList.toggle("panel-mini");
})


DOM.panelCode.addEventListener("click", e => {
    let bg = '';
    if (!current.gradients.length) {
        bg = `background: ${getCurrentBgColor()};`;
    } else {
        bg = `background: ${generateGradient(current.gradients, getCurrentBgColor())};`;
    }
    DOM.popup.querySelector(".popup-code").innerHTML = bg;
    DOM.popup.classList.add("is-show");
})


DOM.panelBgColorClear.addEventListener("click", e => {
    setBgColor("transparent");
})


DOM.dotsToggle.addEventListener("click", e => {
    DOM.canvas.classList.toggle("canvas-dots-hide");
    e.target.classList.toggle("is-active");
})


DOM.popupClose.addEventListener("click", e => {
    DOM.popup.classList.remove("is-show");
    DOM.popupBtn.classList.remove("is-copy");
})


DOM.popupBtn.addEventListener("click", e => {
    const range = document.createRange() // create new range object
    range.selectNodeContents(DOM.popupCode) // set range to encompass desired element text
    const selection = window.getSelection() // get Selection object from currently user selected text
    selection.removeAllRanges() // unselect any user selected text (if any)
    selection.addRange(range)
    document.execCommand('copy');
    DOM.popupBtn.classList.add("is-copy");
})





DOM.library = document.querySelector(".library");
DOM.libraryList = document.querySelector(".library-list");
DOM.librarySave = document.querySelector(".library-btn-save");
DOM.btnShowLibrary = document.querySelector(".btn-show-library");

DOM.librarySave.addEventListener("click", e => {
    saveCurrentToLibrary();
    generateLibrary();
})

function toggleLibrary() {
    document.body.classList.toggle("library-show");
    DOM.library.classList.toggle("is-show");
}

DOM.btnShowLibrary.addEventListener("click", e => {
    toggleLibrary();
})

// const load = document.querySelector("#load");
// load.addEventListener("click", e => {
//     const data = loadLibraryGradients();
//     if (data) {
//         library.gradients = data.gradients
//         generateLibrary()
//     }
// })

const library = {
    gradients: []
}

function uniqueKey() {
    return Math.floor(Math.random() * Date.now()).toString(16)
}

function saveCurrentToLibrary() {
    const stripCurrentGradientsData = [];

    for (let el of current.gradients) {
        const {elements, ...stripData} = el;
        const copy = structuredClone(stripData); //klonuję
        stripCurrentGradientsData.push(copy)
    }

    const gradientToSave = {
        id: uniqueKey(),
        data: stripCurrentGradientsData,
        bgColor : current.bgColor
    }
    library.gradients.push(gradientToSave);
    const json = JSON.stringify(library);
    localStorage.setItem("library", json);
}

function deleteGradientFromLibrary(id) {
    library.gradients = library.gradients.filter(el => el.id !== id);
}

function loadLibraryGradients() {
    const json = localStorage.getItem("library");
    if (json) {
        return JSON.parse(json);
    }
    return false;
}



function loadGradientFromLibrary(id) {
    const loadData = library.gradients.find(el => el.id === id);

    if (loadData) {
        const clonedData = structuredClone(loadData);
        current.gradients = clonedData.data;
        setBgColor(clonedData.bgColor);
        current.gradients.forEach(el => el.elements = {row : null, dot: null})
        generatePanel();
        generateDots();
        setCanvasBg();
        recalculateNumbers();
    }
}

function generateLibrary() {
    DOM.libraryList.innerHTML = "";
    for (let el of library.gradients) {
        const thumb = document.createElement("div");
        thumb.dataset.id = el.id;
        thumb.classList.add("library-element");

        const thumbInside = document.createElement("div");
        thumbInside.style.background = generateGradient(el.data, el.bgColor);
        if (el.bgColor === null) {
            thumb.classList.add("transparent-color");
        }
        thumb.append(thumbInside);

        const btnDelete = document.createElement("button");
        btnDelete.classList.add("library-element-delete");
        btnDelete.innerText = "Delete";
        btnDelete.addEventListener("click", e => {
            const id = el.id;
            deleteGradientFromLibrary(id);
            generateLibrary();
        })

        thumb.append(btnDelete);

        thumb.addEventListener("click", e => {
            const id = thumb.dataset.id;
            loadGradientFromLibrary(id);
        })
        DOM.libraryList.prepend(thumb);
    }
}

function initLibrary() {
    document.body.classList.add("animation-init");
    const data = loadLibraryGradients();
    if (data) {
        library.gradients = data.gradients;
        generateLibrary();
    }
}

if (localStorage.getItem("library") === null) {
    const startLibrary = '{"gradients":[{"id":"116676225bb","data":[{"nr":0,"x":89.73958333333333,"y":50.112359550561806,"color":{"h":208.23529411764707,"s":100,"l":50},"transparent":50,"size":99,"solid":false,"blur":100},{"nr":1,"x":8.710106382978724,"y":50.337078651685395,"color":{"h":330.51544913047854,"s":100,"l":60},"transparent":50,"size":99,"solid":false,"blur":100},{"nr":2,"x":49.21875,"y":92.69662921348315,"color":{"h":122.45945294136882,"s":100,"l":60},"transparent":50,"size":50,"solid":false,"blur":100},{"nr":3,"x":48.95833333333333,"y":6.404494382022471,"color":{"h":57.41176470588236,"s":100,"l":50},"transparent":45,"size":47,"solid":false,"blur":100}],"bgColor":"#000000"},{"id":"16c62fb29ee","data":[{"nr":0,"x":8.909574468085106,"y":91.91011235955057,"color":{"h":311.29411764705884,"s":100,"l":50},"transparent":50,"size":92,"solid":false,"blur":100},{"nr":1,"x":90.72916666666667,"y":9.775280898876403,"color":{"h":71.42857142857143,"s":100,"l":50.588235294117645},"transparent":50,"size":93,"solid":false,"blur":100}],"bgColor":"#000000"},{"id":"e3babe3dc7","data":[{"nr":0,"x":47.552083333333336,"y":97.30337078651685,"color":{"h":0,"s":0,"l":100},"transparent":21,"size":71,"solid":false,"blur":100}],"bgColor":"#060822"},{"id":"175aa105057","data":[{"nr":0,"x":83.69791666666667,"y":24.382022471910112,"color":{"h":231.40957417171418,"s":100,"l":60},"transparent":10,"size":57,"solid":false,"blur":0},{"nr":1,"x":90.10416666666666,"y":14.831460674157304,"color":{"h":218.58823529411762,"s":100,"l":50},"transparent":22,"size":54,"solid":false,"blur":0},{"nr":2,"x":95.26041666666667,"y":6.292134831460674,"color":{"h":199.05882352941174,"s":100,"l":50},"transparent":11,"size":50,"solid":false,"blur":0},{"nr":3,"x":92.76041666666667,"y":9.775280898876403,"color":{"h":178.11764705882354,"s":100,"l":50},"transparent":29,"size":77,"solid":false,"blur":91}],"bgColor":"#11143a"},{"id":"9a556b5e5","data":[{"nr":0,"x":8.645833333333334,"y":85.0561797752809,"color":{"h":240.71984908016748,"s":100,"l":60},"transparent":50,"size":34,"solid":false,"blur":0},{"nr":1,"x":47.552083333333336,"y":92.92134831460675,"color":{"h":275.38826213186616,"s":100,"l":60},"transparent":48,"size":36,"solid":false,"blur":0},{"nr":2,"x":82.29166666666666,"y":10.337078651685392,"color":{"h":265.1060985098618,"s":100,"l":60},"transparent":47,"size":21,"solid":false,"blur":0},{"nr":3,"x":84.01041666666667,"y":80.56179775280899,"color":{"h":337.07803770855264,"s":100,"l":60},"transparent":50,"size":49,"solid":false,"blur":0},{"nr":4,"x":13.020833333333334,"y":10.224719101123595,"color":{"h":162.5120885270305,"s":100,"l":60},"transparent":50,"size":24,"solid":false,"blur":0},{"nr":5,"x":48.28125,"y":16.741573033707866,"color":{"h":353.12270464778766,"s":100,"l":60},"transparent":28,"size":40,"solid":false,"blur":0}],"bgColor":"#11143a"},{"id":"1c46d15793","data":[{"nr":0,"x":50,"y":50,"color":{"h":291.52941176470586,"s":100,"l":50},"transparent":41,"size":88,"solid":false,"blur":100},{"nr":1,"x":50.10416666666667,"y":50.44943820224719,"color":{"h":180.47058823529412,"s":100,"l":50},"transparent":29,"size":40,"solid":false,"blur":74}],"bgColor":"#11143a"}]}';
    localStorage.setItem("library", startLibrary);
}

initLibrary();