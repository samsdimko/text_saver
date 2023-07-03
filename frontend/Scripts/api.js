import { BASE_URL } from './config.js';
import { closeTagConstructor } from './eventHandlers.js';
import { displayTags } from './views.js';
import { deleteTagFromLocalStorage } from "./storage.js";

export async function fetchSavedTexts() {
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
      console.log(response);
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

export async function getUserTags() {
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

export async function fetchAndStoreDefaultTags() {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('User not authorized.');
      return;
    }
    const response = await fetch(`${BASE_URL}/user-default-tags`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    console.log(response);
    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('defaultTags', JSON.stringify(data.tags));
    } else {
      throw new Error('Failed to fetch default tags');
    }
  } catch (error) {
    console.error('Error fetching default tags:', error);
    // Handle the error if needed
  }
  
}

export async function saveText(selectedText) {
  if (selectedText.length === 0) {
    // Handle the case where the selected text is empty
    return;
  }
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

export async function deleteText(textId) {
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

export async function saveTag(tagName) {
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('User not authorized.');
    return;
  }

  try {
    const response = await fetch(`${BASE_URL}/set-tag`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ name: tagName })
    });

    if (response.ok === true) {
      const { tag_id, tag_name } = await response.json(); // Destructure the response data
      console.log('Tag saved successfully!', { id: tag_id, name: tag_name });
      return { id: tag_id, name: tag_name };
    } else {
      throw new Error('Error saving tag: ' + response.status);
    }
  } catch (error) {
    console.error('Error saving tag:', error);
    throw error;
  }
}

export function deleteTag(tagId) {
  const token = localStorage.getItem('token');
    if (!token) {
      console.error('User not authorized.');
      return;
    }
  fetch(`${BASE_URL}/tags/${tagId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  })
    .then((response) => {
      if (response.ok) {
        // Delete the tag from local storage
        deleteTagFromLocalStorage(tagId);
        // Update the tag list on the frontend
        updateTagList();
      } else {
        throw new Error("Failed to delete tag");
      }
    })
    .catch((error) => {
      console.error("Error deleting tag:", error);
      // Handle the error if needed
    });
}

export async function addDefaultTag(tagName) {
  try {
    const savedTag = await saveTag(tagName);

    const tags = JSON.parse(localStorage.getItem('tags')) || [];
    tags.push(savedTag);
    localStorage.setItem('tags', JSON.stringify(tags));

    const defaultTags = JSON.parse(localStorage.getItem('defaultTags')) || [];
    const updatedDefaultTags = defaultTags.filter(tag => tag !== tagName);
    localStorage.setItem('defaultTags', JSON.stringify(updatedDefaultTags));

    await removeDefaultTag(tagName);
    console.log(tags);
    await displayTags(tags);
  } catch (error) {
    console.error('Error adding default tag:', error);
  }
}

export async function removeDefaultTag(tagName) {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('User not authorized.');
      return;
    }

    const response = await fetch(`${BASE_URL}/remove-default-tag`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ tagName })
    });

    if (!response.ok) {
      throw new Error('Failed to remove default tag');
    }
  } catch (error) {
    console.error('Error removing default tag:', error);
    // Handle the error if needed
  }
}