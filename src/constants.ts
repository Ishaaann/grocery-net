
import { Shop, Item, User, UserRole } from './types';

// Helper to generate random coordinates around a central point (New Delhi)
const CENTRAL_LAT = 28.6139;
const CENTRAL_LNG = 77.2090;

const generateLocation = (offset: number) => ({
  lat: CENTRAL_LAT + (Math.random() - 0.5) * 0.05, // Tight cluster around Delhi
  lng: CENTRAL_LNG + (Math.random() - 0.5) * 0.05,
});

export const MOCK_SHOPS: Shop[] = [
  { id: 'shop_1', ownerId: 'owner_1', name: "Fresh Harvest Market", location: generateLocation(1), description: "Organic produce and local goods." },
  { id: 'shop_2', ownerId: 'owner_2', name: "Daily Essentials", location: generateLocation(2), description: "Your neighborhood convenience store." },
  { id: 'shop_3', ownerId: 'owner_3', name: "Gourmet Grocer", location: generateLocation(3), description: "Premium imports and fine foods." },
  { id: 'shop_4', ownerId: 'owner_4', name: "Budget Barn", location: generateLocation(4), description: "Best prices in town, guaranteed." },
  { id: 'shop_5', ownerId: 'owner_5', name: "City Supermarket", location: generateLocation(5), description: "Everything you need under one roof." },
];

export const MOCK_USERS: User[] = [
  // Shop Owners
  ...MOCK_SHOPS.map((shop, index) => ({
    id: shop.ownerId,
    username: `owner${index + 1}`,
    password: 'password',
    name: `Owner of ${shop.name}`,
    role: UserRole.OWNER,
    shopIds: [shop.id]
  })),
  // Customers
  { id: 'cust_1', username: 'alice', password: 'password', name: "Alice Customer", role: UserRole.CUSTOMER },
  { id: 'cust_2', username: 'bob', password: 'password', name: "Bob Customer", role: UserRole.CUSTOMER },
];

const CATEGORIES = ['Produce', 'Dairy', 'Bakery', 'Beverages', 'Pantry', 'Snacks'];
const ITEM_NAMES = [
  ['Apple', 'Banana', 'Carrot', 'Lettuce', 'Tomato'],
  ['Milk', 'Cheese', 'Yogurt', 'Butter', 'Cream'],
  ['Bread', 'Croissant', 'Muffin', 'Bagel', 'Cake'],
  ['Water', 'Soda', 'Juice', 'Coffee', 'Tea'],
  ['Rice', 'Pasta', 'Beans', 'Flour', 'Sugar'],
  ['Chips', 'Nuts', 'Chocolate', 'Candy', 'Popcorn']
];

// Generate 30 items per shop (150 total)
export const GENERATE_MOCK_ITEMS = (): Item[] => {
  const items: Item[] = [];
  MOCK_SHOPS.forEach((shop, shopIndex) => {
    for (let i = 0; i < 30; i++) {
      const categoryIdx = i % CATEGORIES.length;
      const itemIdx = i % 5; // Rotate through names
      const uniqueSuffix = Math.floor(i / 5) + 1; // Variation
      
      const category = CATEGORIES[categoryIdx];
      const baseName = ITEM_NAMES[categoryIdx][itemIdx];
      
      items.push({
        id: `item_${shop.id}_${i}`,
        shopId: shop.id,
        name: `${baseName} ${shopIndex + 1}-V${uniqueSuffix}`, // Ensure unique names per shop
        description: `Fresh ${baseName} from ${shop.name}. High quality.`,
        price: parseFloat((Math.random() * 10 + 1).toFixed(2)),
        stock: Math.floor(Math.random() * 50) + 10, // Stock between 10 and 60
        imageUrl: `https://picsum.photos/seed/${shop.id}${i}/200/200`,
        category: category
      });
    }
  });
  return items;
};
