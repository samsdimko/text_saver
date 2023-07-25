const BASE_URL = 'http://localhost:5000';

(async function() {
  document.addEventListener('DOMContentLoaded', async function() {
    if (!(await isUserAuthorized()) && !(await isRegisterPage()) && !(await isLoginPage())) {
      window.location.href = '/templates/login.html';
    }

    var saveTextButton = document.getElementById('saveTextButton');
    if (saveTextButton) {
      saveTextButton.addEventListener('click', function() {
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
          if (tabs && tabs.length > 0) {
            var tabId = tabs[0].id;
            chrome.scripting.executeScript({
              target: { tabId: tabId },
              function: () => {
                const selectedText = window.getSelection().toString();
                return { selectedText };
              },
            }, function(results) {
              if (chrome.runtime.lastError) {
                console.error('Error executing content script:', chrome.runtime.lastError);
                return;
              }
              const selectedText = results[0].result.selectedText;
              saveText(selectedText);
            });
          } else {
            console.error('No active tab found.');
          }
        });
      });
    }

    var showDictionariesButton = document.getElementById("showDictionariesButton");
    if (showDictionariesButton){
      showDictionariesButton.addEventListener("click", function() {
        window.location.href = '/templates/taglist.html';
      });
    }
    var backButton = document.getElementById("backButton");
    if (backButton) {
      backButton.addEventListener("click", function() {
        window.location.href = '/templates/popup.html';
      });
    }

    var loginForm = document.getElementById("loginForm");
    if (loginForm) {
      loginForm.addEventListener("submit", function(event) {
        event.preventDefault();
        loginUser();
      });
    }

    var registerForm = document.getElementById("registerForm");
    if (registerForm) {
      registerForm.addEventListener("submit", function(event) {
        event.preventDefault();
        registerUser();
      });
    }

    var switchToRegister = document.getElementById("switchToRegister");
    if (switchToRegister) {
      switchToRegister.addEventListener("click", function(event) {
        event.preventDefault();
        switchToRegisterForm();
      });
    }

    var switchToLogin = document.getElementById("switchToLogin");
    if (switchToLogin) {
      switchToLogin.addEventListener("click", function(event) {
        event.preventDefault();
        switchToLoginForm();
      });
    }

    var showTextsButton = document.getElementById('showTextsButton');
    if (showTextsButton) {
      showTextsButton.addEventListener('click', function() {
        window.location.href = '/templates/textlist.html';
      });
    }

    var textListContainer = document.getElementById("textListContainer");
    if (textListContainer) {
      // Fetch the texts from the backend
      const texts = await fetchSavedTexts();
      displayTexts(texts);
    }

    var tagListContainer = document.getElementById("tagListContainer");
    if (tagListContainer) {
      // Fetch the user tags from the backend
      const tags = await getUserTags();
      displayTags(tags);
    }

    var createTagButton = document.getElementById("createTagButton");
    if (createTagButton) {
      createTagButton.addEventListener("click", openTagConstructor);
    }

    var logout = document.getElementById("logoutButton");
    if (logout) {
      logout.addEventListener("click", function(event) {
        event.preventDefault();
        userLogout();
      });
    }
  });
})();

//checks
async function isUserAuthorized() {
  const token = localStorage.getItem('token');
  if (!token) {
    return false; 
  }
  try {
    const response = await fetch(`${BASE_URL}/check-authorization`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.ok === true) {
      return true; // User is authorized
    } else if (response.status === 401) {
      return false; // User is not authorized
    } else {
      throw new Error('Failed to check authorization');
    }
  } catch (error) {
    console.error(error);
    return false; // User is not authorized
  }
}

function isRegisterPage() {
  return window.location.pathname === '/templates/register.html';
}

function isLoginPage() {
  return window.location.pathname === '/templates/login.html';
}

//switches
function switchToRegisterForm() {
  window.location.href = '/templates/register.html';
}

function switchToLoginForm() {
  window.location.href = '/templates/login.html';
}

