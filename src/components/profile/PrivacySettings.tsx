import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { ProfileUpdateData } from '../../services/profile/profileService';

interface PrivacySettingsProps {
  privacy: ProfileUpdateData['privacy'];
  onPrivacyChange: (field: string, value: boolean) => void;
  onExportData: () => void;
  onDeleteAccount: () => void;
}

const PrivacySettings: React.FC<PrivacySettingsProps> = ({
  privacy,
  onPrivacyChange,
  onExportData,
  onDeleteAccount,
}) => {
  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: onDeleteAccount,
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Privacy Controls */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Privacy Controls</Text>
        <Text style={styles.sectionDescription}>
          Control who can see your information and how you appear to others
        </Text>

        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Text style={styles.settingLabel}>Private Profile</Text>
            <Text style={styles.settingDescription}>
              Only approved followers can see your profile and activities
            </Text>
          </View>
          <Switch
            value={privacy?.isPrivate || false}
            onValueChange={(value) => onPrivacyChange('isPrivate', value)}
            trackColor={{ false: '#D1D5DB', true: '#4361EE' }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Text style={styles.settingLabel}>Allow Direct Messages</Text>
            <Text style={styles.settingDescription}>
              Let other members send you direct messages
            </Text>
          </View>
          <Switch
            value={privacy?.allowMessages || false}
            onValueChange={(value) => onPrivacyChange('allowMessages', value)}
            trackColor={{ false: '#D1D5DB', true: '#4361EE' }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Text style={styles.settingLabel}>Show Location</Text>
            <Text style={styles.settingDescription}>
              Display your city and country on your profile
            </Text>
          </View>
          <Switch
            value={privacy?.showLocation || false}
            onValueChange={(value) => onPrivacyChange('showLocation', value)}
            trackColor={{ false: '#D1D5DB', true: '#4361EE' }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Text style={styles.settingLabel}>Show Interests</Text>
            <Text style={styles.settingDescription}>
              Display your interests publicly on your profile
            </Text>
          </View>
          <Switch
            value={privacy?.showInterests || false}
            onValueChange={(value) => onPrivacyChange('showInterests', value)}
            trackColor={{ false: '#D1D5DB', true: '#4361EE' }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Text style={styles.settingLabel}>Show Circle Memberships</Text>
            <Text style={styles.settingDescription}>
              Display which circles you&apos;ve joined on your profile
            </Text>
          </View>
          <Switch
            value={privacy?.showMemberships || false}
            onValueChange={(value) => onPrivacyChange('showMemberships', value)}
            trackColor={{ false: '#D1D5DB', true: '#4361EE' }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>

      {/* Data Management */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Management</Text>
        <Text style={styles.sectionDescription}>
          Manage your personal data and account settings
        </Text>

        <TouchableOpacity style={styles.actionButton} onPress={onExportData}>
          <View style={styles.actionContent}>
            <Text style={styles.actionLabel}>Export My Data</Text>
            <Text style={styles.actionDescription}>
              Download a copy of all your data (GDPR compliance)
            </Text>
          </View>
          <Text style={styles.actionIcon}>📥</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleDeleteAccount}>
          <View style={styles.actionContent}>
            <Text style={[styles.actionLabel, styles.dangerText]}>Delete Account</Text>
            <Text style={styles.actionDescription}>
              Permanently delete your account and all associated data
            </Text>
          </View>
          <Text style={styles.actionIcon}>🗑️</Text>
        </TouchableOpacity>
      </View>

      {/* Information */}
      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>Privacy Information</Text>
        <Text style={styles.infoText}>
          We take your privacy seriously. Your data is encrypted and stored securely. 
          You have full control over what information is shared and with whom. 
          For more details, please read our Privacy Policy.
        </Text>
        <TouchableOpacity style={styles.linkButton}>
          <Text style={styles.linkText}>Read Privacy Policy</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  section: {
    backgroundColor: 'white',
    marginBottom: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingContent: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  actionContent: {
    flex: 1,
    marginRight: 16,
  },
  actionLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  actionIcon: {
    fontSize: 20,
  },
  dangerText: {
    color: '#DC2626',
  },
  infoSection: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  linkButton: {
    alignSelf: 'flex-start',
  },
  linkText: {
    fontSize: 14,
    color: '#4361EE',
    fontWeight: '500',
  },
});

export default PrivacySettings;
