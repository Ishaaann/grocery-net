
import { Item, Shop, Order, CartItem, ApiResponse, User, UserRole, Location, CreateShopPayload, AddressDetails } from '../types';
import { MOCK_SHOPS, GENERATE_MOCK_ITEMS, MOCK_USERS } from '../constants';

// Simulated Network Latency (ms)
const LATENCY = 600;

class MockServerService {
  private items: Item[] = [];
  private orders: Order[] = [];
  private users: User[] = [];
  private shops: Shop[] = [];
  private initialized = false;

  constructor() {
    this.init();
  }

  private init() {
    if (typeof window !== 'undefined') {
      try {
        const storedItems = localStorage.getItem('grocery_net_items');
        const storedOrders = localStorage.getItem('grocery_net_orders');
        const storedUsers = localStorage.getItem('grocery_net_users');
        const storedShops = localStorage.getItem('grocery_net_shops');

        if (storedItems) {
          this.items = JSON.parse(storedItems);
        } else {
          this.items = GENERATE_MOCK_ITEMS();
          this.persistItems();
        }

        if (storedOrders) {
          this.orders = JSON.parse(storedOrders);
        }
        
        if (storedShops) {
          this.shops = JSON.parse(storedShops);
        } else {
          this.shops = MOCK_SHOPS;
          this.persistShops();
        }
        
        if (storedUsers) {
          this.users = JSON.parse(storedUsers);
        } else {
          this.users = MOCK_USERS;
          this.persistUsers();
        }
      } catch (error) {
        console.warn("LocalStorage access denied or failed. Using in-memory data.", error);
        this.items = GENERATE_MOCK_ITEMS();
        this.users = MOCK_USERS;
        this.shops = MOCK_SHOPS;
        this.orders = [];
      }
      
      this.initialized = true;
    }
  }

  private persistItems() {
    try { localStorage.setItem('grocery_net_items', JSON.stringify(this.items)); } catch(e) {}
  }

  private persistOrders() {
    try { localStorage.setItem('grocery_net_orders', JSON.stringify(this.orders)); } catch(e) {}
  }

  private persistUsers() {
    try { localStorage.setItem('grocery_net_users', JSON.stringify(this.users)); } catch(e) {}
  }

  private persistShops() {
    try { localStorage.setItem('grocery_net_shops', JSON.stringify(this.shops)); } catch(e) {}
  }

  private async delay() {
    return new Promise(resolve => setTimeout(resolve, LATENCY));
  }

  // --- Auth Methods ---

  async login(username: string, password: string): Promise<ApiResponse<User>> {
    await this.delay();
    const user = this.users.find(u => u.username === username && u.password === password);
    if (user) {
      return { success: true, data: user };
    }
    return { success: false, error: "Invalid username or password" };
  }

  async register(username: string, password: string, role: UserRole, name: string): Promise<ApiResponse<User>> {
    await this.delay();
    
    if (this.users.find(u => u.username === username)) {
      return { success: false, error: "Username already exists" };
    }

    const newUser: User = {
      id: `user_${Date.now()}`,
      username,
      password,
      name,
      role,
      shopIds: []
    };

    if (role === UserRole.OWNER) {
      // Create a default shop for the new owner
      const newShop: Shop = {
        id: `shop_${newUser.id}_default`,
        ownerId: newUser.id,
        name: `${name}'s Shop`,
        location: { lat: 28.6139, lng: 77.2090 }, // Default to Delhi
        description: "New shop"
      };
      this.shops.push(newShop);
      newUser.shopIds = [newShop.id];
      this.persistShops();
    }

    this.users.push(newUser);
    this.persistUsers();

    return { success: true, data: newUser };
  }

  // --- Data Methods ---

