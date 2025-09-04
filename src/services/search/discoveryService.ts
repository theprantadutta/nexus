import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Circle, Meetup } from '../../types';
import { databaseService } from '../firebase/database';

export interface SearchFilters {
  query?: string;
  categories: string[];
  distance: number;
  sortBy: 'relevance' | 'distance' | 'newest' | 'popular' | 'recommended';
  showOnlineOnly: boolean;
  showFreeOnly: boolean;
  dateRange: 'anytime' | 'today' | 'this_week' | 'this_month';
  location?: {
    latitude: number;
    longitude: number;
  };
  priceRange?: {
    min: number;
    max: number;
  };
}

export interface SearchResult<T> {
  item: T;
  score: number;
  distance?: number;
  relevanceFactors: string[];
}

export interface RecommendationContext {
  userInterests: string[];
  userLocation?: Location.LocationObject;
  joinedCircles: string[];
  attendedMeetups: string[];
  searchHistory: string[];
  interactionHistory: {
    circleViews: string[];
    meetupViews: string[];
    circleJoins: string[];
    meetupAttendances: string[];
  };
}

class DiscoveryService {
  private searchCache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private readonly SEARCH_HISTORY_KEY = '@nexus_search_history';
  private readonly INTERACTION_HISTORY_KEY = '@nexus_interaction_history';

