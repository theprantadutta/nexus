import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TextInput,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useAppStore } from '../../src/store/useAppStore';

import CircleCard from '../../src/components/cards/CircleCard';
import MeetupCard from '../../src/components/cards/MeetupCard';
import SearchFiltersModal from '../../src/components/modals/SearchFiltersModal';
import DiscoverMapView from '../../src/components/maps/DiscoverMapView';
import { CircleCardSkeleton, MeetupCardSkeleton } from '../../src/components/common/SkeletonLoader';
import { useDiscovery } from '../../src/hooks/useDiscovery';
import { SearchFilters } from '../../src/services/search/discoveryService';
import SearchSuggestions from '../../src/components/search/SearchSuggestions';

const CATEGORIES = [
  'All',
  'Technology',
  'Sports',
  'Arts',
  'Gaming',
  'Fitness',
  'Food',
  'Music',
  'Travel',
  'Books',
  'Photography',
  'Business',
];

export default function DiscoverScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    categories: [],
    distance: 25,
    sortBy: 'relevance',
    showOnlineOnly: false,
    showFreeOnly: false,
    dateRange: 'anytime',
  });

  const { loadCircles, loadMeetups, isLoading } = useAppStore();
  const {
    isSearching,
    circleResults,
    meetupResults,
    searchHistory,
    search,
    getRecommendations,
    clearResults,
    trackCircleView,
    trackMeetupView,
  } = useDiscovery();

  // Perform search with current filters
  const performSearch = useCallback(async () => {
    const searchFilters: SearchFilters = {
      ...filters,
      query: searchQuery.trim() || undefined,
      categories: selectedCategory !== 'All' ? [selectedCategory] : filters.categories,
    };

    await search(searchFilters);
  }, [search, filters, searchQuery, selectedCategory]);

  // Get recommendations when no search query
  const loadRecommendations = useCallback(async () => {
    if (!searchQuery.trim()) {
      const recommendationFilters = {
        ...filters,
        categories: selectedCategory !== 'All' ? [selectedCategory] : filters.categories,
      };
      await getRecommendations(recommendationFilters);
    }
  }, [getRecommendations, filters, selectedCategory, searchQuery]);

  // Load initial data and recommendations
  useEffect(() => {
    loadCircles();
    loadMeetups();
    loadRecommendations();
  }, [loadCircles, loadMeetups, loadRecommendations]);

  // Trigger search when filters change
  useEffect(() => {
    if (searchQuery.trim()) {
      performSearch();
    } else {
      loadRecommendations();
    }
  }, [searchQuery, selectedCategory, filters, performSearch, loadRecommendations]);

  const handleApplyFilters = (newFilters: SearchFilters) => {
    setFilters(newFilters);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setShowSuggestions(query.length === 0 && searchHistory.length > 0);
  };

  const handleSearchFocus = () => {
    setShowSuggestions(searchQuery.length === 0 && searchHistory.length > 0);
  };

  const handleSearchBlur = () => {
    // Delay hiding suggestions to allow for suggestion selection
    setTimeout(() => setShowSuggestions(false), 200);
  };

  const handleSuggestionPress = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setShowSuggestions(false);
    clearResults();
  };

  const handleCirclePress = (circleId: string) => {
    trackCircleView(circleId);
    console.log('Navigate to circle:', circleId);
  };

  const handleMeetupPress = (meetupId: string) => {
    trackMeetupView(meetupId);
    console.log('Navigate to meetup:', meetupId);
  };

  const handleJoinMeetup = (meetupId: string) => {
    console.log('Join meetup:', meetupId);
  };
  const renderSearchHeader = () => (
    <View style={styles.searchHeader}>
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search circles and events..."
            value={searchQuery}
            onChangeText={handleSearch}
            onFocus={handleSearchFocus}
            onBlur={handleSearchBlur}
            placeholderTextColor="#9CA3AF"
          />
        </View>
        <TouchableOpacity style={styles.filterButton} onPress={() => setShowFiltersModal(true)}>
          <Text style={styles.filterIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Category Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryContainer}
      >
        {CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryChip,
              selectedCategory === category && styles.selectedCategoryChip
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text style={[
              styles.categoryText,
              selectedCategory === category && styles.selectedCategoryText
            ]}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* View Mode Toggle */}
      <View style={styles.viewToggle}>
        <TouchableOpacity
          style={[styles.toggleButton, viewMode === 'list' && styles.activeToggleButton]}
          onPress={() => setViewMode('list')}
        >
          <Text style={[styles.toggleText, viewMode === 'list' && styles.activeToggleText]}>
            List
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, viewMode === 'map' && styles.activeToggleButton]}
          onPress={() => setViewMode('map')}
        >
          <Text style={[styles.toggleText, viewMode === 'map' && styles.activeToggleText]}>
            Map
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Suggestions */}
      <SearchSuggestions
        suggestions={searchHistory}
        onSuggestionPress={handleSuggestionPress}
        visible={showSuggestions}
      />
    </View>
  );

  const renderListView = () => (
    <ScrollView style={styles.listView} showsVerticalScrollIndicator={false}>
      {/* Trending Circles */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Trending Circles</Text>
        {isLoading || isSearching ? (
          <View style={[styles.horizontalList, { flexDirection: 'row' }]}>
            {Array.from({ length: 5 }).map((_, i) => (
              <View key={i} style={{ marginRight: 16 }}>
                <CircleCardSkeleton />
              </View>
            ))}
          </View>
        ) : circleResults.length > 0 ? (
          <FlatList
            data={circleResults.slice(0, 5)}
            renderItem={({ item }) => (
              <CircleCard
                circle={item.item}
                onPress={() => handleCirclePress(item.item.$id)}
              />
            )}
            keyExtractor={(item) => item.item.$id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          />
        ) : null}
      </View>

      {/* This Weekend */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>This Weekend</Text>
        <View style={styles.meetupsList}>
          {isLoading || isSearching ? (
            Array.from({ length: 3 }).map((_, i) => (
              <MeetupCardSkeleton key={i} />
            ))
          ) : meetupResults.length > 0 ? (
            meetupResults.slice(0, 3).map((result) => (
              <MeetupCard
                key={result.item.$id}
                meetup={result.item}
                onPress={() => handleMeetupPress(result.item.$id)}
                onJoin={() => handleJoinMeetup(result.item.$id)}
                isJoined={false}
              />
            ))
          ) : null}
        </View>
      </View>

      {/* New in Your Area */}
      {circleResults.length > 5 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>New in Your Area</Text>
          <FlatList
            data={circleResults.slice(5, 10)}
            renderItem={({ item }) => (
              <CircleCard
                circle={item.item}
                onPress={() => handleCirclePress(item.item.$id)}
              />
            )}
            keyExtractor={(item) => item.item.$id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          />
        </View>
      )}

      {/* No Results */}
      {circleResults.length === 0 && meetupResults.length === 0 && !isLoading && !isSearching && (
        <View style={styles.noResults}>
          <Text style={styles.noResultsTitle}>No results found</Text>
          <Text style={styles.noResultsText}>
            Try adjusting your search or filters
          </Text>
        </View>
      )}
    </ScrollView>
  );

  const renderMapView = () => (
    <DiscoverMapView
      circles={circleResults.map(r => r.item)}
      meetups={meetupResults.map(r => r.item)}
      onCirclePress={handleCirclePress}
      onMeetupPress={handleMeetupPress}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      {renderSearchHeader()}

      {viewMode === 'list' ? renderListView() : renderMapView()}

      <SearchFiltersModal
        isVisible={showFiltersModal}
        onClose={() => setShowFiltersModal(false)}
        onApplyFilters={handleApplyFilters}
        initialFilters={filters}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  searchHeader: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterIcon: {
    fontSize: 18,
  },
  categoryScroll: {
    marginBottom: 16,
  },
  categoryContainer: {
    paddingRight: 20,
  },
  categoryChip: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedCategoryChip: {
    backgroundColor: '#EEF2FF',
    borderColor: '#4361EE',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  selectedCategoryText: {
    color: '#4361EE',
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 2,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeToggleButton: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeToggleText: {
    color: '#4361EE',
  },
  listView: {
    flex: 1,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  horizontalList: {
    paddingLeft: 20,
  },
  meetupsList: {
    paddingHorizontal: 20,
  },
  noResults: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  noResultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  noResultsText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  mapView: {
    flex: 1,
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    margin: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  mapPlaceholderText: {
    fontSize: 48,
    marginBottom: 16,
  },
  mapPlaceholderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  mapPlaceholderSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
