import { Alert } from 'react-native';

export interface NotificationData {
  title: string;
  body: string;
  data?: Record<string, any>;
}

export interface PushToken {
  token: string;
  platform: 'ios' | 'android' | 'web';
}

class NotificationService {
  private pushToken: string | null = null;
  private isInitialized = false;

  // Initialize notification service
  async initialize(): Promise<boolean> {
    try {
      // In a real implementation, this would:
      // 1. Request notification permissions
      // 2. Get push notification token
      // 3. Register with Firebase/Expo push service
      
      console.log('Notification service initialized');
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
      return false;
    }
  }

  // Request notification permissions
  async requestPermissions(): Promise<boolean> {
    try {
      // In a real implementation with expo-notifications:
      // const { status: existingStatus } = await Notifications.getPermissionsAsync();
      // let finalStatus = existingStatus;
      // 
      // if (existingStatus !== 'granted') {
      //   const { status } = await Notifications.requestPermissionsAsync();
      //   finalStatus = status;
      // }
      // 
      // return finalStatus === 'granted';

      // For now, simulate permission granted
      console.log('Notification permissions requested');
      return true;
    } catch (error) {
      console.error('Failed to request permissions:', error);
      return false;
    }
  }

  // Get push notification token
  async getPushToken(): Promise<string | null> {
    try {
      if (this.pushToken) {
        return this.pushToken;
      }

      // In a real implementation with expo-notifications:
      // const token = (await Notifications.getExpoPushTokenAsync()).data;
      // this.pushToken = token;
      // return token;

      // For now, generate a mock token
      const mockToken = `ExponentPushToken[${Math.random().toString(36).substring(2)}]`;
      this.pushToken = mockToken;
      console.log('Generated push token:', mockToken);
      return mockToken;
    } catch (error) {
      console.error('Failed to get push token:', error);
      return null;
    }
  }

  // Register push token with backend
  async registerPushToken(userId: string): Promise<boolean> {
    try {
      const token = await this.getPushToken();
      if (!token) {
        return false;
      }

      // In a real implementation, send token to your backend:
      // await api.post('/users/push-token', { userId, token });

      console.log('Push token registered for user:', userId);
      return true;
    } catch (error) {
      console.error('Failed to register push token:', error);
      return false;
    }
  }

  // Schedule local notification
  async scheduleLocalNotification(
    notification: NotificationData,
    trigger?: {
      seconds?: number;
      date?: Date;
      repeats?: boolean;
    }
  ): Promise<string | null> {
    try {
      // In a real implementation with expo-notifications:
      // const identifier = await Notifications.scheduleNotificationAsync({
      //   content: {
      //     title: notification.title,
      //     body: notification.body,
      //     data: notification.data,
      //   },
      //   trigger: trigger || null,
      // });
      // return identifier;

      // For now, show an alert as a fallback
      Alert.alert(notification.title, notification.body);
      console.log('Local notification scheduled:', notification);
      return `local-${Date.now()}`;
    } catch (error) {
      console.error('Failed to schedule local notification:', error);
      return null;
    }
  }

  // Send push notification (backend would typically handle this)
  async sendPushNotification(
    tokens: string[],
    notification: NotificationData
  ): Promise<boolean> {
    try {
      // In a real implementation, this would be handled by your backend:
      // await api.post('/notifications/send', { tokens, notification });

      console.log('Push notification sent to tokens:', tokens, notification);
      return true;
    } catch (error) {
      console.error('Failed to send push notification:', error);
      return false;
    }
  }

  // Handle notification received while app is running
  onNotificationReceived(callback: (notification: NotificationData) => void) {
    // In a real implementation with expo-notifications:
    // return Notifications.addNotificationReceivedListener(callback);

    console.log('Notification received listener registered');
    return { remove: () => console.log('Listener removed') };
  }

  // Handle notification tapped/opened
  onNotificationResponse(callback: (response: any) => void) {
    // In a real implementation with expo-notifications:
    // return Notifications.addNotificationResponseReceivedListener(callback);

    console.log('Notification response listener registered');
    return { remove: () => console.log('Response listener removed') };
  }

  // Cancel scheduled notification
  async cancelNotification(identifier: string): Promise<boolean> {
    try {
      // In a real implementation with expo-notifications:
      // await Notifications.cancelScheduledNotificationAsync(identifier);

      console.log('Notification cancelled:', identifier);
      return true;
    } catch (error) {
      console.error('Failed to cancel notification:', error);
      return false;
    }
  }

  // Cancel all scheduled notifications
  async cancelAllNotifications(): Promise<boolean> {
    try {
      // In a real implementation with expo-notifications:
      // await Notifications.cancelAllScheduledNotificationsAsync();

      console.log('All notifications cancelled');
      return true;
    } catch (error) {
      console.error('Failed to cancel all notifications:', error);
      return false;
    }
  }

  // Get notification settings
  getSettings() {
    return {
      isInitialized: this.isInitialized,
      hasPushToken: !!this.pushToken,
      pushToken: this.pushToken,
    };
  }

  // Helper method to create notification for different types
  createNotification(
    type: 'member_joined' | 'meetup_reminder' | 'new_message' | 'meetup_updated',
    data: Record<string, any>
  ): NotificationData {
    switch (type) {
      case 'member_joined':
        return {
          title: 'New Member Joined',
          body: `${data.userName} joined ${data.circleName}`,
          data: { type, circleId: data.circleId, userId: data.userId },
        };
      case 'meetup_reminder':
        return {
          title: 'Meetup Reminder',
          body: `${data.meetupTitle} starts in ${data.timeUntil}`,
          data: { type, meetupId: data.meetupId },
        };
      case 'new_message':
        return {
          title: 'New Message',
          body: `${data.senderName}: ${data.message}`,
          data: { type, chatId: data.chatId, senderId: data.senderId },
        };
      case 'meetup_updated':
        return {
          title: 'Meetup Updated',
          body: `${data.meetupTitle} has been updated`,
          data: { type, meetupId: data.meetupId },
        };
      default:
        return {
          title: 'Notification',
          body: 'You have a new notification',
          data: { type: 'general' },
        };
    }
  }
}

export const notificationService = new NotificationService();
export default notificationService;
