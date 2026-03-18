
export enum UserRole {
  OWNER = 'OWNER',
  CUSTOMER = 'CUSTOMER'
}

export interface User {
  id: string;
  username: string;
  password?: string;
  name: string;
  role: UserRole;
  shopIds?: string[]; // List of owned shops
}

export interface Location {
  lat: number;
  lng: number;
}

export interface AddressDetails {
  flatNumber: string;
  locality: string;
  fullAddress: string; // fallback or combined
}

export interface Shop {
  id: string;
  ownerId: string;
  name: string;
  location: Location;
  description: string;
  imageUrl?: string;
}

export interface CreateShopPayload {
  ownerId: string;
  name: string;
  description: string;
  location: Location;
  imageUrl?: string;
}

export interface Item {
  id: string;
  shopId: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  imageUrl: string;
  category: string;
}

export interface CartItem extends Item {
  quantity: number;
}

export interface Order {
  id: string;
  customerId: string;
  shopId: string;
  items: CartItem[];
  totalAmount: number;
  status: 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'DELIVERED';
  timestamp: number;
  deliveryDistanceKm: number;
  estimatedDeliveryMinutes: number;
  deliveryLocation: Location;
  deliveryAddressDetails?: AddressDetails; // Added for flat/locality
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}
