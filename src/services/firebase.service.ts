import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  QueryConstraint,
  DocumentData,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../lib/firebase';
import { COLLECTIONS } from '../constants';
import type {
  MenuItem,
  Category,
  Order,
  Reservation,
  Review,
  User,
  Notification,
  Promotion,
  LoyaltyPoints,
  AppSettings,
  Table,
  DeliveryZone,
} from '../types';

// Generic CRUD Operations
export class FirebaseService<T extends DocumentData> {
  constructor(private collectionName: string) {}

  async getById(id: string): Promise<T | null> {
    try {
      const docRef = doc(db, this.collectionName, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as T;
      }
      return null;
    } catch (error) {
      console.error(`Error getting document from ${this.collectionName}:`, error);
      throw error;
    }
  }

  async getAll(constraints: QueryConstraint[] = []): Promise<T[]> {
    try {
      const collectionRef = collection(db, this.collectionName);
      const q = query(collectionRef, ...constraints);
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as T[];
    } catch (error) {
      console.error(`Error getting documents from ${this.collectionName}:`, error);
      throw error;
    }
  }

  async create(data: Partial<T>): Promise<string> {
    try {
      const collectionRef = collection(db, this.collectionName);
      const docRef = await addDoc(collectionRef, {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      return docRef.id;
    } catch (error) {
      console.error(`Error creating document in ${this.collectionName}:`, error);
      throw error;
    }
  }

  async update(id: string, data: Partial<T>): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error(`Error updating document in ${this.collectionName}:`, error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error(`Error deleting document from ${this.collectionName}:`, error);
      throw error;
    }
  }

  subscribe(
    id: string,
    callback: (data: T | null) => void
  ): Unsubscribe {
    const docRef = doc(db, this.collectionName, id);
    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        callback({ id: docSnap.id, ...docSnap.data() } as T);
      } else {
        callback(null);
      }
    });
  }

  subscribeToQuery(
    constraints: QueryConstraint[],
    callback: (data: T[]) => void
  ): Unsubscribe {
    const collectionRef = collection(db, this.collectionName);
    const q = query(collectionRef, ...constraints);
    
    return onSnapshot(q, (querySnapshot) => {
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as T[];
      callback(data);
    });
  }
}

// Specific Services
export const menuService = new FirebaseService<MenuItem>(COLLECTIONS.MENU_ITEMS);
export const categoryService = new FirebaseService<Category>(COLLECTIONS.CATEGORIES);
export const orderService = new FirebaseService<Order>(COLLECTIONS.ORDERS);
export const reservationService = new FirebaseService<Reservation>(COLLECTIONS.RESERVATIONS);
export const reviewService = new FirebaseService<Review>(COLLECTIONS.REVIEWS);
export const userService = new FirebaseService<User>(COLLECTIONS.USERS);
export const notificationService = new FirebaseService<Notification>(COLLECTIONS.NOTIFICATIONS);
export const promotionService = new FirebaseService<Promotion>(COLLECTIONS.PROMOTIONS);
export const loyaltyService = new FirebaseService<LoyaltyPoints>(COLLECTIONS.LOYALTY_POINTS);
export const settingsService = new FirebaseService<AppSettings>(COLLECTIONS.SETTINGS);
export const tableService = new FirebaseService<Table>(COLLECTIONS.TABLES);
export const deliveryZoneService = new FirebaseService<DeliveryZone>(COLLECTIONS.DELIVERY_ZONES);

// Menu Operations
export const getMenuByCategory = async (categoryId: string): Promise<MenuItem[]> => {
  return menuService.getAll([
    where('category', '==', categoryId),
    where('available', '==', true),
    orderBy('name', 'asc')
  ]);
};

export const getFeaturedItems = async (): Promise<MenuItem[]> => {
  return menuService.getAll([
    where('featured', '==', true),
    where('available', '==', true),
    limit(10)
  ]);
};

export const searchMenuItems = async (searchTerm: string): Promise<MenuItem[]> => {
  // Note: Firestore doesn't support full-text search natively
  // This is a simple implementation that gets all items and filters client-side
  // For production, consider using Algolia or similar service
  const allItems = await menuService.getAll([where('available', '==', true)]);
  const lowerSearch = searchTerm.toLowerCase();
  
  return allItems.filter(item =>
    item.name.toLowerCase().includes(lowerSearch) ||
    item.description?.toLowerCase().includes(lowerSearch)
  );
};

// Order Operations
export const getUserOrders = async (userId: string): Promise<Order[]> => {
  return orderService.getAll([
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(50)
  ]);
};

export const getPendingOrders = async (): Promise<Order[]> => {
  return orderService.getAll([
    where('status', 'in', ['pending', 'confirmed', 'preparing']),
    orderBy('createdAt', 'asc')
  ]);
};

export const getOrdersByStatus = async (status: string): Promise<Order[]> => {
  return orderService.getAll([
    where('status', '==', status),
    orderBy('createdAt', 'desc')
  ]);
};

export const getOrdersByDateRange = async (startDate: Date, endDate: Date): Promise<Order[]> => {
  return orderService.getAll([
    where('createdAt', '>=', Timestamp.fromDate(startDate)),
    where('createdAt', '<=', Timestamp.fromDate(endDate)),
    orderBy('createdAt', 'desc')
  ]);
};

// Reservation Operations
export const getUserReservations = async (userId: string): Promise<Reservation[]> => {
  return reservationService.getAll([
    where('userId', '==', userId),
    orderBy('date', 'desc'),
    limit(20)
  ]);
};

export const getReservationsByDate = async (date: Date): Promise<Reservation[]> => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  return reservationService.getAll([
    where('date', '>=', Timestamp.fromDate(startOfDay)),
    where('date', '<=', Timestamp.fromDate(endOfDay)),
    orderBy('date', 'asc')
  ]);
};

