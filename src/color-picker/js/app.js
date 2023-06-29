import { ColorPicker } from "./colorpicker.js";

const place = document.querySelector("#test");
const cp = new ColorPicker(place, {
    libraryID : "kolory"
});

cp.onColorSelect.on(color => console.log(color));
cp.onButtonClick.on(color => console.log(color));

cp.setColor("#472622");