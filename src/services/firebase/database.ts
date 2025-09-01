import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  startAfter,
  increment
} from 'firebase/firestore';
import { db, collections } from './config';
import { Circle, Meetup, Membership, User, ApiResponse, CreateCircleForm, CreateMeetupForm } from '../../types';

class DatabaseService {
  // Circle operations
  async getCircles(limitCount: number = 20, lastDoc?: any): Promise<ApiResponse<Circle[]>> {
    try {
      let q = query(
        collection(db, collections.circles),
        orderBy('createdAt', 'desc'),
        firestoreLimit(limitCount)
      );

      if (lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const querySnapshot = await getDocs(q);

      const circles = querySnapshot.docs.map(doc => ({
        $id: doc.id,
        name: doc.data().name,
        description: doc.data().description,
        bannerImage: doc.data().bannerImage,
        category: doc.data().category,
        memberCount: doc.data().memberCount,
        createdBy: doc.data().createdBy,
        location: doc.data().location,
        privacy: doc.data().privacy,
        createdAt: doc.data().createdAt,
      }));

      return {
        success: true,
        data: circles,
      };
    } catch (error: any) {
      console.error('Get circles error:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch circles',
      };
    }
  }

  async getCircleById(circleId: string): Promise<ApiResponse<Circle>> {
    try {
      const docRef = doc(db, collections.circles, circleId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return {
          success: false,
          error: 'Circle not found',
        };
      }

      const data = docSnap.data();
      return {
        success: true,
        data: {
          $id: docSnap.id,
          name: data.name,
          description: data.description,
          bannerImage: data.bannerImage,
          category: data.category,
          memberCount: data.memberCount,
          createdBy: data.createdBy,
          location: data.location,
          privacy: data.privacy,
          createdAt: data.createdAt,
        },
      };
    } catch (error: any) {
      console.error('Get circle error:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch circle',
      };
    }
  }

  async createCircle(userId: string, circleData: CreateCircleForm): Promise<ApiResponse<Circle>> {
    try {
      const docData = {
        ...circleData,
        createdBy: userId,
        memberCount: 1,
        createdAt: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, collections.circles), docData);

      // Create membership for the creator
      await this.createMembership(userId, docRef.id, 'admin');

      return {
        success: true,
        data: {
          $id: docRef.id,
          name: docData.name,
          description: docData.description,
          bannerImage: docData.bannerImage,
          category: docData.category,
          memberCount: docData.memberCount,
          createdBy: docData.createdBy,
          location: docData.location,
          privacy: docData.privacy,
          createdAt: docData.createdAt,
        },
      };
    } catch (error: any) {
      console.error('Create circle error:', error);
      return {
        success: false,
        error: error.message || 'Failed to create circle',
      };
    }
  }

  // Meetup operations
  async getMeetups(circleId?: string, limitCount: number = 20): Promise<ApiResponse<Meetup[]>> {
    try {
      let q = query(
        collection(db, collections.meetups),
        orderBy('date', 'asc'),
        firestoreLimit(limitCount)
      );

      if (circleId) {
        q = query(
          collection(db, collections.meetups),
          where('circleId', '==', circleId),
          orderBy('date', 'asc'),
          firestoreLimit(limitCount)
        );
      }

      const querySnapshot = await getDocs(q);

      const meetups = querySnapshot.docs.map(doc => ({
        $id: doc.id,
        circleId: doc.data().circleId,
        title: doc.data().title,
        description: doc.data().description,
        date: doc.data().date,
        location: doc.data().location,
        maxAttendees: doc.data().maxAttendees,
        currentAttendees: doc.data().currentAttendees,
        images: doc.data().images,
        createdBy: doc.data().createdBy,
        createdAt: doc.data().createdAt,
        price: doc.data().price,
        isOnline: doc.data().isOnline,
      }));

      return {
        success: true,
        data: meetups,
      };
    } catch (error: any) {
      console.error('Get meetups error:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch meetups',
      };
    }
  }

