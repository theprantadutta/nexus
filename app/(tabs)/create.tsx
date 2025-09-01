import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Alert,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { useTokens } from '@/constants/theme/tokens';
import GradientButton from '@/components/common/GradientButton';
import Chip from '@/components/common/Chip';

type CreateType = 'circle' | 'meetup' | null;

const CATEGORIES = [
  'Technology', 'Sports', 'Arts', 'Gaming', 'Fitness', 'Food',
  'Music', 'Travel', 'Books', 'Photography', 'Dancing', 'Cooking',
  'Business', 'Health', 'Education', 'Volunteering'
];

export default function CreateScreen() {
  const [createType, setCreateType] = useState<CreateType>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    bannerImage: null as string | null,
    location: '',
    isPrivate: false,
    maxMembers: 50,
    rules: '',
    // Meetup specific
    date: new Date(),
    time: '',
    duration: 2,
    maxAttendees: 20,
    price: 0,
    isOnline: false,
  });

  const tokens = useTokens();
  const progressValue = useSharedValue(0);
  const stepOpacity = useSharedValue(1);

  useEffect(() => {
    const progress = createType ? (currentStep / (createType === 'circle' ? 3 : 4)) : 0;
    progressValue.value = withTiming(progress, { duration: 300 });
  }, [currentStep, createType, progressValue]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressValue.value * 100}%`,
  }));

  const stepAnimatedStyle = useAnimatedStyle(() => ({
    opacity: stepOpacity.value,
    transform: [
      {
        translateX: interpolate(stepOpacity.value, [0, 1], [50, 0]),
      },
    ],
  }));

  const handleCreateTypeSelect = (type: CreateType) => {
    setCreateType(type);
    setCurrentStep(1);
    stepOpacity.value = withTiming(0, { duration: 150 }, () => {
      stepOpacity.value = withTiming(1, { duration: 150 });
    });
  };

  const handleNext = () => {
    const maxSteps = createType === 'circle' ? 3 : 4;
    if (currentStep < maxSteps) {
      stepOpacity.value = withTiming(0, { duration: 150 }, () => {
        setCurrentStep(prev => prev + 1);
        stepOpacity.value = withTiming(1, { duration: 150 });
      });
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      stepOpacity.value = withTiming(0, { duration: 150 }, () => {
        setCurrentStep(prev => prev - 1);
        stepOpacity.value = withTiming(1, { duration: 150 });
      });
    } else {
      setCreateType(null);
    }
  };

  const handleSubmit = () => {
    Alert.alert(
      'Success!',
      `Your ${createType} has been created successfully!`,
      [
        {
          text: 'OK',
          onPress: () => {
            setCreateType(null);
            setCurrentStep(1);
            setFormData({
              name: '',
              description: '',
              category: '',
              bannerImage: null,
              location: '',
              isPrivate: false,
              maxMembers: 50,
              rules: '',
              date: new Date(),
              time: '',
              duration: 2,
              maxAttendees: 20,
              price: 0,
              isOnline: false,
            });
          },
        },
      ]
    );
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      setFormData(prev => ({ ...prev, bannerImage: result.assets[0].uri }));
    }
  };

  const renderTypeSelection = () => (
    <Animated.View style={[styles.stepContainer, stepAnimatedStyle]}>
      <Text style={[styles.stepTitle, { color: tokens.colors.text }]}>
        What would you like to create?
      </Text>
      <Text style={[styles.stepSubtitle, { color: tokens.colors.textMuted }]}>
        Choose the type of content you want to create
      </Text>

      <View style={styles.typeOptions}>
        <TouchableOpacity
          style={[styles.typeCard, { borderColor: tokens.colors.border }]}
          onPress={() => handleCreateTypeSelect('circle')}
        >
          <LinearGradient
            colors={tokens.gradients.brandPrimary}
            style={styles.typeIcon}
          >
            <Text style={styles.typeIconText}>⭕</Text>
          </LinearGradient>
          <Text style={[styles.typeTitle, { color: tokens.colors.text }]}>Create Circle</Text>
          <Text style={[styles.typeDescription, { color: tokens.colors.textMuted }]}>
            Start a community around shared interests
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.typeCard, { borderColor: tokens.colors.border }]}
          onPress={() => handleCreateTypeSelect('meetup')}
        >
          <LinearGradient
            colors={tokens.gradients.brandSecondary}
            style={styles.typeIcon}
          >
            <Text style={styles.typeIconText}>📅</Text>
          </LinearGradient>
          <Text style={[styles.typeTitle, { color: tokens.colors.text }]}>Create Meetup</Text>
          <Text style={[styles.typeDescription, { color: tokens.colors.textMuted }]}>
            Organize an event for your community
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  const renderBasicInfoStep = () => (
    <Animated.View style={[styles.stepContainer, stepAnimatedStyle]}>
      <Text style={[styles.stepTitle, { color: tokens.colors.text }]}>
        Basic Information
      </Text>
      <Text style={[styles.stepSubtitle, { color: tokens.colors.textMuted }]}>
        Tell us about your {createType}
      </Text>

      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: tokens.colors.text }]}>
          {createType === 'circle' ? 'Circle Name' : 'Event Title'} *
        </Text>
        <TextInput
          style={[styles.input, { borderColor: tokens.colors.border, color: tokens.colors.text }]}
          placeholder={createType === 'circle' ? 'Enter circle name' : 'Enter event title'}
          value={formData.name}
          onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
          placeholderTextColor={tokens.colors.textMuted}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: tokens.colors.text }]}>Category *</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
          <View style={styles.categoryContainer}>
            {CATEGORIES.map((category) => (
              <Chip
                key={category}
                label={category}
                selected={formData.category === category}
                onPress={() => setFormData(prev => ({ ...prev, category }))}
                style={{ marginRight: 8 }}
              />
            ))}
          </View>
        </ScrollView>
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: tokens.colors.text }]}>Description *</Text>
        <TextInput
          style={[styles.textArea, { borderColor: tokens.colors.border, color: tokens.colors.text }]}
          placeholder={`Describe your ${createType}...`}
          value={formData.description}
          onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
          placeholderTextColor={tokens.colors.textMuted}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>
    </Animated.View>
  );

  const renderVisualsStep = () => (
    <Animated.View style={[styles.stepContainer, stepAnimatedStyle]}>
      <Text style={[styles.stepTitle, { color: tokens.colors.text }]}>
        Visuals & Media
      </Text>
      <Text style={[styles.stepSubtitle, { color: tokens.colors.textMuted }]}>
        Add images to make your {createType} stand out
      </Text>

      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: tokens.colors.text }]}>Banner Image</Text>
        <TouchableOpacity
          style={[styles.imageUpload, { borderColor: tokens.colors.border }]}
          onPress={pickImage}
        >
          {formData.bannerImage ? (
            <Image source={{ uri: formData.bannerImage }} style={styles.uploadedImage} />
          ) : (
            <View style={styles.uploadPlaceholder}>
              <Text style={styles.uploadIcon}>📷</Text>
              <Text style={[styles.uploadText, { color: tokens.colors.textMuted }]}>
                Tap to upload image
              </Text>
              <Text style={[styles.uploadHint, { color: tokens.colors.textMuted }]}>
                Recommended: 16:9 aspect ratio
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: tokens.colors.text }]}>Location *</Text>
        <TextInput
          style={[styles.input, { borderColor: tokens.colors.border, color: tokens.colors.text }]}
          placeholder="Enter location"
          value={formData.location}
          onChangeText={(text) => setFormData(prev => ({ ...prev, location: text }))}
          placeholderTextColor={tokens.colors.textMuted}
        />
      </View>
    </Animated.View>
  );

  const renderSettingsStep = () => (
    <Animated.View style={[styles.stepContainer, stepAnimatedStyle]}>
      <Text style={[styles.stepTitle, { color: tokens.colors.text }]}>
        Settings & Rules
      </Text>
      <Text style={[styles.stepSubtitle, { color: tokens.colors.textMuted }]}>
        Configure your {createType} settings
      </Text>

      <View style={styles.formGroup}>
        <View style={styles.switchRow}>
          <View style={styles.switchInfo}>
            <Text style={[styles.label, { color: tokens.colors.text }]}>
              {createType === 'circle' ? 'Private Circle' : 'Private Event'}
            </Text>
            <Text style={[styles.switchDescription, { color: tokens.colors.textMuted }]}>
              {createType === 'circle'
                ? 'Only invited members can join'
                : 'Only invited people can attend'
              }
            </Text>
          </View>
          <TouchableOpacity
            style={[
              styles.switch,
              { backgroundColor: formData.isPrivate ? tokens.colors.primary : tokens.colors.border }
            ]}
            onPress={() => setFormData(prev => ({ ...prev, isPrivate: !prev.isPrivate }))}
          >
            <Animated.View
              style={[
                styles.switchThumb,
                {
                  transform: [{ translateX: formData.isPrivate ? 20 : 2 }],
                }
              ]}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: tokens.colors.text }]}>
          {createType === 'circle' ? 'Maximum Members' : 'Maximum Attendees'}
        </Text>
        <TextInput
          style={[styles.input, { borderColor: tokens.colors.border, color: tokens.colors.text }]}
          placeholder="50"
          value={String(createType === 'circle' ? formData.maxMembers : formData.maxAttendees)}
          onChangeText={(text) => {
            const value = parseInt(text) || 0;
            if (createType === 'circle') {
              setFormData(prev => ({ ...prev, maxMembers: value }));
            } else {
              setFormData(prev => ({ ...prev, maxAttendees: value }));
            }
          }}
          keyboardType="numeric"
          placeholderTextColor={tokens.colors.textMuted}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: tokens.colors.text }]}>
          {createType === 'circle' ? 'Community Rules' : 'Event Guidelines'}
        </Text>
        <TextInput
          style={[styles.textArea, { borderColor: tokens.colors.border, color: tokens.colors.text }]}
          placeholder={`Add ${createType === 'circle' ? 'rules' : 'guidelines'} for participants...`}
          value={formData.rules}
          onChangeText={(text) => setFormData(prev => ({ ...prev, rules: text }))}
          placeholderTextColor={tokens.colors.textMuted}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>
    </Animated.View>
  );

  const renderCurrentStep = () => {
    if (!createType) return renderTypeSelection();

    switch (currentStep) {
      case 1:
        return renderBasicInfoStep();
      case 2:
        return renderVisualsStep();
      case 3:
        return renderSettingsStep();
      default:
        return renderTypeSelection();
    }
  };

  const isStepValid = () => {
    if (!createType) return false;

    switch (currentStep) {
      case 1:
        return formData.name.trim() && formData.category && formData.description.trim();
      case 2:
        return formData.location.trim();
      case 3:
        return true;
      default:
        return false;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: tokens.colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: tokens.colors.surface }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: tokens.colors.text }]}>
          {!createType ? 'Create' : `Create ${createType === 'circle' ? 'Circle' : 'Meetup'}`}
        </Text>
        <View style={styles.placeholder} />
      </View>

      {/* Progress Bar */}
      {createType && (
        <View style={[styles.progressContainer, { backgroundColor: tokens.colors.surface }]}>
          <View style={[styles.progressTrack, { backgroundColor: tokens.colors.surfaceAlt }]}>
            <Animated.View style={[styles.progressBar, progressStyle]}>
              <LinearGradient
                colors={tokens.gradients.brandPrimary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.progressGradient}
              />
            </Animated.View>
          </View>
          <Text style={[styles.progressText, { color: tokens.colors.textMuted }]}>
            Step {currentStep} of {createType === 'circle' ? 3 : 4}
          </Text>
        </View>
      )}

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderCurrentStep()}
      </ScrollView>

      {/* Bottom Actions */}
      {createType && (
        <View style={[styles.bottomActions, { backgroundColor: tokens.colors.surface }]}>
          <TouchableOpacity onPress={handleBack} style={styles.secondaryButton}>
            <Text style={[styles.secondaryButtonText, { color: tokens.colors.textMuted }]}>
              Back
            </Text>
          </TouchableOpacity>
          <GradientButton
            title={currentStep === (createType === 'circle' ? 3 : 4) ? 'Create' : 'Next'}
            onPress={handleNext}
            disabled={!isStepValid()}
            style={{ flex: 1, marginLeft: 12 }}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    fontSize: 18,
    color: '#374151',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressGradient: {
    flex: 1,
  },
  progressText: {
    fontSize: 12,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  stepContainer: {
    padding: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    marginBottom: 32,
  },
  typeOptions: {
    gap: 16,
  },
  typeCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  typeIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  typeIconText: {
    fontSize: 32,
  },
  typeTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  typeDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: 'white',
    minHeight: 100,
  },
  categoryScroll: {
    marginTop: 8,
  },
  categoryContainer: {
    flexDirection: 'row',
    paddingRight: 20,
  },
  imageUpload: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 12,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  uploadPlaceholder: {
    alignItems: 'center',
  },
  uploadIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  uploadText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  uploadHint: {
    fontSize: 12,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchInfo: {
    flex: 1,
    marginRight: 16,
  },
  switchDescription: {
    fontSize: 14,
    marginTop: 4,
  },
  switch: {
    width: 44,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  switchThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'white',
  },
  bottomActions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  secondaryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
