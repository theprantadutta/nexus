import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
} from 'react-native';
import { useAppStore } from '../../store/useAppStore';
import { CreateCircleForm } from '../../types';

interface CreateCircleScreenProps {
  onBack: () => void;
  onComplete: () => void;
}

const CATEGORIES = [
  'Technology', 'Sports', 'Arts', 'Gaming', 'Fitness', 'Food',
  'Music', 'Travel', 'Books', 'Photography', 'Dancing', 'Cooking',
  'Business', 'Health', 'Education', 'Volunteering'
];

const PRIVACY_OPTIONS = [
  { value: 'public', label: 'Public', description: 'Anyone can find and join this circle' },
  { value: 'private', label: 'Private', description: 'Only invited members can join' },
];

const CreateCircleScreen: React.FC<CreateCircleScreenProps> = ({ onBack, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CreateCircleForm>({
    name: '',
    description: '',
    category: '',
    bannerImage: '',
    privacy: 'public',
    location: {
      city: '',
      country: '',
    },
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { createCircle } = useAppStore();

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const updateLocationData = (field: 'city' | 'country', value: string) => {
    setFormData(prev => ({
      ...prev,
      location: { ...prev.location, [field]: value }
    }));
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.name.trim()) newErrors.name = 'Circle name is required';
      if (!formData.category) newErrors.category = 'Please select a category';
      if (!formData.description.trim()) newErrors.description = 'Description is required';
    }

    if (step === 2) {
      // Visuals step - optional fields
    }

    if (step === 3) {
      if (!formData.location.city.trim()) newErrors.city = 'City is required';
      if (!formData.location.country.trim()) newErrors.country = 'Country is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 3) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      onBack();
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    setIsLoading(true);
    try {
      const success = await createCircle(formData);
      if (success) {
        Alert.alert('Success', 'Circle created successfully!', [
          { text: 'OK', onPress: onComplete }
        ]);
      } else {
        Alert.alert('Error', 'Failed to create circle. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${(currentStep / 3) * 100}%` }]} />
      </View>
      <Text style={styles.progressText}>Step {currentStep} of 3</Text>
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Basic Information</Text>
      <Text style={styles.stepSubtitle}>Tell us about your circle</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Circle Name *</Text>
        <TextInput
          style={[styles.textInput, errors.name && styles.inputError]}
          value={formData.name}
          onChangeText={(text) => updateFormData('name', text)}
          placeholder="Enter circle name"
          maxLength={50}
        />
        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
        <Text style={styles.characterCount}>{formData.name.length}/50</Text>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Category *</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
          {CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryChip,
                formData.category === category && styles.selectedCategoryChip
              ]}
              onPress={() => updateFormData('category', category)}
            >
              <Text style={[
                styles.categoryText,
                formData.category === category && styles.selectedCategoryText
              ]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Description *</Text>
        <TextInput
          style={[styles.textArea, errors.description && styles.inputError]}
          value={formData.description}
          onChangeText={(text) => updateFormData('description', text)}
          placeholder="Describe what your circle is about..."
          multiline
          numberOfLines={4}
          maxLength={500}
        />
        {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
        <Text style={styles.characterCount}>{formData.description.length}/500</Text>
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Visuals & Branding</Text>
      <Text style={styles.stepSubtitle}>Make your circle stand out</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Banner Image</Text>
        <TouchableOpacity style={styles.imageUpload}>
          {formData.bannerImage ? (
            <Image source={{ uri: formData.bannerImage }} style={styles.uploadedImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.uploadIcon}>📷</Text>
              <Text style={styles.uploadText}>Tap to upload banner</Text>
              <Text style={styles.uploadSubtext}>Recommended: 800x400px</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Color Theme</Text>
        <View style={styles.colorPicker}>
          {['#4361EE', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'].map((color) => (
            <TouchableOpacity
              key={color}
              style={[styles.colorOption, { backgroundColor: color }]}
              onPress={() => updateFormData('themeColor', color)}
            >
              {formData.themeColor === color && (
                <Text style={styles.colorSelected}>✓</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Settings & Location</Text>
      <Text style={styles.stepSubtitle}>Configure your circle</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Privacy Setting</Text>
        {PRIVACY_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.privacyOption,
              formData.privacy === option.value && styles.selectedPrivacyOption
            ]}
            onPress={() => updateFormData('privacy', option.value)}
          >
            <View style={styles.privacyOptionContent}>
              <Text style={styles.privacyLabel}>{option.label}</Text>
              <Text style={styles.privacyDescription}>{option.description}</Text>
            </View>
            <View style={[
              styles.radioButton,
              formData.privacy === option.value && styles.selectedRadioButton
            ]} />
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.locationContainer}>
        <View style={styles.locationInput}>
          <Text style={styles.inputLabel}>City *</Text>
          <TextInput
            style={[styles.textInput, errors.city && styles.inputError]}
            value={formData.location.city}
            onChangeText={(text) => updateLocationData('city', text)}
            placeholder="Enter city"
          />
          {errors.city && <Text style={styles.errorText}>{errors.city}</Text>}
        </View>

        <View style={styles.locationInput}>
          <Text style={styles.inputLabel}>Country *</Text>
          <TextInput
            style={[styles.textInput, errors.country && styles.inputError]}
            value={formData.location.country}
            onChangeText={(text) => updateLocationData('country', text)}
            placeholder="Enter country"
          />
          {errors.country && <Text style={styles.errorText}>{errors.country}</Text>}
        </View>
      </View>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Circle</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Progress Bar */}
      {renderProgressBar()}

      {/* Content */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderCurrentStep()}
      </ScrollView>

      {/* Bottom Buttons */}
      <View style={styles.bottomButtons}>
        <TouchableOpacity
          style={[styles.nextButton, isLoading && styles.disabledButton]}
          onPress={handleNext}
          disabled={isLoading}
        >
          <Text style={styles.nextButtonText}>
            {isLoading ? 'Creating...' : currentStep === 3 ? 'Create Circle' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 20,
    color: '#111827',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  placeholder: {
    width: 40,
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4361EE',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  stepContainer: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
  },
  textArea: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    height: 100,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    marginTop: 4,
  },
  characterCount: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'right',
    marginTop: 4,
  },
  categoryScroll: {
    marginBottom: 8,
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
  imageUpload: {
    height: 200,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  uploadText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 4,
  },
  uploadSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  colorPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorSelected: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  privacyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    marginBottom: 12,
  },
  selectedPrivacyOption: {
    borderColor: '#4361EE',
    backgroundColor: '#EEF2FF',
  },
  privacyOptionContent: {
    flex: 1,
  },
  privacyLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  privacyDescription: {
    fontSize: 14,
    color: '#6B7280',
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
  locationContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  locationInput: {
    flex: 1,
  },
  bottomButtons: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  nextButton: {
    backgroundColor: '#4361EE',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});

export default CreateCircleScreen;
