const videoExtensions = ['.avi', '.mp4', '.mkv', '.mpg', '.mpg4'];

function extractExtension(filename) {
  const parts = filename.split('.');
  if (parts.length === 1 || (parts[0] === '' && parts.length === 2)) {
    return null;
  }
  return `.${parts.pop().toLowerCase()}`;
}

function extractFilename(filename) {
  const extension = extractExtension(filename);
  if (extension === null) {
    return filename;
  }
  return filename.replace(extension, '');
}

function isEpisode(filename) {
  const extension = extractExtension(filename);
  if (extension === null) {
    return false;
  }

  return videoExtensions.includes(extension);
}

module.exports = {
  extractExtension,
  extractFilename,
  isEpisode,
};
