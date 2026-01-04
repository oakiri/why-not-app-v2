// App Constants
export const APP_NAME = 'WHY NOT Hamburguesería';
export const APP_VERSION = '2.0.0';

// Colors (from theme)
export const COLORS = {
  primary: '#FFD600', // Amarillo corporativo
  secondary: '#FF6B00',
  background: '#FFFFFF',
  surface: '#F5F5F5',
  text: '#333333',
  textSecondary: '#666666',
  border: '#E0E0E0',
  error: '#D32F2F',
  success: '#388E3C',
  warning: '#F57C00',
  info: '#1976D2',
  white: '#FFFFFF',
  black: '#000000',
  gray: {
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
};

// Order Status
export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  READY: 'ready',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  preparing: 'En preparación',
  ready: 'Listo',
  completed: 'Completado',
  cancelled: 'Cancelado',
};

export const ORDER_STATUS_COLORS: Record<string, string> = {
  pending: COLORS.warning,
  confirmed: COLORS.info,
  preparing: COLORS.secondary,
  ready: COLORS.success,
  completed: COLORS.gray[600],
  cancelled: COLORS.error,
};

// Delivery Types
export const DELIVERY_TYPES = {
  PICKUP: 'pickup',
  DELIVERY: 'delivery',
  DINE_IN: 'dine-in',
} as const;

export const DELIVERY_TYPE_LABELS: Record<string, string> = {
  pickup: 'Recoger',
  delivery: 'Entrega a domicilio',
  'dine-in': 'Comer aquí',
};

// Payment Methods
export const PAYMENT_METHODS = {
  CASH: 'cash',
  CARD: 'card',
  ONLINE: 'online',
  APP: 'app',
} as const;

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cash: 'Efectivo',
  card: 'Tarjeta',
  online: 'Pago online',
  app: 'Pago en app',
};

// User Roles
export const USER_ROLES = {
  CUSTOMER: 'customer',
  EMPLOYEE: 'employee',
  ADMIN: 'admin',
} as const;

export const USER_ROLE_LABELS: Record<string, string> = {
  customer: 'Cliente',
  employee: 'Empleado',
  admin: 'Administrador',
};

// Reservation Status
export const RESERVATION_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  SEATED: 'seated',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no-show',
} as const;

export const RESERVATION_STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  seated: 'Sentados',
  completed: 'Completada',
  cancelled: 'Cancelada',
  'no-show': 'No se presentó',
};

// Loyalty Tiers
export const LOYALTY_TIERS = {
  BRONZE: 'bronze',
  SILVER: 'silver',
  GOLD: 'gold',
  PLATINUM: 'platinum',
} as const;

export const LOYALTY_TIER_LABELS: Record<string, string> = {
  bronze: 'Bronce',
  silver: 'Plata',
  gold: 'Oro',
  platinum: 'Platino',
};

export const LOYALTY_TIER_THRESHOLDS: Record<string, number> = {
  bronze: 0,
  silver: 500,
  gold: 1500,
  platinum: 3000,
};

export const LOYALTY_TIER_COLORS: Record<string, string> = {
  bronze: '#CD7F32',
  silver: '#C0C0C0',
  gold: '#FFD700',
  platinum: '#E5E4E2',
};

// Points Configuration
export const POINTS_PER_EURO = 10; // 10 puntos por cada euro gastado
export const EUROS_PER_POINT = 0.01; // 1 punto = 0.01€
export const MIN_POINTS_TO_REDEEM = 100;

// Notification Types
export const NOTIFICATION_TYPES = {
  ORDER: 'order',
  RESERVATION: 'reservation',
  PROMOTION: 'promotion',
  LOYALTY: 'loyalty',
  SYSTEM: 'system',
} as const;

// Time Slots for Reservations
export const RESERVATION_TIME_SLOTS = [
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00', '22:30',
];

// Days of Week
export const DAYS_OF_WEEK = [
  'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'
];

export const DAYS_OF_WEEK_SHORT = [
  'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'
];

// Allergens
export const ALLERGENS = [
  { id: 'gluten', name: 'Gluten', icon: '🌾' },
  { id: 'dairy', name: 'Lácteos', icon: '🥛' },
  { id: 'eggs', name: 'Huevos', icon: '🥚' },
  { id: 'fish', name: 'Pescado', icon: '🐟' },
  { id: 'shellfish', name: 'Mariscos', icon: '🦐' },
  { id: 'nuts', name: 'Frutos secos', icon: '🥜' },
  { id: 'peanuts', name: 'Cacahuetes', icon: '🥜' },
  { id: 'soy', name: 'Soja', icon: '🫘' },
  { id: 'celery', name: 'Apio', icon: '🥬' },
  { id: 'mustard', name: 'Mostaza', icon: '🌭' },
  { id: 'sesame', name: 'Sésamo', icon: '🌰' },
  { id: 'sulfites', name: 'Sulfitos', icon: '🍷' },
  { id: 'lupin', name: 'Altramuces', icon: '🫘' },
  { id: 'molluscs', name: 'Moluscos', icon: '🦪' },
];

