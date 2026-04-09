import { drawPerson } from "./drawPerson.js";
import { setupZoom } from "./zoom.js";
import { assignColors } from "./colorGenerator.js";

//d3.json("tree/family.json").then(data => {
d3.json("tree/tree.json").then(data => {
    assignColors(data.root);
    function linkParents(person) {
        if (!person) return;

        (person.children || []).forEach(child => {
            child.parent = person;
            linkParents(child);
        });
    }
    linkParents(data.root);
    const width = 1500;
    const height = 1500;

    const svgRoot = d3.select("#canvas");
    const zoomLayer = svgRoot.append("g");

    const svg = zoomLayer.append("g")
        .attr("transform", `translate(${width / 2}, ${height / 2})`);

    setupZoom(svgRoot, zoomLayer, width, height);

    const maxGenerations = data.max_generations;

    const baseRadius = 550;
    const innerRadius = baseRadius * 0.4; // 🔥 новый маленький круг

    const smallRadius = 25;
    const offset = smallRadius + 15;

    const ROWS = 6;
    const rowHeight = 500 / ROWS;

    // 🟢 🔥 маленький круг
    svg.append("circle")
        .attr("r", innerRadius)
        .attr("fill", "none")
        .attr("stroke", "#000")
        .attr("stroke-width", 3);

    // 🟢 остальные круги
    for (let i = 1; i <= maxGenerations; i++) {
        svg.append("circle")
            .attr("r", innerRadius + i * baseRadius)
            .attr("fill", "none")
            .attr("stroke", "#000")
            .attr("stroke-width", 3);
    }

    function drawGeneration(parents, startAngle, endAngle, depth) {
        if (!parents || parents.length === 0) return;

        const sectorAngle = endAngle - startAngle;
        const familyCount = parents.length;

        const angleStep = sectorAngle / familyCount;

        const maxChildren = Math.max(
            ...parents.map(p => (p.children ? p.children.length : 0)),
            0
        );

        for (let childIndex = 0; childIndex < maxChildren; childIndex++) {

            parents.forEach((parent, familyIndex) => {
                const children = parent.children || [];
                const child = children[childIndex];

                if (!child) return;

                const angle = startAngle + angleStep * (familyIndex + 0.5);

                // 🔥 теперь считаем от innerRadius
                const radius =
                    innerRadius +
                    depth * baseRadius +
                    (childIndex + 1) * rowHeight;

                const x = radius * Math.cos(angle);
                const y = radius * Math.sin(angle);

                drawPerson(svg, x, y, offset, smallRadius, child);
            });
        }

        const nextParents = [];

        for (let childIndex = 0; childIndex < maxChildren; childIndex++) {
            parents.forEach(parent => {
                const children = parent.children || [];
                if (children[childIndex]) {
                    nextParents.push(children[childIndex]);
                }
            });
        }

        drawGeneration(nextParents, startAngle, endAngle, depth + 1);
    }

    // 🟢 центр
    drawPerson(svg, 0, 1, offset, smallRadius, data.root);

    const root = data.root;
    const children = root.children || [];
    const kidsCount = children.length;

    const fullCircle = 2 * Math.PI;
    const sectorSize = fullCircle / kidsCount;

    children.forEach((child, i) => {
        const startAngle = i * sectorSize;
        const endAngle = startAngle + sectorSize;

        // 🔥 границы теперь начинаются с innerRadius
        const x1 = innerRadius * Math.cos(startAngle);
        const y1 = innerRadius * Math.sin(startAngle);
        const x2 = (innerRadius + maxGenerations * baseRadius) * Math.cos(startAngle);
        const y2 = (innerRadius + maxGenerations * baseRadius) * Math.sin(startAngle);

        svg.append("line")
            .attr("x1", x1)
            .attr("y1", y1)
            .attr("x2", x2)
            .attr("y2", y2)
            .attr("stroke", "#333")
            .attr("stroke-width", 2);

        // 🔥 первое поколение на маленьком круге
        const angle = (startAngle + endAngle) / 2;

        const firstGenRadius = innerRadius + baseRadius / 2;

        const x = firstGenRadius * Math.cos(angle);
        const y = firstGenRadius * Math.sin(angle);

        drawPerson(svg, x, y, offset, smallRadius, child);

        drawGeneration([child], startAngle, endAngle, 1);
    });
});