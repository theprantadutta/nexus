import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Dimensions,
  Modal,
} from 'react-native';
import Slider from '@react-native-community/slider';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface FilterOptions {
  distance: number;
  categories: string[];
  sortBy: 'relevance' | 'distance' | 'newest' | 'popular';
  showOnlineOnly: boolean;
  showFreeOnly: boolean;
  dateRange: 'anytime' | 'today' | 'this_week' | 'this_month';
}

interface SearchFiltersModalProps {
  isVisible: boolean;
  onClose: () => void;
  onApplyFilters: (filters: FilterOptions) => void;
  initialFilters: FilterOptions;
}

const CATEGORIES = [
  'Technology', 'Sports', 'Arts', 'Gaming', 'Fitness', 'Food',
  'Music', 'Travel', 'Books', 'Photography', 'Dancing', 'Cooking',
  'Business', 'Health', 'Education', 'Volunteering'
];

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Most Relevant' },
  { value: 'distance', label: 'Nearest First' },
  { value: 'newest', label: 'Newest First' },
  { value: 'popular', label: 'Most Popular' },
];

const DATE_RANGES = [
  { value: 'anytime', label: 'Anytime' },
  { value: 'today', label: 'Today' },
  { value: 'this_week', label: 'This Week' },
  { value: 'this_month', label: 'This Month' },
];

const SearchFiltersModal: React.FC<SearchFiltersModalProps> = ({
  isVisible,
  onClose,
  onApplyFilters,
  initialFilters,
}) => {
  const [filters, setFilters] = useState<FilterOptions>(initialFilters);

  const updateFilter = (key: keyof FilterOptions, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleCategory = (category: string) => {
    const currentCategories = filters.categories;
    const updatedCategories = currentCategories.includes(category)
      ? currentCategories.filter(c => c !== category)
      : [...currentCategories, category];
    
    updateFilter('categories', updatedCategories);
  };

  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleReset = () => {
    setFilters({
      distance: 25,
      categories: [],
      sortBy: 'relevance',
      showOnlineOnly: false,
      showFreeOnly: false,
      dateRange: 'anytime',
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.categories.length > 0) count++;
    if (filters.distance < 50) count++;
    if (filters.showOnlineOnly) count++;
    if (filters.showFreeOnly) count++;
    if (filters.dateRange !== 'anytime') count++;
    if (filters.sortBy !== 'relevance') count++;
    return count;
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeIcon}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Filters</Text>
          <TouchableOpacity onPress={handleReset} style={styles.resetButton}>
            <Text style={styles.resetText}>Reset</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Distance */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Distance</Text>
            <View style={styles.distanceContainer}>
              <Text style={styles.distanceLabel}>Within {filters.distance} km</Text>
              <Slider
                style={styles.slider}
                minimumValue={1}
                maximumValue={100}
                value={filters.distance}
                onValueChange={(value) => updateFilter('distance', Math.round(value))}
                minimumTrackTintColor="#4361EE"
                maximumTrackTintColor="#E5E7EB"
              />
              <View style={styles.distanceRange}>
                <Text style={styles.rangeText}>1 km</Text>
                <Text style={styles.rangeText}>100+ km</Text>
              </View>
            </View>
          </View>

          {/* Categories */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <View style={styles.categoriesGrid}>
              {CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryChip,
                    filters.categories.includes(category) && styles.selectedCategoryChip
                  ]}
                  onPress={() => toggleCategory(category)}
                >
                  <Text style={[
                    styles.categoryText,
                    filters.categories.includes(category) && styles.selectedCategoryText
                  ]}>
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Sort By */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sort By</Text>
            {SORT_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.sortOption,
                  filters.sortBy === option.value && styles.selectedSortOption
                ]}
                onPress={() => updateFilter('sortBy', option.value)}
              >
                <Text style={[
                  styles.sortOptionText,
                  filters.sortBy === option.value && styles.selectedSortOptionText
                ]}>
                  {option.label}
                </Text>
                <View style={[
                  styles.radioButton,
                  filters.sortBy === option.value && styles.selectedRadioButton
                ]} />
              </TouchableOpacity>
            ))}
          </View>

          {/* Date Range */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>When</Text>
            {DATE_RANGES.map((range) => (
              <TouchableOpacity
                key={range.value}
                style={[
                  styles.sortOption,
                  filters.dateRange === range.value && styles.selectedSortOption
                ]}
                onPress={() => updateFilter('dateRange', range.value)}
              >
                <Text style={[
                  styles.sortOptionText,
                  filters.dateRange === range.value && styles.selectedSortOptionText
                ]}>
                  {range.label}
                </Text>
                <View style={[
                  styles.radioButton,
                  filters.dateRange === range.value && styles.selectedRadioButton
                ]} />
              </TouchableOpacity>
            ))}
          </View>

          {/* Toggle Options */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Options</Text>
            
            <View style={styles.toggleOption}>
              <View style={styles.toggleContent}>
                <Text style={styles.toggleLabel}>Online Events Only</Text>
                <Text style={styles.toggleDescription}>Show only virtual events</Text>
              </View>
              <Switch
                value={filters.showOnlineOnly}
                onValueChange={(value) => updateFilter('showOnlineOnly', value)}
                trackColor={{ false: '#D1D5DB', true: '#4361EE' }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.toggleOption}>
              <View style={styles.toggleContent}>
                <Text style={styles.toggleLabel}>Free Events Only</Text>
                <Text style={styles.toggleDescription}>Show only free events</Text>
              </View>
              <Switch
                value={filters.showFreeOnly}
                onValueChange={(value) => updateFilter('showFreeOnly', value)}
                trackColor={{ false: '#D1D5DB', true: '#4361EE' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </ScrollView>

        {/* Bottom Actions */}
        <View style={styles.bottomActions}>
          <View style={styles.filtersCount}>
            <Text style={styles.filtersCountText}>
              {getActiveFiltersCount()} filter{getActiveFiltersCount() !== 1 ? 's' : ''} applied
            </Text>
          </View>
          <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
            <Text style={styles.applyButtonText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    fontSize: 16,
    color: '#6B7280',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  resetButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  resetText: {
    fontSize: 16,
    color: '#4361EE',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  distanceContainer: {
    marginBottom: 8,
  },
  distanceLabel: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 16,
    textAlign: 'center',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  distanceRange: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  rangeText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
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
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  selectedSortOption: {
    backgroundColor: '#EEF2FF',
  },
  sortOptionText: {
    fontSize: 16,
    color: '#374151',
  },
  selectedSortOptionText: {
    color: '#4361EE',
    fontWeight: '500',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
  },
  selectedRadioButton: {
    borderColor: '#4361EE',
    backgroundColor: '#4361EE',
  },
  toggleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  toggleContent: {
    flex: 1,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  toggleDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  bottomActions: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  filtersCount: {
    marginBottom: 12,
  },
  filtersCountText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  applyButton: {
    backgroundColor: '#4361EE',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});

export default SearchFiltersModal;
