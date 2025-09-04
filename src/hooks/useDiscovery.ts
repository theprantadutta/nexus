import { useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';
import { Circle, Meetup } from '../types';
import { 
  discoveryService, 
  SearchFilters, 
  SearchResult, 
  RecommendationContext 
} from '../services/search/discoveryService';
import { useAppStore } from '../store/useAppStore';

export const useDiscovery = () => {
  const [isSearching, setIsSearching] = useState(false);
  const [circleResults, setCircleResults] = useState<SearchResult<Circle>[]>([]);
  const [meetupResults, setMeetupResults] = useState<SearchResult<Meetup>[]>([]);
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  
  const { user, userMemberships } = useAppStore();

  // Load user location on mount
  useEffect(() => {
    loadUserLocation();
    loadSearchHistory();
  }, []);

  const loadUserLocation = async () => {
    const location = await discoveryService.getCurrentLocation();
    setUserLocation(location);
  };

  const loadSearchHistory = async () => {
    const history = await discoveryService.getSearchHistory();
    setSearchHistory(history);
  };

  // Build recommendation context
  const buildRecommendationContext = useCallback((): RecommendationContext | undefined => {
    if (!user) return undefined;

    return {
      userInterests: user.interests || [],
      userLocation: userLocation || undefined,
      joinedCircles: userMemberships.map(m => m.circleId),
      attendedMeetups: [], // TODO: Get from user's meetup history
      searchHistory,
      interactionHistory: {
        circleViews: [],
        meetupViews: [],
        circleJoins: userMemberships.map(m => m.circleId),
        meetupAttendances: [],
      },
    };
  }, [user, userLocation, userMemberships, searchHistory]);

  // Perform search
  const search = useCallback(async (filters: SearchFilters) => {
    setIsSearching(true);
    
    try {
      // Add user location to filters if available
      const searchFilters: SearchFilters = {
        ...filters,
        location: userLocation ? {
          latitude: userLocation.coords.latitude,
          longitude: userLocation.coords.longitude,
        } : undefined,
      };

      const context = buildRecommendationContext();

      // Search circles and meetups in parallel
      const [circleResults, meetupResults] = await Promise.all([
        discoveryService.searchCircles(searchFilters, context),
        discoveryService.searchMeetups(searchFilters, context),
      ]);

      setCircleResults(circleResults);
      setMeetupResults(meetupResults);

      // Save search query to history
      if (filters.query) {
        await discoveryService.saveSearchQuery(filters.query);
        await loadSearchHistory();
      }
    } catch (error) {
      console.error('Search error:', error);
      setCircleResults([]);
      setMeetupResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [userLocation, buildRecommendationContext]);

  // Get recommendations without search query
  const getRecommendations = useCallback(async (filters: Omit<SearchFilters, 'query'>) => {
    const recommendationFilters: SearchFilters = {
      ...filters,
      sortBy: 'recommended',
      location: userLocation ? {
        latitude: userLocation.coords.latitude,
        longitude: userLocation.coords.longitude,
      } : undefined,
    };

    await search(recommendationFilters);
  }, [search, userLocation]);

  // Track user interactions
  const trackCircleView = useCallback(async (circleId: string) => {
    await discoveryService.trackInteraction('circle_view', circleId);
  }, []);

  const trackMeetupView = useCallback(async (meetupId: string) => {
    await discoveryService.trackInteraction('meetup_view', meetupId);
  }, []);

  const trackCircleJoin = useCallback(async (circleId: string) => {
    await discoveryService.trackInteraction('circle_join', circleId);
  }, []);

  const trackMeetupAttend = useCallback(async (meetupId: string) => {
    await discoveryService.trackInteraction('meetup_attend', meetupId);
  }, []);

  // Get popular searches or trending content
  const getTrending = useCallback(async () => {
    const trendingFilters: SearchFilters = {
      categories: [],
      distance: 50,
      sortBy: 'popular',
      showOnlineOnly: false,
      showFreeOnly: false,
      dateRange: 'this_week',
      location: userLocation ? {
        latitude: userLocation.coords.latitude,
        longitude: userLocation.coords.longitude,
      } : undefined,
    };

    await search(trendingFilters);
  }, [search, userLocation]);

  // Clear search results
  const clearResults = useCallback(() => {
    setCircleResults([]);
    setMeetupResults([]);
  }, []);

  // Refresh location
  const refreshLocation = useCallback(async () => {
    await loadUserLocation();
  }, []);

  return {
    // State
    isSearching,
    circleResults,
    meetupResults,
    userLocation,
    searchHistory,
    
    // Actions
    search,
    getRecommendations,
    getTrending,
    clearResults,
    refreshLocation,
    
    // Tracking
    trackCircleView,
    trackMeetupView,
    trackCircleJoin,
    trackMeetupAttend,
  };
};
