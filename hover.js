// hover.js

let activePerson = null;

/**
 * 🔥 получаем предков
 */
function getAncestors(person) {
    const ancestors = [];

    let current = person;
    while (current) {
        ancestors.push(current);
        current = current.parent;
    }

    return ancestors;
}

/**
 * 🔥 подсветка hover (временно)
 */
function highlight(ancestors) {
    d3.selectAll(".person").classed("highlight", false);

    ancestors.forEach(p => {
        if (p._element) {
            d3.select(p._element).classed("highlight", true);
        }
    });
}

/**
 * 🔥 сброс hover
 */
function clearHighlight() {
    if (activePerson) return; // ❗ если есть клик — не сбрасываем
    d3.selectAll(".person")
        .classed("highlight", false)
        .classed("child-highlight", false);
}

/**
 * 🔥 режим фокуса (по клику)
 */
function focusOn(person) {
    const ancestors = getAncestors(person);
    const children = person.children || [];

    d3.selectAll(".person")
        .classed("dimmed", true)
        .classed("highlight", false);

    // предки (красный)
    ancestors.forEach(p => {
        if (p._element) {
            d3.select(p._element)
                .classed("dimmed", false)
                .classed("highlight", true);
        }
    });

    // дети (синий)
    children.forEach(c => {
        if (c._element) {
            d3.select(c._element)
                .classed("dimmed", false)
                .classed("child-highlight", true);
        }
    });

    // сам человек
    if (person._element) {
        d3.select(person._element)
            .classed("dimmed", false)
            .classed("highlight", true);
    }
}

/**
 * 🔥 сброс фокуса
 */
function clearFocus() {
    d3.selectAll(".person")
        .classed("dimmed", false)
        .classed("highlight", false)
        .classed("child-highlight", false);
}

/**
 * 🔥 подключение к элементу
 */
export function applyHover(g, person) {

    person._element = g.node();
    g.classed("person", true);

    // 🖱 hover
    g.on("mouseover", () => {
        if (activePerson) return;

        const ancestors = getAncestors(person);
        highlight(ancestors);
    });

    g.on("mouseout", () => {
        clearHighlight();
    });

    // 🖱 click (главное)
    g.on("click", () => {

        // если уже активен — выключаем
        if (activePerson === person) {
            activePerson = null;
            clearFocus();
            return;
        }

        activePerson = person;
        focusOn(person);
    });
}
