// TVMaze API service for TV series data
// Documentation: https://www.tvmaze.com/api

const TVMAZE_BASE_URL = 'https://api.tvmaze.com';

class TVMazeApi {
  constructor() {
    this.baseUrl = TVMAZE_BASE_URL;
  }

  // Generic API request method
  async makeRequest(endpoint, params = {}) {
    try {
      const url = new URL(`${this.baseUrl}${endpoint}`);
      
      // Add query parameters
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          url.searchParams.append(key, params[key]);
        }
      });

      console.log('TVMaze API Request:', url.toString());

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('TVMaze API Error:', error);
      return { success: false, error: error.message };
    }
  }

  // Search TV shows
  async searchShows(query) {
    const result = await this.makeRequest('/search/shows', { q: query });
    
    if (result.success) {
      return {
        success: true,
        data: {
          results: result.data.map(item => this.formatShowData(item.show)),
          pagination: null // TVMaze doesn't use pagination for search
        }
      };
    }
    
    return result;
  }

  // Get show by ID
  async getShowById(id, embed = ['episodes', 'cast', 'crew']) {
    const params = {};
    if (embed.length > 0) {
      params.embed = embed.join(',');
    }

    const result = await this.makeRequest(`/shows/${id}`, params);
    
    if (result.success) {
      return {
        success: true,
        data: this.formatShowData(result.data)
      };
    }
    
    return result;
  }

  // Get show episodes
  async getShowEpisodes(id, specials = false) {
    const params = {};
    if (specials) {
      params.specials = '1';
    }

    const result = await this.makeRequest(`/shows/${id}/episodes`, params);
    
    if (result.success) {
      return {
        success: true,
        data: result.data.map(this.formatEpisodeData)
      };
    }
    
    return result;
  }

  // Get show seasons
  async getShowSeasons(id) {
    const result = await this.makeRequest(`/shows/${id}/seasons`);
    
    if (result.success) {
      return {
        success: true,
        data: result.data.map(season => ({
          id: season.id,
          number: season.number,
          name: season.name,
          episodeOrder: season.episodeOrder,
          premiereDate: season.premiereDate,
          endDate: season.endDate,
          network: season.network ? {
            id: season.network.id,
            name: season.network.name,
            country: season.network.country
          } : null,
          webChannel: season.webChannel ? {
            id: season.webChannel.id,
            name: season.webChannel.name,
            country: season.webChannel.country
          } : null,
          image: season.image ? {
            medium: season.image.medium,
            original: season.image.original
          } : null,
          summary: season.summary
        }))
      };
    }
    
    return result;
  }

  // Get show cast
  async getShowCast(id) {
    const result = await this.makeRequest(`/shows/${id}/cast`);
    
    if (result.success) {
      return {
        success: true,
        data: result.data.map(castMember => ({
          person: {
            id: castMember.person.id,
            name: castMember.person.name,
            country: castMember.person.country,
            birthday: castMember.person.birthday,
            deathday: castMember.person.deathday,
            gender: castMember.person.gender,
            image: castMember.person.image ? {
              medium: castMember.person.image.medium,
              original: castMember.person.image.original
            } : null
          },
          character: {
            id: castMember.character.id,
            name: castMember.character.name,
            image: castMember.character.image ? {
              medium: castMember.character.image.medium,
              original: castMember.character.image.original
            } : null
          },
          self: castMember.self,
          voice: castMember.voice
        }))
      };
    }
    
    return result;
  }

  // Get episode by ID
  async getEpisodeById(id) {
    const result = await this.makeRequest(`/episodes/${id}`);
    
    if (result.success) {
      return {
        success: true,
        data: this.formatEpisodeData(result.data)
      };
    }
    
    return result;
  }

  // Get shows by page (for browsing)
  async getShowsByPage(page = 0) {
    const result = await this.makeRequest('/shows', { page });
    
    if (result.success) {
      return {
        success: true,
        data: {
          results: result.data.map(this.formatShowData),
          pagination: {
            currentPage: page,
            hasNextPage: result.data.length === 250 // TVMaze returns 250 shows per page
          }
        }
      };
    }
    
    return result;
  }

  // Get shows airing today
  async getShowsAiringToday() {
    const today = new Date().toISOString().split('T')[0];
    const result = await this.makeRequest('/schedule', { date: today });
    
    if (result.success) {
      return {
        success: true,
        data: result.data.map(item => ({
          episode: this.formatEpisodeData(item),
          show: this.formatShowData(item.show)
        }))
      };
    }
    
    return result;
  }

  // Get shows by genre
  async getShowsByGenre(genre, page = 0) {
    // TVMaze doesn't have a direct genre filter, so we'll search and filter
    const result = await this.getShowsByPage(page);
    
    if (result.success) {
      const filteredShows = result.data.results.filter(show => 
        show.genres.some(g => g.toLowerCase().includes(genre.toLowerCase()))
      );
      
      return {
        success: true,
        data: {
          results: filteredShows,
          pagination: result.data.pagination
        }
      };
    }
    
    return result;
  }

  // Format show data to consistent structure
  formatShowData(show) {
    return {
      id: show.id,
      name: show.name,
      type: show.type,
      language: show.language,
      genres: show.genres || [],
      status: show.status,
      runtime: show.runtime,
      averageRuntime: show.averageRuntime,
      premiered: show.premiered,
      ended: show.ended,
      officialSite: show.officialSite,
      schedule: show.schedule ? {
        time: show.schedule.time,
        days: show.schedule.days
      } : null,
      rating: show.rating ? {
        average: show.rating.average
      } : null,
      weight: show.weight,
      network: show.network ? {
        id: show.network.id,
        name: show.network.name,
        country: show.network.country ? {
          name: show.network.country.name,
          code: show.network.country.code,
          timezone: show.network.country.timezone
        } : null,
        officialSite: show.network.officialSite
      } : null,
      webChannel: show.webChannel ? {
        id: show.webChannel.id,
        name: show.webChannel.name,
        country: show.webChannel.country ? {
          name: show.webChannel.country.name,
          code: show.webChannel.country.code,
          timezone: show.webChannel.country.timezone
        } : null,
        officialSite: show.webChannel.officialSite
      } : null,
      dvdCountry: show.dvdCountry,
      externals: show.externals ? {
        tvdb: show.externals.tvdb,
        imdb: show.externals.imdb,
        thetvdb: show.externals.thetvdb
      } : null,
      image: show.image ? {
        medium: show.image.medium,
        original: show.image.original
      } : null,
      summary: show.summary,
      updated: show.updated,
      // Embedded data
      episodes: show._embedded?.episodes?.map(this.formatEpisodeData) || [],
      cast: show._embedded?.cast || [],
      crew: show._embedded?.crew || []
    };
  }

  // Format episode data to consistent structure
  formatEpisodeData(episode) {
    return {
      id: episode.id,
      name: episode.name,
      season: episode.season,
      number: episode.number,
      type: episode.type,
      airdate: episode.airdate,
      airtime: episode.airtime,
      airstamp: episode.airstamp,
      runtime: episode.runtime,
      rating: episode.rating ? {
        average: episode.rating.average
      } : null,
      image: episode.image ? {
        medium: episode.image.medium,
        original: episode.image.original
      } : null,
      summary: episode.summary,
      // Show data if embedded
      show: episode.show ? this.formatShowData(episode.show) : null
    };
  }
}

export default new TVMazeApi();