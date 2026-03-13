import { extractJobData } from './extractor';

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
    if (request.action === 'extract_job') {
        try {
            const data = extractJobData();
            sendResponse({ success: true, data });
        } catch (error) {
            sendResponse({
                success: false,
                error: error instanceof Error ? error.message : 'Extraction failed',
            });
        }
    }
    return true; // keep channel open
});
