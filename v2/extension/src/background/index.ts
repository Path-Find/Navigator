chrome.runtime.onInstalled.addListener(() => {
    console.log('Navigator Extension v2 installed');
});

// Clear badge when switching tabs
chrome.tabs.onActivated.addListener(() => {
    chrome.action.setBadgeText({ text: '' });
});

// Listen for badge updates from popup
chrome.runtime.onMessage.addListener((request) => {
    if (request.action === 'set_badge') {
        chrome.action.setBadgeText({ text: request.text || '' });
        chrome.action.setBadgeBackgroundColor({ color: request.color || '#10b981' });
    }
});
