function getSelectedText() {
  const selection = window.getSelection();
  return selection ? selection.toString() : '';
}

chrome.action.onClicked.addListener(async (tab) => {
  try {
    const result = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: () => {
        const selectedText = window.getSelection().toString();
        return { selectedText };
      },
    });
    const selectedText = result[0].result.selectedText;
    chrome.runtime.sendMessage({ action: 'saveText', selectedText });
  } catch (error) {
    console.error('Error executing content script:', error);
  }
});