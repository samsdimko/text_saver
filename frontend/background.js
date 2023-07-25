chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.method == "getToken")
      console.log(123);
      chrome.storage.local.get(['token'], function(result) {
        const token = result.token;
        console.log('Token from storage:', token);
      });
      sendResponse({token: token});
});


chrome.runtime.onInstalled.addListener(function() {
  chrome.contextMenus.create({
    id: "saveText",
    title: "Save Text",
    contexts: ["selection"],
  });
});

chrome.contextMenus.onClicked.addListener(function(info, tab) {
  if (info.menuItemId === "saveText") {
    const selectedText = info.selectionText;
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
      chrome.tabs.sendMessage(tabs[0].id, { action: 'saveText', selectedText });
    });
  }
});