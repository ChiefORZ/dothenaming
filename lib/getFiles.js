const { extractExtension, extractFilename, isEpisode } = require('./utils');

const fs = require('fs');
const path = require('path');

function getFiles(source) {
  return new Promise(resolve => {
    fs.readdir(source, (err, files) => {
      if (files) {
        // get all subdirectories and execute getFiles() recursive
        const promises = files
          .filter(file => fs.lstatSync(source + path.sep + file).isDirectory())
          .map(file => getFiles(source + path.sep + file));
        return Promise.all(promises).then(subDirectory => {
          // when we got a file, check if it is an video and return an object
          const filesInDir = files
            .filter(file => !fs.lstatSync(source + path.sep + file).isDirectory())
            .map(file => {
              if (isEpisode(file)) {
                return {
                  folderDir: source,
                  fileName: extractFilename(file),
                  fileExtension: extractExtension(file),
                  fullFilePath: source + path.sep + file,
                };
              }
              return null;
            })
            .filter(Boolean);
          // always return a flattened array
          const flattened = Array.prototype.concat(filesInDir, ...subDirectory);
          resolve(flattened);
        });
      }
      return resolve([]);
    });
  });
}

module.exports = getFiles;
