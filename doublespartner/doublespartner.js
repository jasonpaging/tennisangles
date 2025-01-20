document.addEventListener('DOMContentLoaded', (event) => {
    const toggleSwitch = document.getElementById('handednessToggle');
    const court = document.getElementById('court');
    const canvas = document.getElementById('courtCanvas');
    const ctx = canvas.getContext('2d');
    const tennisBall = document.getElementById('tennisball');
    const hitter1 = document.getElementById('hitter1');
    const returner1 = document.getElementById('returner1');
             
    function drawLineOfSight() {
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
        const courtRect = court.getBoundingClientRect();
        const targetBaselineTop = { x: courtRect.right, y: courtRect.top };
        const targetBaselineBottom = { x: courtRect.right + 1, y: courtRect.top + courtRect.height };     

        const returnerRect = returner1.getBoundingClientRect();    
        const returnerCoords = getCoordinates(returner1, courtRect);

        const hitterRect = hitter1.getBoundingClientRect();
        const hitterHandedness = toggleSwitch.checked ? 'left' : 'right';
        const hitterCenter = getCoordinates(hitter1, courtRect);
        let hitter1Scale, hitter1Deg;

        tennisBall.style.left = `${hitterRect.left - courtRect.left + (hitterRect.width * 1)}px`;
        if (hitterHandedness == 'right') {
            tennisBall.style.top = `${hitterRect.bottom - (hitterRect.height * .2) - courtRect.top}px`;
            hitter1Scale = 1;
            hitter1Deg = 0;
        } else {
            tennisBall.style.top = `${hitterRect.top + (hitterRect.height * .1) - courtRect.top}px`;
            hitter1Scale = -1;
            hitter1Deg = 180;
        }
        const hitterCoords = getCoordinates(tennisBall, courtRect);

        // Calculate the angle between hitter and returner 
        const facingAngle = getFacingAngle(returnerCoords, hitterCenter); 
        // Calculate rotation to the returner 
        const returnerRectRotated = getRotatedBoundingBox(returnerRect.left - courtRect.left, returnerRect.top - courtRect.top, returnerRect.width, returnerRect.height, -1* facingAngle);
        const returnerBlockingCoords = {topx: returnerRectRotated.midTop.x, topy: returnerRectRotated.midTop.y, botx: returnerRectRotated.midBottom.x, boty: returnerRectRotated.midBottom.y};

        // Move sprites
        returner1.style.transform = `rotate(${facingAngle}deg)`;
        hitter1.style.transform = `scaleX(${hitter1Scale}) rotate(${hitter1Deg}deg)`;

        const playerDistance = getDistanceBetweenPoints(hitterCoords.x, hitterCoords.y, returnerCoords.x, returnerCoords.y);

        points = []
        // Lines from the tennisball to the returner (light gray lines)
        ctx.beginPath();
        ctx.moveTo(hitterCoords.x, hitterCoords.y);
        ctx.lineTo(returnerBlockingCoords.topx, returnerBlockingCoords.topy);
        points.push({x: returnerBlockingCoords.topx, y: returnerBlockingCoords.topy});
        intersectionPoint = getLinesIntersectionPoint(hitterCoords.x, hitterCoords.y, returnerBlockingCoords.topx, returnerBlockingCoords.topy, targetBaselineTop.x,targetBaselineTop.y,targetBaselineBottom.x,targetBaselineBottom.y);
        points.push({x: intersectionPoint.x, y: intersectionPoint.y});
        ctx.strokeStyle = 'gray';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(hitterCoords.x, hitterCoords.y);
        ctx.lineTo(returnerBlockingCoords.botx, returnerBlockingCoords.boty);
        intersectionPoint = getLinesIntersectionPoint(hitterCoords.x, hitterCoords.y, returnerBlockingCoords.botx, returnerBlockingCoords.boty, targetBaselineTop.x,targetBaselineTop.y,targetBaselineBottom.x,targetBaselineBottom.y);
        points.push({x: intersectionPoint.x, y: intersectionPoint.y});
        points.push({x: returnerBlockingCoords.botx, y: returnerBlockingCoords.boty});
        // complete polygon points
        points.push({x: returnerBlockingCoords.topx, y: returnerBlockingCoords.topy});
        ctx.strokeStyle = 'gray';
        ctx.lineWidth = 1;
        ctx.stroke();

        // polygon that extends the lines from the tennis ball behind the returner and shades the area dark gray
        drawPolygon(points, 'rgba(0, 0, 0, 0.2)',ctx);
        points = []

        // Line from top of returner to baseline with angle increased based on distance to hitter
        ctx.beginPath();
        ctx.moveTo(returnerBlockingCoords.topx, returnerBlockingCoords.topy);
        points.push({x: returnerBlockingCoords.topx, y: returnerBlockingCoords.topy});
        // calculate an extension on both sides of the returner that they can reach/strafe to
        strafeCoords = getPointFromAngle(returnerBlockingCoords.topx, returnerBlockingCoords.topy, facingAngle - 85, playerDistance/5);
        ctx.lineTo(strafeCoords.x, strafeCoords.y);
        points.push({x: strafeCoords.x, y: strafeCoords.y});
        intersectionPoint = getLinesIntersectionPoint(hitterCoords.x, hitterCoords.y, strafeCoords.x, strafeCoords.y, targetBaselineTop.x,targetBaselineTop.y,targetBaselineBottom.x,targetBaselineBottom.y);
        ctx.lineTo(intersectionPoint.x, intersectionPoint.y);
        points.push({x: intersectionPoint.x, y: intersectionPoint.y});
        ctx.strokeStyle = 'gray';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(returnerBlockingCoords.botx, returnerBlockingCoords.boty);
        strafeCoords = getPointFromAngle(returnerBlockingCoords.botx, returnerBlockingCoords.boty, facingAngle + 85, playerDistance/5);
        ctx.lineTo(strafeCoords.x, strafeCoords.y);
        intersectionPoint = getLinesIntersectionPoint(hitterCoords.x, hitterCoords.y, strafeCoords.x, strafeCoords.y, targetBaselineTop.x,targetBaselineTop.y,targetBaselineBottom.x,targetBaselineBottom.y);
        ctx.lineTo(intersectionPoint.x, intersectionPoint.y);
        points.push({x: intersectionPoint.x, y: intersectionPoint.y});
        points.push({x: strafeCoords.x, y: strafeCoords.y});
        points.push({x: returnerBlockingCoords.botx, y: returnerBlockingCoords.boty});
        ctx.strokeStyle = 'gray';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        points.push({x: returnerBlockingCoords.topx, y: returnerBlockingCoords.topy});
        drawPolygon(points, 'rgba(0, 0, 0, 0.4)',ctx);
    }
    
    function handlePlayerSelection(event) { 
        const scenario = event.target.value; 
        switch (scenario) { 
            case 'Scenario0': 
                hitter1.style.left = 'calc(80vw *(100/780))';
                hitter1.style.top = 'calc(80vw *(165/780))'; 
                returner1.style.left = 'calc(80vw *(600/780))'; 
                returner1.style.top = 'calc(80vw *(160/780))';
                toggleSwitch.checked = false;
                break; 
            case 'Scenario1': 
                hitter1.style.left = 'calc(80vw *(370/780))'; 
                hitter1.style.top = 'calc(80vw *(12/780))'; 
                returner1.style.left = 'calc(80vw *(525/780))'; 
                returner1.style.top = 'calc(80vw *(100/780))'; 
                toggleSwitch.checked = true;
                break; 
            case 'Scenario2': 
                hitter1.style.left = 'calc(80vw *(60/780))'; 
                hitter1.style.top = 'calc(80vw *(275/780))'; 
                returner1.style.left = 'calc(80vw *(525/780))'; 
                returner1.style.top = 'calc(80vw *(250/780))'; 
                toggleSwitch.checked = false;
                break; 
        }
        drawLineOfSight();
    }

    function resizeCanvas() { 
        canvas.width = court.clientWidth; 
        canvas.height = court.clientHeight; 
        drawLineOfSight(); // Redraw on resize 
    }
    
    [hitter1, returner1].forEach(player => {
        let offsetX, offsetY;
        // Touch events
        player.addEventListener('touchstart', function(e) {
            const touch = e.touches[0];
            offsetX = touch.clientX - player.getBoundingClientRect().left;
            offsetY = touch.clientY - player.getBoundingClientRect().top;
        }, { passive: false });
        player.addEventListener('touchmove', function(e) {
            const touch = e.touches[0];
            const newX = touch.clientX - offsetX;
            const newY = touch.clientY - offsetY;
            player.style.left = `${newX}px`;
            player.style.top = `${newY}px`;
            e.preventDefault(); // Prevent scrolling during touchmove
            drawLineOfSight();
        }, { passive: false });
        player.addEventListener('touchend', function(e) {
            // You can handle touchend event here if needed
            console.log(`player position: ${player.style.left}, ${player.style.top}`);
        }, { passive: false });

        // Mouse events
        player.addEventListener('mousedown', function(e) {
            offsetX = e.clientX - player.getBoundingClientRect().left;
            offsetY = e.clientY - player.getBoundingClientRect().top;
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });

        function onMouseMove(e) {
            const newX = e.clientX - offsetX;
            const newY = e.clientY - offsetY;
            player.style.left = `${newX}px`;
            player.style.top = `${newY}px`;
            drawLineOfSight();
        }

        function onMouseUp(e) {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        }
        
    });

    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('orientationchange', resizeCanvas);                       
    toggleSwitch.addEventListener('change', drawLineOfSight);
    scenarioSelector.addEventListener('change', handlePlayerSelection);

    resizeCanvas(); // Initial call to set canvas size, draw elements
});