  async createMeetup(userId: string, meetupData: CreateMeetupForm & { circleId: string }): Promise<ApiResponse<Meetup>> {
    try {
      const docData = {
        ...meetupData,
        createdBy: userId,
        currentAttendees: 0,
        createdAt: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, collections.meetups), docData);

      return {
        success: true,
        data: {
          $id: docRef.id,
          circleId: docData.circleId,
          title: docData.title,
          description: docData.description,
          date: docData.date,
          location: docData.location,
          maxAttendees: docData.maxAttendees,
          currentAttendees: docData.currentAttendees,
          images: docData.images,
          createdBy: docData.createdBy,
          createdAt: docData.createdAt,
          price: docData.price,
          isOnline: docData.isOnline,
        },
      };
    } catch (error: any) {
      console.error('Create meetup error:', error);
      return {
        success: false,
        error: error.message || 'Failed to create meetup',
      };
    }
  }

  // Membership operations
  async createMembership(userId: string, circleId: string, role: 'admin' | 'moderator' | 'member' = 'member'): Promise<ApiResponse<Membership>> {
    try {
      const membershipData = {
        userId,
        circleId,
        role,
        joinedAt: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, collections.memberships), membershipData);

      // Update circle member count
      const circleRef = doc(db, collections.circles, circleId);
      await updateDoc(circleRef, {
        memberCount: increment(1),
      });

      return {
        success: true,
        data: {
          $id: docRef.id,
          userId: membershipData.userId,
          circleId: membershipData.circleId,
          role: membershipData.role,
          joinedAt: membershipData.joinedAt,
        },
      };
    } catch (error: any) {
      console.error('Create membership error:', error);
      return {
        success: false,
        error: error.message || 'Failed to join circle',
      };
    }
  }

  async getUserMemberships(userId: string): Promise<ApiResponse<Membership[]>> {
    try {
      const q = query(
        collection(db, collections.memberships),
        where('userId', '==', userId)
      );

      const querySnapshot = await getDocs(q);

      const memberships = querySnapshot.docs.map(doc => ({
        $id: doc.id,
        userId: doc.data().userId,
        circleId: doc.data().circleId,
        role: doc.data().role,
        joinedAt: doc.data().joinedAt,
      }));

      return {
        success: true,
        data: memberships,
      };
    } catch (error: any) {
      console.error('Get user memberships error:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch memberships',
      };
    }
  }

  // Leave circle
  async leaveMembership(userId: string, circleId: string): Promise<ApiResponse<null>> {
    try {
      // Find the membership document
      const q = query(
        collection(db, collections.memberships),
        where('userId', '==', userId),
        where('circleId', '==', circleId)
      );

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return {
          success: false,
          error: 'Membership not found',
        };
      }

      // Delete the membership
      const membershipDoc = querySnapshot.docs[0];
      await deleteDoc(membershipDoc.ref);

      // Update circle member count
      const circleRef = doc(db, collections.circles, circleId);
      await updateDoc(circleRef, {
        memberCount: increment(-1),
      });

      return {
        success: true,
      };
    } catch (error: any) {
      console.error('Leave membership error:', error);
      return {
        success: false,
        error: error.message || 'Failed to leave circle',
      };
    }
  }

  // Get circle members
  async getCircleMembers(circleId: string): Promise<ApiResponse<User[]>> {
    try {
      // Get memberships for this circle
      const membershipQuery = query(
        collection(db, collections.memberships),
        where('circleId', '==', circleId)
      );

      const membershipSnapshot = await getDocs(membershipQuery);
      const userIds = membershipSnapshot.docs.map(doc => doc.data().userId);

      if (userIds.length === 0) {
        return {
          success: true,
          data: [],
        };
      }

      // Get user details for each member
      const users: User[] = [];
      for (const userId of userIds) {
        const userDoc = await getDoc(doc(db, collections.users, userId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          users.push({
            $id: userId,
            name: userData.name,
            email: userData.email,
            avatar: userData.avatar,
            bio: userData.bio,
            interests: userData.interests,
            joinedAt: userData.joinedAt,
            location: userData.location,
          });
        }
      }

      return {
        success: true,
        data: users,
      };
    } catch (error: any) {
      console.error('Get circle members error:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch circle members',
      };
    }
  }

  // Check if user is member of circle
  async checkMembership(userId: string, circleId: string): Promise<ApiResponse<Membership | null>> {
    try {
      const q = query(
        collection(db, collections.memberships),
        where('userId', '==', userId),
        where('circleId', '==', circleId)
      );

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return {
          success: true,
          data: null,
        };
      }

      const membershipDoc = querySnapshot.docs[0];
      const membershipData = membershipDoc.data();

      return {
        success: true,
        data: {
          $id: membershipDoc.id,
          userId: membershipData.userId,
          circleId: membershipData.circleId,
          role: membershipData.role,
          joinedAt: membershipData.joinedAt,
        },
      };
    } catch (error: any) {
      console.error('Check membership error:', error);
      return {
        success: false,
        error: error.message || 'Failed to check membership',
      };
    }
  }

  // Register for meetup
  async registerForMeetup(userId: string, meetupId: string): Promise<ApiResponse<null>> {
    try {
      // Check if already registered
      const existingQuery = query(
        collection(db, collections.attendances),
        where('userId', '==', userId),
        where('meetupId', '==', meetupId)
      );

      const existingSnapshot = await getDocs(existingQuery);

      if (!existingSnapshot.empty) {
        return {
          success: false,
          error: 'Already registered for this meetup',
        };
      }

      // Create attendance record
      await addDoc(collection(db, collections.attendances), {
        userId,
        meetupId,
        status: 'registered',
        registeredAt: new Date().toISOString(),
      });

      // Update meetup attendee count
      const meetupRef = doc(db, collections.meetups, meetupId);
      await updateDoc(meetupRef, {
        currentAttendees: increment(1),
      });

      return {
        success: true,
      };
    } catch (error: any) {
      console.error('Register for meetup error:', error);
      return {
        success: false,
        error: error.message || 'Failed to register for meetup',
      };
    }
  }

  // Unregister from meetup
  async unregisterFromMeetup(userId: string, meetupId: string): Promise<ApiResponse<null>> {
    try {
      // Find the attendance record
      const q = query(
        collection(db, collections.attendances),
        where('userId', '==', userId),
        where('meetupId', '==', meetupId)
      );

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return {
          success: false,
          error: 'Not registered for this meetup',
        };
      }

      // Delete the attendance record
      const attendanceDoc = querySnapshot.docs[0];
      await deleteDoc(attendanceDoc.ref);

      // Update meetup attendee count
      const meetupRef = doc(db, collections.meetups, meetupId);
      await updateDoc(meetupRef, {
        currentAttendees: increment(-1),
      });

      return {
        success: true,
      };
    } catch (error: any) {
      console.error('Unregister from meetup error:', error);
      return {
        success: false,
        error: error.message || 'Failed to unregister from meetup',
      };
    }
  }

  // Get meetup attendees
  async getMeetupAttendees(meetupId: string): Promise<ApiResponse<User[]>> {
    try {
      // Get attendances for this meetup
      const attendanceQuery = query(
        collection(db, collections.attendances),
        where('meetupId', '==', meetupId),
        where('status', '==', 'registered')
      );

      const attendanceSnapshot = await getDocs(attendanceQuery);
      const userIds = attendanceSnapshot.docs.map(doc => doc.data().userId);

      if (userIds.length === 0) {
        return {
          success: true,
          data: [],
        };
      }

      // Get user details for each attendee
      const users: User[] = [];
      for (const userId of userIds) {
        const userDoc = await getDoc(doc(db, collections.users, userId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          users.push({
            $id: userId,
            name: userData.name,
            email: userData.email,
            avatar: userData.avatar,
            bio: userData.bio,
            interests: userData.interests,
            joinedAt: userData.joinedAt,
            location: userData.location,
          });
        }
      }

      return {
        success: true,
        data: users,
      };
    } catch (error: any) {
      console.error('Get meetup attendees error:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch meetup attendees',
      };
    }
  }

  // Check if user is registered for meetup
  async checkMeetupRegistration(userId: string, meetupId: string): Promise<ApiResponse<boolean>> {
    try {
      const q = query(
        collection(db, collections.attendances),
        where('userId', '==', userId),
        where('meetupId', '==', meetupId),
        where('status', '==', 'registered')
      );

      const querySnapshot = await getDocs(q);

      return {
        success: true,
        data: !querySnapshot.empty,
      };
    } catch (error: any) {
      console.error('Check meetup registration error:', error);
      return {
        success: false,
        error: error.message || 'Failed to check registration',
      };
    }
  }

  // Get user's registered meetups
  async getUserMeetups(userId: string): Promise<ApiResponse<Meetup[]>> {
    try {
      // Get user's attendances
      const attendanceQuery = query(
        collection(db, collections.attendances),
        where('userId', '==', userId),
        where('status', '==', 'registered')
      );

      const attendanceSnapshot = await getDocs(attendanceQuery);
      const meetupIds = attendanceSnapshot.docs.map(doc => doc.data().meetupId);

      if (meetupIds.length === 0) {
        return {
          success: true,
          data: [],
        };
      }

      // Get meetup details
      const meetups: Meetup[] = [];
      for (const meetupId of meetupIds) {
        const meetupDoc = await getDoc(doc(db, collections.meetups, meetupId));
        if (meetupDoc.exists()) {
          const meetupData = meetupDoc.data();
          meetups.push({
            $id: meetupId,
            circleId: meetupData.circleId,
            title: meetupData.title,
            description: meetupData.description,
            date: meetupData.date,
            location: meetupData.location,
            maxAttendees: meetupData.maxAttendees,
            currentAttendees: meetupData.currentAttendees,
            images: meetupData.images,
            createdBy: meetupData.createdBy,
            createdAt: meetupData.createdAt,
            isOnline: meetupData.isOnline,
            price: meetupData.price,
          });
        }
      }

      return {
        success: true,
        data: meetups,
      };
    } catch (error: any) {
      console.error('Get user meetups error:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch user meetups',
      };
    }
  }

  // Chat and messaging methods

  // Send message
  async sendMessage(chatId: string, senderId: string, text: string, type: 'text' | 'image' = 'text'): Promise<ApiResponse<string>> {
    try {
      const messageData = {
        chatId,
        senderId,
        text,
        type,
        timestamp: new Date().toISOString(),
        status: 'sent',
      };

      const messageRef = await addDoc(collection(db, collections.messages), messageData);

      // Update chat's last message
      const chatRef = doc(db, collections.chats, chatId);
      await updateDoc(chatRef, {
        lastMessage: {
          text,
          timestamp: messageData.timestamp,
          senderId,
        },
        updatedAt: messageData.timestamp,
      });

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

  // Get chat messages
  async getChatMessages(chatId: string, limit: number = 50): Promise<ApiResponse<any[]>> {
    try {
      const messagesQuery = query(
        collection(db, collections.messages),
        where('chatId', '==', chatId),
        orderBy('timestamp', 'desc'),
        firestoreLimit(limit)
      );

      const messagesSnapshot = await getDocs(messagesQuery);
      const messages = messagesSnapshot.docs.map(doc => ({
        $id: doc.id,
        ...doc.data(),
      }));

      return {
        success: true,
        data: messages.reverse(), // Reverse to show oldest first
      };
    } catch (error: any) {
      console.error('Get chat messages error:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch messages',
      };
    }
  }

  // Get user chats
  async getUserChats(userId: string): Promise<ApiResponse<any[]>> {
    try {
      const chatsQuery = query(
        collection(db, collections.chats),
        where('participants', 'array-contains', userId),
        orderBy('updatedAt', 'desc')
      );

      const chatsSnapshot = await getDocs(chatsQuery);
      const chats = chatsSnapshot.docs.map(doc => ({
        $id: doc.id,
        ...doc.data(),
      }));

      return {
        success: true,
        data: chats,
      };
    } catch (error: any) {
      console.error('Get user chats error:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch chats',
      };
    }
  }

  // Create or get direct chat
  async createDirectChat(userId1: string, userId2: string): Promise<ApiResponse<string>> {
    try {
      // Check if chat already exists
      const existingChatQuery = query(
        collection(db, collections.chats),
        where('type', '==', 'direct'),
        where('participants', 'array-contains', userId1)
      );

      const existingChats = await getDocs(existingChatQuery);
      const directChat = existingChats.docs.find(doc => {
        const participants = doc.data().participants;
        return participants.includes(userId2);
      });

      if (directChat) {
        return {
          success: true,
          data: directChat.id,
        };
      }

      // Create new direct chat
      const chatData = {
        type: 'direct',
        participants: [userId1, userId2],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastMessage: null,
      };

      const chatRef = await addDoc(collection(db, collections.chats), chatData);

      return {
        success: true,
        data: chatRef.id,
      };
    } catch (error: any) {
      console.error('Create direct chat error:', error);
      return {
        success: false,
        error: error.message || 'Failed to create chat',
      };
    }
  }

  // Create group chat
  async createGroupChat(name: string, participants: string[], createdBy: string): Promise<ApiResponse<string>> {
    try {
      const chatData = {
        type: 'group',
        name,
        participants,
        createdBy,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastMessage: null,
      };

      const chatRef = await addDoc(collection(db, collections.chats), chatData);

      return {
        success: true,
        data: chatRef.id,
      };
    } catch (error: any) {
      console.error('Create group chat error:', error);
      return {
        success: false,
        error: error.message || 'Failed to create group chat',
      };
    }
  }

  // Update message status
  async updateMessageStatus(messageId: string, status: 'sent' | 'delivered' | 'read'): Promise<ApiResponse<null>> {
    try {
      const messageRef = doc(db, collections.messages, messageId);
      await updateDoc(messageRef, { status });

      return {
        success: true,
      };
    } catch (error: any) {
      console.error('Update message status error:', error);
      return {
        success: false,
        error: error.message || 'Failed to update message status',
      };
    }
  }
}

export const databaseService = new DatabaseService();
