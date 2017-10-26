const { config, log } = require('./cli');

const XRegExp = require('xregexp');

const tvRegEx = XRegExp('^(.+).s([0-9]+)e([0-9]+).*$');

function filterOutDuplicates(files) {
  // map over each file and find out - through the filename - which file is an movie or an tv series
  const videos = files.map(file => {
    const tv = tvRegEx.exec(file.fileName.toLowerCase());
    if (tv) {
      return {
        type: 'tv',
        ...file,
        tv: {
          name: tv[1].replace(/\./g, ' '),
          season: tv[2],
          episode: tv[3],
        },
        proper:
          file.fileName.toLowerCase().includes('proper') ||
          file.fileName.toLowerCase().includes('repack'),
      };
    }
    const re2 = /(.*?)(dvdrip|xvid|720[a-z]{2}|1080[a-z]{1}|480[a-z]{1}| cd[0-9]|dvdscr|brrip|divx|[\{\(\[]?[0-9]{4}).*/;
    const re3 = /(.*?)\(.*\)(.*)/;
    let text = file.fileName;
    text = text.replace(/\./g, ' ').toLowerCase();
    const text2 = re2.exec(text);
    if (text2) text = text2[1];
    const text3 = re3.exec(text);
    if (text3) text = text3[1];

    return {
      type: 'movie',
      ...file,
      movie: text,
      sample: file.fileName.toLowerCase().includes('sample'),
    };
  });

  const newVideosArr = [];

  // find duplicates in the array
  // push to new Array if no duplicate found
  // overwrite if it is the proper one (proper, repack, !sample)
  videos.forEach(video => {
    const findDuplicate = newVideosArr.find(i => {
      if (video.tv) {
        return (
          video.type === i.type &&
          video.tv.name === i.tv.name &&
          video.tv.season === i.tv.season &&
          video.tv.episode === i.tv.episode
        );
      }
      return video.movie === i.movie;
    });
    if (findDuplicate) {
      //  if our new item is the proper one
      if (
        (video.type === 'tv' && video.proper) ||
        (video.type === 'movie' && findDuplicate.sample)
      ) {
        if (config.isVerbose) {
          log.info(`removed duplicate ${findDuplicate.fileName}`);
        }
        // remove the old from the array
        newVideosArr.splice(newVideosArr.indexOf(findDuplicate), 1);
      } else {
        return;
      }
    }
    newVideosArr.push(video);
  });

  return newVideosArr;
}

module.exports = filterOutDuplicates;
