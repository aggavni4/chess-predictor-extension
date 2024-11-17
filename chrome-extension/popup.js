// document.getElementById("predict-button").addEventListener("click", () => {
//     chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//         if (tabs[0] && tabs[0].id) {
//             chrome.tabs.sendMessage(tabs[0].id, { action: "getFEN" }, (response) => {
//                 if (chrome.runtime.lastError) {
//                     console.error("Error while sending message:", chrome.runtime.lastError);
//                     document.getElementById("result").innerText = "Error: Could not establish connection.";
//                     return;
//                 }
//                 console.log("Best move:", response);
//                 if (response && response.bestMove) {
//                     document.getElementById("result").innerText = `Best Move: ${response.bestMove}`;
//                 } else {
//                     document.getElementById("result").innerText = "Error: Best move not found.";
//                 }
//             });
//         }
//     });
// });

document.getElementById("predict-button").addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0] && tabs[0].id) {
            chrome.tabs.sendMessage(tabs[0].id, { action: "getFEN" }, (response) => {
                if (chrome.runtime.lastError) {
                    console.log("errrrrrr");
                    console.error("Error while sending message:", chrome.runtime.lastError);
                    document.getElementById("result").innerText = "Error: Could not establish connection.";
                    return;
                }
                if (response) {
                    console.log("Best move:", response);
                    document.getElementById("result").innerText = `Best Move: ${response.bestMove || 'Not found'}`;
                } else {
                    document.getElementById("result").innerText = "Error: No response from content script.";
                }
            });
        }
    });
});
