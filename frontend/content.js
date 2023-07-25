const BASE_URL = 'https://samsdimkoprojects.pro/text_saver/api';

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'saveText') {
    const selectedText = request.selectedText;
    (async () => {
      // Retrieve the token from the extension's local storage
      const token = await new Promise((resolve) => {
        chrome.storage.local.get('token', (result) => {
          resolve(result.token);
        });
      });

      // Now you have the token, you can proceed with your API call
      if (!token) {
        console.error('User not authorized.');
        return;
      }

      // Your fetch request using the token
      fetch(`${BASE_URL}/save-text`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          text: selectedText.trim()
        })
      })
        .then(response => {
          if (response.ok) {
            return response.json();
          } else {
            throw new Error('Failed to save text.');
          }
        })
        .then(data => {
          console.log('Text saved successfully!', data);
          // Perform any additional actions after saving the text
        })
        .catch(error => {
          console.error('Error saving text:', error);
          // Handle the error if needed
        });
    })();


    sendResponse({ success: true });
  }
});

async function sendDataToEventHandlers(data) {
  const customEvent = new CustomEvent('dataFromContentScript', { detail: data });
  var token = null;
  await chrome.runtime.sendMessage({method: "getToken"}, function(response) {
    console.log(response);
  });
  console.log(token);
  document.dispatchEvent(customEvent);
}