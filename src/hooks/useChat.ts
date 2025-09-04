import { useState, useEffect, useRef, useCallback } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { chatService, ChatMessage, TypingIndicator } from '../services/firebase/chat';

interface UseChatProps {
  chatId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
}

export const useChat = ({ chatId, userId, userName, userAvatar }: UseChatProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingIndicator[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!chatId || !userId) return;

    const unsubscribeMessages = chatService.subscribeToMessages(
      chatId,
      setMessages,
      (error) => {
        console.error('Message subscription error:', error);
        Alert.alert('Error', 'Failed to load messages');
      }
    );

    const unsubscribeTyping = chatService.subscribeToTypingIndicators(
      chatId,
      userId,
      setTypingUsers
    );

    return () => {
      unsubscribeMessages();
      unsubscribeTyping();
      // Clear typing indicator on unmount
      chatService.setTypingIndicator(chatId, userId, false);
      // Clear typing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [chatId, userId]);

  // Send text message
  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return false;

    setIsLoading(true);
    try {
      const result = await chatService.sendMessage(
        chatId,
        userId,
        userName,
        text.trim(),
        'text',
        { senderAvatar: userAvatar }
      );

      if (!result.success) {
        Alert.alert('Error', result.error || 'Failed to send message');
        return false;
      }
      return true;
    } catch (error) {
      console.error('Send message error:', error);
      Alert.alert('Error', 'Failed to send message');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [chatId, userId, userName, userAvatar, isLoading]);

  // Send image message
  const sendImage = useCallback(async (imageUri: string) => {
    if (isLoading) return false;

    setIsLoading(true);
    try {
      // Convert image to blob for upload
      const response = await fetch(imageUri);
      const blob = await response.blob();
      
      const result = await chatService.sendMessage(
        chatId,
        userId,
        userName,
        '📷 Image',
        'image',
        {
          imageFile: blob,
          senderAvatar: userAvatar,
        }
      );

      if (!result.success) {
        Alert.alert('Error', result.error || 'Failed to send image');
        return false;
      }
      return true;
    } catch (error) {
      console.error('Send image error:', error);
      Alert.alert('Error', 'Failed to send image');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [chatId, userId, userName, userAvatar, isLoading]);

  // Handle typing indicators
  const handleTyping = useCallback((text: string) => {
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set typing indicator
    if (text.trim()) {
      chatService.setTypingIndicator(chatId, userId, true, userName);
      
      // Clear typing indicator after 3 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        chatService.setTypingIndicator(chatId, userId, false);
      }, 3000);
    } else {
      chatService.setTypingIndicator(chatId, userId, false);
    }
  }, [chatId, userId, userName]);

  // Pick image from camera or gallery
  const pickImage = useCallback(async (source: 'camera' | 'gallery') => {
    try {
      let result;
      
      if (source === 'camera') {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          Alert.alert('Permission needed', 'Camera permission is required to take photos');
          return null;
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });
      } else {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
          Alert.alert('Permission needed', 'Gallery permission is required to select photos');
          return null;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });
      }

      if (!result.canceled && result.assets[0]) {
        return result.assets[0].uri;
      }
      return null;
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to process image');
      return null;
    }
  }, []);

  // Mark messages as read
  const markAsRead = useCallback(async (messageIds: string[]) => {
    try {
      await chatService.markMessagesAsRead(chatId, userId, messageIds);
    } catch (error) {
      console.error('Mark as read error:', error);
    }
  }, [chatId, userId]);

  return {
    messages,
    typingUsers,
    isLoading,
    sendMessage,
    sendImage,
    handleTyping,
    pickImage,
    markAsRead,
  };
};
