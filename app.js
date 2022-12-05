let drag = false;
let dragElement = null;
let selectedGradient = null;
let currentId = 0;
let mainColor = 'transparent';

const dots = document.querySelectorAll(".dot");
const canvas = document.querySelector(".canvas");
const panel = document.querySelector(".panel");
const panelList = panel.querySelector(".panel-list");
const placeMainColor = panel.querySelector(".panel-main-color");

let gradients = [
    // {
    //     id : currentId,
    //     x : 50,
    //     y : 50,
    //     color : {
    //         h : Math.random()*360,
    //         s : 100,
    //         l : 60
    //     },
    //     transparent : 100,
    //     size : 100
    // }
];

function init() {
    setCanvasBg();

    if (mainColor === "transparent") {
        placeMainColor.style.backgroundColor = "";
        placeMainColor.classList.add("transparent-color");
    } else {
        placeMainColor.style.backgroundColor = mainColor;
        placeMainColor.classList.remove("transparent-color");
    }
}

init();

function hex2rgb(hex) {
    hex = parseInt(((hex.indexOf('#') > -1) ? hex.substring(1) : hex), 16);
    return {
        r: hex >> 16,
        g: (hex & 0x00FF00) >> 8,
        b: (hex & 0x0000FF)
    };
}

function rgb2hsl(r, g, b) {
    r /= 255, g /= 255, b /= 255;
    let max = Math.max(r, g, b),
        min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0; // achromatic
    } else {
        let d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
        }
        h /= 6;
    }

    return [h, s, l];
}

function generateGradient() {
    let gradientsArr = [];

    if (mainColor !== "transparent") {
        gradientsArr.push(`linear-gradient(${mainColor}, ${mainColor})`);
    }

    for (let gr of gradients) {
        const color = getColorOfGradient(gr);
        gradientsArr.push(`radial-gradient(circle at ${gr.x}% ${gr.y}%, ${color}, transparent ${gr.size}%)`);
    }

    const arr = [...gradientsArr].reverse();

    return arr.join(",");
}

function getGradientById(id) {
    return gradients.find(el => el.id === +id);
}

function getColorOfGradient(gradient, withAlpha = true) {
    if (withAlpha) {
        return `hsla(${gradient.color.h}, ${gradient.color.s}%, ${gradient.color.l}%, ${gradient.transparent / 100})`;
    } else {
        return `hsla(${gradient.color.h}, ${gradient.color.s}%, ${gradient.color.l}%, 1)`;
    }
}

function fillPanel() {
    if (selectedGradient) {
        console.log(selectedGradient);
        const id = selectedGradient.id;
        console.log(id);
        const row = document.querySelector(`.panel-row[data-id="${id}"]`);
        row.querySelector(".panel-input-x").value = selectedGradient.x.toFixed(2);
        row.querySelector(".panel-input-y").value = selectedGradient.y.toFixed(2);
        row.querySelector(".panel-input-size").value = selectedGradient.size;
    }
}

function setCanvasBg() {
    document.body.classList.toggle("transparent-color", mainColor === "transparent");
    const gradient = generateGradient();
    canvas.style.backgroundImage = gradient;
}

canvas.addEventListener("mouseup", e => {
    drag = false;
    selectedGradient = null;
    panel.querySelectorAll(`.panel-row`).forEach(row => row.classList.remove("panel-row-current"));

    if (dragElement) {
        document.body.classList.remove("canvas-dot-moved");
        dragElement.classList.remove("canvas-dot-selected");
        dragElement = null;
    }
});

canvas.addEventListener("mousedown", e => {
    const dot = e.target.closest(".canvas-dot");
    if (dot) {
        drag = true;
        dragElement = dot;
        dragElement.classList.add("canvas-dot-selected");
        document.body.classList.add("canvas-dot-moved");

        const id = +dragElement.dataset.id;

        panel.querySelectorAll(`.panel-row`).forEach(row => row.classList.remove("panel-row-current"))
        panel.querySelector(`.panel-row[data-id="${id}"]`).classList.add("panel-row-current");

        // debugger
        selectedGradient = gradients.find(el => el.id === id);
        console.log(selectedGradient);
    }
});

