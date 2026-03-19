

const convertUTCISOToLocalePrettyTime = (isoString) => {
  const date = new Date(isoString);
  if (isNaN(date)) {
    return `Invalid ISO string`
  }
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

export default convertUTCISOToLocalePrettyTime;