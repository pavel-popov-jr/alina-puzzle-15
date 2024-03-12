document.getElementById("shuffle-button").addEventListener("click", () => {
    shuffleTiles();
    drawTiles();
});

document.getElementById("change-photo-button").addEventListener("click", () => {
    resetGame();
});
