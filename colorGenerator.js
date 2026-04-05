const randomColor = () => ({
    r: Math.floor(Math.random() * 200 + 30),
    g: Math.floor(Math.random() * 200 + 30),
    b: Math.floor(Math.random() * 200 + 30)
});

const mixColors = (c1, c2) => ({
    r: Math.floor((c1.r + c2.r) / 2),
    g: Math.floor((c1.g + c2.g) / 2),
    b: Math.floor((c1.b + c2.b) / 2)
});

const toCss = (c) => `rgb(${c.r}, ${c.g}, ${c.b})`;

export function assignColors(root) {

    if (!root._color) {
        root._color = randomColor();
    }

    function traverse(person) {
        if (!person) return;

        // spouse всегда случайный
        if (person.spouse && !person.spouse._color) {
            person.spouse._color = randomColor();
        }

        const children = person.children || [];

        children.forEach(child => {

            // spouse ребёнка тоже случайный
            if (child.spouse && !child.spouse._color) {
                child.spouse._color = randomColor();
            }

            // ребёнок = смесь родителей
            if (person.spouse) {
                child._color = mixColors(
                    person._color,
                    person.spouse._color
                );
            } else {
                child._color = person._color;
            }

            traverse(child);
        });
    }

    traverse(root);

    // перевод в CSS
    function apply(person) {
        if (!person) return;

        person.color = toCss(person._color);

        if (person.spouse) {
            person.spouse.color = toCss(person.spouse._color);
        }

        (person.children || []).forEach(apply);
    }

    apply(root);
}

// 🔥 отдельная функция получения цвета
export function getColor(person) {
    return person?.color || "#ffffff";
}