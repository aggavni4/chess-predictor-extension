// chrome.runtime.onInstalled.addListener(() => {
//     console.log("Chess Move Predictor extension installed.");
//   });
  

// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//     if (message.action === "predictMove") {
//         // Mock response
//         const bestMove = "e2e4";
//         sendResponse({ bestMove });
//     }
// });


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "predictMove" && message.fen) {
        console.log("Received FEN:", message.fen);

        // Mocking a response for testing purposes
        const bestMove = "e2e4"; // Replace this with your model's prediction later
        sendResponse({ bestMove: bestMove });
    } else {
        console.error("Invalid message received:", message);
        sendResponse({ error: "Invalid message or missing FEN" });
    }
    return true; // Keeps the message channel open for async responses
});
