export function deleteTagFromLocalStorage(tagId) {
  // Retrieve the tags from local storage
  var tags = JSON.parse(localStorage.getItem("tags")) || [];

  // Find the index of the tag with the specified ID
  var index = tags.findIndex((tag) => tag.id === tagId);

  // If the tag is found, remove it from the array
  if (index !== -1) {
    tags.splice(index, 1);
    // Store the updated tags back to local storage
    localStorage.setItem("tags", JSON.stringify(tags));
  }
}

export function clearLocalStorage() {
  localStorage.clear();
}
