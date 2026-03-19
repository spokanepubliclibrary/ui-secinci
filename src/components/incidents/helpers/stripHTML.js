

// helper for isFormValid, strip to validate for non-empty
const stripHTML = (html) => {
  const editorDocument = new DOMParser().parseFromString(html, 'text/html');
  const textContent = editorDocument.body.textContent || '';
  // ensure empty tags or whitespace return an empty string
  return textContent.trim() === '' ? '' : textContent.trim();
};

export default stripHTML;