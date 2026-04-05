export function setupZoom(svgRoot, zoomLayer, width, height) {
    const zoom = d3.zoom()
        .scaleExtent([0.3, 5])
        .on("zoom", (event) => {
            zoomLayer.attr("transform", event.transform);
        });

    svgRoot.call(zoom);

    // начальное положение (центр + масштаб)
    svgRoot.call(
        zoom.transform,
        d3.zoomIdentity
            .translate(width / 2, height / 2)
            .scale(1)
    );
}