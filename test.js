import { drawPerson } from "./drawPerson.js";
import { setupZoom } from "./zoom.js";

d3.json("family_tree.json").then(data => {
    const width = 1500;
    const height = 1500;

    const svgRoot = d3.select("#canvas");
    const zoomLayer = svgRoot.append("g");

    const svg = zoomLayer.append("g")
        .attr("transform", `translate(${width / 2}, ${height / 2})`);

    setupZoom(svgRoot, zoomLayer, width, height);

    const maxGenerations = data.max_generations;
    const baseRadius = 550;

    const smallRadius = 20;
    const offset = 25;

    // 🔥 расстояние между рядами
    const rowHeight = smallRadius * 2 + 10;

    // 🟢 круги поколений
    for (let i = 1; i <= maxGenerations; i++) {
        svg.append("circle")
            .attr("r", i * baseRadius)
            .attr("fill", "none")
            .attr("stroke", "#000")
            .attr("stroke-width", 2);
    }

    /**
     * 🔥 ВЕТКА С РЯДАМИ
     */
    function drawBranch(person, angle, depth, parentX = 0, parentY = 0) {
        if (!person) return;

        const children = person.children || [];
        if (children.length === 0) return;

        let remaining = [...children];
        let row = 0;

        while (remaining.length > 0) {
            row++;

            const radius = depth * baseRadius + row * rowHeight;

            // сколько помещается в ряд (по вертикали луча)
            const capacity = Math.max(1, Math.floor(baseRadius / rowHeight));

            const batch = remaining.splice(0, capacity);

            batch.forEach((child, i) => {
                // 🔥 небольшой угол, чтобы не было наложения
                const spacing = smallRadius * 10; // 🔥 расстояние между людьми (можешь увеличить)

                const angleStep = spacing / radius;

                const angleOffset = (i - (batch.length - 1) / 2) * angleStep;
                const childAngle = angle + angleOffset;

                const x = radius * Math.cos(childAngle);
                const y = radius * Math.sin(childAngle);

                // 🔗 линия
                svg.append("line")
                    .attr("x1", parentX)
                    .attr("y1", parentY)
                    .attr("x2", x)
                    .attr("y2", y)
                    .attr("stroke", "#aaa")
                    .attr("stroke-width", 1.5);

                drawPerson(svg, x, y, offset, smallRadius, child);

                // 🔁 рекурсия
                drawBranch(child, childAngle, depth + 1, x, y);
            });
        }
    }

    // 🟢 центр
    drawPerson(svg, 0, 0, offset, smallRadius, data.husband);

    const root = data.husband;
    const children = root.children || [];
    const kidsCount = children.length;

    const fullCircle = 2 * Math.PI;
    const sectorSize = fullCircle / kidsCount;

    children.forEach((child, i) => {
        const startAngle = i * sectorSize;
        const endAngle = startAngle + sectorSize;

        const angle = (startAngle + endAngle) / 2;

        const x = baseRadius * Math.cos(angle);
        const y = baseRadius * Math.sin(angle);

        // 🔗 линия от центра
        svg.append("line")
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", x)
            .attr("y2", y)
            .attr("stroke", "#aaa")
            .attr("stroke-width", 1.5);

        drawPerson(svg, x, y, offset, smallRadius, child);

        drawBranch(child, angle, 2, x, y);
    });
});