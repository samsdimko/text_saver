import { initializeCommon } from './common.js';
import { fetchSavedTexts, saveText, saveTag, fetchWordsByTag } from './api.js';
import { displayTexts, displayTags, displayDictionary } from './views.js';
import { loginUser, registerUser, userLogout } from './auth.js';
import { getTagNameById } from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
  initializeCommon();
});

export function bindEventListeners() {
  var saveTextButton = document.getElementById('saveTextButton');
  if (saveTextButton) {
    saveTextButton.addEventListener('click', handleSaveTextButtonClick);
  }

  var showDictionariesButton = document.getElementById("showDictionariesButton");
  if (showDictionariesButton){
    showDictionariesButton.addEventListener("click", handleShowDictionariesButtonClick);
  }

  var backButton = document.getElementById("backButton");
  if (backButton) {
    backButton.addEventListener("click", handleBackButtonClick);
  }

  var loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", handleLoginFormSubmit);
  }

  var registerForm = document.getElementById("registerForm");
  if (registerForm) {
    registerForm.addEventListener("submit", handleRegisterFormSubmit);
  }

  var switchToRegister = document.getElementById("switchToRegister");
  if (switchToRegister) {
    switchToRegister.addEventListener("click", handleSwitchToRegisterClick);
  }

  var switchToLogin = document.getElementById("switchToLogin");
  if (switchToLogin) {
    switchToLogin.addEventListener("click", handleSwitchToLoginClick);
  }

  var showTextsButton = document.getElementById('showTextsButton');
  if (showTextsButton) {
    showTextsButton.addEventListener('click', handleShowTextsButtonClick);
  }

  var createTagButton = document.getElementById("createTagButton");
  if (createTagButton) {
    createTagButton.addEventListener("click", handleCreateTagButtonClick);
  }

  var logout = document.getElementById("logoutButton");
  if (logout) {
    logout.addEventListener("click", handleLogoutButtonClick);
  }

  document.addEventListener('dataFromContentScript', function(event) {
    const selectedText = event.detail;
    saveTextContextMenus(selectedText);
  });
}

export async function initializeTextList() {
  var textListContainer = document.getElementById("textListContainer");
  if (textListContainer) {
    const texts = await fetchSavedTexts();
    displayTexts(texts);
  }
}

export async function initializeTagList() {
  var tagListContainer = document.getElementById("tagListContainer");
  if (tagListContainer) {
    displayTags();
  }
}

export async function initializeDictionary() {
  var dictionatyContainer = document.getElementById("wordListContainer")
  if (dictionatyContainer) {
    var queryString = window.location.search;
    var urlParams = new URLSearchParams(queryString);
    var tagId = urlParams.get("tagId");
    var tagName = getTagNameById(parseInt(tagId));
    var tagTitle = document.getElementById("tagTitle");
    tagTitle.textContent = "Dictionary: " + tagName;
    var texts = await fetchWordsByTag(tagId);
    displayDictionary(texts);
  }
}

function switchToRegisterForm() {
  window.location.href = '/templates/register.html';
}

function switchToLoginForm() {
  window.location.href = '/templates/login.html';
}


function handleSaveTextButtonClick() {
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
}

function handleShowDictionariesButtonClick() {
  window.location.href = '/templates/taglist.html';
}

function handleBackButtonClick() {
  window.location.href = '/templates/popup.html';
}

function handleLoginFormSubmit(event) {
  event.preventDefault();
  loginUser();
}

function handleRegisterFormSubmit(event) {
  event.preventDefault();
  registerUser();
}

function handleSwitchToRegisterClick(event) {
  event.preventDefault();
  switchToRegisterForm();
}

function handleSwitchToLoginClick(event) {
  event.preventDefault();
  switchToLoginForm();
}

function handleShowTextsButtonClick() {
  window.location.href = '/templates/textlist.html';
}

function handleCreateTagButtonClick() {
  openTagConstructor();
}

function handleLogoutButtonClick(event) {
  event.preventDefault();
  userLogout();
}

async function handleSaveTagButtonClick() {
  var inputField = document.querySelector(".constructor-modal input");
  var tagName = inputField.value.trim();

  if (tagName) {
    await saveTag(tagName)
      .then(() => {
        closeTagConstructor();
        displayTags();
      })
      .catch((error) => {
        console.error('Error saving tag:', error);
      });
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
  saveButton.addEventListener("click", handleSaveTagButtonClick);

  var cancelButton = document.createElement("button");
  cancelButton.textContent = "Cancel";
  cancelButton.addEventListener("click", closeTagConstructor);

  constructorModal.appendChild(inputField);
  constructorModal.appendChild(saveButton);
  constructorModal.appendChild(cancelButton);

  document.body.appendChild(constructorModal);

  document.body.classList.add("modal-open");
}

export function closeTagConstructor() {
  var constructorModal = document.querySelector(".constructor-modal");
  if (constructorModal) {
    constructorModal.remove();
  }
}

async function saveTextContextMenus(selectedText) {
  saveText(selectedText, true);
}