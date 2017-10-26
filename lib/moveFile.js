const { config, log } = require('./cli');

const fs = require('fs');
const mkdirp = require('mkdirp');
const path = require('path');
const sanitize = require('sanitize-filename');

function mkdir(dir) {
  return new Promise(resolve => {
    mkdirp(dir, () => {
      resolve();
    });
  });
}

function rmdir(dir) {
  if (config.isVerbose) {
    log.info(`remove directory: ${dir}`);
  }
  if (fs.existsSync(dir)) {
    fs.readdirSync(dir).forEach(file => {
      const curPath = `${dir}/${file}`;
      if (fs.lstatSync(curPath).isDirectory()) {
        rmdir(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(dir);
  }
}

// if a nfo with the exact filename exists, copy it too!
function copyNfoFile(file, newFilePath) {
  const nfoFilePath = file.fullFilePath.toLowerCase().replace(file.fileExtension, '.nfo');
  const newNfoFilePath = newFilePath.replace(file.fileExtension, '.nfo');
  if (fs.existsSync(nfoFilePath)) {
    fs.renameSync(nfoFilePath, newNfoFilePath);
  }
}

async function moveFile(file) {
  const { copyNFO, destination, removeParentDir, source } = config.options;
  if (file.type === 'movie') {
    const newFilename = sanitize(`${file.movie}${file.fileExtension}`);
    const dir = `${destination}${path.sep}Movies${path.sep}`;
    if (!fs.existsSync(dir)) {
      if (config.isVerbose) {
        log.info(`create directory: ${dir}`);
      }
      await mkdir(dir);
    }
    if (config.isVerbose) {
      log.info(`move: ${file.movie} to ${dir}${newFilename}`);
    }
    if (copyNFO) copyNfoFile(file, `${dir}${newFilename}`);
    fs.renameSync(file.fullFilePath, `${dir}${newFilename}`);
    if (removeParentDir && file.folderDir !== source) rmdir(file.folderDir);
  } else if (file.type === 'tv') {
    // pad the season and the episode number to twi digits, so we can make S01E02
    const padSeason = `00${file.tv.episode.season}`.substring(`${file.tv.episode.season}`.length);
    const padEpisode = `00${file.tv.episode.number}`.substring(`${file.tv.episode.number}`.length);
    const newFilename = sanitize(
      `${file.tv.show.name} - S${padSeason}E${padEpisode} - ${file.tv.episode
        .name}${file.fileExtension}`
    );
    // generate the path to the new file and create the directory, if it does not exist!
    const dir = `${destination}${path.sep}Series${path.sep}${file.tv.show
      .name}${path.sep}Season ${file.tv.episode.season}${path.sep}`;
    if (!fs.existsSync(dir)) {
      if (config.isVerbose) {
        log.info(`create directory: ${dir}`);
      }
      await mkdir(dir);
    }
    if (config.isVerbose) {
      log.info(`move: ${file.tv.show.name}(S${padSeason}E${padEpisode}) to ${dir}${newFilename}`);
    }
    if (copyNFO) copyNfoFile(file, `${dir}${newFilename}`);
    fs.renameSync(file.fullFilePath, `${dir}${newFilename}`);
    if (removeParentDir && file.folderDir !== source) rmdir(file.folderDir);
  }
}

module.exports = moveFile;
