
import React, { useState } from 'react';
import { User, UserRole, Shop } from '../types';
import { LogOut, ShoppingBasket, Store, UserCircle, ChevronDown, Menu } from 'lucide-react';
import { ProfileDrawer } from './ProfileDrawer';

interface LayoutProps {
  user: User | null;
  onLogout: () => void;
  title: string;
  children: React.ReactNode;
  cartItemCount?: number;
  onOpenCart?: () => void;
  
  // New Props for Profile and Shop Switching
  ownedShops?: Shop[];
  currentShopId?: string;
  onSwitchShop?: (shopId: string) => void;
  onCreateShop?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
    user, 
    onLogout, 
    title, 
    children, 
    cartItemCount = 0, 
    onOpenCart,
    ownedShops = [],
    currentShopId,
    onSwitchShop,
    onCreateShop
}) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isShopDropdownOpen, setIsShopDropdownOpen] = useState(false);

  return (
    <div className="h-full flex flex-col bg-gray-50 relative">
      <header className="bg-emerald-700 text-white shadow-md sticky top-0 z-40 shrink-0">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          
          {/* Left: Brand or Shop Switcher */}
          <div className="flex items-center space-x-2 flex-1 relative">
            {user?.role === UserRole.OWNER && ownedShops.length > 0 ? (
                <div className="relative">
                    <button 
                      onClick={() => setIsShopDropdownOpen(!isShopDropdownOpen)}
                      className="flex items-center space-x-1 cursor-pointer bg-emerald-800/50 px-3 py-1.5 rounded-lg hover:bg-emerald-800 transition-colors border border-emerald-600/30"
                    >
                        <Store className="h-5 w-5" />
                        <span className="font-bold text-sm max-w-[120px] truncate">
                            {ownedShops.find(s => s.id === currentShopId)?.name || "Select Shop"}
                        </span>
                        <ChevronDown className={`h-4 w-4 opacity-70 transition-transform ${isShopDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {/* Dropdown */}
                    {isShopDropdownOpen && (
                      <>
                        <div 
                          className="fixed inset-0 z-40" 
                          onClick={() => setIsShopDropdownOpen(false)} 
                        />
                        <div className="absolute top-full left-0 mt-2 w-60 bg-white rounded-lg shadow-xl py-2 z-50 text-gray-900 border border-gray-100 animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 mb-1">
                              My Shops
                            </div>
                            {ownedShops.map(shop => (
                                <button
                                    key={shop.id}
                                    onClick={() => {
                                      if (onSwitchShop) onSwitchShop(shop.id);
                                      setIsShopDropdownOpen(false);
                                    }}
                                    className={`w-full text-left px-4 py-3 text-sm hover:bg-emerald-50 flex items-center justify-between transition-colors ${currentShopId === shop.id ? 'text-emerald-700 font-bold bg-emerald-50' : 'text-gray-700'}`}
                                >
                                    <span className="truncate">{shop.name}</span>
                                    {currentShopId === shop.id && <div className="h-2 w-2 bg-emerald-600 rounded-full"></div>}
                                </button>
                            ))}
                            <div className="border-t border-gray-100 mt-1 pt-1">
                                <button 
                                  onClick={() => {
                                    setIsShopDropdownOpen(false);
                                    if (onCreateShop) onCreateShop();
                                  }}
                                  className="w-full text-left px-4 py-3 text-sm text-emerald-600 font-semibold hover:bg-emerald-50 flex items-center space-x-2"
                                >
                                  <span>+ Create New Shop</span>
                                </button>
                            </div>
                        </div>
                      </>
                    )}
                </div>
            ) : (
                <div className="flex items-center space-x-2">
                    <Store className="h-6 w-6" />
                    <h1 className="text-lg font-bold tracking-tight truncate max-w-[150px]">{title}</h1>
                </div>
            )}
          </div>
          
          {/* Right: Actions */}
          <div className="flex items-center space-x-3">
            {user && (
              <>
                {user.role === UserRole.CUSTOMER && onOpenCart && (
                  <button 
                    onClick={onOpenCart}
                    className="relative p-2 hover:bg-emerald-600 rounded-full transition-colors"
                  >
                    <ShoppingBasket className="h-6 w-6" />
                    {cartItemCount > 0 && (
                      <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-red-100 transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
                        {cartItemCount}
                      </span>
                    )}
                  </button>
                )}

                <button 
                  onClick={() => setIsProfileOpen(true)}
                  className="p-1 hover:bg-emerald-600 rounded-full transition-colors"
                >
                   <UserCircle className="h-8 w-8 text-emerald-100" />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-grow flex flex-col max-w-7xl mx-auto px-4 py-6 w-full h-full overflow-hidden relative">
        {children}
      </main>
      
      {/* Footer / Copyright */}
      <footer className="bg-gray-800 text-gray-500 py-4 text-center text-xs shrink-0">
        <p>&copy; 2024 GroceryNet</p>
      </footer>

      {/* Profile Drawer */}
      {user && onCreateShop && (
          <ProfileDrawer 
            isOpen={isProfileOpen}
            onClose={() => setIsProfileOpen(false)}
            user={user}
            onLogout={onLogout}
            onCreateShop={() => {
                setIsProfileOpen(false);
                onCreateShop();
            }}
          />
      )}
    </div>
  );
};
