import { addDefaultTag, deleteText, deleteTag } from './api.js';

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

export function displayTags(tags) {
  console.log(tags);
  var tagListContainer = document.getElementById("tagListContainer");
  tagListContainer.innerHTML = "";
  if (tags && tags.length > 0) {
    for (var i = 0; i < tags.length; i++) {
      var tagItem = document.createElement("div");
      tagItem.className = "tagItem";

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
        var tagId = event.target.getAttribute("data-tag-id");
        deleteTag(tagId);
      });

      tagItem.appendChild(tagOrderSpan);
      tagItem.appendChild(tagNameSpan);
      tagItem.appendChild(deleteButton);

      tagListContainer.appendChild(tagItem);
    }
  } 
  var defaultTags = JSON.parse(localStorage.getItem("defaultTags"));
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
      addDefaultTagButton.addEventListener("click", function(event) {
        var tagName = event.target.getAttribute("data-tag-name");
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
