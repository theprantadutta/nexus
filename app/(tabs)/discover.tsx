import React, { useState, useEffect } from 'react';
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
  Dimensions,
} from 'react-native';
import { useAppStore } from '../../src/store/useAppStore';
import { Circle, Meetup } from '../../src/types';
import CircleCard from '../../src/components/cards/CircleCard';
import MeetupCard from '../../src/components/cards/MeetupCard';
import SearchFiltersModal from '../../src/components/modals/SearchFiltersModal';
import DiscoverMapView from '../../src/components/maps/DiscoverMapView';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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
  const [filteredCircles, setFilteredCircles] = useState<Circle[]>([]);
  const [filteredMeetups, setFilteredMeetups] = useState<Meetup[]>([]);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [filters, setFilters] = useState({
    distance: 25,
    categories: [] as string[],
    sortBy: 'relevance' as 'relevance' | 'distance' | 'newest' | 'popular',
    showOnlineOnly: false,
    showFreeOnly: false,
    dateRange: 'anytime' as 'anytime' | 'today' | 'this_week' | 'this_month',
  });

  const { circles, meetups, loadCircles, loadMeetups, isLoading } = useAppStore();

  useEffect(() => {
    loadCircles();
    loadMeetups();
  }, []);

  useEffect(() => {
    filterContent();
  }, [searchQuery, selectedCategory, filters, circles, meetups]);

  const filterContent = () => {
    let filteredC = circles;
    let filteredM = meetups;

    // Filter by category
    if (selectedCategory !== 'All') {
      filteredC = circles.filter(circle => circle.category === selectedCategory);
      filteredM = meetups.filter(meetup => {
        const circle = circles.find(c => c.$id === meetup.circleId);
        return circle?.category === selectedCategory;
      });
    }

    // Filter by advanced filters
    if (filters.categories.length > 0) {
      filteredC = filteredC.filter(circle => filters.categories.includes(circle.category));
      filteredM = filteredM.filter(meetup => {
        const circle = circles.find(c => c.$id === meetup.circleId);
        return circle && filters.categories.includes(circle.category);
      });
    }

    // Filter by online only
    if (filters.showOnlineOnly) {
      filteredM = filteredM.filter(meetup => meetup.isOnline);
    }

    // Filter by free only
    if (filters.showFreeOnly) {
      filteredM = filteredM.filter(meetup => !meetup.price || meetup.price === 0);
    }

    // Filter by date range
    if (filters.dateRange !== 'anytime') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      filteredM = filteredM.filter(meetup => {
        const meetupDate = new Date(meetup.date);

        switch (filters.dateRange) {
          case 'today':
            return meetupDate >= today && meetupDate < new Date(today.getTime() + 24 * 60 * 60 * 1000);
          case 'this_week':
            const weekEnd = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
            return meetupDate >= today && meetupDate < weekEnd;
          case 'this_month':
            const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            return meetupDate >= today && meetupDate <= monthEnd;
          default:
            return true;
        }
      });
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filteredC = filteredC.filter(circle =>
        circle.name.toLowerCase().includes(query) ||
        circle.description.toLowerCase().includes(query)
      );
      filteredM = filteredM.filter(meetup =>
        meetup.title.toLowerCase().includes(query) ||
        meetup.description.toLowerCase().includes(query)
      );
    }

    // Sort results
    if (filters.sortBy === 'newest') {
      filteredC = filteredC.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      filteredM = filteredM.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (filters.sortBy === 'popular') {
      filteredC = filteredC.sort((a, b) => b.memberCount - a.memberCount);
      filteredM = filteredM.sort((a, b) => b.currentAttendees - a.currentAttendees);
    }

    setFilteredCircles(filteredC);
    setFilteredMeetups(filteredM);
  };

  const handleApplyFilters = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  const handleCirclePress = (circleId: string) => {
    console.log('Navigate to circle:', circleId);
  };

  const handleMeetupPress = (meetupId: string) => {
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
            onChangeText={setSearchQuery}
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
    </View>
  );

  const renderListView = () => (
    <ScrollView style={styles.listView} showsVerticalScrollIndicator={false}>
      {/* Trending Circles */}
      {filteredCircles.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trending Circles</Text>
          <FlatList
            data={filteredCircles.slice(0, 5)}
            renderItem={({ item }) => (
              <CircleCard
                circle={item}
                onPress={() => handleCirclePress(item.$id)}
              />
            )}
            keyExtractor={(item) => item.$id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          />
        </View>
      )}

      {/* This Weekend */}
      {filteredMeetups.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>This Weekend</Text>
          <View style={styles.meetupsList}>
            {filteredMeetups.slice(0, 3).map((meetup) => (
              <MeetupCard
                key={meetup.$id}
                meetup={meetup}
                onPress={() => handleMeetupPress(meetup.$id)}
                onJoin={() => handleJoinMeetup(meetup.$id)}
                isJoined={false}
              />
            ))}
          </View>
        </View>
      )}

      {/* New in Your Area */}
      {filteredCircles.length > 5 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>New in Your Area</Text>
          <FlatList
            data={filteredCircles.slice(5, 10)}
            renderItem={({ item }) => (
              <CircleCard
                circle={item}
                onPress={() => handleCirclePress(item.$id)}
              />
            )}
            keyExtractor={(item) => item.$id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          />
        </View>
      )}

      {/* No Results */}
      {filteredCircles.length === 0 && filteredMeetups.length === 0 && !isLoading && (
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
      circles={filteredCircles}
      meetups={filteredMeetups}
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
