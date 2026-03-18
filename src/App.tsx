
import React, { useState, useEffect } from 'react';
import { User, UserRole, CartItem, Item, Shop, Location, AddressDetails } from './types';
import { Layout } from './components/Layout';
import { OwnerDashboard } from './components/OwnerDashboard';
import { CustomerMarketplace } from './components/CustomerMarketplace';
import { CartDrawer } from './components/CartDrawer';
import { LandingScreen, LoginScreen, RegisterScreen } from './components/AuthScreens';
import { CreateShopScreen } from './components/CreateShopScreen';
import { mockServer } from './services/mockServer';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // Owner State
  const [ownedShops, setOwnedShops] = useState<Shop[]>([]);
  const [currentShopId, setCurrentShopId] = useState<string | undefined>(undefined);
  
  // Customer Location State (Hoisted for consistency)
  const [customerLocation, setCustomerLocation] = useState<Location>({ lat: 28.6139, lng: 77.2090 }); // Default Delhi
  const [addressDetails, setAddressDetails] = useState<AddressDetails>({
      flatNumber: '',
      locality: 'Connaught Place',
      fullAddress: 'Connaught Place, New Delhi'
  });

  // Navigation State
  const [authScreen, setAuthScreen] = useState<'landing' | 'login' | 'register'>('landing');
  const [appView, setAppView] = useState<'dashboard' | 'create-shop'>('dashboard');

  // Load owned shops when user logs in
  useEffect(() => {
    if (currentUser?.role === UserRole.OWNER) {
      loadOwnedShops();
    }
  }, [currentUser]);

  const loadOwnedShops = async () => {
    if (!currentUser) return;
    const res = await mockServer.getShops();
    if (res.success && res.data) {
        // Filter shops owned by current user
        const myShops = res.data.filter(s => s.ownerId === currentUser.id);
        setOwnedShops(myShops);
        // Default to first shop if none selected
        if (myShops.length > 0 && !currentShopId) {
            setCurrentShopId(myShops[0].id);
        }
    }
  };

  const handleAddToCart = (item: Item) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (itemId: string, delta: number) => {
      setCart(prev => {
          return prev.map(item => {
              if (item.id === itemId) {
                  return { ...item, quantity: Math.max(0, item.quantity + delta) };
              }
              return item;
          }).filter(item => item.quantity > 0);
      });
  };

  const handleLocationUpdate = (loc: Location, details: AddressDetails) => {
      setCustomerLocation(loc);
      setAddressDetails(details);
  };

  const handleLogout = () => {
      setCurrentUser(null);
      setCart([]);
      setAuthScreen('landing');
      setOwnedShops([]);
      setCurrentShopId(undefined);
      setAppView('dashboard');
      // Reset location on logout if desired, or keep it
  };

  // --- Auth Flow Render ---
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-0 md:p-4">
        {/* Mobile Device Simulation Container */}
        <div className="bg-white w-full h-screen md:h-[800px] md:w-[400px] md:rounded-3xl shadow-2xl overflow-hidden relative border-0 md:border-8 md:border-gray-800">
           {authScreen === 'landing' && (
             <LandingScreen 
                onNavigate={setAuthScreen} 
             />
           )}
           {authScreen === 'login' && (
             <LoginScreen 
                onLoginSuccess={setCurrentUser} 
                onNavigate={setAuthScreen}
             />
           )}
           {authScreen === 'register' && (
             <RegisterScreen 
                onLoginSuccess={setCurrentUser} 
                onNavigate={setAuthScreen}
             />
           )}
        </div>
      </div>
    );
  }

  // --- Main App Render ---
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-0 md:p-4">
        <div className="bg-white w-full h-screen md:h-[800px] md:w-[400px] md:rounded-3xl shadow-2xl overflow-hidden relative border-0 md:border-8 md:border-gray-800 flex flex-col">
            
            {appView === 'create-shop' ? (
                <CreateShopScreen 
                    user={currentUser} 
                    onBack={() => setAppView('dashboard')}
                    onSuccess={(newShopId) => {
                        loadOwnedShops();
                        setCurrentShopId(newShopId);
                        setAppView('dashboard');
                    }}
                />
            ) : (
                <>
                    <div className="flex-1 overflow-y-auto bg-gray-50 scrollbar-hide">
                        <Layout 
                            user={currentUser} 
                            onLogout={handleLogout}
                            title={currentUser.role === UserRole.OWNER ? "My Business" : "Marketplace"}
                            cartItemCount={cart.reduce((a,b) => a + b.quantity, 0)}
                            onOpenCart={() => setIsCartOpen(true)}
                            
                            // Owner Props
                            ownedShops={ownedShops}
                            currentShopId={currentShopId}
                            onSwitchShop={setCurrentShopId}
                            onCreateShop={() => setAppView('create-shop')}
                        >
                            {currentUser.role === UserRole.OWNER ? (
                                <OwnerDashboard 
                                    user={currentUser} 
                                    selectedShopId={currentShopId}
                                />
                            ) : (
                                <CustomerMarketplace 
                                    user={currentUser} 
                                    onAddToCart={handleAddToCart}
                                    customerLocation={customerLocation}
                                    addressDetails={addressDetails}
                                    onLocationUpdate={handleLocationUpdate}
                                />
                            )}

                            <CartDrawer 
                                isOpen={isCartOpen} 
                                onClose={() => setIsCartOpen(false)}
                                cartItems={cart}
                                onUpdateQuantity={handleUpdateQuantity}
                                onClearCart={() => setCart([])}
                                customerId={currentUser.id}
                                customerLocation={customerLocation}
                                addressDetails={addressDetails}
                            />
                        </Layout>
                    </div>
                    
                    {/* Android Navigation Bar Simulation */}
                    <div className="h-12 bg-black flex items-center justify-center space-x-12 md:rounded-b-2xl shrink-0 z-50">
                        <div className="w-4 h-4 rounded-full border border-gray-500"></div> {/* Back */}
                        <div className="w-4 h-4 rounded-full border border-gray-500"></div> {/* Home */}
                        <div className="w-4 h-4 rounded-sm border border-gray-500"></div> {/* Recent */}
                    </div>
                </>
            )}
        </div>
    </div>
  );
}

export default App;
