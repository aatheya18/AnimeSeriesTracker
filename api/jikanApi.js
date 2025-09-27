// Jikan API service for anime data
// Documentation: https://docs.api.jikan.moe/

const JIKAN_BASE_URL = 'https://api.jikan.moe/v4';

class JikanApi {
  constructor() {
    this.baseUrl = JIKAN_BASE_URL;
    this.requestDelay = 1000; // 1 second delay between requests to respect rate limits
    this.lastRequestTime = 0;
  }

  // Add delay between requests to respect rate limits
  async delayRequest() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.requestDelay) {
      const delay = this.requestDelay - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    this.lastRequestTime = Date.now();
  }

  // Generic API request method
  async makeRequest(endpoint, params = {}) {
    try {
      await this.delayRequest();
      
      const url = new URL(`${this.baseUrl}${endpoint}`);
      
      // Add query parameters
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          url.searchParams.append(key, params[key]);
        }
      });

      console.log('Jikan API Request:', url.toString());

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
      console.error('Jikan API Error:', error);
      return { success: false, error: error.message };
    }
  }

  // Search anime
  async searchAnime(query, page = 1, limit = 25) {
    const params = {
      q: query,
      page,
      limit,
      order_by: 'score',
      sort: 'desc'
    };

    const result = await this.makeRequest('/anime', params);
    
    if (result.success) {
      return {
        success: true,
        data: {
          results: result.data.data.map(this.formatAnimeData),
          pagination: result.data.pagination
        }
      };
    }
    
    return result;
  }

  // Get anime by ID
  async getAnimeById(id) {
    const result = await this.makeRequest(`/anime/${id}`);
    
    if (result.success) {
      return {
        success: true,
        data: this.formatAnimeData(result.data.data)
      };
    }
    
    return result;
  }

  // Get anime characters
  async getAnimeCharacters(id) {
    const result = await this.makeRequest(`/anime/${id}/characters`);
    
    if (result.success) {
      return {
        success: true,
        data: result.data.data.map(character => ({
          id: character.character.mal_id,
          name: character.character.name,
          image: character.character.images?.jpg?.image_url || null,
          role: character.role,
          voiceActors: character.voice_actors?.map(va => ({
            id: va.person.mal_id,
            name: va.person.name,
            image: va.person.images?.jpg?.image_url || null,
            language: va.language
          })) || []
        }))
      };
    }
    
    return result;
  }

  // Get anime episodes
  async getAnimeEpisodes(id, page = 1) {
    const result = await this.makeRequest(`/anime/${id}/episodes`, { page });
    
    if (result.success) {
      return {
        success: true,
        data: {
          episodes: result.data.data.map(episode => ({
            id: episode.mal_id,
            number: episode.episode_id,
            title: episode.title,
            titleJapanese: episode.title_japanese,
            titleRomanji: episode.title_romanji,
            aired: episode.aired,
            score: episode.score,
            filler: episode.filler,
            recap: episode.recap,
            forumUrl: episode.forum_url
          })),
          pagination: result.data.pagination
        }
      };
    }
    
    return result;
  }

  // Get anime reviews
  async getAnimeReviews(id, page = 1) {
    const result = await this.makeRequest(`/anime/${id}/reviews`, { page });
    
    if (result.success) {
      return {
        success: true,
        data: {
          reviews: result.data.data.map(review => ({
            id: review.mal_id,
            user: {
              username: review.user.username,
              image: review.user.images?.jpg?.image_url || null
            },
            date: review.date,
            score: review.score,
            content: review.review,
            helpful: review.reactions.helpful,
            tags: review.tags
          })),
          pagination: result.data.pagination
        }
      };
    }
    
    return result;
  }

  // Get top anime
  async getTopAnime(type = 'tv', page = 1, limit = 25) {
    const params = {
      type,
      page,
      limit
    };

    const result = await this.makeRequest('/top/anime', params);
    
    if (result.success) {
      return {
        success: true,
        data: {
          results: result.data.data.map(this.formatAnimeData),
          pagination: result.data.pagination
        }
      };
    }
    
    return result;
  }

  // Get seasonal anime
  async getSeasonalAnime(year, season, page = 1, limit = 25) {
    const params = {
      page,
      limit
    };

    const result = await this.makeRequest(`/seasons/${year}/${season}`, params);
    
    if (result.success) {
      return {
        success: true,
        data: {
          results: result.data.data.map(this.formatAnimeData),
          pagination: result.data.pagination
        }
      };
    }
    
    return result;
  }

  // Get current season anime
  async getCurrentSeasonAnime(page = 1, limit = 25) {
    const params = {
      page,
      limit
    };

    const result = await this.makeRequest('/seasons/now', params);
    
    if (result.success) {
      return {
        success: true,
        data: {
          results: result.data.data.map(this.formatAnimeData),
          pagination: result.data.pagination
        }
      };
    }
    
    return result;
  }

  // Get anime recommendations
  async getAnimeRecommendations(id) {
    const result = await this.makeRequest(`/anime/${id}/recommendations`);
    
    if (result.success) {
      return {
        success: true,
        data: result.data.data.map(rec => ({
          id: rec.entry.mal_id,
          title: rec.entry.title,
          image: rec.entry.images?.jpg?.image_url || null,
          votes: rec.votes
        }))
      };
    }
    
    return result;
  }

  // Format anime data to consistent structure
  formatAnimeData(anime) {
    return {
      id: anime.mal_id,
      title: anime.title,
      titleEnglish: anime.title_english,
      titleJapanese: anime.title_japanese,
      titleSynonyms: anime.title_synonyms || [],
      type: anime.type,
      source: anime.source,
      episodes: anime.episodes,
      status: anime.status,
      airing: anime.airing,
      aired: {
        from: anime.aired?.from || null,
        to: anime.aired?.to || null,
        string: anime.aired?.string || null
      },
      duration: anime.duration,
      rating: anime.rating,
      score: anime.score,
      scoredBy: anime.scored_by,
      rank: anime.rank,
      popularity: anime.popularity,
      members: anime.members,
      favorites: anime.favorites,
      synopsis: anime.synopsis,
      background: anime.background,
      season: anime.season,
      year: anime.year,
      broadcast: anime.broadcast,
      producers: anime.producers?.map(p => ({
        id: p.mal_id,
        name: p.name,
        type: p.type
      })) || [],
      licensors: anime.licensors?.map(l => ({
        id: l.mal_id,
        name: l.name,
        type: l.type
      })) || [],
      studios: anime.studios?.map(s => ({
        id: s.mal_id,
        name: s.name,
        type: s.type
      })) || [],
      genres: anime.genres?.map(g => ({
        id: g.mal_id,
        name: g.name,
        type: g.type
      })) || [],
      themes: anime.themes?.map(t => ({
        id: t.mal_id,
        name: t.name,
        type: t.type
      })) || [],
      demographics: anime.demographics?.map(d => ({
        id: d.mal_id,
        name: d.name,
        type: d.type
      })) || [],
      images: {
        jpg: {
          imageUrl: anime.images?.jpg?.image_url || null,
          smallImageUrl: anime.images?.jpg?.small_image_url || null,
          largeImageUrl: anime.images?.jpg?.large_image_url || null
        },
        webp: {
          imageUrl: anime.images?.webp?.image_url || null,
          smallImageUrl: anime.images?.webp?.small_image_url || null,
          largeImageUrl: anime.images?.webp?.large_image_url || null
        }
      },
      trailer: {
        youtubeId: anime.trailer?.youtube_id || null,
        url: anime.trailer?.url || null,
        embedUrl: anime.trailer?.embed_url || null
      },
      approved: anime.approved,
      titles: anime.titles || []
    };
  }
}

export default new JikanApi();
