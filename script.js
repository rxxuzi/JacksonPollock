const canvas = document.getElementById('paintCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let painting = false;
let lastPoint = { x: 0, y: 0 };
let lastLineWidth = 30;  // Increased the initial line width

// Event listeners
canvas.addEventListener('mousedown', startPainting);
canvas.addEventListener('mouseup', stopPainting);
canvas.addEventListener('mousemove', draw);

function startPainting(event) {
    painting = true;
    lastPoint = { x: event.clientX, y: event.clientY };
}

function stopPainting() {
    painting = false;
    ctx.beginPath();
    createSplatter(lastPoint.x, lastPoint.y, 10, 50);  // Create a splatter when the cursor stops
}

function draw(event) {
    if (!painting) return;

    const lineWidth = getLineWidth(lastPoint, { x: event.clientX, y: event.clientY });
    ctx.lineWidth = (lastLineWidth * 3 + lineWidth) / 4;  // Average to smooth the transition of line width
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.lineTo(event.clientX, event.clientY);
    ctx.stroke();

    // If the line width is thin, create splatters around the line
    if (ctx.lineWidth < 15) {
        createSplatter(event.clientX, event.clientY, 2, 10);
    }

    ctx.beginPath();
    ctx.moveTo(event.clientX, event.clientY);

    lastPoint = { x: event.clientX, y: event.clientY };
    lastLineWidth = ctx.lineWidth;
}

/**
 * Calculate the line width based on the movement speed of the cursor.
 * @param {Object} pointA - The initial point {x, y}.
 * @param {Object} pointB - The current point {x, y}.
 * @returns {number} - The calculated line width.
 */
function getLineWidth(pointA, pointB) {
    const distance = Math.sqrt(Math.pow(pointB.x - pointA.x, 2) + Math.pow(pointB.y - pointA.y, 2));
    return 50 - (distance / 1.5);  // Increased the max line width
}

/**
 * Create a splatter effect around a point.
 * @param {number} x - The x coordinate of the center point.
 * @param {number} y - The y coordinate of the center point.
 * @param {number} maxDots - The maximum number of dots for the splatter.
 * @param {number} maxRadius - The maximum radius for the splatter dots.
 */
function createSplatter(x, y, maxDots, maxRadius) {
    for (let i = 0; i < maxDots; i++) {
        const angle = Math.random() * Math.PI * 2;  // 0 to 2π
        const distance = Math.random() * maxRadius;
        const offsetX = Math.cos(angle) * distance;
        const offsetY = Math.sin(angle) * distance;

        ctx.beginPath();
        ctx.arc(x + offsetX, y + offsetY, Math.random() * 3, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Clear Canvas
document.getElementById('clearCanvas').addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});

// Change Brush Color
document.getElementById('colorPicker').addEventListener('input', (event) => {
    ctx.strokeStyle = event.target.value;
    ctx.fillStyle = event.target.value;
});

// Download as PNG
document.getElementById('download').addEventListener('click', () => {
    const name =  prompt('Enter a name for your painting');
    const dataURL = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataURL;
    if (name === null){
        a.download = 'myPainting.png';
    }else {
        a.download = name + '.png';
    }
    a.click();
});

// Print Canvas
document.getElementById('print').addEventListener('click', () => {
    const dataURL = canvas.toDataURL('image/png');
    let windowContent = '<!DOCTYPE html>';
    windowContent += '<html lang="en">';
    windowContent += '<head><title>Print canvas</title></head>';
    windowContent += '<body>';
    windowContent += '<img src="' + dataURL + '">';
    windowContent += '</body>';
    windowContent += '</html>';
    const printWin = window.open('', '', 'width=340,height=260');
    printWin.document.open();
    printWin.document.write(windowContent);
    printWin.document.addEventListener('load', function() {
        printWin.print();
    }, true);
});

// Toggle the display of #info
document.getElementById('toggleInfo').addEventListener('click', () => {
    const infoDiv = document.getElementById('info');
    if (infoDiv.style.display === 'none' || infoDiv.style.display === '') {
        infoDiv.style.display = 'block';
    } else {
        infoDiv.style.display = 'none';
    }
});