/*
  compare to update only if content actually changed.
  assists in preventing react-quill's cleanup <-> setState feedback loop
*/

export const isSameHtml = (a, b) => {
  const normalize = (html) => {
    const doc = new DOMParser().parseFromString(html || '', 'text/html');
    return doc.body.textContent.trim();
  };

  return normalize(a) === normalize(b);
};