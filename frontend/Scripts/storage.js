export function deleteTagFromLocalStorage(tagId) {

  var tags = JSON.parse(localStorage.getItem("userTags")) || [];

  // Find the index of the tag with the specified ID
  var index = tags.findIndex((tag) => tag[0] === parseInt(tagId));

  // If the tag is found, remove it from the array
  if (index !== -1) {
    tags.splice(index, 1);
    // Store the updated tags back to local storage
    localStorage.setItem("userTags", JSON.stringify(tags));
  }
}

export function clearLocalStorage() {
  localStorage.clear();
}

export function storeUserTags(tags) {
  localStorage.setItem('userTags', JSON.stringify(tags));
}