  async createShop(payload: CreateShopPayload): Promise<ApiResponse<Shop>> {
      await this.delay();
      const newShop: Shop = {
          id: `shop_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          ownerId: payload.ownerId,
          name: payload.name,
          description: payload.description,
          location: payload.location,
          imageUrl: payload.imageUrl
      };

      this.shops.push(newShop);
      
      // Update User
      const userIdx = this.users.findIndex(u => u.id === payload.ownerId);
      if (userIdx !== -1) {
          if (!this.users[userIdx].shopIds) this.users[userIdx].shopIds = [];
          this.users[userIdx].shopIds!.push(newShop.id);
          this.persistUsers();
      }
      
      this.persistShops();
      return { success: true, data: newShop };
  }

  async updateShop(ownerId: string, shopId: string, updates: Partial<Shop>): Promise<ApiResponse<Shop>> {
    await this.delay();
    const index = this.shops.findIndex(s => s.id === shopId);
    if (index === -1) return { success: false, error: "Shop not found" };
    
    if (this.shops[index].ownerId !== ownerId) return { success: false, error: "Unauthorized" };
    
    this.shops[index] = { ...this.shops[index], ...updates };
    this.persistShops();
    return { success: true, data: this.shops[index] };
  }

  async getShops(): Promise<ApiResponse<Shop[]>> {
    await this.delay();
    return { success: true, data: this.shops };
  }

  async getItems(shopId?: string): Promise<ApiResponse<Item[]>> {
    await this.delay();
    if (shopId) {
      return { success: true, data: this.items.filter(i => i.shopId === shopId) };
    }
    return { success: true, data: this.items };
  }

  async updateItem(ownerId: string, updatedItem: Item): Promise<ApiResponse<Item>> {
    await this.delay();
    const shop = this.shops.find(s => s.id === updatedItem.shopId);
    if (!shop || shop.ownerId !== ownerId) {
      return { success: false, error: "Unauthorized: You do not own this shop." };
    }

    const index = this.items.findIndex(i => i.id === updatedItem.id);
    if (index === -1) {
      this.items.push(updatedItem);
    } else {
      this.items[index] = updatedItem;
    }
    this.persistItems();
    return { success: true, data: updatedItem };
  }

  async deleteItem(ownerId: string, itemId: string): Promise<ApiResponse<boolean>> {
    await this.delay();
    const item = this.items.find(i => i.id === itemId);
    if (!item) return { success: false, error: "Item not found" };

    const shop = this.shops.find(s => s.id === item.shopId);
    if (!shop || shop.ownerId !== ownerId) {
        return { success: false, error: "Unauthorized" };
    }

    this.items = this.items.filter(i => i.id !== itemId);
    this.persistItems();
    return { success: true, data: true };
  }

  async placeOrder(
      customerId: string, 
      shopId: string, 
      items: CartItem[], 
      distance: number, 
      deliveryTime: number, 
      deliveryLocation: Location,
      addressDetails?: AddressDetails
    ): Promise<ApiResponse<Order>> {
    await this.delay();
    
    // Server-side validation of stock
    const insufficientStockItems = [];
    for (const cartItem of items) {
      const serverItem = this.items.find(i => i.id === cartItem.id);
      if (!serverItem || serverItem.stock < cartItem.quantity) {
        insufficientStockItems.push(cartItem.name);
      }
    }

    if (insufficientStockItems.length > 0) {
      return { 
        success: false, 
        error: `Order failed. Insufficient stock for: ${insufficientStockItems.join(', ')}` 
      };
    }

    // Deduct Stock
    items.forEach(cartItem => {
        const idx = this.items.findIndex(i => i.id === cartItem.id);
        if (idx !== -1) {
            this.items[idx].stock -= cartItem.quantity;
        }
    });
    this.persistItems();

    const newOrder: Order = {
        id: `order_${Date.now()}`,
        customerId,
        shopId,
        items,
        totalAmount: items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        status: 'PENDING',
        timestamp: Date.now(),
        deliveryDistanceKm: distance,
        estimatedDeliveryMinutes: deliveryTime,
        deliveryLocation,
        deliveryAddressDetails: addressDetails
    };

    this.orders.push(newOrder);
    this.persistOrders();

    return { success: true, data: newOrder };
  }
  
  async updateOrderStatus(orderId: string, status: Order['status']): Promise<ApiResponse<Order>> {
    await this.delay();
    const orderIndex = this.orders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) {
      return { success: false, error: "Order not found" };
    }
    
    this.orders[orderIndex].status = status;
    this.persistOrders();
    return { success: true, data: this.orders[orderIndex] };
  }
  
  async getShopOrders(ownerId: string): Promise<ApiResponse<Order[]>> {
      await this.delay();
      // Get all shops owned by this user
      const userShops = this.shops.filter(s => s.ownerId === ownerId);
      const shopIds = userShops.map(s => s.id);
      
      const shopOrders = this.orders.filter(o => shopIds.includes(o.shopId)).sort((a,b) => b.timestamp - a.timestamp);
      return { success: true, data: shopOrders };
  }

  async getCustomerOrders(customerId: string): Promise<ApiResponse<Order[]>> {
      await this.delay();
      const customerOrders = this.orders.filter(o => o.customerId === customerId).sort((a,b) => b.timestamp - a.timestamp);
      return { success: true, data: customerOrders };
  }
}

export const mockServer = new MockServerService();