// Validation Rules
export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{3,6}$/,
  PASSWORD_MIN_LENGTH: 6,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  COMMENT_MAX_LENGTH: 500,
  NOTES_MAX_LENGTH: 200,
};

// API Endpoints (Cloud Functions)
export const API_ENDPOINTS = {
  CREATE_ORDER: '/createOrder',
  UPDATE_ORDER: '/updateOrder',
  CANCEL_ORDER: '/cancelOrder',
  CREATE_RESERVATION: '/createReservation',
  UPDATE_RESERVATION: '/updateReservation',
  CANCEL_RESERVATION: '/cancelReservation',
  SYNC_MENU: '/syncMenu',
  APPLY_PROMOTION: '/applyPromotion',
  REDEEM_POINTS: '/redeemPoints',
  SEND_NOTIFICATION: '/sendNotification',
  TPV_WEBHOOK: '/tpvWebhook',
};

// Firebase Collections
export const COLLECTIONS = {
  USERS: 'users',
  MENU_ITEMS: 'menuItems',
  CATEGORIES: 'categories',
  ORDERS: 'orders',
  RESERVATIONS: 'reservations',
  REVIEWS: 'reviews',
  LOYALTY_POINTS: 'loyaltyPoints',
  NOTIFICATIONS: 'notifications',
  PROMOTIONS: 'promotions',
  SETTINGS: 'settings',
  ANALYTICS: 'analytics',
  TPV_CONFIG: 'tpvConfig',
  INVENTORY: 'inventory',
  TABLES: 'tables',
  DELIVERY_ZONES: 'deliveryZones',
  SUPPORT_CHATS: 'supportChats',
};

// Storage Paths
export const STORAGE_PATHS = {
  USER_PROFILES: 'users',
  MENU_ITEMS: 'menu',
  CATEGORIES: 'categories',
  REVIEWS: 'reviews',
  PROMOTIONS: 'promotions',
  RESTAURANT_GALLERY: 'restaurant/gallery',
  DOCUMENTS: 'documents',
  TEMP: 'temp',
};

// Pagination
export const PAGINATION = {
  ITEMS_PER_PAGE: 20,
  ORDERS_PER_PAGE: 10,
  REVIEWS_PER_PAGE: 10,
};

// Cache Duration (in milliseconds)
export const CACHE_DURATION = {
  MENU: 5 * 60 * 1000, // 5 minutes
  SETTINGS: 10 * 60 * 1000, // 10 minutes
  CATEGORIES: 10 * 60 * 1000, // 10 minutes
  PROMOTIONS: 5 * 60 * 1000, // 5 minutes
};

// Timeouts
export const TIMEOUTS = {
  API_REQUEST: 30000, // 30 seconds
  IMAGE_UPLOAD: 60000, // 60 seconds
  DEBOUNCE_SEARCH: 500, // 500ms
};

// Image Sizes
export const IMAGE_SIZES = {
  THUMBNAIL: { width: 150, height: 150 },
  SMALL: { width: 300, height: 300 },
  MEDIUM: { width: 600, height: 600 },
  LARGE: { width: 1200, height: 1200 },
};

// Max File Sizes (in bytes)
export const MAX_FILE_SIZES = {
  IMAGE: 5 * 1024 * 1024, // 5MB
  DOCUMENT: 10 * 1024 * 1024, // 10MB
};

// Default Values
export const DEFAULTS = {
  CURRENCY: '€',
  LANGUAGE: 'es',
  COUNTRY: 'ES',
  TAX_RATE: 0.10, // 10% IVA
  DELIVERY_FEE: 2.50,
  MINIMUM_ORDER: 10.00,
  ESTIMATED_DELIVERY_TIME: 30, // minutes
  ESTIMATED_PICKUP_TIME: 15, // minutes
  DELIVERY_RADIUS: 5, // km
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Error de conexión. Por favor, verifica tu conexión a internet.',
  AUTH_ERROR: 'Error de autenticación. Por favor, inicia sesión nuevamente.',
  PERMISSION_DENIED: 'No tienes permisos para realizar esta acción.',
  NOT_FOUND: 'El recurso solicitado no fue encontrado.',
  VALIDATION_ERROR: 'Por favor, verifica los datos ingresados.',
  SERVER_ERROR: 'Error del servidor. Por favor, intenta nuevamente más tarde.',
  UNKNOWN_ERROR: 'Ha ocurrido un error inesperado.',
  CART_EMPTY: 'El carrito está vacío.',
  ITEM_UNAVAILABLE: 'Este producto no está disponible en este momento.',
  MINIMUM_ORDER_NOT_MET: 'El pedido mínimo no ha sido alcanzado.',
  INVALID_PROMO_CODE: 'El código promocional no es válido.',
  INSUFFICIENT_POINTS: 'No tienes suficientes puntos para canjear.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  ORDER_CREATED: '¡Pedido realizado con éxito!',
  ORDER_CANCELLED: 'Pedido cancelado correctamente.',
  RESERVATION_CREATED: '¡Reserva realizada con éxito!',
  RESERVATION_CANCELLED: 'Reserva cancelada correctamente.',
  PROFILE_UPDATED: 'Perfil actualizado correctamente.',
  REVIEW_SUBMITTED: '¡Gracias por tu reseña!',
  POINTS_REDEEMED: 'Puntos canjeados correctamente.',
  PROMO_APPLIED: 'Código promocional aplicado.',
};

