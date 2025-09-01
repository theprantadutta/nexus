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
  Switch,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAppStore } from '../../store/useAppStore';
import { CreateMeetupForm } from '../../types';

interface CreateMeetupScreenProps {
  circleId: string;
  onBack: () => void;
  onComplete: () => void;
}

const CreateMeetupScreen: React.FC<CreateMeetupScreenProps> = ({ circleId, onBack, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  
  const [formData, setFormData] = useState<CreateMeetupForm & { circleId: string }>({
    circleId,
    title: '',
    description: '',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Default to next week
    location: {
      name: '',
      address: '',
      coordinates: { latitude: 0, longitude: 0 },
    },
    maxAttendees: undefined,
    images: [],
    price: undefined,
    isOnline: false,
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { createMeetup } = useAppStore();

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const updateLocationData = (field: keyof typeof formData.location, value: any) => {
    setFormData(prev => ({
      ...prev,
      location: { ...prev.location, [field]: value }
    }));
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.title.trim()) newErrors.title = 'Event title is required';
      if (!formData.description.trim()) newErrors.description = 'Description is required';
      if (new Date(formData.date) <= new Date()) newErrors.date = 'Event date must be in the future';
    }

    if (step === 2) {
      if (!formData.isOnline) {
        if (!formData.location.name.trim()) newErrors.locationName = 'Location name is required';
        if (!formData.location.address.trim()) newErrors.locationAddress = 'Address is required';
      }
      if (formData.maxAttendees && formData.maxAttendees < 1) {
        newErrors.maxAttendees = 'Max attendees must be at least 1';
      }
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
      const success = await createMeetup(formData);
      if (success) {
        Alert.alert('Success', 'Meetup created successfully!', [
          { text: 'OK', onPress: onComplete }
        ]);
      } else {
        Alert.alert('Error', 'Failed to create meetup. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const currentDate = new Date(formData.date);
      const newDate = new Date(selectedDate);
      newDate.setHours(currentDate.getHours());
      newDate.setMinutes(currentDate.getMinutes());
      updateFormData('date', newDate.toISOString());
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const currentDate = new Date(formData.date);
      currentDate.setHours(selectedTime.getHours());
      currentDate.setMinutes(selectedTime.getMinutes());
      updateFormData('date', currentDate.toISOString());
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
      <Text style={styles.stepTitle}>Event Details</Text>
      <Text style={styles.stepSubtitle}>Tell us about your meetup</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Event Title *</Text>
        <TextInput
          style={[styles.textInput, errors.title && styles.inputError]}
          value={formData.title}
          onChangeText={(text) => updateFormData('title', text)}
          placeholder="Enter event title"
          maxLength={100}
        />
        {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
        <Text style={styles.characterCount}>{formData.title.length}/100</Text>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Description *</Text>
        <TextInput
          style={[styles.textArea, errors.description && styles.inputError]}
          value={formData.description}
          onChangeText={(text) => updateFormData('description', text)}
          placeholder="Describe your event..."
          multiline
          numberOfLines={4}
          maxLength={1000}
        />
        {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
        <Text style={styles.characterCount}>{formData.description.length}/1000</Text>
      </View>

      <View style={styles.dateTimeContainer}>
        <View style={styles.dateInput}>
          <Text style={styles.inputLabel}>Date *</Text>
          <TouchableOpacity
            style={[styles.dateButton, errors.date && styles.inputError]}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateButtonText}>
              {new Date(formData.date).toLocaleDateString()}
            </Text>
          </TouchableOpacity>
          {errors.date && <Text style={styles.errorText}>{errors.date}</Text>}
        </View>

        <View style={styles.timeInput}>
          <Text style={styles.inputLabel}>Time *</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowTimePicker(true)}
          >
            <Text style={styles.dateButtonText}>
              {new Date(formData.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={new Date(formData.date)}
          mode="date"
          display="default"
          onChange={handleDateChange}
          minimumDate={new Date()}
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={new Date(formData.date)}
          mode="time"
          display="default"
          onChange={handleTimeChange}
        />
      )}
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Location & Capacity</Text>
      <Text style={styles.stepSubtitle}>Where will your event take place?</Text>

      <View style={styles.inputContainer}>
        <View style={styles.switchContainer}>
          <Text style={styles.inputLabel}>Online Event</Text>
          <Switch
            value={formData.isOnline}
            onValueChange={(value) => updateFormData('isOnline', value)}
            trackColor={{ false: '#D1D5DB', true: '#4361EE' }}
            thumbColor={formData.isOnline ? '#FFFFFF' : '#FFFFFF'}
          />
        </View>
      </View>

      {!formData.isOnline && (
        <>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Venue Name *</Text>
            <TextInput
              style={[styles.textInput, errors.locationName && styles.inputError]}
              value={formData.location.name}
              onChangeText={(text) => updateLocationData('name', text)}
              placeholder="Enter venue name"
            />
            {errors.locationName && <Text style={styles.errorText}>{errors.locationName}</Text>}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Address *</Text>
            <TextInput
              style={[styles.textInput, errors.locationAddress && styles.inputError]}
              value={formData.location.address}
              onChangeText={(text) => updateLocationData('address', text)}
              placeholder="Enter full address"
              multiline
            />
            {errors.locationAddress && <Text style={styles.errorText}>{errors.locationAddress}</Text>}
          </View>
        </>
      )}

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Max Attendees (Optional)</Text>
        <TextInput
          style={[styles.textInput, errors.maxAttendees && styles.inputError]}
          value={formData.maxAttendees?.toString() || ''}
          onChangeText={(text) => updateFormData('maxAttendees', text ? parseInt(text) : undefined)}
          placeholder="Leave empty for unlimited"
          keyboardType="numeric"
        />
        {errors.maxAttendees && <Text style={styles.errorText}>{errors.maxAttendees}</Text>}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Price (Optional)</Text>
        <TextInput
          style={styles.textInput}
          value={formData.price?.toString() || ''}
          onChangeText={(text) => updateFormData('price', text ? parseFloat(text) : undefined)}
          placeholder="0 for free event"
          keyboardType="numeric"
        />
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Review & Publish</Text>
      <Text style={styles.stepSubtitle}>Review your event details</Text>

      <View style={styles.previewCard}>
        <Text style={styles.previewTitle}>{formData.title}</Text>
        <Text style={styles.previewDate}>
          {new Date(formData.date).toLocaleDateString()} at{' '}
          {new Date(formData.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
        <Text style={styles.previewLocation}>
          {formData.isOnline ? '💻 Online Event' : `📍 ${formData.location.name}`}
        </Text>
        <Text style={styles.previewDescription} numberOfLines={3}>
          {formData.description}
        </Text>
        
        <View style={styles.previewDetails}>
          <Text style={styles.previewDetailItem}>
            👥 {formData.maxAttendees ? `Max ${formData.maxAttendees} attendees` : 'Unlimited attendees'}
          </Text>
          <Text style={styles.previewDetailItem}>
            💰 {formData.price ? `$${formData.price}` : 'Free'}
          </Text>
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
        <Text style={styles.headerTitle}>Create Meetup</Text>
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
            {isLoading ? 'Creating...' : currentStep === 3 ? 'Create Meetup' : 'Next'}
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
  dateTimeContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  dateInput: {
    flex: 2,
  },
  timeInput: {
    flex: 1,
  },
  dateButton: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#111827',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  previewCard: {
    backgroundColor: '#F9FAFB',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  previewTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  previewDate: {
    fontSize: 16,
    color: '#4361EE',
    fontWeight: '600',
    marginBottom: 4,
  },
  previewLocation: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 12,
  },
  previewDescription: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    marginBottom: 16,
  },
  previewDetails: {
    gap: 8,
  },
  previewDetailItem: {
    fontSize: 14,
    color: '#6B7280',
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

export default CreateMeetupScreen;
