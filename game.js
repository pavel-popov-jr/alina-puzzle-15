// Game state variables
const canvas = document.getElementById('puzzle-canvas');
const ctx = canvas.getContext('2d');
const gridSize = 4; // For a 4x4 grid
const tileCount = gridSize * gridSize;
const tiles = [];
const initialEmptyIndex = tileCount - 1;
const srcImageSize = 1280; // The size of the source image
const photos = ['alina.png', 'alina-2.png', 'alina-3.png', 'alina-4.png', 'alina-5.png'];
let currentPhoto;
let emptyIndex = initialEmptyIndex; // Assuming the empty tile is initially in the last position after shuffle
let image = new Image();
let tileSize;
let gameStarted = false;

// Dynamically update canvas size based on the viewport width while maintaining aspect ratio
function updateCanvasSize() {
    const maxWidth = Math.min(window.innerWidth * 0.9, window.innerHeight * 0.9); // Adjust based on your layout preferences
    canvas.width = canvas.height = maxWidth; // Ensure the canvas is square
    tileSize = maxWidth / gridSize; // Recalculate tile size based on new canvas size
    drawTiles(); // Redraw the tiles to fit the new canvas size
}

window.addEventListener('resize', updateCanvasSize);
updateCanvasSize(); // Call this function to set initial size

// Initialize the game
function initGame() {
    tileSize = canvas.width / gridSize;
    let newPhoto;
    while (!newPhoto || newPhoto === currentPhoto) {
        newPhoto = getRandomPhoto();
    }
    currentPhoto = newPhoto;
    image.src = currentPhoto;
    image.addEventListener('load', () => setupTiles()); // Ensure image is loaded before setting up tiles
}

function getRandomPhoto() {
    return photos[Math.floor(Math.random()*photos.length)];
}

function resetGame() {

    gameStarted = false;
    emptyIndex = initialEmptyIndex;
    initGame();
}

// Split the image into tiles and shuffle them
function setupTiles() {
    for (let i = 0; i < tileCount; i++) {
        tiles[i] = { x: (i % gridSize) * tileSize, y: Math.floor(i / gridSize) * tileSize, index: i };
    }
    shuffleTiles();
    drawTiles();
}

// Shuffle the tiles using the Fisher-Yates (Knuth) Shuffle
function shuffleTiles() {
    let solvable = false;
    while (!solvable) {
        // Fisher-Yates (Knuth) Shuffle algorithm
        for (let i = tiles.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
        }
        // Ensure the empty space is set correctly after shuffling
        emptyIndex = tiles.findIndex(tile => tile.index === tileCount - 1);
        // Check if the new shuffle is solvable
        solvable = isSolvable();
    }
}

// Draw the tiles on the canvas
// Make sure to adjust the drawing logic to account for the different size of the source image
function drawTiles(showNumbers = true) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    tiles.forEach((tile, index) => {
        // Adjusted condition to not render the tile with number 16 unless the game is won.
        // This means we check if the index is not the empty index or if the game has started and it's not the winning condition.
        if (index !== emptyIndex && !(gameStarted && checkCompletion() && tile.index === tileCount - 1)) {
            // Recalculate the position of the tile based on the new tileSize
            const destX = (index % gridSize) * tileSize;
            const destY = Math.floor(index / gridSize) * tileSize;
            const srcX = (tile.index % gridSize) * (srcImageSize / gridSize);
            const srcY = Math.floor(tile.index / gridSize) * (srcImageSize / gridSize);

            ctx.drawImage(image, srcX, srcY, srcImageSize / gridSize, srcImageSize / gridSize, destX, destY, tileSize, tileSize);

            // ctx.drawImage(image,
            //     // Source coordinates and size
            //     (tile.x / tileSize) * (srcImageSize / gridSize), (tile.y / tileSize) * (srcImageSize / gridSize), srcImageSize / gridSize, srcImageSize / gridSize,
            //     // Destination coordinates and size
            //     (index % gridSize) * tileSize, Math.floor(index / gridSize) * tileSize, tileSize, tileSize);

            if (showNumbers) {
                // Draw the number on each tile
                ctx.font = `${tileSize / 2}px Comic Sans MS`; // Text size
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.lineWidth=1;
                ctx.strokeText(tile.index + 1, (index % gridSize) * tileSize + tileSize / 2, Math.floor(index / gridSize) * tileSize + tileSize / 2);
                ctx.fillStyle="rgba(255,255,255,.65)";
                ctx.fillText(tile.index + 1, (index % gridSize) * tileSize + tileSize / 2, Math.floor(index / gridSize) * tileSize + tileSize / 2);

            }
        }
    });
}

// Move the clicked tile if adjacent to the empty space
function moveTile(clickedIndex) {
    gameStarted = true;
    const clickedRow = Math.floor(clickedIndex / gridSize);
    const clickedCol = clickedIndex % gridSize;
    const emptyRow = Math.floor(emptyIndex / gridSize);
    const emptyCol = emptyIndex % gridSize;

    if ((Math.abs(clickedRow - emptyRow) === 1 && clickedCol === emptyCol) ||
        (Math.abs(clickedCol - emptyCol) === 1 && clickedRow === emptyRow)) {
        [tiles[clickedIndex], tiles[emptyIndex]] = [tiles[emptyIndex], tiles[clickedIndex]];
        emptyIndex = clickedIndex;
    }
}

// Check if the puzzle is solved
function checkCompletion() {
    for (let i = 0; i < tiles.length; i++) {
        if (tiles[i].index !== i) return false;
    }
    return true;
}

// Counts the number of inversions
function countInversions() {
    let inversionCount = 0;
    for (let i = 0; i < tileCount; i++) {
        for (let j = i + 1; j < tileCount; j++) {
            // Count pairs(i, j) such that i appears before j, but i > j.
            if (tiles[i] !== tileCount - 1 && tiles[j] !== tileCount - 1 && tiles[i].index > tiles[j].index) {
                inversionCount++;
            }
        }
    }
    return inversionCount;
}

// Check if the puzzle is solvable
function isSolvable() {
    const inversionCount = countInversions();
    const emptyTileRow = Math.floor(emptyIndex / gridSize) + 1; // Counting from bottom
    if (gridSize % 2 === 0) { // Even grid
        if (emptyTileRow % 2 === 0) { // Empty tile on an even row counting from the bottom
            return inversionCount % 2 === 1; // Solvable if inversions are odd
        } else { // Empty tile on an odd row counting from the bottom
            return inversionCount % 2 === 0; // Solvable if inversions are even
        }
    } else { // Odd grid
        return inversionCount % 2 === 0; // Solvable if inversions are even
    }
}

// Handle user clicks on the canvas
canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const clickedRow = Math.floor(y / tileSize);
    const clickedCol = Math.floor(x / tileSize);
    const clickedIndex = clickedRow * gridSize + clickedCol;

    if (clickedIndex !== emptyIndex) {
        moveTile(clickedIndex);
        drawTiles();

        if (checkCompletion()) {
            gameStarted = false;
            emptyIndex = -1;
            drawTiles(false);
            console.log("Victory!")
        }
    }
});

// Start the game
initGame();
