const canvas = document.getElementById('paintCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let painting = false;
let lastPoint = { x: 0, y: 0 };
let lastLineWidth = 20; // Initial line width

const MAX_LINE_WIDTH = 40; // You can adjust this value
const MIN_LINE_WIDTH = 5; // You can adjust this value

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

let lastAngle = null;  // Track the last movement angle

function draw(event) {
    if (!painting) return;

    const currentPoint = { x: event.clientX, y: event.clientY };
    const lineWidth = getLineWidth(lastPoint, currentPoint);
    ctx.lineWidth = (lastLineWidth + lineWidth) / 2;

    const currentAngle = Math.atan2(currentPoint.y - lastPoint.y, currentPoint.x - lastPoint.x);

    if (lastAngle !== null) {
        const angleDifference = Math.abs(currentAngle - lastAngle);
        if (angleDifference > 1) {
            createSplatter(currentPoint.x, currentPoint.y, 4, 25);  // Scatter more paint if turning rapidly
        }
    }

    lastAngle = currentAngle;

    ctx.lineWidth = (lastLineWidth + lineWidth) / 2;  // Average to smooth the transition of line width

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();  // Move this line here
    ctx.moveTo(lastPoint.x, lastPoint.y);  // Use the lastPoint instead of the current point
    ctx.lineTo(event.clientX, event.clientY);
    ctx.stroke();

    // If the line width is thin, create splatters around the line
    if (ctx.lineWidth < 15) {
        createSplatter(event.clientX, event.clientY, 2, 10);
    }

    lastPoint = { x: event.clientX, y: event.clientY };
    lastLineWidth = ctx.lineWidth;
}

function midPointBtw(p1, p2) {
    return {
        x: p1.x + (p2.x - p1.x) / 2,
        y: p1.y + (p2.y - p1.y) / 2
    };
}


/**
 * Calculate the line width based on the movement speed of the cursor.
 * @param {Object} pointA - The initial point {x, y}.
 * @param {Object} pointB - The current point {x, y}.
 * @returns {number} - The calculated line width.
 */
function getLineWidth(pointA, pointB) {
    const distance = Math.sqrt(Math.pow(pointB.x - pointA.x, 2) + Math.pow(pointB.y - pointA.y, 2));

    // Creates large stains when distance is close to 0
    if (distance < 1) {
        createBigSplatter(pointB.x, pointB.y);
        return MAX_LINE_WIDTH;
    }

    const lineWidth = MAX_LINE_WIDTH - (distance);
    return Math.min(MAX_LINE_WIDTH, Math.max(MIN_LINE_WIDTH, lineWidth));
}

/**
 * Create a big splatter effect around a point.
 * @param {number} x - The x coordinate of the center point.
 * @param {number} y - The y coordinate of the center point.
 */
function createBigSplatter(x, y) {
    const numberOfSplatters = Math.floor(Math.random() * 4) + 1; // 1 to 4 big splatters
    for (let i = 0; i < numberOfSplatters; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 10; // adjust this for distance between center and big splatter
        const offsetX = Math.cos(angle) * distance;
        const offsetY = Math.sin(angle) * distance;

        const ellipseWidth = Math.random() * 30 + 20;  // random value between 20 and 50
        const ellipseHeight = Math.random() * 20 + 10; // random value between 10 and 30

        ctx.beginPath();
        ctx.ellipse(x + offsetX, y + offsetY, ellipseWidth, ellipseHeight, angle, 0, Math.PI * 2);
        ctx.fill();
    }
}


/**
 * Create a splatter effect around a point.
 * @param {number} x - The x coordinate of the center point.
 * @param {number} y - The y coordinate of the center point.
 * @param {number} maxDots - The maximum number of dots for the splatter.
 * @param {number} maxRadius - The maximum radius for the splatter dots.
 */

const MIN_SPLATTER_DISTANCE = 2;
function createSplatter(x, y, maxDots, maxRadius) {
    for (let i = 0; i < maxDots; i++) {
        const angle = Math.random() * Math.PI * MIN_SPLATTER_DISTANCE;  // 0 to 2π
        const distance = Math.random() * maxRadius + 1;
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
    windowContent += '<img alt="Pollock Style"" src="' + dataURL + '">';
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

//Share on Twitter
document.getElementById('shareOnTwitter').addEventListener('click', shareOnTwitter);

function shareOnTwitter() {
    const base = "https://twitter.com/intent/tweet";
    const text = encodeURIComponent("Check out my creation on JacksonPollock by rxxuzi!");
    const url = encodeURIComponent("https://rxxuzi.github.io/JacksonPollock/");
    const via = "rxxuzi";
    const hashtags = encodeURIComponent("JacksonPollock");

    const tweetURL = `${base}?text=${text}&url=${url}&via=${via}&hashtags=${hashtags}`;

    window.open(tweetURL, '_blank');
}
