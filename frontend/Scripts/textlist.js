const BASE_URL = 'http://localhost:5000';

document.addEventListener('DOMContentLoaded', async function() {
  var backButton = document.getElementById('backButton');
  if (backButton) {
    backButton.addEventListener('click', function() {
      window.close();
    });
  }

  var textList = document.getElementById('textList');
  if (textList) {
    fetchSavedTexts();
  }
});

function fetchSavedTexts() {
  const token = localStorage.getItem('token');
  console.log(0);
  if (!token) {
    console.error('User not authorized.');
    return;
  }
  console.log(1);
  fetch(`${BASE_URL}/get-texts`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  })
    .then(function(response) {
      if (response.ok === true) {
        return response.json();
      } else {
        throw new Error('Error: ' + response.status);
      }
    })
    .then(function(data) {
      var textList = document.getElementById('textList');
      textList.innerHTML = '';

      if (data.length > 0) {
        data.forEach(function(text) {
          var listItem = document.createElement('div');
          listItem.classList.add('textItem');

          var textContent = document.createElement('span');
          textContent.textContent = text;

          var deleteButton = document.createElement('button');
          deleteButton.textContent = 'Delete';
          deleteButton.addEventListener('click', function() {
            deleteText(text);
          });

          listItem.appendChild(textContent);
          listItem.appendChild(deleteButton);
          textList.appendChild(listItem);
        });
      } else {
        var noTextsMessage = document.createElement('div');
        noTextsMessage.textContent = 'No saved texts.';
        textList.appendChild(noTextsMessage);
      }
    })
    .catch(function(error) {
      console.error(error);
    });
}

function deleteText(text) {
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('User not authorized.');
    return;
  }

  fetch(`${BASE_URL}/delete-text`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ text: text })
  })
    .then(function(response) {
      if (response.ok === true) {
        return response.json();
      } else {
        throw new Error('Error deleting text: ' + response.status);
      }
    })
    .then(function(data) {
      console.log('Text deleted successfully!', data);
      // Refresh the text list
      fetchSavedTexts();
    })
    .catch(function(error) {
      console.error('Error deleting text:', error);
    });
}
