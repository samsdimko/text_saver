export function formatTagText(tagText) {
  const tagWords = tagText.split(' ');
  for (let i = 0; i < tagWords.length; i++) {
    const firstChar = tagWords[i][0];
    const restChars = tagWords[i].slice(1).toLowerCase();
    tagWords[i] = firstChar + restChars;
  }
  tagText = tagWords.join(' ');
  tagText = tagText[0].toUpperCase() + tagText.slice(1);
  return tagText
}

export function getTagNameById(tagId) {
  var userTags = JSON.parse(localStorage.getItem("userTags"));
  if (userTags && userTags.length > 0) {
    var matchingTag = userTags.find(function (tag) {
      return tag[0] === tagId;
    });
    if (matchingTag) {
      return matchingTag[1];
    }
  }
  return null; // Tag not found or userTags is empty
}