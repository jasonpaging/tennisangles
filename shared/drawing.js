function drawPolygon(points, fillColor, ctx) {
    ctx.beginPath();
    ctx.lineWidth = 0;
    ctx.moveTo(points[0].x, points[0].y); // Move to the first point
    
    // Loop through the rest of the points
    for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
    }

    ctx.closePath(); // Close the path
    ctx.fillStyle = fillColor; // Set the fill color
    ctx.fill(); // Fill the polygon
}
