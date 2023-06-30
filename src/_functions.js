/**
 * tworzy tekst gradientu
 * @param data
 * @param bgColor
 * @returns {string}
 */
export function generateGradient(data, bgColor) {
    let gradientsArr = [];
    let bgSize = ''; //`0 0 / 100% 100%`;

    if (bgColor !== null) {
        gradientsArr.push(`linear-gradient(${bgColor}, ${bgColor}) ${bgSize}`);
    }

    for (let gr of data) {
        const color = getColorOfGradient(gr);
        const blur = gr.size - gr.size * (gr.blur / 100);
        gradientsArr.push(
            `radial-gradient(circle at ${gr.x.toFixed(2)}% ${gr.y.toFixed(2)}%, ${color}, ${color} ${blur}%, transparent ${gr.size}%) ${bgSize}`
        );
    }

    const arr = [...gradientsArr].reverse();

    return arr.join(',');
}

/**
 * return color from gradient
 * @param gradient
 * @param withAlpha
 * @returns {string}
 */
export function getColorOfGradient(gradient, withAlpha = true) {
    if (withAlpha) {
        return `hsla(${gradient.color.h}, ${gradient.color.s}%, ${gradient.color.l}%, ${gradient.transparent / 100})`;
    } else {
        return `hsla(${gradient.color.h}, ${gradient.color.s}%, ${gradient.color.l}%, 1)`;
    }
}
