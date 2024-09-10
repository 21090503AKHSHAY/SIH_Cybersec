const API_KEY = 'a12eb3a7-ebe9-406a-9fed-f883d5fd019e'; // Replace with your actual API key

chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.set({ enabled: false });
});

chrome.action.onClicked.addListener((tab) => {
    chrome.storage.sync.get('enabled', (data) => {
        const newStatus = !data.enabled;
        chrome.storage.sync.set({ enabled: newStatus }, () => {
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                function: toggleHoverDetection,
                args: [newStatus]
            });
        });
    });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'analyzeLink') {
        analyzeLink(request.url, sendResponse);
        return true;
    } else if (request.action === 'toggleHoverDetection') {
        chrome.tabs.query({}, (tabs) => {
            tabs.forEach((tab) => {
                chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    function: toggleHoverDetection,
                    args: [request.enabled]
                });
            });
        });
    }
});

function analyzeLink(url, sendResponse) {
    fetch('https://urlscan.io/api/v1/scan/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'API-Key': API_KEY
        },
        body: JSON.stringify({ url: url })
    })
    .then((response) => response.json())
    .then((data) => {
        let riskLevel = 'safe';
        let message = 'This link appears safe.';

        if (data.verdicts?.overall?.malicious) { 
            riskLevel = 'danger';
            message = 'This link is flagged as dangerous.';
        } else if (data.verdicts?.overall?.suspicious) {
            riskLevel = 'warning';
            message = 'This link is suspicious.';
        }

        sendResponse({ url, riskLevel, message });
    })
    .catch((error) => {
        sendResponse({ url, riskLevel: 'unknown', message: 'Unable to determine link safety.' });
    });
}

function toggleHoverDetection(isEnabled) {
    chrome.storage.sync.set({ enabled: isEnabled }, () => {
        if (!isEnabled) {
            document.removeEventListener('mouseover', handleMouseOver);
            document.removeEventListener('mouseout', handleMouseOut);
            hideTooltip(); // Ensure tooltip is hidden when disabled
        }
    });
}
