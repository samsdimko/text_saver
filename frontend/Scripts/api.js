import { BASE_URL } from './config.js';
import { closeTagConstructor } from './eventHandlers.js';
import { displayTexts, displayTags } from './views.js';
import { deleteTagFromLocalStorage, storeUserTags } from "./storage.js";
import { formatTagText } from "./utils.js";

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

export async function fetchUserTags() {  
  const token = localStorage.getItem('token');
  if (!token) {
    return;
  }
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
    .then(data => {
      const tags = data.tags;
      return tags;
    })
    .catch(error => {
      console.error('Error fetching user tags:', error);
      return [];
    });
  
}

export async function fetchUserTextTags() {
  const token = localStorage.getItem('token');
  if (!token) {
    return;
  }

  try {
    const response = await fetch(`${BASE_URL}/get-text-tags`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok === true) {
      const data = await response.json();
      return data.text_tags
      console.log('Text tags fetched successfully');
    } else {
      throw new Error('Error fetching text tags: ' + response.status);
    }
  } catch (error) {
    console.error('Error fetching text tags:', error);
    throw error;
  }
}

export async function fetchDefaultTags() {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return;
    }
    const response = await fetch(`${BASE_URL}/user-default-tags`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    if (response.ok === true) {
      const data = await response.json();
      return data.tags
    } else {
      throw new Error('Failed to fetch default tags');
    }
  
  } catch (error) {
    console.error('Error fetching default tags:', error);    
  }
  
}

export async function saveText(selectedText, isContextMenu = false) {
  if (selectedText.length === 0) {
    return;
  }
  console.log(localStorage);
  if (isContextMenu) {
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
    return;
  }
  var confirmationModal = document.createElement("div");
  confirmationModal.className = "confirmation-modal";

  var confirmationText = document.createElement("p");
  confirmationText.className = "confirmation-modal-text";
  confirmationText.textContent = "Do you want to save the following text?\n";

  var confirmationTextWrapper = document.createElement("div");
  confirmationTextWrapper.className = "confirmation-modal-text-wrapper scrollable";
  
  var confirmationTextContent = document.createElement("span");
  confirmationTextContent.className = "confirmation-modal-text-main";
  confirmationTextContent.textContent = selectedText;

  confirmationTextWrapper.appendChild(confirmationTextContent);
  confirmationText.appendChild(confirmationTextWrapper);

  var confirmationButtons = document.createElement("div");
  confirmationButtons.className = "confirmation-modal-buttons";

  var saveButton = document.createElement("button");
  saveButton.textContent = "Save";
  saveButton.addEventListener("click", function() {
    // Save the text

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
      confirmationModal.remove();
    });

    var cancelButton = document.createElement("button");
    cancelButton.textContent = "Cancel";
    cancelButton.className = "cancel";
    cancelButton.addEventListener("click", function() {
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
      body: JSON.stringify({ name: formatTagText(tagName) })
    });

    if (response.ok === true) {
      const { tag_id, tag_name } = await response.json();      
      return { id: tag_id, name: tag_name };
    } else {
      throw new Error('Error saving tag: ' + response.status);
    }
  } catch (error) {
    console.error('Error saving tag:', error);
    throw error;
  }
}

export async function deleteTag(tagId) {
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('User not authorized.');
    return;
  }
  try {
    const response = await fetch(`${BASE_URL}/delete-tag/${tagId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });
    if (response.ok === true) {
      const data = await response.json();
      displayTags();
    } else {
      throw new Error("Failed to delete tag");
    }
  } catch (error) {
    console.error("Error deleting tag:", error);
    // Handle the error if needed
  }
}

export async function addDefaultTag(tagName) {
  try {
    const savedTag = await saveTag(tagName);
    await displayTags();
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

export async function addTagToText(textId, tagId) {
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('User not authorized.');
    return;
  }

  try {
    const response = await fetch(`${BASE_URL}/add-tag-to-text`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ text_id: textId, tag_id: tagId })
    });

    if (response.ok === true) {
      console.log('Tags added to text successfully');
    } else {
      throw new Error('Error adding tags to text: ' + response.status);
    }
  } catch (error) {
    console.error('Error adding tags to text:', error);
    throw error;
  }
}

export async function fetchWordsByTag(tagId) {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return [];
    }

    const response = await fetch(`${BASE_URL}/get-words-by-tag/${tagId}`, {
      method: 'get',
      headers: {
        'content-type': 'application/json',
        'authorization': `bearer ${token}`
      }
    });

    if (response.ok === true) {
      const data = await response.json();
      return data.words;
    } else {
      throw new error('failed to fetch words by tag');
    }
  } catch (error) {
    console.error('error fetching words by tag:', error);
    return [];
  }
}

export async function removeTagFromText(textId, tagId) {
  var token = localStorage.getItem('token');
  if (!token) {
    console.error('User not authorized.');
    return;
  }

  var requestOptions = {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
  };

  fetch(`${BASE_URL}/remove-tag-from-text/${textId}/${tagId}`, requestOptions)
    .then(function(response) {
      if (response.ok === true) {
        console.log('Tag removed successfully!');
        // Refresh the word list
        fetchWordsByTag(tag) // Assuming you have implemented fetchWordsByTag
          .then(function(words) {
            displayWords(words); // Assuming you have implemented displayWords
          })
          .catch(function(error) {
            console.error('Error fetching words:', error);
          });
      } else {
        throw new Error('Error removing tag: ' + response.status);
      }
    })
    .catch(function(error) {
      console.error('Error removing tag:', error);
    });
}

export async function fetchRoomId() {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('User not authorized.');
      return null;
    }
    const response = await fetch(`${BASE_URL}/get-room-id`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    if (response.ok) {
      const data = await response.json();
      return data.room_id;
    } else {
      throw new Error('Error: ' + response.status);
    }
  } catch (error) {
    console.error(error);
    return null;
  }
}