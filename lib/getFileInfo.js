const { config, log } = require('./cli');

const TmDB = require('tmdb-v3');
const TvDB = require('tvdb.js');

const tmDB = new TmDB({ apiKey: 'db81c82f22a7647260e0b02e242f784a' });
const tvDB = TvDB('742BA4305DDC79D8');

async function getTVShowInfo(file) {
  if (config.isVerbose) {
    log.info(
      `get TV Show Info for: ${file.tv.name} Season ${file.tv.season} Episode ${file.tv.episode}`
    );
  }

  const show = await tvDB.find(file.tv.name);
  // Make use of the native find Javascript function to filter the episodes
  const episode = show.episodes.find(
    ep =>
      parseInt(ep.season, 10) === parseInt(file.tv.season, 10) &&
      parseInt(ep.number, 10) === parseInt(file.tv.episode, 10)
  );
  if (episode) {
    if (config.isVerbose) {
      log.info(
        `found Episode: ${show.name} - ${episode.name}(S${episode.season}E${episode.number})`
      );
    }
    return {
      origName: file.fileName,
      show,
      episode,
    };
  }
  return undefined;
}

async function getMovieInfo(file) {
  if (config.isVerbose) log.info(`get Movie Info for: ${file.movie}`);

  const { body } = await tmDB.searchMovie(file.movie);
  const movie = JSON.parse(body).results[0];
  if (movie) {
    if (config.isVerbose) {
      log.info(`found Movie: ${movie.title}`);
    }
    return movie.title;
  }
  return undefined;
}

async function getFileInfo(file) {
  try {
    if (file.type === 'tv') {
      const tv = await getTVShowInfo(file);
      if (tv) {
        return {
          ...file,
          tv,
        };
      }
    } else if (file.type === 'movie') {
      const movie = await getMovieInfo(file);
      if (movie) {
        return {
          ...file,
          movie,
        };
      }
    }
    console.log('return undefined', file);
    return undefined;
  } catch (err) {
    console.log('getFileInfo error:', err);
    throw err;
  }
}

module.exports = getFileInfo;