//autentifications
async function registerUser() {
  var login = document.getElementById("usernameField").value;
  var email = document.getElementById("emailField").value;
  var password = document.getElementById("passwordField").value;
  
  if (password.length < 5) {
    var messageContainer = document.getElementById('messageContainer');
    messageContainer.style.color = 'red';
    messageContainer.textContent = 'Password should be at least 5 characters long.';
    return;
  }

  var response = await fetch(`${BASE_URL}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      login: login,
      email: email,
      password: password
    })
  });
  if (response.ok === true) {
    var data = await response.json();
    if (data.message === 'User registered successfully') {
      var token = data.token;
      // Store the token in local storage or cookies for future authenticated requests
      localStorage.setItem('token', token);
      window.location.href = '/templates/popup.html'
    } else if (data.message === 'User with this login is already registered') {
      var messageContainer = document.getElementById('messageContainer');
      messageContainer.style.color = 'red';
      messageContainer.textContent = 'User with this login is already registered';
    } else if (data.message === 'User with this email is already registered') {
      var messageContainer = document.getElementById('messageContainer');
      messageContainer.style.color = 'red';
      messageContainer.textContent = 'User with this email is already registered';
    }
  } else {
    var error = await response.json();
    console.error('Error registering user:', error.message);
    // Handle the registration error
  }
}

function loginUser() {
  var loginInput = document.getElementById("usernameField").value;
  var passwordInput = document.getElementById("passwordField").value;

  var userData = {
    login: loginInput,
    password: passwordInput
  };
  fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(userData)
  })
    .then(response => {
      if (response.ok === true) {
        return response.json();
      } else {
        throw new Error('Login failed with status: ' + response.status);
      }
    })
    .then(data => {
      var token = data.token;
      var tags = data.tags;
      storeUserTags(tags);
      localStorage.setItem('token', token);
      window.location.href = '/templates/popup.html';
    })
    .catch(error => {
      console.error('Login error:', error);
      var errorMessage = document.getElementById("errorMessage");
      errorMessage.textContent = 'Login failed. Please try again.';
    });
}

function userLogout() {
  const token = localStorage.getItem('token');

  fetch(`${BASE_URL}/logout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  })
    .then(response => {
      if (response.ok) {
        localStorage.removeItem('token');
        window.location.href = '/templates/login.html';
      } else {
        throw new Error('Logout failed');
      }
    })
    .catch(error => {
      console.error('Logout error:', error);
    });
}

//texts
function saveText(selectedText) {
  var confirmationModal = document.createElement("div");
  confirmationModal.className = "confirmation-modal";

  var confirmationText = document.createElement("p");
  confirmationText.className = "confirmation-modal-text";
  var confirmationText = document.createElement("p");
  confirmationText.className = "confirmation-modal-text";
  confirmationText.innerHTML = 'Do you want to save the following text?<br><p><span class="confirmation-modal-text-main">' + selectedText + '</span>';

  var confirmationButtons = document.createElement("div");
  confirmationButtons.className = "confirmation-modal-buttons";

  var saveButton = document.createElement("button");
  saveButton.textContent = "Save";
  saveButton.addEventListener("click", function() {
    // Save the text
    if (selectedText.length < 5) {
      var errorMessage = document.createElement("p");
      errorMessage.textContent = "Text should be at least 5 characters long.";
      confirmationModal.appendChild(errorMessage);
      return;
    }
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('User not authorized.');
      return;
    }

    fetch(`${BASE_URL}/save-text`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        text: selectedText
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
      confirmationModal.remove();
    });

    var cancelButton = document.createElement("button");
    cancelButton.textContent = "Cancel";
    cancelButton.className = "cancel";
    cancelButton.addEventListener("click", function() {
    // Close the confirmation modal
    confirmationModal.remove();
  });

  confirmationButtons.appendChild(saveButton);
  confirmationButtons.appendChild(cancelButton);

  confirmationModal.appendChild(confirmationText);
  confirmationModal.appendChild(confirmationButtons);

  document.body.appendChild(confirmationModal);
}

async function fetchSavedTexts() {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('User not authorized.');
      return;
    }
    const response = await fetch(`${BASE_URL}/get-texts`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    if (response.ok === true) {
      const data = await response.json();
      return data.texts;
    } else {
      throw new Error('Error: ' + response.status);
    }
  } catch (error) {
    console.error(error);
    return [];
  }
}

function displayTexts(texts) {
  var textListContainer = document.getElementById("textListContainer");
  textListContainer.innerHTML = "";
  if (texts && texts.length > 0) {
    for (var i = 0; i < texts.length; i++) {
      var textItem = document.createElement("div");
      textItem.className = "textItem";

      var textOrderSpan = document.createElement("span");
      textOrderSpan.className = "textOrder";
      textOrderSpan.textContent = (i + 1).toString();

      var textContentSpan = document.createElement("span");
      textContentSpan.className = "textContent";
      textContentSpan.textContent = texts[i][1];

      var addTagButton = document.createElement("button");
      addTagButton.className = "addTagButton";
      addTagButton.textContent = "Add Tag";
      addTagButton.setAttribute("data-text-id", texts[i][0]);
      addTagButton.addEventListener("click", function(event) {
        var textId = event.target.getAttribute("data-text-id");
        addTagForText(textId);
      });

      var deleteButton = document.createElement("button");
      deleteButton.className = "deleteButton";
      var deleteImage = document.createElement("img");
      deleteImage.src = "/pics/delete.png";
      deleteImage.alt = "Delete";
      deleteButton.appendChild(deleteImage);
      deleteButton.setAttribute("data-text-id", texts[i][0]);
      deleteButton.addEventListener("click", function(event) {
        var textId = event.target.getAttribute("data-text-id");
        deleteText(textId);
      });

      textItem.appendChild(textOrderSpan);
      textItem.appendChild(textContentSpan);
      textItem.appendChild(addTagButton);
      textItem.appendChild(deleteButton);

      textListContainer.appendChild(textItem);
    }
  } else {
    var noTextsMessage = document.createElement("p");
    noTextsMessage.textContent = "No saved texts.";
    textListContainer.appendChild(noTextsMessage);
  }
}