canvas.addEventListener("mousemove", e => {
    if (dragElement && drag && selectedGradient) {
        const x = e.pageX / canvas.offsetWidth * 100;
        const y = e.pageY / canvas.offsetHeight * 100;
        dragElement.style.left = `${x}%`;
        dragElement.style.top = `${y}%`;
        selectedGradient.x = x;
        selectedGradient.y = y;
        setCanvasBg();
        fillPanel();
    }
});

function generateGradientObj() {
    currentId++;

    return {
        id: currentId,
        x: 50,
        y: 50,
        color: {
            h: Math.random() * 360,
            s: 100,
            l: 60
        },
        transparent: 50,
        size: 100
    }
}

function generateGradientDot(obGradient) {
    const dot = document.createElement("div");
    dot.classList.add("canvas-dot");
    dot.dataset.id = obGradient.id;
    return dot;
}

function addNewGradient() {
    const obGradient = generateGradientObj();
    gradients.push(obGradient);
    generatePanelRow(obGradient);
    console.log(currentId, gradients);
    const dot = generateGradientDot(obGradient);
    canvas.append(dot);
    setCanvasBg();
}


const cp = new ColorPicker(placeMainColor, {
    libraryID: 100,
    showLibrary: false,
    showInput: false,
    showButton: true
});
cp.onColorSelect.on(color => {
    placeMainColor.style.background = color;
    mainColor = color;
    setCanvasBg();
});
cp.onButtonClick.on(color => {
    placeMainColor.classList.toggle("is-show");
});
placeMainColor.querySelector(".color").addEventListener("click", e => {
    e.stopPropagation();
})
placeMainColor.addEventListener("click", e => {
    e.currentTarget.classList.toggle("is-show");
})

panel.addEventListener("click", e => {
    //uwaga - tablica w panelu jest odwrocona dla lepszej wizualizacji
    //wiec jezeli klikam w dol to przenosze w kierunku poczatku tablicy
    const btn = e.target.closest(".panel-row-down");
    if (btn) {
        const row = btn.closest(".panel-row");
        const id = +row.dataset.id;
        const index = gradients.findIndex(el => el.id === id);
        if (index <= 0) return;
        row.nextElementSibling.after(row);
        console.log(gradients);
        const g = gradients;
        const temp = {...g[index - 1]};
        g[index - 1] = {...g[index]};
        g[index] = temp;
        recalculateNumbers();
        setCanvasBg();
    }
})

panel.addEventListener("click", e => {
    const btn = e.target.closest(".panel-row-up");
    if (btn) {
        const row = btn.closest(".panel-row");
        const id = +row.dataset.id;
        const index = gradients.findIndex(el => el.id === id);
        if (index >= gradients.length - 1) return;
        row.previousElementSibling.before(row);

        const g = gradients;
        const temp = {...g[index]};
        g[index] = {...g[index+1]};
        g[index+1] = temp;

        recalculateNumbers();
        setCanvasBg();
    }
})

