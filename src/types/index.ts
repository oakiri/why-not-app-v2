// User Types
export type UserRole = 'customer' | 'employee' | 'admin';

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  phoneNumber?: string;
  role: UserRole;
  loyaltyPoints?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Menu Types
export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  categoryName?: string;
  image?: string;
  images?: string[];
  available: boolean;
  featured?: boolean;
  allergens?: string[];
  nutritionalInfo?: NutritionalInfo;
  modifiers?: Modifier[];
  preparationTime?: number; // minutes
  tpvId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  image?: string;
  order: number;
  active: boolean;
  icon?: string;
}

export interface Modifier {
  id: string;
  name: string;
  price: number;
  category: string;
  required?: boolean;
  maxQuantity?: number;
}

export interface NutritionalInfo {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
}

// Order Types
export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
export type DeliveryType = 'pickup' | 'delivery' | 'dine-in';
export type PaymentMethod = 'cash' | 'card' | 'online' | 'app';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface Order {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  deliveryType: DeliveryType;
  deliveryAddress?: DeliveryAddress;
  tableNumber?: string;
  notes?: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  estimatedTime?: number;
  tpvOrderId?: string;
  tpvStatus?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface OrderItem {
  id: string;
  itemId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  modifiers?: Modifier[];
  notes?: string;
  subtotal: number;
}

export interface DeliveryAddress {
  street: string;
  city: string;
  postalCode: string;
  country: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  instructions?: string;
}

// Cart Types
export interface CartItem extends OrderItem {
  addedAt: Date;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  tax: number;
  discount: number;
  deliveryFee: number;
  total: number;
  itemCount: number;
}

// Reservation Types
export type ReservationStatus = 'pending' | 'confirmed' | 'seated' | 'completed' | 'cancelled' | 'no-show';

export interface Reservation {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  date: Date;
  time: string;
  numberOfPeople: number;
  tableId?: string;
  tableName?: string;
  status: ReservationStatus;
  notes?: string;
  specialRequests?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Table {
  id: string;
  name: string;
  capacity: number;
  location: string;
  available: boolean;
  qrCode?: string;
}

// Review Types
export interface Review {
  id: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  orderId?: string;
  rating: number;
  comment: string;
  images?: string[];
  response?: {
    text: string;
    respondedBy: string;
    respondedAt: Date;
  };
  helpful: number;
  createdAt: Date;
  updatedAt: Date;
}

// Loyalty Types
export interface LoyaltyPoints {
  userId: string;
  points: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  lifetimePoints: number;
  transactions: LoyaltyTransaction[];
  updatedAt: Date;
}

export interface LoyaltyTransaction {
  id: string;
  type: 'earned' | 'redeemed' | 'expired';
  points: number;
  reason: string;
  orderId?: string;
  createdAt: Date;
}

// Notification Types
export type NotificationType = 'order' | 'reservation' | 'promotion' | 'loyalty' | 'system';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  read: boolean;
  actionUrl?: string;
  createdAt: Date;
}

// Promotion Types
export interface Promotion {
  id: string;
  title: string;
  description: string;
  image?: string;
  discountType: 'percentage' | 'fixed' | 'bogo' | 'free-item';
  discountValue: number;
  code?: string;
  minOrderAmount?: number;
  maxDiscount?: number;
  applicableItems?: string[];
  applicableCategories?: string[];
  startDate: Date;
  endDate: Date;
  active: boolean;
  usageLimit?: number;
  usageCount: number;
  termsAndConditions?: string;
}

// Settings Types
export interface AppSettings {
  restaurantName: string;
  restaurantLogo?: string;
  restaurantAddress: string;
  restaurantPhone: string;
  restaurantEmail: string;
  openingHours: OpeningHours[];
  socialMedia?: SocialMedia;
  deliveryEnabled: boolean;
  pickupEnabled: boolean;
  dineInEnabled: boolean;
  reservationsEnabled: boolean;
  loyaltyEnabled: boolean;
  minimumOrderAmount: number;
  deliveryRadius: number; // km
  estimatedDeliveryTime: number; // minutes
  estimatedPickupTime: number; // minutes
  taxRate: number;
  currency: string;
  language: string;
  supportedLanguages: string[];
  maintenanceMode: boolean;
}

export interface OpeningHours {
  day: string;
  open: string;
  close: string;
  closed: boolean;
}

export interface SocialMedia {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  tiktok?: string;
  website?: string;
}

// Analytics Types
export interface Analytics {
  date: Date;
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  newCustomers: number;
  returningCustomers: number;
  topSellingItems: Array<{
    itemId: string;
    itemName: string;
    quantity: number;
    revenue: number;
  }>;
  ordersByType: {
    pickup: number;
    delivery: number;
    dineIn: number;
  };
  ordersByStatus: {
    completed: number;
    cancelled: number;
  };
  peakHours: Array<{
    hour: number;
    orders: number;
  }>;
}

// TPV Types
export type TPVType = 'revo' | 'lightspeed' | 'toast' | 'square' | 'none';

export interface TPVConfig {
  type: TPVType;
  enabled: boolean;
  credentials: {
    apiKey?: string;
    apiSecret?: string;
    clientId?: string;
    clientSecret?: string;
    accessToken?: string;
    refreshToken?: string;
    tenant?: string;
    baseUrl?: string;
  };
  webhookUrl?: string;
  syncMenu: boolean;
  syncOrders: boolean;
  syncInventory: boolean;
  lastSyncAt?: Date;
}

// Delivery Zone Types
export interface DeliveryZone {
  id: string;
  name: string;
  coordinates: Array<{
    latitude: number;
    longitude: number;
  }>;
  deliveryFee: number;
  minimumOrder: number;
  estimatedTime: number;
  active: boolean;
}

// Support Chat Types
export interface SupportChat {
  id: string;
  userId: string;
  userName: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  messages: ChatMessage[];
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  message: string;
  timestamp: Date;
  read: boolean;
}

// Inventory Types
export interface InventoryItem {
  itemId: string;
  itemName: string;
  quantity: number;
  unit: string;
  lowStockThreshold: number;
  lastRestocked: Date;
  supplier?: string;
}

// Error Types
export interface AppError {
  code: string;
  message: string;
  details?: any;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: AppError;
  message?: string;
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  email: string;
  password: string;
  confirmPassword: string;
  displayName: string;
  phoneNumber?: string;
  acceptTerms: boolean;
}

export interface CheckoutForm {
  deliveryType: DeliveryType;
  deliveryAddress?: DeliveryAddress;
  tableNumber?: string;
  paymentMethod: PaymentMethod;
  notes?: string;
  usePoints?: boolean;
}

export interface ReservationForm {
  date: Date;
  time: string;
  numberOfPeople: number;
  notes?: string;
  specialRequests?: string;
}

// Navigation Types
export type RootStackParamList = {
  Home: undefined;
  Menu: undefined;
  MenuDetail: { itemId: string };
  Cart: undefined;
  Checkout: undefined;
  Orders: undefined;
  OrderDetail: { orderId: string };
  Profile: undefined;
  Reservations: undefined;
  ReservationForm: undefined;
  Loyalty: undefined;
  Reviews: undefined;
  Settings: undefined;
  Support: undefined;
  // Auth screens
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  // Backoffice screens
  Dashboard: undefined;
  OrdersManagement: undefined;
  MenuManagement: undefined;
  ReservationsManagement: undefined;
  CustomersManagement: undefined;
  Analytics: undefined;
  SettingsManagement: undefined;
};

// Backoffice specific types
export interface DashboardStats {
  todayOrders: number;
  todayRevenue: number;
  pendingOrders: number;
  activeReservations: number;
  lowStockItems: number;
  newCustomers: number;
}

export interface OrderFilters {
  status?: OrderStatus[];
  deliveryType?: DeliveryType[];
  dateFrom?: Date;
  dateTo?: Date;
  minAmount?: number;
  maxAmount?: number;
}
