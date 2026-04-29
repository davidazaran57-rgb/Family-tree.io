let currentRotation = 0;
let step = 0;
let targetGroup = null;
let centerX = 0;
let centerY = 0;

export function initRotation(rootData, svgGroup, width, height) {
    const childrenCount = (rootData.children || []).length;

    // лучше по секторам (можешь вернуть childrenCount если нужно)
    step = 360 / childrenCount;

    targetGroup = svgGroup;
    centerX = width / 2;
    centerY = height / 2;
}

export function rotateLeft() {
    currentRotation -= step;
    applyRotation();
}

export function rotateRight() {
    currentRotation += step;
    applyRotation();
}

function applyRotation() {
    targetGroup
        .transition()
        .duration(500) // длительность анимации (мс)
        .ease(d3.easeCubicInOut) // плавность
        .attr(
            "transform",
            `translate(${centerX}, ${centerY}) rotate(${currentRotation})`
        );
}