  // Location-based search
  async getCurrentLocation(): Promise<Location.LocationObject | null> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Location permission denied');
        return null;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      
      return location;
    } catch (error) {
      console.error('Get location error:', error);
      return null;
    }
  }

  // Calculate distance between two points using Haversine formula
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Advanced search with scoring
  async searchCircles(
    filters: SearchFilters,
    context?: RecommendationContext
  ): Promise<SearchResult<Circle>[]> {
    const cacheKey = `circles_${JSON.stringify(filters)}`;
    
    // Check cache first
    const cached = this.getCachedResult(cacheKey);
    if (cached) return cached;

    try {
      // Get all circles
      const result = await databaseService.getCircles(100);
      if (!result.success || !result.data) return [];

      let circles = result.data;
      const searchResults: SearchResult<Circle>[] = [];

      for (const circle of circles) {
        const searchResult = this.scoreCircle(circle, filters, context);
        if (searchResult.score > 0) {
          searchResults.push(searchResult);
        }
      }

      // Sort by score and selected sort method
      const sortedResults = this.sortResults(searchResults, filters.sortBy);
      
      // Cache results
      this.setCachedResult(cacheKey, sortedResults);
      
      return sortedResults;
    } catch (error) {
      console.error('Search circles error:', error);
      return [];
    }
  }

  async searchMeetups(
    filters: SearchFilters,
    context?: RecommendationContext
  ): Promise<SearchResult<Meetup>[]> {
    const cacheKey = `meetups_${JSON.stringify(filters)}`;
    
    // Check cache first
    const cached = this.getCachedResult(cacheKey);
    if (cached) return cached;

    try {
      // Get all meetups
      const result = await databaseService.getMeetups(undefined, 100);
      if (!result.success || !result.data) return [];

      let meetups = result.data;
      const searchResults: SearchResult<Meetup>[] = [];

      for (const meetup of meetups) {
        const searchResult = this.scoreMeetup(meetup, filters, context);
        if (searchResult.score > 0) {
          searchResults.push(searchResult);
        }
      }

      // Sort by score and selected sort method
      const sortedResults = this.sortResults(searchResults, filters.sortBy);
      
      // Cache results
      this.setCachedResult(cacheKey, sortedResults);
      
      return sortedResults;
    } catch (error) {
      console.error('Search meetups error:', error);
      return [];
    }
  }

  // Circle scoring algorithm
  private scoreCircle(
    circle: Circle,
    filters: SearchFilters,
    context?: RecommendationContext
  ): SearchResult<Circle> {
    let score = 0;
    const relevanceFactors: string[] = [];

    // Base score
    score += 10;

    // Text relevance
    if (filters.query) {
      const query = filters.query.toLowerCase();
      const name = circle.name.toLowerCase();
      const description = circle.description.toLowerCase();
      
      if (name.includes(query)) {
        score += 50;
        relevanceFactors.push('name_match');
      }
      if (description.includes(query)) {
        score += 30;
        relevanceFactors.push('description_match');
      }
      
      // Fuzzy matching for typos
      if (this.fuzzyMatch(query, name) || this.fuzzyMatch(query, description)) {
        score += 20;
        relevanceFactors.push('fuzzy_match');
      }
    }

    // Category filtering
    if (filters.categories.length > 0) {
      if (!filters.categories.includes(circle.category)) {
        return { item: circle, score: 0, relevanceFactors: [] };
      }
      score += 25;
      relevanceFactors.push('category_match');
    }

    // Location-based scoring
    let distance: number | undefined;
    if (filters.location && circle.location?.coordinates) {
      distance = this.calculateDistance(
        filters.location.latitude,
        filters.location.longitude,
        circle.location.coordinates.latitude,
        circle.location.coordinates.longitude
      );

      if (distance <= filters.distance) {
        // Closer circles get higher scores
        const distanceScore = Math.max(0, 50 - (distance / filters.distance) * 50);
        score += distanceScore;
        relevanceFactors.push('within_distance');
      } else {
        // Outside distance filter
        score = 0;
      }
    }

    // Popularity scoring
    const popularityScore = Math.min(30, circle.memberCount * 0.5);
    score += popularityScore;
    if (popularityScore > 15) {
      relevanceFactors.push('popular');
    }

    // Recommendation scoring
    if (context) {
      const recommendationScore = this.getCircleRecommendationScore(circle, context);
      score += recommendationScore;
      if (recommendationScore > 20) {
        relevanceFactors.push('recommended');
      }
    }

    return {
      item: circle,
      score,
      distance,
      relevanceFactors,
    };
  }

  // Meetup scoring algorithm
  private scoreMeetup(
    meetup: Meetup,
    filters: SearchFilters,
    context?: RecommendationContext
  ): SearchResult<Meetup> {
    let score = 0;
    const relevanceFactors: string[] = [];

    // Base score
    score += 10;

    // Text relevance
    if (filters.query) {
      const query = filters.query.toLowerCase();
      const title = meetup.title.toLowerCase();
      const description = meetup.description.toLowerCase();
      
      if (title.includes(query)) {
        score += 50;
        relevanceFactors.push('title_match');
      }
      if (description.includes(query)) {
        score += 30;
        relevanceFactors.push('description_match');
      }
    }

    // Online filter
    if (filters.showOnlineOnly && !meetup.isOnline) {
      return { item: meetup, score: 0, relevanceFactors: [] };
    }

    // Free filter
    if (filters.showFreeOnly && meetup.price && meetup.price > 0) {
      return { item: meetup, score: 0, relevanceFactors: [] };
    }

    // Price range filter
    if (filters.priceRange) {
      const price = meetup.price || 0;
      if (price < filters.priceRange.min || price > filters.priceRange.max) {
        return { item: meetup, score: 0, relevanceFactors: [] };
      }
    }

    // Date range filtering
    const meetupDate = new Date(meetup.date);
    const now = new Date();
    
    if (!this.isWithinDateRange(meetupDate, filters.dateRange)) {
      return { item: meetup, score: 0, relevanceFactors: [] };
    }

    // Upcoming events get higher scores
    const daysUntil = (meetupDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    if (daysUntil >= 0 && daysUntil <= 7) {
      score += 30;
      relevanceFactors.push('upcoming');
    }

    // Location-based scoring
    let distance: number | undefined;
    if (filters.location && meetup.location && !meetup.isOnline) {
      distance = this.calculateDistance(
        filters.location.latitude,
        filters.location.longitude,
        meetup.location.coordinates.latitude,
        meetup.location.coordinates.longitude
      );

      if (distance <= filters.distance) {
        const distanceScore = Math.max(0, 40 - (distance / filters.distance) * 40);
        score += distanceScore;
        relevanceFactors.push('within_distance');
      } else {
        score = 0;
      }
    }

    // Attendance scoring
    const attendanceRatio = meetup.maxAttendees 
      ? meetup.currentAttendees / meetup.maxAttendees 
      : 0;
    
    if (attendanceRatio > 0.7) {
      score += 20;
      relevanceFactors.push('high_interest');
    }

    // Recommendation scoring
    if (context) {
      const recommendationScore = this.getMeetupRecommendationScore(meetup, context);
      score += recommendationScore;
      if (recommendationScore > 15) {
        relevanceFactors.push('recommended');
      }
    }

    return {
      item: meetup,
      score,
      distance,
      relevanceFactors,
    };
  }

  // Recommendation algorithms
  private getCircleRecommendationScore(circle: Circle, context: RecommendationContext): number {
    let score = 0;

    // Interest-based recommendations
    if (context.userInterests.includes(circle.category)) {
      score += 30;
    }

    // Similar circles recommendation
    const similarCircles = context.joinedCircles.length;
    if (similarCircles > 0) {
      // Users who joined similar circles might like this one
      score += Math.min(20, similarCircles * 2);
    }

    // Interaction history
    if (context.interactionHistory.circleViews.includes(circle.$id)) {
      score += 15; // Previously viewed
    }

    return score;
  }

  private getMeetupRecommendationScore(meetup: Meetup, context: RecommendationContext): number {
    let score = 0;

    // Circle membership recommendation
    if (context.joinedCircles.includes(meetup.circleId)) {
      score += 40; // High score for own circle events
    }

    // Similar meetup attendance
    const attendedCount = context.attendedMeetups.length;
    if (attendedCount > 0) {
      score += Math.min(15, attendedCount);
    }

    // Interaction history
    if (context.interactionHistory.meetupViews.includes(meetup.$id)) {
      score += 10; // Previously viewed
    }

    return score;
  }

  // Utility methods
  private fuzzyMatch(query: string, text: string): boolean {
    // Simple fuzzy matching - can be enhanced with libraries like fuse.js
    const threshold = 0.8;
    const similarity = this.calculateSimilarity(query, text);
    return similarity >= threshold;
  }

  private calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  private isWithinDateRange(date: Date, range: string): boolean {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (range) {
      case 'today':
        return date >= today && date < new Date(today.getTime() + 24 * 60 * 60 * 1000);
      case 'this_week':
        const weekEnd = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        return date >= today && date < weekEnd;
      case 'this_month':
        const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        return date >= today && date <= monthEnd;
      default:
        return date >= today; // Future events only
    }
  }

  private sortResults<T>(results: SearchResult<T>[], sortBy: string): SearchResult<T>[] {
    return results.sort((a, b) => {
      switch (sortBy) {
        case 'distance':
          if (a.distance !== undefined && b.distance !== undefined) {
            return a.distance - b.distance;
          }
          return b.score - a.score;
        case 'newest':
          // Assuming items have createdAt property
          const aDate = new Date((a.item as any).createdAt || 0);
          const bDate = new Date((b.item as any).createdAt || 0);
          return bDate.getTime() - aDate.getTime();
        case 'popular':
          const aPopularity = (a.item as any).memberCount || (a.item as any).currentAttendees || 0;
          const bPopularity = (b.item as any).memberCount || (b.item as any).currentAttendees || 0;
          return bPopularity - aPopularity;
        default:
          return b.score - a.score; // relevance/recommended
      }
    });
  }

  // Cache management
  private getCachedResult(key: string): any {
    const cached = this.searchCache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }

  private setCachedResult(key: string, data: any): void {
    this.searchCache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  // Search history management
  async saveSearchQuery(query: string): Promise<void> {
    try {
      const history = await this.getSearchHistory();
      const updatedHistory = [query, ...history.filter(q => q !== query)].slice(0, 10);
      await AsyncStorage.setItem(this.SEARCH_HISTORY_KEY, JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Save search query error:', error);
    }
  }

  async getSearchHistory(): Promise<string[]> {
    try {
      const history = await AsyncStorage.getItem(this.SEARCH_HISTORY_KEY);
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('Get search history error:', error);
      return [];
    }
  }

  // Interaction tracking
  async trackInteraction(type: 'circle_view' | 'meetup_view' | 'circle_join' | 'meetup_attend', itemId: string): Promise<void> {
    try {
      const history = await this.getInteractionHistory();
      const key = `${type}s` as keyof typeof history;
      
      if (!history[key].includes(itemId)) {
        history[key] = [itemId, ...history[key]].slice(0, 50); // Keep last 50 interactions
        await AsyncStorage.setItem(this.INTERACTION_HISTORY_KEY, JSON.stringify(history));
      }
    } catch (error) {
      console.error('Track interaction error:', error);
    }
  }

  private async getInteractionHistory(): Promise<RecommendationContext['interactionHistory']> {
    try {
      const history = await AsyncStorage.getItem(this.INTERACTION_HISTORY_KEY);
      return history ? JSON.parse(history) : {
        circleViews: [],
        meetupViews: [],
        circleJoins: [],
        meetupAttendances: [],
      };
    } catch (error) {
      console.error('Get interaction history error:', error);
      return {
        circleViews: [],
        meetupViews: [],
        circleJoins: [],
        meetupAttendances: [],
      };
    }
  }

  // Clear cache
  clearCache(): void {
    this.searchCache.clear();
  }
}

export const discoveryService = new DiscoveryService();
