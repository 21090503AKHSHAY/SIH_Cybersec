document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.getElementById('toggleExtension');
    const statusText = document.getElementById('statusText');

    chrome.storage.sync.get('enabled', (data) => {
        toggle.checked = data.enabled || false;
        updateStatusText(data.enabled || false);
    });

    toggle.addEventListener('change', () => {
        const isEnabled = toggle.checked;
        chrome.storage.sync.set({ enabled: isEnabled }, () => {
            updateStatusText(isEnabled);

            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                chrome.scripting.executeScript({
                    target: { tabId: tabs[0].id },
                    function: toggleHoverDetection,
                    args: [isEnabled]
                });
            });
        });
    });

    function updateStatusText(isEnabled) {
        statusText.textContent = isEnabled ? 'Extension is on' : 'Extension is off';
    }
});