function generatePanelRow(obGradient) {
    const div = document.createElement("div");
    div.classList.add("panel-row");
    div.dataset.id = obGradient.id;
    const indexInGradients = gradients.indexOf(obGradient);
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
            <input class="panel-input-size" data-key="size" type="range" min="10" max="200" value="${obGradient.size}" />
        </div>
        <div class="panel-input-group panel-input-group-4">
            <span class="panel-label">transparent</span>
            <input class="panel-input-transparent" data-key="transparent" type="range" min="0" max="100" value="${obGradient.transparent}" />
        </div>
        <div class="panel-input-group panel-input-group-buttons panel-input-5">
            <button class="panel-row-up">up</button>
            <button class="panel-row-down">down</button>
            <button class="panel-row-delete">x</button>
        </div>
    </div>
    `;
    panelList.prepend(div);

    const inputs = div.querySelectorAll(".panel-input-x, .panel-input-y, .panel-input-size, .panel-input-transparent");
    for (let input of inputs) {
        input.addEventListener("input", e => {
            const gradient = getGradientById(obGradient.id);
            gradient[input.dataset.key] = +e.target.value;
            if (input.dataset.key === "x" || input.dataset.key === "y") {
                const dot = canvas.querySelector(`.canvas-dot[data-id="${obGradient.id}"]`);
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
        const gradient = getGradientById(obGradient.id);
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
    cp.onHueSelect.on(color => {
        colorSelect(color);
    });
    cp.onButtonClick.on(color => {
        place.classList.toggle("is-show");
    });
    place.querySelector(".color").addEventListener("click", e => {
        e.stopPropagation();
    })
    place.addEventListener("click", e => {
        e.currentTarget.classList.toggle("is-show");
    })
}

function recalculateNumbers() {
    const rows = [...panelList.querySelectorAll(".panel-row")].reverse();

    rows.forEach((row, i) => {
        row.querySelector(".panel-color span").textContent = i + 1;
        const id = row.dataset.id;
        canvas.querySelector(`.canvas-dot[data-id="${id}"]`).textContent = i + 1;
    })
}

function deleteGradient(id) {
    gradients = gradients.filter(el => el.id !== id);
    deleteDot(id);
}

function deleteDot(id) {
    const dots = canvas.querySelectorAll(".canvas-dot");
    for (let dot of dots) {
        if (+dot.dataset.id === id) dot.remove();
    }
}

const btnAdd = document.querySelector("#panelAdd");
btnAdd.addEventListener("click", e => {
    addNewGradient();
    recalculateNumbers();
})

panelList.addEventListener("click", e => {
    const del = e.target.closest(".panel-row-delete");
    if (del) {
        const row = del.closest(".panel-row");
        const id = +row.dataset.id;
        row.remove();
        deleteGradient(id);
        recalculateNumbers();
        setCanvasBg();
    }
})

const panelToggle = document.querySelector(".panel-toggle");
panelToggle.addEventListener("click", e => {
    panel.classList.toggle("panel-mini");
})

const panelCode = document.querySelector(".panel-code");
panelCode.addEventListener("click", e => {
    let bg = '';
    if (!gradients.length) {
        bg = `background: ${mainColor}`;
    } else {
        bg = `background-image: ${generateGradient()};`;
    }
    popup.querySelector(".popup-code").innerHTML = bg;
    popup.classList.add("is-show");
})

const panelMainColorClear = document.querySelector(".panel-main-color-clear");
panelMainColorClear.addEventListener("click", e => {
    mainColor = "transparent";
    placeMainColor.style.background = "";
    placeMainColor.classList.add("transparent-color");
    document.body.classList.add("transparent-color");
    setCanvasBg();
})

const dotsToggle = document.querySelector(".toggle-dots");
dotsToggle.addEventListener("click", e => {
    canvas.classList.toggle("canvas-dots-hide");
    e.target.classList.toggle("is-active");
})

const popup = document.querySelector(".popup");
const popupClose = popup.querySelector(".popup-close");
const popupBtn = popup.querySelector(".popup-btn");
const popupCode = popup.querySelector(".popup-code");

popupClose.addEventListener("click", e => {
    popup.classList.remove("is-show");
    popupBtn.classList.remove("is-copy");
})

popupBtn.addEventListener("click", e => {
    const range = document.createRange() // create new range object
    range.selectNodeContents(popupCode) // set range to encompass desired element text
    const selection = window.getSelection() // get Selection object from currently user selected text
    selection.removeAllRanges() // unselect any user selected text (if any)
    selection.addRange(range)
    document.execCommand('copy');
    popupBtn.classList.add("is-copy");
})

