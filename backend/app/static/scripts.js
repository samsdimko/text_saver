// Function to save text
function saveText() {
  var selectedText = window.getSelection().toString();

  var confirmation = confirm(`Do you want to save the following text?\n\n"${selectedText}"`);

  if (confirmation) {
    var data = {
      text: selectedText,
    };

    fetch('http://localhost:5000/save-text', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
      .then(response => response.json())
      .then(result => {
        console.log(result);
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }
}

// Function to switch to the list of saved texts
function showTexts() {
  window.location.href = 'http://localhost:5000/text-list';
}

// Function to delete text by user
function deleteText(textId) {
  var confirmation = confirm('Are you sure you want to delete this text?');

  if (confirmation) {
    fetch(`http://localhost:5000/delete-text/${textId}`, {
      method: 'DELETE',
    })
      .then(response => response.json())
      .then(result => {
        console.log(result);
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
  var saveButton = document.getElementById('saveButton');
  saveButton.addEventListener('click', saveText);

  var showTextsButton = document.getElementById('showTextsButton');
  showTextsButton.addEventListener('click', showTexts);

  var deleteButtons = document.getElementsByClassName('deleteButton');
  for (var i = 0; i < deleteButtons.length; i++) {
    deleteButtons[i].addEventListener('click', function() {
      var textId = this.dataset.textId;
      deleteText(textId);
    });
  }
});

function logout() {
  const token = localStorage.getItem('token');

  if (token) {
    // Perform logout actions on the backend, such as invalidating the token

    // Clear the token from local storage
    localStorage.removeItem('token');

    // Redirect to the login page or perform any other necessary actions
    window.location.href = '/login';
  } else {
    alert('You are not logged in');
  }
}

document.getElementById("loginForm").addEventListener("submit", function(event) {
  event.preventDefault();
  
  // Perform data processing or AJAX request to the Flask backend for login
  // Retrieve form data using JavaScript and send it to the backend
});

document.getElementById("registerForm").addEventListener("submit", function(event) {
  event.preventDefault();
  
  // Perform data processing or AJAX request to the Flask backend for registration
  // Retrieve form data using JavaScript and send it to the backend
});

document.addEventListener('DOMContentLoaded', function() {
  const logoutButton = document.getElementById('logoutButton');
  logoutButton.addEventListener('click', logout);
});