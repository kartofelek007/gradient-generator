{
    const libraryID = "kolory";
    const place = document.querySelector("#test");

    const cp = new ColorPicker(place, {
        libraryID
    });

    cp.onColorSelect.on(color => console.log(color));
    cp.onButtonClick.on(color => console.log(color));

    cp.setColor("#472622");
}

{
    const libraryID = "koloryB";
    const place = document.querySelector("#test2");
    const cp = new ColorPicker(place, {
        libraryID
    });

    cp.onColorSelect.on(color => console.log(color));
    cp.onButtonClick.on(color => console.log(color));

    cp.setColor("#472622");
}

{
    const libraryID = "koloryB";
    const place = document.querySelector("#test3");
    const cp = new ColorPicker(place, {
        libraryID
    });

    cp.onColorSelect.on(color => console.log(color));
    cp.onButtonClick.on(color => console.log(color));

    cp.setColor("#472622");
}