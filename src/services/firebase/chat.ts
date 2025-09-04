import {
  collection,
  doc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  onSnapshot,
  serverTimestamp,
  increment,
  arrayUnion,
  Timestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, collections } from './config';
import { ApiResponse } from '../../types';

export interface ChatMessage {
  $id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  text: string;
  type: 'text' | 'image' | 'file' | 'system';
  timestamp: string;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  imageUrl?: string;
  fileName?: string;
  fileSize?: number;
  readBy?: string[];
  editedAt?: string;
  replyTo?: string;
}

export interface Chat {
  $id: string;
  type: 'direct' | 'group' | 'circle';
  name?: string;
  participants: string[];
  circleId?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  lastMessage?: {
    text: string;
    timestamp: string;
    senderId: string;
    senderName: string;
  };
  unreadCount?: Record<string, number>;
  typingUsers?: string[];
  avatar?: string;
}

export interface TypingIndicator {
  chatId: string;
  userId: string;
  userName: string;
  timestamp: string;
}

class ChatService {
  private messageListeners: Map<string, () => void> = new Map();
  private typingListeners: Map<string, () => void> = new Map();

  // Real-time message synchronization
  subscribeToMessages(
    chatId: string,
    onMessagesUpdate: (messages: ChatMessage[]) => void,
    onError?: (error: Error) => void
  ): () => void {
    try {
      const messagesQuery = query(
        collection(db, collections.messages),
        where('chatId', '==', chatId),
        orderBy('timestamp', 'asc'),
        firestoreLimit(100)
      );

      const unsubscribe = onSnapshot(
        messagesQuery,
        (snapshot) => {
          const messages: ChatMessage[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            messages.push({
              $id: doc.id,
              chatId: data.chatId,
              senderId: data.senderId,
              senderName: data.senderName,
              senderAvatar: data.senderAvatar,
              text: data.text,
              type: data.type,
              timestamp: data.timestamp instanceof Timestamp 
                ? data.timestamp.toDate().toISOString()
                : data.timestamp,
              status: data.status,
              imageUrl: data.imageUrl,
              fileName: data.fileName,
              fileSize: data.fileSize,
              readBy: data.readBy || [],
              editedAt: data.editedAt,
              replyTo: data.replyTo,
            });
          });
          onMessagesUpdate(messages);
        },
        (error) => {
          console.error('Messages subscription error:', error);
          onError?.(error);
        }
      );

      this.messageListeners.set(chatId, unsubscribe);
      return unsubscribe;
    } catch (error) {
      console.error('Subscribe to messages error:', error);
      onError?.(error as Error);
      return () => {};
    }
  }

  // Send message with enhanced features
  async sendMessage(
    chatId: string,
    senderId: string,
    senderName: string,
    text: string,
    type: 'text' | 'image' | 'file' = 'text',
    options?: {
      imageFile?: File | Blob;
      fileName?: string;
      fileSize?: number;
      replyTo?: string;
      senderAvatar?: string;
    }
  ): Promise<ApiResponse<string>> {
    try {
      let imageUrl: string | undefined;
      
      // Handle image upload
      if (type === 'image' && options?.imageFile) {
        const imageUploadResult = await this.uploadImage(options.imageFile, chatId);
        if (!imageUploadResult.success) {
          return imageUploadResult;
        }
        imageUrl = imageUploadResult.data;
      }

      const messageData = {
        chatId,
        senderId,
        senderName,
        senderAvatar: options?.senderAvatar,
        text,
        type,
        timestamp: serverTimestamp(),
        status: 'sent',
        imageUrl,
        fileName: options?.fileName,
        fileSize: options?.fileSize,
        readBy: [senderId], // Sender has read their own message
        replyTo: options?.replyTo,
      };

      const messageRef = await addDoc(collection(db, collections.messages), messageData);

      // Update chat's last message and unread counts
      await this.updateChatLastMessage(chatId, {
        text: type === 'image' ? '📷 Image' : type === 'file' ? '📎 File' : text,
        timestamp: new Date().toISOString(),
        senderId,
        senderName,
      });

      // Clear typing indicator for sender
      await this.setTypingIndicator(chatId, senderId, false);

      return {
        success: true,
        data: messageRef.id,
      };
    } catch (error: any) {
      console.error('Send message error:', error);
      return {
        success: false,
        error: error.message || 'Failed to send message',
      };
    }
  }

  // Upload image to Firebase Storage
  private async uploadImage(imageFile: File | Blob, chatId: string): Promise<ApiResponse<string>> {
    try {
      const timestamp = Date.now();
      const fileName = `chat_${chatId}_${timestamp}.jpg`;
      const imageRef = ref(storage, `chat-images/${fileName}`);
      
      await uploadBytes(imageRef, imageFile);
      const downloadURL = await getDownloadURL(imageRef);
      
      return {
        success: true,
        data: downloadURL,
      };
    } catch (error: any) {
      console.error('Upload image error:', error);
      return {
        success: false,
        error: error.message || 'Failed to upload image',
      };
    }
  }

  // Typing indicators
  async setTypingIndicator(chatId: string, userId: string, isTyping: boolean, userName?: string): Promise<void> {
    try {
      const chatRef = doc(db, collections.chats, chatId);
      
      if (isTyping && userName) {
        await updateDoc(chatRef, {
          typingUsers: arrayUnion({
            userId,
            userName,
            timestamp: new Date().toISOString(),
          }),
        });
      } else {
        // Remove typing indicator
        const chatDoc = await import('firebase/firestore').then(({ getDoc }) => getDoc(chatRef));
        if (chatDoc.exists()) {
          const typingUsers = chatDoc.data().typingUsers || [];
          const updatedTypingUsers = typingUsers.filter((user: any) => user.userId !== userId);
          await updateDoc(chatRef, {
            typingUsers: updatedTypingUsers,
          });
        }
      }
    } catch (error) {
      console.error('Set typing indicator error:', error);
    }
  }

  // Subscribe to typing indicators
  subscribeToTypingIndicators(
    chatId: string,
    currentUserId: string,
    onTypingUpdate: (typingUsers: TypingIndicator[]) => void
  ): () => void {
    try {
      const chatRef = doc(db, collections.chats, chatId);
      
      const unsubscribe = onSnapshot(chatRef, (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          const typingUsers = (data.typingUsers || [])
            .filter((user: any) => user.userId !== currentUserId)
            .filter((user: any) => {
              // Remove stale typing indicators (older than 5 seconds)
              const typingTime = new Date(user.timestamp).getTime();
              const now = Date.now();
              return now - typingTime < 5000;
            });
          
          onTypingUpdate(typingUsers);
        }
      });

      this.typingListeners.set(chatId, unsubscribe);
      return unsubscribe;
    } catch (error) {
      console.error('Subscribe to typing indicators error:', error);
      return () => {};
    }
  }

  // Mark messages as read
  async markMessagesAsRead(chatId: string, userId: string, messageIds: string[]): Promise<ApiResponse<null>> {
    try {
      const batch = await import('firebase/firestore').then(({ writeBatch }) => writeBatch(db));
      
      messageIds.forEach((messageId) => {
        const messageRef = doc(db, collections.messages, messageId);
        batch.update(messageRef, {
          readBy: arrayUnion(userId),
          status: 'read',
        });
      });

      await batch.commit();

      // Reset unread count for this user in the chat
      const chatRef = doc(db, collections.chats, chatId);
      await updateDoc(chatRef, {
        [`unreadCount.${userId}`]: 0,
      });

      return {
        success: true,
      };
    } catch (error: any) {
      console.error('Mark messages as read error:', error);
      return {
        success: false,
        error: error.message || 'Failed to mark messages as read',
      };
    }
  }

  // Update chat last message
  private async updateChatLastMessage(chatId: string, lastMessage: Chat['lastMessage']): Promise<void> {
    try {
      const chatRef = doc(db, collections.chats, chatId);
      await updateDoc(chatRef, {
        lastMessage,
        updatedAt: serverTimestamp(),
      });

      // Increment unread count for all participants except sender
      const chatDoc = await import('firebase/firestore').then(({ getDoc }) => getDoc(chatRef));
      if (chatDoc.exists()) {
        const participants = chatDoc.data().participants || [];
        const updates: Record<string, any> = {};
        
        participants.forEach((participantId: string) => {
          if (participantId !== lastMessage?.senderId) {
            updates[`unreadCount.${participantId}`] = increment(1);
          }
        });

        if (Object.keys(updates).length > 0) {
          await updateDoc(chatRef, updates);
        }
      }
    } catch (error) {
      console.error('Update chat last message error:', error);
    }
  }

  // Get chat by ID
  async getChatById(chatId: string): Promise<ApiResponse<Chat>> {
    try {
      const chatDoc = await import('firebase/firestore').then(({ getDoc }) => 
        getDoc(doc(db, collections.chats, chatId))
      );
      
      if (!chatDoc.exists()) {
        return {
          success: false,
          error: 'Chat not found',
        };
      }

      const data = chatDoc.data();
      return {
        success: true,
        data: {
          $id: chatDoc.id,
          type: data.type,
          name: data.name,
          participants: data.participants,
          circleId: data.circleId,
          createdBy: data.createdBy,
          createdAt: data.createdAt instanceof Timestamp 
            ? data.createdAt.toDate().toISOString()
            : data.createdAt,
          updatedAt: data.updatedAt instanceof Timestamp 
            ? data.updatedAt.toDate().toISOString()
            : data.updatedAt,
          lastMessage: data.lastMessage,
          unreadCount: data.unreadCount || {},
          typingUsers: data.typingUsers || [],
          avatar: data.avatar,
        },
      };
    } catch (error: any) {
      console.error('Get chat by ID error:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch chat',
      };
    }
  }

  // Create circle chat
  async createCircleChat(circleId: string, circleName: string, participants: string[]): Promise<ApiResponse<string>> {
    try {
      const chatData = {
        type: 'circle',
        name: `${circleName} Chat`,
        participants,
        circleId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastMessage: null,
        unreadCount: {},
        typingUsers: [],
      };

      const chatRef = await addDoc(collection(db, collections.chats), chatData);

      return {
        success: true,
        data: chatRef.id,
      };
    } catch (error: any) {
      console.error('Create circle chat error:', error);
      return {
        success: false,
        error: error.message || 'Failed to create circle chat',
      };
    }
  }

  // Edit message
  async editMessage(messageId: string, newText: string): Promise<ApiResponse<null>> {
    try {
      const messageRef = doc(db, collections.messages, messageId);
      await updateDoc(messageRef, {
        text: newText,
        editedAt: serverTimestamp(),
      });

      return {
        success: true,
      };
    } catch (error: any) {
      console.error('Edit message error:', error);
      return {
        success: false,
        error: error.message || 'Failed to edit message',
      };
    }
  }

  // Delete message
  async deleteMessage(messageId: string): Promise<ApiResponse<null>> {
    try {
      const messageRef = doc(db, collections.messages, messageId);
      await updateDoc(messageRef, {
        text: 'This message was deleted',
        type: 'system',
        editedAt: serverTimestamp(),
      });

      return {
        success: true,
      };
    } catch (error: any) {
      console.error('Delete message error:', error);
      return {
        success: false,
        error: error.message || 'Failed to delete message',
      };
    }
  }

  // Clean up listeners
  unsubscribeFromMessages(chatId: string): void {
    const unsubscribe = this.messageListeners.get(chatId);
    if (unsubscribe) {
      unsubscribe();
      this.messageListeners.delete(chatId);
    }
  }

  unsubscribeFromTyping(chatId: string): void {
    const unsubscribe = this.typingListeners.get(chatId);
    if (unsubscribe) {
      unsubscribe();
      this.typingListeners.delete(chatId);
    }
  }

  // Clean up all listeners
  cleanup(): void {
    this.messageListeners.forEach((unsubscribe) => unsubscribe());
    this.typingListeners.forEach((unsubscribe) => unsubscribe());
    this.messageListeners.clear();
    this.typingListeners.clear();
  }
}

export const chatService = new ChatService();
