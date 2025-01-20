function getCoordinates(obj, courtRect) {
    const rect = obj.getBoundingClientRect();
    return {
        x: (rect.left - courtRect.left + (rect.width /2)),
        y: (rect.top - courtRect.top + (rect.height /3))
    };
}
function getCoordinatesWithHandedness(coords,player="hitter",side="right", hitterHandedAdjustment=0) {
    let playerAdj, sideAdj;
    if (player==="hitter"){
        playerAdj = -1;
        }
    else {
        playerAdj = 1;
    }
    if (side==="left"){
            sideAdj = 1;
        }                
    else {
        sideAdj = -1;
    }    
    coords.y = coords.y + (hitterHandedAdjustment *.7 * playerAdj * sideAdj)
    return coords;
}

function getDistanceBetweenPoints(x1, y1, x2, y2) { 
    const deltaX = x2 - x1; 
    const deltaY = y2 - y1; 
    return Math.sqrt(deltaX * deltaX + deltaY * deltaY); 
}

function rotatePoint(cx, cy, angle, x, y) {
    const radians = angle * (Math.PI / 180);
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);
    const nx = (cos * (x - cx)) + (sin * (y - cy)) + cx;
    const ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
    return { x: nx, y: ny };
}

function getRotatedBoundingBox(x, y, width, height, angle) {
    const cx = x + width / 2;
    const cy = y + height / 2;

    const corners = [
        rotatePoint(cx, cy, angle, x, y),
        rotatePoint(cx, cy, angle, x + width, y),
        rotatePoint(cx, cy, angle, x, y + height),
        rotatePoint(cx, cy, angle, x + width, y + height)
    ];

    const minX = Math.min(...corners.map(p => p.x));
    const minY = Math.min(...corners.map(p => p.y));
    const maxX = Math.max(...corners.map(p => p.x));
    const maxY = Math.max(...corners.map(p => p.y));

    return {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY,
        midTop: { x: (corners[0].x + corners[1].x) / 2, y: (corners[0].y + corners[1].y) / 2 },
        midBottom: { x: (corners[2].x + corners[3].x) / 2, y: (corners[2].y + corners[3].y) / 2 },
    };
}

function getLinesIntersectionPoint(x1, y1, x2, y2, x3, y3, x4, y4) {
    const slopeA = (y2 - y1) / (x2 - x1);
    const interceptA = y1 - slopeA * x1;
    const slopeB = (y4 - y3) / (x4 - x3);

    const interceptB = y3 - slopeB * x3;
    const x = (interceptB - interceptA) / (slopeA - slopeB);
    const y = slopeA * x + interceptA;
    return { x: x, y: y };
}
function getPointFromAngle(x1, y1, angle, length) {
    // Convert the angle to radians
    const angleRad = angle * (Math.PI / 180);
    
    // Calculate the end point using trigonometry
    const x2 = x1 + length * Math.cos(angleRad);
    const y2 = y1 + length * Math.sin(angleRad);
    return { x: x2, y: y2 };

}

// gets the Angle such that the first object can be rotated to face the second object.  The angle is in degrees.
function getFacingAngle(returnerCoords, hitterCenter) {
    return Math.atan2(returnerCoords.y - hitterCenter.y, returnerCoords.x - hitterCenter.x) * 180 / Math.PI;
}