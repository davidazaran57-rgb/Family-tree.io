import { getColor } from "./colorGenerator.js";
import { applyHover } from "./hover.js";

export function drawPerson(container, x, y, offset, smallRadius, person) {

    const angle = Math.atan2(y, x) * 180 / Math.PI;

    const g = container.append("g")
        .attr("transform", `
            translate(${x}, ${y})
            rotate(${angle + 270})
        `);

    d3.selectAll("circle")
        .attr("cy", 0)
        .attr("stroke-width", 2)
        .attr("stroke", "#000");

    d3.selectAll("text")
        .attr("text-anchor", "middle")
        .attr("font-size", "14px");

    // 🔵 ОСНОВНОЙ ЧЕЛОВЕК
    g.append("circle")
        .attr("cx", -offset)
        .attr("r", smallRadius)
        .attr("fill", getColor(person))
        

    // 💍 СУПРУГ (если есть)
    if (person?.spouse) {
        g.append("circle")
            .attr("cx", offset)
            .attr("r", smallRadius)
            .attr("fill", getColor(person.spouse))

        // линия между супругами
        g.append("line")
            .attr("x1", -offset + smallRadius)
            .attr("x2", offset - smallRadius)
            .attr("y1", 0)
            .attr("y2", 0)
            .attr("stroke-width", 2)
            .attr("stroke", "#000");

        g.append("text")
            .attr("y", smallRadius + 15)
            .attr("x", offset)

            .text(person.spouse.firstName);
        g.append("text")
            .attr("y", smallRadius + 30)
            .attr("x", offset)
            .text(person.spouse.lastName);    
    }

    // 📝 имя (основного)
    if (person?.firstName) {
        g.append("text")
            .attr("y", smallRadius + 15)
            .attr("x", -offset)
            .text(person.firstName);
        g.append("text")
            .attr("y", smallRadius + 30)
            .attr("x", -offset)
            .text(person.lastName);    
    }
    
    applyHover(g, person);
    return g;
}