console.log("Content script is loaded");

document.addEventListener("DOMContentLoaded", function() {
    // This will wait until the DOM is fully loaded before running the script
    const board = document.querySelector("#board-single");
    
    if (!board) {
        console.log("Chess board not found.");
        return null;
    }

    // Continue with the FEN extraction logic once the board is found
    extractFENFromBoard().then(fenString => {
        if (fenString) {
            // Send FEN to the backend to predict the best move
            console.log("FEN extracted:", fenString);
            sendFENToBackend(fenString).then(bestMove => {
                // Send the response back to the popup or other parts of the extension
                console.log("Predicted best move:", bestMove);
            });
        }
    });
});


async function extractFENFromBoard() {
    console.log("Extracting FEN...");
    const pieceMap = {
        wp: "P", wn: "N", wb: "B", wr: "R", wq: "Q", wk: "K",
        bp: "p", bn: "n", bb: "b", br: "r", bq: "q", bk: "k"
    };

    const board = document.querySelector("#board-single");
    if (!board) {
        console.log("Chess board not found.");
        return null;
    }

    let boardState = Array(8).fill(null).map(() => Array(8).fill(""));
    const squares = Array.from(board.children);

    squares.forEach(square => {
        const squareClass = square.classList.value;
        const squarePosition = squareClass.match(/square-(\d{2})/);
        if (squarePosition) {
            const squareId = squarePosition[1];
            const [row, col] = getPositionFromSquareId(squareId);
            const pieceClass = squareClass.split(" ").find(cls => cls in pieceMap);
            if (pieceClass) {
                boardState[row][col] = pieceMap[pieceClass];
            }
        }
    });

    const fenRows = boardState.map(row => row.reduce((acc, cell) => {
        if (cell) {
            return acc + cell;
        } else {
            const lastChar = acc.slice(-1);
            return lastChar >= "1" && lastChar <= "8" ? acc.slice(0, -1) + (parseInt(lastChar) + 1) : acc + "1";
        }
    }, ""));
    const fenString = fenRows.join("/") + " w - - 0 1";

    console.log("FEN:", fenString);
    return fenString;
}

function getPositionFromSquareId(squareId) {
    const row = 8 - Math.floor((squareId - 1) / 10);
    const col = (squareId - 1) % 10;
    return [row, col];
}



async function sendFENToBackend(fenString) {
    if (!fenString) {
        console.error("FEN string generation failed.");
        return;
    }
    const backendURL = "http://127.0.0.1:5000/predict"; // Replace with your backend URL
    try {
        const response = await fetch(backendURL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ fen: fenString })
        });

        if (response.ok) {
            const data = await response.json();
            console.log(data);
            console.log("Predicted Best Move(content.js):", data.bestMove);
            highlightBestMove(data.bestMove);
        } else {
            console.error("Failed to fetch prediction:", response.statusText);
        }
    } catch (error) {
        console.error("Error while sending FEN to backend:", error);
    }
}

  
  function highlightMoveOnBoard(move) {
    const fromSquare = move.slice(0, 2); // Starting square, e.g., "e2"
    const toSquare = move.slice(2, 4);   // Target square, e.g., "e4"
  
    // const fromElement = document.querySelector(`.square-${fromSquare}`);
    // const toElement = document.querySelector(`.square-${toSquare}`);
    const fromElement = document.querySelector(`.square-${move.slice(0, 2).toLowerCase()}`);
    const toElement = document.querySelector(`.square-${move.slice(2, 4).toLowerCase()}`);

  
    if (fromElement) {
      fromElement.style.backgroundColor = 'yellow';
    }
    if (toElement) {
      toElement.style.backgroundColor = 'green';
    }
  }
  
// Run FEN extraction and send it to the backend
  (async () => {
    const fenString = await extractFENFromBoard();
    if (fenString) {
        await sendFENToBackend(fenString);
    }
})();