// Feature Flags (can be overridden by Firebase Remote Config)
export const FEATURES = {
  ENABLE_RESERVATIONS: true,
  ENABLE_LOYALTY: true,
  ENABLE_DELIVERY: true,
  ENABLE_PICKUP: true,
  ENABLE_DINE_IN: true,
  ENABLE_REVIEWS: true,
  ENABLE_PROMOTIONS: true,
  ENABLE_CHAT_SUPPORT: true,
  ENABLE_PUSH_NOTIFICATIONS: true,
  ENABLE_TPV_INTEGRATION: true,
  ENABLE_MULTIIDIOMA: false, // TODO: Implement in Phase 7
};

// TPV Types
export const TPV_TYPES = {
  REVO: 'revo',
  LIGHTSPEED: 'lightspeed',
  TOAST: 'toast',
  SQUARE: 'square',
  NONE: 'none',
} as const;

export const TPV_TYPE_LABELS: Record<string, string> = {
  revo: 'Revo XEF',
  lightspeed: 'Lightspeed Restaurant',
  toast: 'Toast POS',
  square: 'Square POS',
  none: 'Sin integración',
};

// Social Media Links
export const SOCIAL_MEDIA = {
  FACEBOOK: 'https://facebook.com/whynothamburgueseria',
  INSTAGRAM: 'https://instagram.com/whynothamburgueseria',
  TWITTER: 'https://twitter.com/whynothamburgueseria',
  TIKTOK: 'https://tiktok.com/@whynothamburgueseria',
};

// Contact Info
export const CONTACT = {
  PHONE: '+34 XXX XXX XXX',
  EMAIL: 'info@whynothamburgueseria.com',
  ADDRESS: 'Calle Principal, 123, Madrid, España',
  WHATSAPP: '+34XXXXXXXXX',
};

// App Store Links
export const APP_STORES = {
  IOS: 'https://apps.apple.com/app/whynot',
  ANDROID: 'https://play.google.com/store/apps/details?id=com.whynot',
};

// Legal Links
export const LEGAL = {
  TERMS: 'https://whynothamburgueseria.com/terminos',
  PRIVACY: 'https://whynothamburgueseria.com/privacidad',
  COOKIES: 'https://whynothamburgueseria.com/cookies',
};

// Rating Configuration
export const RATING = {
  MIN: 1,
  MAX: 5,
  STEP: 0.5,
};

// Animation Durations (in milliseconds)
export const ANIMATIONS = {
  FAST: 200,
  NORMAL: 300,
  SLOW: 500,
};

// Z-Index Layers
export const Z_INDEX = {
  DROPDOWN: 1000,
  MODAL: 2000,
  TOAST: 3000,
  TOOLTIP: 4000,
};

export default {
  APP_NAME,
  APP_VERSION,
  COLORS,
  ORDER_STATUS,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  DELIVERY_TYPES,
  DELIVERY_TYPE_LABELS,
  PAYMENT_METHODS,
  PAYMENT_METHOD_LABELS,
  USER_ROLES,
  USER_ROLE_LABELS,
  RESERVATION_STATUS,
  RESERVATION_STATUS_LABELS,
  LOYALTY_TIERS,
  LOYALTY_TIER_LABELS,
  LOYALTY_TIER_THRESHOLDS,
  LOYALTY_TIER_COLORS,
  POINTS_PER_EURO,
  EUROS_PER_POINT,
  MIN_POINTS_TO_REDEEM,
  NOTIFICATION_TYPES,
  RESERVATION_TIME_SLOTS,
  DAYS_OF_WEEK,
  DAYS_OF_WEEK_SHORT,
  ALLERGENS,
  VALIDATION,
  API_ENDPOINTS,
  COLLECTIONS,
  STORAGE_PATHS,
  PAGINATION,
  CACHE_DURATION,
  TIMEOUTS,
  IMAGE_SIZES,
  MAX_FILE_SIZES,
  DEFAULTS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  FEATURES,
  TPV_TYPES,
  TPV_TYPE_LABELS,
  SOCIAL_MEDIA,
  CONTACT,
  APP_STORES,
  LEGAL,
  RATING,
  ANIMATIONS,
  Z_INDEX,
};
