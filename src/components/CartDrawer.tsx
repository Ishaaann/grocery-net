
import React, { useState, useEffect } from 'react';
import { CartItem, Shop, Location, AddressDetails } from '../types';
import { X, Plus, Minus, Truck, AlertTriangle, Clock } from 'lucide-react';
import { mockServer } from '../services/mockServer';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (itemId: string, delta: number) => void;
  onClearCart: () => void;
  customerId: string;
  // Props from App.tsx
  customerLocation: Location;
  addressDetails?: AddressDetails;
}

// Haversine formula for distance
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ 
    isOpen, 
    onClose, 
    cartItems, 
    onUpdateQuantity, 
    onClearCart, 
    customerId,
    customerLocation,
    addressDetails
}) => {
  const [shops, setShops] = useState<Shop[]>([]);
  
  const [isOrdering, setIsOrdering] = useState(false);
  const [orderStatus, setOrderStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    mockServer.getShops().then(res => {
        if (res.data) setShops(res.data);
    });
  }, [isOpen]);

  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  const itemsByShop = cartItems.reduce((acc, item) => {
      if (!acc[item.shopId]) acc[item.shopId] = [];
      acc[item.shopId].push(item);
      return acc;
  }, {} as Record<string, CartItem[]>);

  const shopIds = Object.keys(itemsByShop);
  const multiShop = shopIds.length > 1;

  // Calculate Delivery Logic using Props
  let deliveryInfo = { distance: 0, time: 0 };
  if (shopIds.length === 1) {
      const shop = shops.find(s => s.id === shopIds[0]);
      if (shop) {
          const dist = getDistanceFromLatLonInKm(customerLocation.lat, customerLocation.lng, shop.location.lat, shop.location.lng);
          const time = Math.ceil(10 + (dist * 2)); 
          deliveryInfo = { distance: parseFloat(dist.toFixed(2)), time };
      }
  }

  // Stock Validation Logic
  // Check if any cart item quantity exceeds available stock
  const stockErrors = cartItems.filter(item => item.quantity > item.stock);
  const hasStockErrors = stockErrors.length > 0;

  const handleCheckout = async () => {
      if (multiShop) {
          alert("Please order from one shop at a time.");
          return;
      }
      
      setIsOrdering(true);
      setOrderStatus('idle');

      const shopId = shopIds[0];
      const items = itemsByShop[shopId];

      const res = await mockServer.placeOrder(
          customerId, 
          shopId, 
          items, 
          deliveryInfo.distance, 
          deliveryInfo.time, 
          customerLocation,
          addressDetails
      );

      if (res.success) {
          setOrderStatus('success');
          setStatusMessage(`Order placed! Arriving in ~${deliveryInfo.time} mins.`);
          setTimeout(() => {
              onClearCart();
              onClose();
              setOrderStatus('idle');
          }, 3000);
      } else {
          setOrderStatus('error');
          setStatusMessage(res.error || "Order failed.");
      }
      setIsOrdering(false);
  };

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 overflow-hidden z-[100]">
      <div className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
      <div className="absolute inset-y-0 right-0 max-w-full flex">
        <div className="w-screen max-w-md bg-white shadow-xl flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-medium text-gray-900">Shopping Cart</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="flex-1 py-6 px-4 overflow-y-auto">
            {cartItems.length === 0 ? (
                <div className="text-center text-gray-500 mt-20">Your cart is empty.</div>
            ) : (
                <ul className="divide-y divide-gray-200">
                    {cartItems.map((item) => {
                        const isExceedingStock = item.quantity > item.stock;
                        return (
                            <li key={`${item.id}_cart`} className={`py-4 flex rounded-lg ${isExceedingStock ? 'bg-red-50 p-2' : ''}`}>
                                <img src={item.imageUrl} alt={item.name} className="h-16 w-16 rounded-md object-cover border" />
                                <div className="ml-4 flex-1 flex flex-col">
                                    <div className="flex justify-between text-base font-medium text-gray-900">
                                        <h3>{item.name}</h3>
                                        <p className="ml-4">₹{(item.price * item.quantity).toFixed(2)}</p>
                                    </div>
                                    {/* Stock Error Message */}
                                    {isExceedingStock && (
                                        <div className="text-xs text-red-600 font-bold mt-1">
                                            Only {item.stock} left in stock!
                                        </div>
                                    )}
                                    <div className="flex-1 flex items-end justify-between text-sm mt-2">
                                        <div className="flex items-center border rounded-md bg-white">
                                            <button onClick={() => onUpdateQuantity(item.id, -1)} className="px-2 py-1 hover:bg-gray-100">-</button>
                                            <span className="px-2 font-mono">{item.quantity}</span>
                                            <button onClick={() => onUpdateQuantity(item.id, 1)} className="px-2 py-1 hover:bg-gray-100">+</button>
                                        </div>
                                        <button onClick={() => onUpdateQuantity(item.id, -item.quantity)} type="button" className="font-medium text-emerald-600 hover:text-emerald-500">Remove</button>
                                    </div>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
          </div>

          {cartItems.length > 0 && (
            <div className="border-t border-gray-200 py-6 px-4 sm:px-6 bg-gray-50">
              
              {multiShop && (
                  <div className="mb-4 bg-yellow-50 border-l-4 border-yellow-400 p-4">
                      <div className="flex">
                          <AlertTriangle className="h-5 w-5 text-yellow-400" />
                          <div className="ml-3">
                              <p className="text-sm text-yellow-700">
                                  Multiple shops detected. Please verify cart.
                              </p>
                          </div>
                      </div>
                  </div>
              )}

              {/* Delivery Info Block */}
              {!multiShop && shopIds.length === 1 && (
                 <div className="mb-4 bg-white border border-emerald-100 rounded-lg p-4 shadow-sm">
                     <div className="flex justify-between items-center mb-1">
                         <span className="text-sm font-medium text-gray-500">Delivery to:</span>
                         <span className="text-xs font-medium text-gray-900 truncate max-w-[150px]">{addressDetails?.fullAddress || 'N/A'}</span>
                     </div>
                     <div className="flex justify-between items-center mb-1">
                         <span className="text-sm font-medium text-gray-500">Distance:</span>
                         <span className="text-sm font-bold text-gray-900">{deliveryInfo.distance} km</span>
                     </div>
                     <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100">
                         <div className="flex items-center text-emerald-700">
                             <Clock className="h-4 w-4 mr-1" />
                             <span className="text-sm font-bold">Estimated Delivery:</span>
                         </div>
                         <span className="text-lg font-bold text-emerald-700">{deliveryInfo.time} mins</span>
                     </div>
                 </div>
              )}

              <div className="flex justify-between text-base font-medium text-gray-900 mb-4">
                <p>Subtotal</p>
                <p>₹{total.toFixed(2)}</p>
              </div>
              
              {orderStatus === 'error' && (
                  <div className="mb-4 p-2 bg-red-100 text-red-700 text-sm rounded border border-red-200">
                      {statusMessage}
                  </div>
              )}
               {orderStatus === 'success' && (
                  <div className="mb-4 p-2 bg-green-100 text-green-700 text-sm rounded border border-green-200">
                      {statusMessage}
                  </div>
              )}

              {/* Checkout Button */}
              <button
                disabled={multiShop || isOrdering || cartItems.length === 0 || hasStockErrors}
                onClick={handleCheckout}
                className={`w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white transition-all ${
                    multiShop || isOrdering || hasStockErrors
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {hasStockErrors ? 'Reduce Quantity to Proceed' : isOrdering ? 'Processing...' : `Place Order • ₹${total.toFixed(2)}`}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
