
import React, { useState, useEffect } from 'react';
import { User, Shop, Item, Order, UserRole, Location, AddressDetails } from '../types';
import { mockServer } from '../services/mockServer';
import { ItemCard } from './ItemCard';
import { MapPin, Search, Navigation, Clock, ChevronLeft, ShoppingBag, History, Truck, Star, Loader2, Store, Crosshair } from 'lucide-react';

interface CustomerMarketplaceProps {
  user: User;
  onAddToCart: (item: Item) => void;
  // State hoisted to parent to sync with Cart
  customerLocation: Location;
  addressDetails: AddressDetails;
  onLocationUpdate: (location: Location, details: AddressDetails) => void;
}

// Distance calc (Haversine)
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; 
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const CustomerMarketplace: React.FC<CustomerMarketplaceProps> = ({ 
    user, 
    onAddToCart,
    customerLocation,
    addressDetails,
    onLocationUpdate
}) => {
  const [activeTab, setActiveTab] = useState<'browse' | 'orders'>('browse');
  const [view, setView] = useState<'shops' | 'details'>('shops');
  
  // Data
  const [shops, setShops] = useState<Shop[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  
  // Selection
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Map / Location Search Input State (Modal)
  const [inputFlat, setInputFlat] = useState('');
  const [inputLocality, setInputLocality] = useState('');
  const [isLocating, setIsLocating] = useState(false);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    // Pre-fill inputs from props
    setInputFlat(addressDetails.flatNumber);
    setInputLocality(addressDetails.locality);
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    const [shopsRes, itemsRes, ordersRes] = await Promise.all([
      mockServer.getShops(),
      mockServer.getItems(),
      mockServer.getCustomerOrders(user.id)
    ]);
    if (shopsRes.data) setShops(shopsRes.data);
    if (itemsRes.data) setItems(itemsRes.data);
    if (ordersRes.data) setOrders(ordersRes.data);
    setLoading(false);
  };

  const handleShopSelect = (shop: Shop) => {
    setSelectedShop(shop);
    setView('details');
    setSearchTerm(''); // Reset search when entering shop
  };

  const handleBackToShops = () => {
    setView('shops');
    setSelectedShop(null);
    setSearchTerm('');
  };

  // GPS Detection
  const handleDetectLocation = () => {
      if ("geolocation" in navigator) {
          setIsLocating(true);
          navigator.geolocation.getCurrentPosition(
              (position) => {
                  const loc = {
                      lat: position.coords.latitude,
                      lng: position.coords.longitude
                  };
                  // Update parent state
                  onLocationUpdate(loc, {
                      flatNumber: '',
                      locality: "Detected Location (GPS)",
                      fullAddress: "Detected Location (GPS)"
                  });
                  setIsLocating(false);
                  setInputLocality("Detected Location (GPS)");
                  setInputFlat("");
                  setIsLocationModalOpen(false);
              },
              (error) => {
                  alert("Could not detect location. Please enter manually.");
                  setIsLocating(false);
              }
          );
      } else {
          alert("Geolocation not supported");
      }
  };

  const confirmLocation = () => {
      if (!inputLocality) {
          alert("Please enter a locality or landmark");
          return;
      }
      
      const fullAddr = `${inputFlat ? inputFlat + ', ' : ''}${inputLocality}`;
      
      // SIMULATE GEOCODING
      // If the user manually changed the address, we assume the location coordinates change.
      // We generate a random offset around Delhi to simulate "finding" that address on a map.
      // This ensures distance calculations change when the address changes.
      const simulatedNewLoc = {
          lat: 28.6139 + (Math.random() - 0.5) * 0.1, // Approx 10km radius
          lng: 77.2090 + (Math.random() - 0.5) * 0.1
      };

      onLocationUpdate(simulatedNewLoc, {
          flatNumber: inputFlat,
          locality: inputLocality,
          fullAddress: fullAddr
      });
      setIsLocationModalOpen(false);
  };

  const getShopDeliveryInfo = (shop: Shop) => {
      const dist = getDistanceFromLatLonInKm(customerLocation.lat, customerLocation.lng, shop.location.lat, shop.location.lng);
      const time = Math.ceil(10 + (dist * 2)); // 10m prep + 2m/km
      return { dist: dist.toFixed(1), time };
  };

  if (loading) return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-700"></div></div>;

  // Filter Logic
  // 1. Shops matching name
  const filteredShops = shops.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
  
  // 2. Global Items matching name (across all shops)
  const globalMatchingItems = searchTerm && view === 'shops' 
    ? items.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : [];

  // 3. In-Shop Items matching name
  const shopItems = selectedShop 
      ? items.filter(i => i.shopId === selectedShop.id && i.name.toLowerCase().includes(searchTerm.toLowerCase()))
      : [];

  return (
    <div className="h-full flex flex-col">
      {/* 1. Location Bar (Top) */}
      <div 
        onClick={() => setIsLocationModalOpen(true)}
        className="bg-emerald-50 px-4 py-2 flex items-center text-sm text-emerald-800 cursor-pointer border-b border-emerald-100 hover:bg-emerald-100 transition-colors"
      >
        <MapPin className="h-4 w-4 mr-2 shrink-0" />
        <span className="truncate font-medium">Deliver to: <span className="font-bold underline">{addressDetails.fullAddress}</span></span>
      </div>

      {/* 2. Main Content Area */}
      <div className="flex-1 overflow-y-auto bg-gray-50 pb-20">
        
        {activeTab === 'orders' ? (
             <div className="p-4 space-y-4">
                 <h2 className="text-xl font-bold text-gray-800 mb-4">Order History</h2>
                 {orders.length === 0 ? (
                     <div className="text-center text-gray-400 py-10">No past orders found.</div>
                 ) : (
                     orders.map(order => (
                         <div key={order.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                             <div className="flex justify-between items-start mb-2">
                                 <div>
                                     <h3 className="font-bold text-gray-800">{shops.find(s => s.id === order.shopId)?.name || 'Unknown Shop'}</h3>
                                     <p className="text-xs text-gray-500">{new Date(order.timestamp).toLocaleDateString()}</p>
                                 </div>
                                 <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                                     order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' : 
                                     order.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'
                                 }`}>
                                     {order.status}
                                 </span>
                             </div>
                             <div className="text-sm text-gray-600 mb-2">
                                 {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                             </div>
                             
                             {/* Address Used */}
                             <div className="text-xs text-gray-500 mb-2 bg-gray-50 p-2 rounded">
                                 Destination: {order.deliveryAddressDetails?.fullAddress || 'N/A'}
                             </div>

                             <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                                 <span className="text-xs font-bold text-gray-500">
                                     ETA: {order.estimatedDeliveryMinutes}m
                                 </span>
                                 <span className="font-bold text-emerald-600">₹{order.totalAmount.toFixed(2)}</span>
                             </div>
                         </div>
                     ))
                 )}
             </div>
        ) : (
             // BROWSE TAB
             <div className="space-y-4">
                
                {view === 'shops' ? (
                    <>
                        {/* Search Bar */}
                        <div className="p-4 bg-white shadow-sm sticky top-0 z-10">
                            <div className="flex items-center bg-white border border-gray-300 rounded-lg px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-emerald-100 focus-within:border-emerald-400 transition-all">
                                <Search className="h-4 w-4 text-gray-400 mr-2" />
                                <input 
                                    type="text" 
                                    placeholder="Search for stores or items..." 
                                    className="flex-1 outline-none text-sm bg-white"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* CONTENT: Hybrid Search (Shops AND Items) or Just Shops */}
                        <div className="px-4 pb-4 space-y-6">
                            
                            {/* 1. Matching Shops */}
                            {filteredShops.length > 0 && (
                                <div className="space-y-3">
                                    <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wide">
                                        {searchTerm ? 'Matching Shops' : 'Nearby Shops'}
                                    </h3>
                                    {filteredShops.map(shop => {
                                        const { dist, time } = getShopDeliveryInfo(shop);
                                        return (
                                            <div 
                                                key={shop.id} 
                                                onClick={() => handleShopSelect(shop)}
                                                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                                            >
                                                <div className="h-32 bg-gray-200 relative">
                                                    {shop.imageUrl ? (
                                                        <img src={shop.imageUrl} className="w-full h-full object-cover" alt={shop.name} />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-emerald-100 text-emerald-600">
                                                            <ShoppingBag className="h-12 w-12 opacity-50" />
                                                        </div>
                                                    )}
                                                    <div className="absolute bottom-2 right-2 bg-white/90 px-2 py-1 rounded-lg text-xs font-bold flex items-center shadow-sm">
                                                        <Clock className="h-3 w-3 mr-1 text-emerald-600" />
                                                        {time} min
                                                    </div>
                                                </div>
                                                <div className="p-4">
                                                    <div className="flex justify-between items-start">
                                                        <h3 className="font-bold text-lg text-gray-900">{shop.name}</h3>
                                                        <span className="flex items-center text-xs font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                                                            <Navigation className="h-3 w-3 mr-1" />
                                                            {dist} km
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-500 line-clamp-1 mt-1">{shop.description}</p>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}

                            {/* 2. Matching Items (Only show if searching) */}
                            {searchTerm && (
                                <div className="space-y-3">
                                    <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wide">
                                        Matching Items
                                    </h3>
                                    {globalMatchingItems.length === 0 ? (
                                        <div className="text-gray-400 text-sm italic">No items found matching "{searchTerm}"</div>
                                    ) : (
                                        globalMatchingItems.map(item => {
                                            const shop = shops.find(s => s.id === item.shopId);
                                            return (
                                                <div key={item.id} className="relative">
                                                    <div className="flex items-center justify-between px-1 mb-1">
                                                         <span className="text-[10px] font-bold text-gray-400 uppercase flex items-center">
                                                             <Store className="h-3 w-3 mr-1" />
                                                             {shop?.name}
                                                         </span>
                                                    </div>
                                                    <ItemCard 
                                                        item={item}
                                                        role={UserRole.CUSTOMER}
                                                        onAdd={onAddToCart}
                                                        variant="compact"
                                                    />
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            )}

                            {/* Empty State */}
                            {searchTerm && filteredShops.length === 0 && globalMatchingItems.length === 0 && (
                                <div className="text-center py-10 text-gray-400">
                                    No results found for "{searchTerm}"
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    // SHOP DETAILS VIEW
                    <>
                        {/* Shop Header */}
                        <div className="bg-white shadow-sm sticky top-0 z-10">
                            <div className="p-2 border-b border-gray-100">
                                <button onClick={handleBackToShops} className="flex items-center text-emerald-600 text-sm font-bold">
                                    <ChevronLeft className="h-5 w-5 mr-1" />
                                    Back to shops
                                </button>
                            </div>
                            
                            {/* Shop Cover Image (Replaces Map) */}
                            <div className="h-40 bg-gray-200 relative overflow-hidden w-full border-b border-gray-200">
                                <img 
                                    src={selectedShop?.imageUrl || `https://picsum.photos/seed/${selectedShop?.id}/800/400`} 
                                    alt={selectedShop?.name} 
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                                     <div className="text-white">
                                         <h1 className="text-2xl font-bold shadow-sm">{selectedShop?.name}</h1>
                                         <p className="text-sm opacity-90 flex items-center">
                                            <Clock className="h-4 w-4 mr-1" />
                                            ETA: {selectedShop ? getShopDeliveryInfo(selectedShop).time : 0} mins
                                         </p>
                                     </div>
                                </div>
                            </div>
                            
                            {/* Item Search inside Shop */}
                            <div className="p-3 bg-white">
                                <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2">
                                    <Search className="h-4 w-4 text-gray-400 mr-2" />
                                    <input 
                                        type="text" 
                                        placeholder={`Search in ${selectedShop?.name}...`} 
                                        className="flex-1 outline-none text-sm bg-transparent"
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Compact Item List */}
                        <div className="p-3">
                            {shopItems.map(item => (
                                <ItemCard 
                                    key={item.id}
                                    item={item}
                                    role={UserRole.CUSTOMER}
                                    onAdd={onAddToCart}
                                    variant="compact"
                                />
                            ))}
                            {shopItems.length === 0 && (
                                <div className="text-center py-8 text-gray-400">
                                    No items found.
                                </div>
                            )}
                        </div>
                    </>
                )}
             </div>
        )}
      </div>

      {/* 3. Bottom Tabs (Navigation) */}
      <div className="bg-white border-t border-gray-200 h-16 flex justify-around items-center shrink-0 absolute bottom-0 w-full rounded-b-xl z-20">
          <button 
            onClick={() => setActiveTab('browse')}
            className={`flex flex-col items-center space-y-1 ${activeTab === 'browse' ? 'text-emerald-600' : 'text-gray-400'}`}
          >
              <ShoppingBag className="h-6 w-6" />
              <span className="text-[10px] font-bold">Market</span>
          </button>
          <button 
            onClick={() => setActiveTab('orders')}
            className={`flex flex-col items-center space-y-1 ${activeTab === 'orders' ? 'text-emerald-600' : 'text-gray-400'}`}
          >
              <History className="h-6 w-6" />
              <span className="text-[10px] font-bold">Orders</span>
          </button>
      </div>

      {/* Enhanced Location Modal */}
      {isLocationModalOpen && (
          <div className="absolute inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center">
              <div className="bg-white w-full max-w-sm rounded-t-xl sm:rounded-xl p-5 animate-in slide-in-from-bottom duration-300">
                  <h3 className="font-bold text-xl mb-4 text-gray-900">Delivery Address</h3>
                  
                  <div className="space-y-4">
                        {/* GPS Button */}
                        <button 
                            onClick={handleDetectLocation}
                            disabled={isLocating}
                            className="w-full flex items-center justify-center space-x-2 bg-emerald-50 text-emerald-700 py-3 rounded-lg font-semibold border border-emerald-200 hover:bg-emerald-100 transition-colors"
                        >
                            {isLocating ? <Loader2 className="animate-spin h-5 w-5" /> : <Crosshair className="h-5 w-5" />}
                            <span>{isLocating ? 'Detecting...' : 'Detect Current Location (GPS)'}</span>
                        </button>

                        <div className="relative flex items-center py-2">
                            <div className="flex-grow border-t border-gray-200"></div>
                            <span className="flex-shrink-0 mx-4 text-gray-400 text-xs uppercase">Or enter manually</span>
                            <div className="flex-grow border-t border-gray-200"></div>
                        </div>

                        {/* Flat Number Input */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Flat / House No / Floor</label>
                            <input 
                                type="text"
                                className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-emerald-500"
                                placeholder="e.g. Flat 302, Sai Apartment"
                                value={inputFlat}
                                onChange={e => setInputFlat(e.target.value)}
                            />
                        </div>

                        {/* Locality Input */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Locality / Area / Landmark</label>
                            <input 
                                type="text"
                                className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-emerald-500"
                                placeholder="e.g. Connaught Place, Near Metro"
                                value={inputLocality}
                                onChange={e => setInputLocality(e.target.value)}
                            />
                        </div>
                  </div>

                  <div className="flex space-x-3 mt-6">
                      <button 
                        onClick={() => setIsLocationModalOpen(false)}
                        className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-50 rounded-lg"
                      >
                          Cancel
                      </button>
                      <button 
                        onClick={confirmLocation}
                        className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 shadow-sm"
                      >
                          Save Address
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
