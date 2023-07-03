chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'saveText') {
    const selectedText = request.selectedText;
    sendResponse({ success: true });
  }
});