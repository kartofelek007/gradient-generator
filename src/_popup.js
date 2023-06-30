/**
 * pokazuje popup
 * @param element
 */
function showPopup(element) {
    if (element) {
        element.classList.add("is-show");
        document.body.classList.add("popup-show");
    }
}

/**
 * ukrywa popup
 * @param element
 */
function hidePopup(element) {
    if (element) {
        element.classList.remove("is-show");
        document.body.classList.remove("popup-show");
    }
}

const DOM = {}
DOM.btnCopy = document.querySelector("#copyToClipboard");
DOM.codeDiv = document.querySelector("#finalCode");
DOM.allPopupClose = document.querySelectorAll(".popup-close");

DOM.btnCopy.addEventListener('click', () => {
    const range = document.createRange(); // create new range object
    range.selectNodeContents(DOM.codeDiv); // set range to encompass desired element text
    const selection = window.getSelection(); // get Selection object from currently user selected text
    selection.removeAllRanges(); // unselect any user selected text (if any)
    selection.addRange(range);
    document.execCommand('copy');
    DOM.btnCopy.classList.add('is-copy');
});


DOM.allPopupClose.forEach(el => {
    el.addEventListener("click", e => {
        const popup = e.target.closest(".popup");
        hidePopup(popup)
    })
})

document.addEventListener("keyup", e => {
    if (e.key === "Escape") {
        DOM.allPopupClose.forEach(el => {
            el.click();
        });
    }
})

export const popup = {
    showPopup,
    hidePopup
}