export const getAvailableTables = async (date: Date, time: string, numberOfPeople: number): Promise<Table[]> => {
  // Get all tables that can accommodate the number of people
  const allTables = await tableService.getAll([
    where('capacity', '>=', numberOfPeople),
    where('available', '==', true)
  ]);

  // Get reservations for the same date and time
  const reservations = await getReservationsByDate(date);
  const reservedTableIds = reservations
    .filter(r => r.time === time && r.status !== 'cancelled')
    .map(r => r.tableId);

  // Filter out reserved tables
  return allTables.filter(table => !reservedTableIds.includes(table.id));
};

// Review Operations
export const getItemReviews = async (itemId: string): Promise<Review[]> => {
  // Note: You'll need to add itemId field to reviews
  return reviewService.getAll([
    orderBy('createdAt', 'desc'),
    limit(20)
  ]);
};

export const getUserReviews = async (userId: string): Promise<Review[]> => {
  return reviewService.getAll([
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  ]);
};

// Notification Operations
export const getUserNotifications = async (userId: string): Promise<Notification[]> => {
  return notificationService.getAll([
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(50)
  ]);
};

export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  await notificationService.update(notificationId, { read: true } as Partial<Notification>);
};

export const markAllNotificationsAsRead = async (userId: string): Promise<void> => {
  const notifications = await getUserNotifications(userId);
  const unreadNotifications = notifications.filter(n => !n.read);
  
  await Promise.all(
    unreadNotifications.map(n => markNotificationAsRead(n.id))
  );
};

// Loyalty Operations
export const getUserLoyaltyPoints = async (userId: string): Promise<LoyaltyPoints | null> => {
  return loyaltyService.getById(userId);
};

export const addLoyaltyPoints = async (
  userId: string,
  points: number,
  reason: string,
  orderId?: string
): Promise<void> => {
  const loyaltyData = await getUserLoyaltyPoints(userId);
  
  if (loyaltyData) {
    const newPoints = loyaltyData.points + points;
    const newLifetimePoints = loyaltyData.lifetimePoints + points;
    
    // Determine tier based on lifetime points
    let tier: 'bronze' | 'silver' | 'gold' | 'platinum' = 'bronze';
    if (newLifetimePoints >= 3000) tier = 'platinum';
    else if (newLifetimePoints >= 1500) tier = 'gold';
    else if (newLifetimePoints >= 500) tier = 'silver';
    
    await loyaltyService.update(userId, {
      points: newPoints,
      lifetimePoints: newLifetimePoints,
      tier,
      transactions: [
        ...loyaltyData.transactions,
        {
          id: Date.now().toString(),
          type: 'earned',
          points,
          reason,
          orderId,
          createdAt: new Date(),
        }
      ]
    } as Partial<LoyaltyPoints>);
  }
};

// Promotion Operations
export const getActivePromotions = async (): Promise<Promotion[]> => {
  const now = Timestamp.now();
  return promotionService.getAll([
    where('active', '==', true),
    where('startDate', '<=', now),
    where('endDate', '>=', now),
    orderBy('startDate', 'desc')
  ]);
};

export const validatePromotionCode = async (code: string): Promise<Promotion | null> => {
  const promotions = await promotionService.getAll([
    where('code', '==', code.toUpperCase()),
    where('active', '==', true)
  ]);
  
  if (promotions.length === 0) return null;
  
  const promotion = promotions[0];
  const now = new Date();
  
  // Check if promotion is within date range
  if (promotion.startDate > now || promotion.endDate < now) {
    return null;
  }
  
  // Check if usage limit is reached
  if (promotion.usageLimit && promotion.usageCount >= promotion.usageLimit) {
    return null;
  }
  
  return promotion;
};

// Settings Operations
export const getAppSettings = async (): Promise<AppSettings | null> => {
  return settingsService.getById('app');
};

// Storage Operations
export const uploadImage = async (
  path: string,
  file: Blob,
  fileName: string
): Promise<string> => {
  try {
    const storageRef = ref(storage, `${path}/${fileName}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

export const deleteImage = async (path: string): Promise<void> => {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
};

// Real-time Subscriptions
export const subscribeToOrder = (
  orderId: string,
  callback: (order: Order | null) => void
): Unsubscribe => {
  return orderService.subscribe(orderId, callback);
};

export const subscribeToPendingOrders = (
  callback: (orders: Order[]) => void
): Unsubscribe => {
  return orderService.subscribeToQuery([
    where('status', 'in', ['pending', 'confirmed', 'preparing']),
    orderBy('createdAt', 'asc')
  ], callback);
};

export const subscribeToUserNotifications = (
  userId: string,
  callback: (notifications: Notification[]) => void
): Unsubscribe => {
  return notificationService.subscribeToQuery([
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(50)
  ], callback);
};

export default {
  menuService,
  categoryService,
  orderService,
  reservationService,
  reviewService,
  userService,
  notificationService,
  promotionService,
  loyaltyService,
  settingsService,
  tableService,
  deliveryZoneService,
  getMenuByCategory,
  getFeaturedItems,
  searchMenuItems,
  getUserOrders,
  getPendingOrders,
  getOrdersByStatus,
  getOrdersByDateRange,
  getUserReservations,
  getReservationsByDate,
  getAvailableTables,
  getItemReviews,
  getUserReviews,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUserLoyaltyPoints,
  addLoyaltyPoints,
  getActivePromotions,
  validatePromotionCode,
  getAppSettings,
  uploadImage,
  deleteImage,
  subscribeToOrder,
  subscribeToPendingOrders,
  subscribeToUserNotifications,
};
