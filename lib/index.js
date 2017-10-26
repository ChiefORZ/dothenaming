const { config, help, log, version } = require('./cli');

const filterOutDuplicates = require('./filterOutDuplicates');
const getFileInfo = require('./getFileInfo');
const getFiles = require('./getFiles');
const { getSpinner } = require('./cli/spinner');
const moveFile = require('./moveFile');

function promiseProgress(proms, cb) {
  let d = 0;
  cb(0);
  proms.forEach(p => {
    p.then(() => {
      d++;
      cb(d);
    });
  });
  return Promise.all(proms);
}

async function getFileInfoAndMove(file) {
  const fileInfo = await getFileInfo(file);
  moveFile(fileInfo);
}

/*
1) get a list of all video files using regex in the root directory, also store names of subdirs
2) each subdir, list + traverse files, use regex to get the video file name push to files[]
3) each files[], check if movie or tv show (check for SnnEnn, and/or file size) then get all the info. 
   NOTE: If (parent) then use parent folder name to get info.
4) move files to their appropriate location and clean up remove by removing the the parent directory
*/
async function dothenaming() {
  let initSpinner;
  try {
    if (config.isShowVersion) {
      version();
    } else if (config.isShowHelp) {
      help();
    } else {
      const { source } = config.options;

      initSpinner = getSpinner().start(`Get files from folder ${source}`);
      let files = await getFiles(source);
      initSpinner.succeed();
      initSpinner = null;

      initSpinner = getSpinner().start(`Filter out duplicates`);
      files = filterOutDuplicates(files);
      initSpinner.succeed();
      initSpinner = null;

      // TODO: search the destination folder if this video(episode/movie) already exists and overwrite only if we have the new proper/repack file

      if (files && files.length) {
        initSpinner = getSpinner().start(
          `Get infos for ${files.length} file(s) from TMDb and TVDB (0/${files.length})`
        );
        files = await promiseProgress(files.map(file => getFileInfoAndMove(file)), p => {
          // update the spinner, if we got an progress callback
          initSpinner = getSpinner().text = `Get infos for ${files.length} file(s) from TMDb and TVDB (${p}/${files.length})`;
        });
        initSpinner.succeed();
        initSpinner = null;

        getSpinner().succeed(`Done (in ${Math.floor(process.uptime())}s.)`);
      } else {
        log.info('No video files found');
      }
    }
  } catch (err) {
    initSpinner.fail();
    log.error('oOps something went wrong...');
    log.error(err.message);
    console.log(err);
    throw err;
  }
}

module.exports = dothenaming;
