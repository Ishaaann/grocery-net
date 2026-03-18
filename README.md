# GroceryNet 🛒

GroceryNet is a location-aware, hyper-local grocery marketplace application designed to connect customers with nearby shop owners. The platform facilitates a seamless shopping experience by allowing users to browse local inventories, manage carts, and handle orders, while providing shop owners with tools to manage their digital storefronts.

## 🚀 Key Features

### For Customers
* **Location-Based Discovery**: Automatically finds and displays grocery shops near the user's location.
* **Dynamic Marketplace**: Browse various categories such as Fruits, Vegetables, Dairy, and Bakery from local vendors.
* **Cart Management**: Real-time cart updates, item quantity adjustments, and a streamlined checkout process.
* **Order Tracking**: View and manage active and past orders with status updates.

### For Shop Owners
* **Storefront Management**: Tools to create and configure a digital shop, including setting names, categories, and locations.
* **Inventory Control**: Add, update, or remove items from the shop's inventory.
* **Order Dashboard**: A dedicated interface to monitor incoming customer orders and manage fulfillment.

##  Technologies & Frameworks Used

* **Frontend Core**: 
    * **React**: For building the component-based user interface.
    * **TypeScript**: Ensures type safety across the application models (User, Shop, Order).
* **Build & Tooling**:
    * **Vite**: High-performance frontend build tool and development server.
* **Mobile Integration**:
    * **Capacitor**: Enables the web application to run as a native mobile app on Android.
* **Styling & UI**:
    * **Tailwind CSS**: For utility-first responsive styling.
    * **Lucide React**: Used for consistent, modern iconography.
* **State & Logic**:
    * **React Hooks**: Extensive use of `useState` and `useEffect` for state management.
* **Backend Simulation**:
    * **Mock Service Layer**: A custom-built service (using `localStorage`) that simulates API calls and persists data without a live backend.

##  Project Structure

```text
grocerynet/
├── android/               # Native Android project files (Capacitor)
├── src/
│   ├── components/        # UI components (Auth, Cart, Marketplace, etc.)
│   ├── services/          # Mock API and data persistence logic
│   ├── types.ts           # Global TypeScript interfaces
│   ├── constants.ts       # Mock data and application constants
│   ├── App.tsx            # Main application entry and routing
│   └── index.tsx          # React DOM rendering
├── capacitor.config.ts    # Capacitor configuration
└── vite.config.ts         # Vite build configuration
