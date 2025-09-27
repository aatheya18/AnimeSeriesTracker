// Unified content API service that combines Jikan (anime) and TVMaze (TV series) APIs

import jikanApi from './jikanApi';
import tvMazeApi from './tvMazeApi';
import { CONTENT_TYPES } from '../config/firebase';

class ContentApi {
  constructor() {
    this.jikan = jikanApi;
    this.tvMaze = tvMazeApi;
  }

  // Search content (anime and TV series)
  async searchContent(query, contentType = null, page = 1, limit = 25) {
    try {
      const results = [];
      
      // Search anime if contentType is null or 'anime'
      if (!contentType || contentType === CONTENT_TYPES.ANIME) {
        const animeResult = await this.jikan.searchAnime(query, page, limit);
        if (animeResult.success) {
          const animeItems = animeResult.data.results.map(item => ({
            ...item,
            contentType: CONTENT_TYPES.ANIME,
            source: 'jikan'
          }));
          results.push(...animeItems);
        }
      }

      // Search TV series if contentType is null or 'tv_series'
      if (!contentType || contentType === CONTENT_TYPES.TV_SERIES) {
        const tvResult = await this.tvMaze.searchShows(query);
        if (tvResult.success) {
          const tvItems = tvResult.data.results.map(item => ({
            ...this.formatTVShowToUnified(item),
            contentType: CONTENT_TYPES.TV_SERIES,
            source: 'tvmaze'
          }));
          results.push(...tvItems);
        }
      }

      // Sort results by score/rating
      results.sort((a, b) => {
        const scoreA = a.score || a.rating?.average || 0;
        const scoreB = b.score || b.rating?.average || 0;
        return scoreB - scoreA;
      });

      return {
        success: true,
        data: {
          results: results.slice(0, limit),
          pagination: {
            currentPage: page,
            hasNextPage: results.length > limit
          }
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get content by ID and type
  async getContentById(id, contentType) {
    try {
      if (contentType === CONTENT_TYPES.ANIME) {
        const result = await this.jikan.getAnimeById(id);
        if (result.success) {
          return {
            success: true,
            data: {
              ...result.data,
              contentType: CONTENT_TYPES.ANIME,
              source: 'jikan'
            }
          };
        }
        return result;
      } else if (contentType === CONTENT_TYPES.TV_SERIES) {
        const result = await this.tvMaze.getShowById(id);
        if (result.success) {
          return {
            success: true,
            data: {
              ...this.formatTVShowToUnified(result.data),
              contentType: CONTENT_TYPES.TV_SERIES,
              source: 'tvmaze'
            }
          };
        }
        return result;
      } else {
        return { success: false, error: 'Invalid content type' };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get content episodes
  async getContentEpisodes(id, contentType, page = 1) {
    try {
      if (contentType === CONTENT_TYPES.ANIME) {
        return await this.jikan.getAnimeEpisodes(id, page);
      } else if (contentType === CONTENT_TYPES.TV_SERIES) {
        const result = await this.tvMaze.getShowEpisodes(id);
        if (result.success) {
          return {
            success: true,
            data: {
              episodes: result.data,
              pagination: null // TVMaze doesn't use pagination for episodes
            }
          };
        }
        return result;
      } else {
        return { success: false, error: 'Invalid content type' };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get content characters/cast
  async getContentCast(id, contentType) {
    try {
      if (contentType === CONTENT_TYPES.ANIME) {
        return await this.jikan.getAnimeCharacters(id);
      } else if (contentType === CONTENT_TYPES.TV_SERIES) {
        return await this.tvMaze.getShowCast(id);
      } else {
        return { success: false, error: 'Invalid content type' };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get content reviews
  async getContentReviews(id, contentType, page = 1) {
    try {
      if (contentType === CONTENT_TYPES.ANIME) {
        return await this.jikan.getAnimeReviews(id, page);
      } else if (contentType === CONTENT_TYPES.TV_SERIES) {
        // TVMaze doesn't have reviews, return empty array
        return {
          success: true,
          data: {
            reviews: [],
            pagination: null
          }
        };
      } else {
        return { success: false, error: 'Invalid content type' };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get trending/popular content
  async getTrendingContent(contentType = null, page = 1, limit = 25) {
    try {
      const results = [];

      // Get trending anime
      if (!contentType || contentType === CONTENT_TYPES.ANIME) {
        const animeResult = await this.jikan.getCurrentSeasonAnime(page, limit);
        if (animeResult.success) {
          const animeItems = animeResult.data.results.map(item => ({
            ...item,
            contentType: CONTENT_TYPES.ANIME,
            source: 'jikan'
          }));
          results.push(...animeItems);
        }
      }

      // Get trending TV series
      if (!contentType || contentType === CONTENT_TYPES.TV_SERIES) {
        const tvResult = await this.tvMaze.getShowsByPage(page - 1); // TVMaze uses 0-based pages
        if (tvResult.success) {
          const tvItems = tvResult.data.results
            .slice(0, limit)
            .map(item => ({
              ...this.formatTVShowToUnified(item),
              contentType: CONTENT_TYPES.TV_SERIES,
              source: 'tvmaze'
            }));
          results.push(...tvItems);
        }
      }

      return {
        success: true,
        data: {
          results: results.slice(0, limit),
          pagination: {
            currentPage: page,
            hasNextPage: results.length > limit
          }
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get top-rated content
  async getTopRatedContent(contentType = null, page = 1, limit = 25) {
    try {
      const results = [];

      // Get top anime
      if (!contentType || contentType === CONTENT_TYPES.ANIME) {
        const animeResult = await this.jikan.getTopAnime('tv', page, limit);
        if (animeResult.success) {
          const animeItems = animeResult.data.results.map(item => ({
            ...item,
            contentType: CONTENT_TYPES.ANIME,
            source: 'jikan'
          }));
          results.push(...animeItems);
        }
      }

      // Get top TV series (sorted by rating)
      if (!contentType || contentType === CONTENT_TYPES.TV_SERIES) {
        const tvResult = await this.tvMaze.getShowsByPage(page - 1);
        if (tvResult.success) {
          const sortedTVShows = tvResult.data.results
            .filter(show => show.rating?.average)
            .sort((a, b) => (b.rating?.average || 0) - (a.rating?.average || 0))
            .slice(0, limit)
            .map(item => ({
              ...this.formatTVShowToUnified(item),
              contentType: CONTENT_TYPES.TV_SERIES,
              source: 'tvmaze'
            }));
          results.push(...sortedTVShows);
        }
      }

      return {
        success: true,
        data: {
          results: results.slice(0, limit),
          pagination: {
            currentPage: page,
            hasNextPage: results.length > limit
          }
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get content recommendations
  async getContentRecommendations(id, contentType) {
    try {
      if (contentType === CONTENT_TYPES.ANIME) {
        return await this.jikan.getAnimeRecommendations(id);
      } else if (contentType === CONTENT_TYPES.TV_SERIES) {
        // TVMaze doesn't have recommendations, return similar shows by genre
        const showResult = await this.tvMaze.getShowById(id);
        if (showResult.success && showResult.data.genres.length > 0) {
          const genre = showResult.data.genres[0];
          const similarResult = await this.tvMaze.getShowsByGenre(genre);
          if (similarResult.success) {
            return {
              success: true,
              data: similarResult.data.results
                .filter(show => show.id !== id)
                .slice(0, 10)
                .map(show => ({
                  id: show.id,
                  title: show.name,
                  image: show.image?.medium || null,
                  votes: 0
                }))
            };
          }
        }
        return { success: true, data: [] };
      } else {
        return { success: false, error: 'Invalid content type' };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Format TV show data to match anime structure
  formatTVShowToUnified(tvShow) {
    return {
      id: tvShow.id,
      title: tvShow.name,
      titleEnglish: tvShow.name,
      titleJapanese: null,
      titleSynonyms: [],
      type: tvShow.type,
      source: 'TV',
      episodes: null, // Will be populated from episodes array if available
      status: tvShow.status,
      airing: tvShow.status === 'Running',
      aired: {
        from: tvShow.premiered,
        to: tvShow.ended,
        string: tvShow.premiered && tvShow.ended ? 
          `${tvShow.premiered} to ${tvShow.ended}` : 
          tvShow.premiered || null
      },
      duration: tvShow.runtime ? `${tvShow.runtime} min` : tvShow.averageRuntime ? `${tvShow.averageRuntime} min` : null,
      rating: tvShow.rating?.average ? `R-${Math.round(tvShow.rating.average)}` : null,
      score: tvShow.rating?.average || null,
      scoredBy: null,
      rank: null,
      popularity: tvShow.weight || null,
      members: null,
      favorites: null,
      synopsis: tvShow.summary ? tvShow.summary.replace(/<[^>]*>/g, '') : null,
      background: null,
      season: null,
      year: tvShow.premiered ? new Date(tvShow.premiered).getFullYear() : null,
      broadcast: tvShow.schedule ? {
        day: tvShow.schedule.days?.[0] || null,
        time: tvShow.schedule.time || null,
        timezone: tvShow.network?.country?.timezone || null,
        string: tvShow.schedule.days && tvShow.schedule.time ? 
          `${tvShow.schedule.days.join(', ')} at ${tvShow.schedule.time}` : null
      } : null,
      producers: [],
      licensors: [],
      studios: tvShow.network ? [{
        id: tvShow.network.id,
        name: tvShow.network.name,
        type: 'Network'
      }] : tvShow.webChannel ? [{
        id: tvShow.webChannel.id,
        name: tvShow.webChannel.name,
        type: 'Web Channel'
      }] : [],
      genres: tvShow.genres?.map((genre, index) => ({
        id: index + 1,
        name: genre,
        type: 'genre'
      })) || [],
      themes: [],
      demographics: [],
      images: {
        jpg: {
          imageUrl: tvShow.image?.original || null,
          smallImageUrl: tvShow.image?.medium || null,
          largeImageUrl: tvShow.image?.original || null
        },
        webp: {
          imageUrl: null,
          smallImageUrl: null,
          largeImageUrl: null
        }
      },
      trailer: {
        youtubeId: null,
        url: null,
        embedUrl: null
      },
      approved: true,
      titles: [{ type: 'Default', title: tvShow.name }],
      // Additional TV-specific fields
      language: tvShow.language,
      network: tvShow.network,
      webChannel: tvShow.webChannel,
      officialSite: tvShow.officialSite,
      externals: tvShow.externals,
      episodes: tvShow.episodes || [],
      cast: tvShow.cast || [],
      crew: tvShow.crew || []
    };
  }
}

export default new ContentApi();
