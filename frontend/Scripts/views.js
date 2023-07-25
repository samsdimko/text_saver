import { addDefaultTag, deleteText, deleteTag, 
fetchUserTags, removeTagFromText, fetchDefaultTags } from './api.js';
import { openAddTagModal } from './tagModal.js';
import { getTagNameById } from "./utils.js";

const maxLength = 48;

export function displayTexts(texts) {
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
      
      var content = texts[i][1];
      if (content.length > maxLength) {
        var truncatedContent = content.substring(0, maxLength) + "...";
        var showFullLink = document.createElement("a");
        showFullLink.textContent = "show more";
        showFullLink.href = "#";
        showFullLink.addEventListener("click", function(event) {
          event.preventDefault();
          textContentSpan.textContent = content;
          showFullLink.remove();
        });
        textContentSpan.textContent = truncatedContent;
        textContentSpan.appendChild(showFullLink);
      } else {
        textContentSpan.textContent = content;
      }

      var addTagButton = document.createElement("button");
      addTagButton.className = "addTagButton";
      addTagButton.setAttribute("data-text-id", texts[i][0]);

      var addTagImage = document.createElement("img");
      addTagImage.src = "/pics/tag-add.png";
      addTagImage.alt = "Add Tag";


      addTagButton.appendChild(addTagImage);
      addTagButton.addEventListener("click", function(event) {
        var textId = event.currentTarget.getAttribute("data-text-id");
        openAddTagModal(textId);
      });

      addTagButton.addEventListener("mouseenter", function() {
        var existingHintContainer = addTagButton.querySelector(".tagHintContainer");
        if (existingHintContainer) {
          existingHintContainer.remove();
        }

        var hintContainer = createHintContainer();
        addTagButton.appendChild(hintContainer);
        var cursorSpacing = 10;
        // Position the hint container relative to the cursor
        document.addEventListener("mousemove", function(event) {
          var offsetX = event.clientX + cursorSpacing;
          var offsetY = event.clientY + cursorSpacing;

          // Adjust the positioning if the hint container exceeds the viewport boundaries
          if (offsetX + hintContainer.offsetWidth > window.innerWidth) {
            offsetX = window.innerWidth - hintContainer.offsetWidth - cursorSpacing;
          }
          if (offsetY + hintContainer.offsetHeight > window.innerHeight) {
            offsetY = window.innerHeight - hintContainer.offsetHeight - cursorSpacing;
          }

          hintContainer.style.left = offsetX + "px";
          hintContainer.style.top = offsetY + "px";
        });
      });

      addTagButton.addEventListener("mouseleave", function() {
        var hintContainer = addTagButton.querySelector(".tagHintContainer");
        if (hintContainer) {
          hintContainer.remove();
        }
      });

      var deleteButton = document.createElement("button");
      deleteButton.className = "deleteButton";
      var deleteImage = document.createElement("img");
      deleteImage.src = "/pics/delete.png";
      deleteImage.alt = "Delete";
      deleteButton.appendChild(deleteImage);
      deleteButton.setAttribute("data-text-id", texts[i][0]);
      deleteButton.addEventListener("click", function(event) {
        var textId = event.currentTarget.getAttribute("data-text-id");
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

export async function displayTags() {
  const tags = await fetchUserTags();
  const defaultTags = await fetchDefaultTags();
  var tagListContainer = document.getElementById("tagListContainer");
  tagListContainer.innerHTML = "";

  if (tags && tags.length > 0) {
    for (var i = 0; i < tags.length; i++) {
      var tagItem = document.createElement("div");
      tagItem.className = "tagItem";
      tagItem.setAttribute("data-tag-id", tags[i][0]);
      tagItem.addEventListener("click", function (event) {
        var tagId = event.currentTarget.getAttribute("data-tag-id");
        redirectToDictionaryPage(tagId);
      });

      var tagOrderSpan = document.createElement("span");
      tagOrderSpan.className = "tagOrder";
      tagOrderSpan.textContent = (i + 1).toString();

      var tagNameSpan = document.createElement("span");
      tagNameSpan.className = "tagName";
      tagNameSpan.textContent = tags[i][1];

      var deleteButton = document.createElement("button");
      deleteButton.className = "deleteButton";
      var deleteImage = document.createElement("img");
      deleteImage.src = "/pics/delete.png";
      deleteImage.alt = "Delete";
      deleteButton.appendChild(deleteImage);
      deleteButton.setAttribute("data-tag-id", tags[i][0]);
      deleteButton.addEventListener("click", function (event) {
        event.stopPropagation();
        var tagId = event.currentTarget.getAttribute("data-tag-id");
        deleteTag(tagId);
      });

      tagItem.appendChild(tagOrderSpan);
      tagItem.appendChild(tagNameSpan);
      tagItem.appendChild(deleteButton);

      tagListContainer.appendChild(tagItem);
    }
  }

  if (defaultTags.length > 0) {
    for (var i = 0; i < defaultTags.length; i++) {
      var defaultTagItem = document.createElement("div");
      defaultTagItem.className = "tagItem default-tag";

      var defaultTagNameSpan = document.createElement("span");
      defaultTagNameSpan.className = "defaultTagItem";
      defaultTagNameSpan.textContent = defaultTags[i];

      var addDefaultTagButton = document.createElement("button");
      addDefaultTagButton.className = "addDefaultTagButton";
      addDefaultTagButton.textContent = "Add";
      addDefaultTagButton.setAttribute("data-tag-name", defaultTags[i]);
      addDefaultTagButton.addEventListener("click", function (event) {
        var tagName = event.currentTarget.getAttribute("data-tag-name");
        addDefaultTag(tagName);
      });

      defaultTagItem.appendChild(defaultTagNameSpan);
      defaultTagItem.appendChild(addDefaultTagButton);

      tagListContainer.appendChild(defaultTagItem);
    }
  }

  if (tags && tags.length === 0 && defaultTags.length === 0) {
    var noTagsMessage = document.createElement("p");
    noTagsMessage.textContent = "No tags found.";
    tagListContainer.appendChild(noTagsMessage);
  }
}

function redirectToDictionaryPage(tagId) {
  var tagName = getTagNameById(tagId);
  var queryString = "?tagId=" + encodeURIComponent(tagId) + "?tag=" + encodeURIComponent(tagName);
  window.location.href = "dictionary.html" + queryString;
}

export function displayDictionary(texts) {
  var wordListContainer = document.getElementById("wordListContainer");
  wordListContainer.innerHTML = "";

  if (texts && texts.length > 0) {
    for (var i = 0; i < texts.length; i++) {
      var textItem = createTextItemForDictionary(texts[i], i);
      wordListContainer.appendChild(textItem);
    }
  } else {
    var noTextsMessage = document.createElement("p");
    noTextsMessage.textContent = "No tagged texts.";
    wordListContainer.appendChild(noTextsMessage);
  }
}

function createTextItemForDictionary(text, index) {
  var textItem = document.createElement("div");
  textItem.className = "textItem";

  var textOrderSpan = document.createElement("span");
  textOrderSpan.className = "textOrder";
  textOrderSpan.textContent = (index + 1).toString();

  var textContentSpan = document.createElement("span");
  textContentSpan.className = "textContent";
  textContentSpan.textContent = text[1];

  var removeTagButton = document.createElement("button");
  removeTagButton.className = "removeTagButton";
  removeTagButton.textContent = "Remove Tag";
  removeTagButton.setAttribute("data-text-id", text[0]);
  removeTagButton.addEventListener("click", function(event) {
    var textId = event.currentTarget.getAttribute("data-text-id");
    var queryString = window.location.search;
    var urlParams = new URLSearchParams(queryString);
    var tagId = urlParams.get("tagId");
    removeTagFromText(textId, tagId);
  });

  textItem.appendChild(textOrderSpan);
  textItem.appendChild(textContentSpan);
  textItem.appendChild(removeTagButton);

  return textItem;
}

function createHintContainer() {
  var hintContainer = document.createElement("div");
  hintContainer.className = "tagHintContainer";
  hintContainer.textContent = "Add Tag";

  return hintContainer;
}