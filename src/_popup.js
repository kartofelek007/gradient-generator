const DOM = {};
DOM.popup = document.querySelector('.popup');
DOM.popupClose = DOM.popup.querySelector('.popup-close');
DOM.popupBtn = DOM.popup.querySelector('.popup-btn');
DOM.popupCode = DOM.popup.querySelector('.popup-code');

DOM.popupBtn.addEventListener('click', (e) => {
    const range = document.createRange(); // create new range object
    range.selectNodeContents(DOM.popupCode); // set range to encompass desired element text
    const selection = window.getSelection(); // get Selection object from currently user selected text
    selection.removeAllRanges(); // unselect any user selected text (if any)
    selection.addRange(range);
    document.execCommand('copy');
    DOM.popupBtn.classList.add('is-copy');
});

DOM.popupClose.addEventListener('click', (e) => {
    document.body.classList.remove("popup-show");
    DOM.popup.classList.remove('is-show');
    DOM.popupBtn.classList.remove('is-copy');
});

document.addEventListener("keyup", e => {
    if (e.key === "Escape") {
        DOM.popupClose.click();
    }
})

/**
 * Pokazuje popup z treścią gradientu
 * @param {string} bg
 */
function showPopup(bg) {
    document.body.classList.add("popup-show");
    DOM.popup.querySelector('.popup-code').innerHTML = bg;
    DOM.popup.classList.add('is-show');
}

export const popup = {
    showPopup
}