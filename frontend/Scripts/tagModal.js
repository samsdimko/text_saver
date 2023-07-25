import { saveTag, addTagToText, fetchUserTags, fetchUserTextTags } from './api.js';

export async function openAddTagModal(textId) {
  var addTagModal = document.createElement("div");
  addTagModal.className = "add-tag-modal";

  var tagDropdownContainer = document.createElement("div");
  tagDropdownContainer.className = "tag-dropdown-container";

  var inputField = document.createElement("input");
  inputField.type = "text";
  inputField.id = "tagInput";
  inputField.placeholder = "Select or enter a tag";

  var dropdownList = document.createElement("ul");
  dropdownList.id = "tagDropdownList";
  dropdownList.className = "tag-dropdown-list";

  // Populate the dropdown list options using available tags from local storage
  var tags = await fetchUserTags();
  var textTags = await fetchUserTextTags();
  console.log(tags);
  console.log(textTags);
  if (tags && tags.length > 0) {
    for (var i = 0; i < tags.length; i++) {
      var tagId = tags[i][0];
      var tagName = tags[i][1];
      var isTagUsed = textTags.some(function (textTag) {
        return textTag[0] === parseInt(textId) && textTag[1] === parseInt(tagId);
      });
      if (!isTagUsed) {
        var tagOption = document.createElement("li");
        tagOption.textContent = tagName;
        tagOption.setAttribute("data-tag-id", tagId);
        tagOption.addEventListener("click", function (event) {
          var selectedTag = event.target.textContent;
          var tagId = event.target.getAttribute("data-tag-id");
          addTagToText(textId, tagId);
          closeAddTagModal();
        });
        dropdownList.appendChild(tagOption);
      }
    }
  }

  tagDropdownContainer.appendChild(inputField);
  tagDropdownContainer.appendChild(dropdownList);
  addTagModal.appendChild(tagDropdownContainer);

  var addButton = document.createElement("button");
  addButton.textContent = "Add";
  addButton.disabled = true;
  addButton.addEventListener("click", function () {
    var selectedTag = inputField.value.trim();
    var userTags = JSON.parse(localStorage.getItem("userTags"));

    if (selectedTag && userTags) {
      var matchingTag = userTags.find(function (tag) {
        return tag[1].toLowerCase() === selectedTag.toLowerCase();
      });

      if (matchingTag) {
        addTagToText(textId, matchingTag[0]);
      } else {
        saveTag(selectedTag)
          .then(function (tag) {
            addTagToText(textId, tag.tag_id);
          })
          .catch(function (error) {
            console.error("Error saving tag:", error);
          });
      }
    }

    closeAddTagModal();
  });

  var cancelButton = document.createElement("button");
  cancelButton.textContent = "Cancel";
  cancelButton.addEventListener("click", closeAddTagModal);

  addTagModal.appendChild(addButton);
  addTagModal.appendChild(cancelButton);

  var modalBackdrop = document.createElement("div");
  modalBackdrop.className = "modal-backdrop";
  modalBackdrop.addEventListener("click", closeAddTagModal);

  inputField.addEventListener("focus", function () {
    dropdownList.style.display = "block";
  });

  inputField.addEventListener("input", function () {
    addButton.disabled = inputField.value.trim().length === 0;
  });

  inputField.addEventListener("blur", function () {
    dropdownList.style.display = "none";
  });

  document.body.appendChild(modalBackdrop);
  document.body.appendChild(addTagModal);

  document.body.classList.add("modal-open");
}

function closeAddTagModal() {
  var addTagModal = document.querySelector(".add-tag-modal");
  var modalBackdrop = document.querySelector(".modal-backdrop");

  if (addTagModal && modalBackdrop) {
    addTagModal.remove();
    modalBackdrop.remove();

    // Remove the CSS class for modal open
    document.body.classList.remove("modal-open");
  }
}