async function deleteText(textId) {
  const token = localStorage.getItem('token');
  if (!token) {
        console.error('User not authorized.');
        return;
      }
  try {
    const response = await fetch(`${BASE_URL}/delete-text/${textId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    if (response.ok === true) {
      const data = await response.json();
      console.log('Text deleted successfully!', data);
      // Refresh the text list
      const texts = await fetchSavedTexts();
      displayTexts(texts);
    } else {
      throw new Error('Error deleting text: ' + response.status);
    }
  } catch (error) {
    console.error('Error deleting text:', error);
  }
}

//tags
function storeUserTags(tags) {
  const tagList = tags.map(tag => [tag.id, tag.name]);
  localStorage.setItem('userTags', JSON.stringify(tagList));
}

function getUserTags() {
  var storedTags = localStorage.getItem('userTags');
  if (storedTags) {
    return JSON.parse(storedTags);
  } else {
    // Fetch user tags from the backend
    return fetch(`${BASE_URL}/user-tags`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(response => {
        if (response.ok === true) {
          return response.json();
        } else {
          throw new Error('Error fetching user tags: ' + response.status);
        }
      })
      .then(tags => {
        storeUserTags(tags);
        return tags;
      })
      .catch(error => {
        console.error('Error fetching user tags:', error);
        return [];
      });
  }
}

function displayTags(tags) {
  var tagListContainer = document.getElementById("tagListContainer");
  tagListContainer.innerHTML = "";
  if (tags && tags.length > 0) {
    for (var i = 0; i < tags.length; i++) {
      var tagItem = document.createElement("div");
      tagItem.className = "tagItem";

      var tagNameSpan = document.createElement("span");
      tagNameSpan.className = "tagName";
      tagNameSpan.textContent = tags[i];

      var deleteButton = document.createElement("button");
      deleteButton.className = "deleteButton";
      deleteButton.textContent = "Delete";
      deleteButton.setAttribute("data-tag-name", tags[i]);
      deleteButton.addEventListener("click", function(event) {
        var tagName = event.target.getAttribute("data-tag-name");
        deleteTag(tagName);
      });

      tagItem.appendChild(tagNameSpan);
      tagItem.appendChild(deleteButton);

      tagListContainer.appendChild(tagItem);
    }
  } else {
    var noTagsMessage = document.createElement("p");
    noTagsMessage.textContent = "No tags found.";
    tagListContainer.appendChild(noTagsMessage);
  }
}

async function deleteTag(tagName) {
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('User not authorized.');
    return;
  }
  try {
    const response = await fetch(`${BASE_URL}/delete-tag/${tagName}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    if (response.ok === true) {
      const data = await response.json();
      console.log('Tag deleted successfully!', data);
      // Refresh the tag list
      const tags = await fetchUserTags();
      displayTags(tags);
    } else {
      throw new Error('Error deleting tag: ' + response.status);
    }
  } catch (error) {
    console.error('Error deleting tag:', error);
  }
}

function openTagConstructor() {
  var constructorModal = document.createElement("div");
  constructorModal.className = "constructor-modal";

  var inputField = document.createElement("input");
  inputField.type = "text";
  inputField.placeholder = "Enter tag name";

  var saveButton = document.createElement("button");
  saveButton.textContent = "Save";
  saveButton.addEventListener("click", saveTag);

  var cancelButton = document.createElement("button");
  cancelButton.textContent = "Cancel";
  cancelButton.addEventListener("click", closeTagConstructor);

  constructorModal.appendChild(inputField);
  constructorModal.appendChild(saveButton);
  constructorModal.appendChild(cancelButton);

  document.body.appendChild(constructorModal);
}

function closeTagConstructor() {
  var constructorModal = document.querySelector(".constructor-modal");
  if (constructorModal) {
    constructorModal.remove();
  }
}

function saveTag() {
  var inputField = document.querySelector(".constructor-modal input");
  var tagName = inputField.value;

  if (tagName) {
    fetch(`${BASE_URL}/set-tag`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ name: tagName })
    })
      .then(response => {
        if (response.ok === true) {
          return response.json();
        } else {
          throw new Error('Error saving tag: ' + response.status);
        }
      })
      .then(data => {
        var tagId = data.tag_id;
        var tagName = data.tag_name;

        var storedTags = JSON.parse(localStorage.getItem('userTags'));
        storedTags.push([tagId, tagName]);
        localStorage.setItem('userTags', JSON.stringify(storedTags));

        // Close the constructor window
        closeTagConstructor();
      })
      .catch(error => {
        console.error('Error saving tag:', error);
      });
  }
}