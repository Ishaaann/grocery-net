
import React, { useState, useEffect } from 'react';
import { User, Item, Order, Shop, Location } from '../types';
import { mockServer } from '../services/mockServer';
import { ItemCard } from './ItemCard';
import { Package, Plus, DollarSign, Activity, Settings, ClipboardList, TrendingUp, MapPin, Truck, CheckCircle, Clock, Upload, ImageIcon, AlertTriangle, Store, Navigation, Search, Loader2 } from 'lucide-react';

interface OwnerDashboardProps {
  user: User;
  selectedShopId?: string; // Prop for the currently active shop
}

export const OwnerDashboard: React.FC<OwnerDashboardProps> = ({ user, selectedShopId }) => {
  const [items, setItems] = useState<Item[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [shop, setShop] = useState<Shop | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'inventory' | 'orders' | 'settings'>('inventory');
  const [orderFilter, setOrderFilter] = useState<string>('ALL');
  
  // Delete Confirmation State
  const [itemToDelete, setItemToDelete] = useState<Item | null>(null);

  // Form State for Items
  const [formData, setFormData] = useState<Partial<Item>>({});

  // Form State for Shop Settings
  const [shopSettings, setShopSettings] = useState<{
    name: string;
    description: string;
    imageUrl: string;
    location: Location | null;
  }>({ name: '', description: '', imageUrl: '', location: null });
  const [locationQuery, setLocationQuery] = useState('');
  const [isSearchingMap, setIsSearchingMap] = useState(false);
  const [shopUpdateLoading, setShopUpdateLoading] = useState(false);


  useEffect(() => {
    loadData();
  }, [selectedShopId, activeTab]);

  const loadData = async () => {
    if (!selectedShopId) return;
    setLoading(true);
    
    const [itemsRes, ordersRes, shopsRes] = await Promise.all([
      mockServer.getItems(selectedShopId),
      mockServer.getShopOrders(user.id),
      mockServer.getShops()
    ]);
    
    if (itemsRes.success && itemsRes.data) setItems(itemsRes.data);
    
    // Filter orders for the selected shop only
    if (ordersRes.success && ordersRes.data) {
        setOrders(ordersRes.data.filter(o => o.shopId === selectedShopId));
    }

    if (shopsRes.success && shopsRes.data) {
      const currentShop = shopsRes.data.find(s => s.id === selectedShopId);
      setShop(currentShop);
      if (currentShop) {
          setShopSettings({
              name: currentShop.name,
              description: currentShop.description,
              imageUrl: currentShop.imageUrl || '',
              location: currentShop.location
          });
      }
    }
    
    setLoading(false);
  };

  const handleEdit = (item: Item) => {
    setEditingItem(item);
    setFormData(item);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    if (!selectedShopId) return;
    setEditingItem(null);
    setFormData({
        shopId: selectedShopId,
        imageUrl: '', 
        category: 'Produce'
    });
    setIsModalOpen(true);
  };

  const handleDelete = (item: Item) => {
    setItemToDelete(item);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    await mockServer.deleteItem(user.id, itemToDelete.id);
    setItemToDelete(null);
    loadData();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.stock || !selectedShopId) return;

    const finalImage = formData.imageUrl || `https://picsum.photos/seed/${Date.now()}/200/200`;

    const itemToSave: Item = {
        id: editingItem ? editingItem.id : `item_${selectedShopId}_${Date.now()}`,
        shopId: selectedShopId,
        name: formData.name!,
        description: formData.description || '',
        price: Number(formData.price),
        stock: Number(formData.stock),
        imageUrl: finalImage,
        category: formData.category || 'General'
    };

    await mockServer.updateItem(user.id, itemToSave);
    setIsModalOpen(false);
    loadData();
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
      await mockServer.updateOrderStatus(orderId, status);
      loadData();
  };

  const openRouteMap = (order: Order) => {
      // If we have shop location and order delivery location, construct a google maps directions URL
      if (shop?.location && order.deliveryLocation) {
          const origin = `${shop.location.lat},${shop.location.lng}`;
          const dest = `${order.deliveryLocation.lat},${order.deliveryLocation.lng}`;
          const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}`;
          window.open(url, '_blank');
      } else {
          alert("Location data invalid.");
      }
  };

  // --- Settings Logic ---
  const handleLocationSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!locationQuery) return;
    
    setIsSearchingMap(true);
    // Simulate API delay
    setTimeout(() => {
        setIsSearchingMap(false);
        // Generate a mock location based on the search, but keep it roughly in Delhi for the demo logic to hold up
        setShopSettings(prev => ({
            ...prev,
            location: {
                lat: 28.6139 + (Math.random() - 0.5) * 0.1,
                lng: 77.2090 + (Math.random() - 0.5) * 0.1
            }
        }));
    }, 1000);
  };

  const handleUpdateShop = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedShopId || !shopSettings.name || !shopSettings.location) return;

      setShopUpdateLoading(true);
      await mockServer.updateShop(user.id, selectedShopId, {
          name: shopSettings.name,
          description: shopSettings.description,
          location: shopSettings.location,
          // imageUrl: shopSettings.imageUrl // Not updating image here for brevity, but could be added
      });
      setShopUpdateLoading(false);
      alert("Shop settings updated successfully!");
      loadData();
  };


  if (!selectedShopId) {
      return (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <Store className="h-12 w-12 mb-2 opacity-50" />
              <p>Please select or create a shop to get started.</p>
          </div>
      );
  }

  if (loading) return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-700"></div></div>;

  const filteredOrders = orders.filter(o => orderFilter === 'ALL' || o.status === orderFilter);

  // Stats
  const totalItems = items.length;
  const lowStockItems = items.filter(i => i.stock < 10).length;

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-200 p-1 rounded-lg shrink-0">
        <button 
          onClick={() => setActiveTab('inventory')}
          className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'inventory' ? 'bg-white shadow text-emerald-700' : 'text-gray-600 hover:bg-gray-300'}`}
        >
          <Package className="h-4 w-4" />
          <span>Inventory</span>
        </button>
        <button 
          onClick={() => setActiveTab('orders')}
          className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'orders' ? 'bg-white shadow text-emerald-700' : 'text-gray-600 hover:bg-gray-300'}`}
        >
          <ClipboardList className="h-4 w-4" />
          <span>Orders</span>
          {orders.length > 0 && <span className="bg-red-500 text-white text-xs rounded-full px-1.5">{orders.length}</span>}
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'settings' ? 'bg-white shadow text-emerald-700' : 'text-gray-600 hover:bg-gray-300'}`}
        >
          <Settings className="h-4 w-4" />
          <span>Settings</span>
        </button>
      </div>

      {activeTab === 'inventory' && (
        <div className="space-y-6 flex-1 overflow-y-auto pb-20 pr-1">
             
             {/* Summary Cards */}
             <div className="grid grid-cols-2 gap-4">
                 <div className="bg-emerald-600 rounded-lg p-4 text-white shadow-md relative overflow-hidden">
                     <div className="absolute right-0 top-0 opacity-10 transform translate-x-2 -translate-y-2">
                         <Package className="h-16 w-16" />
                     </div>
                     <p className="text-emerald-100 text-xs font-medium uppercase tracking-wider">Total Items</p>
                     <p className="text-3xl font-bold mt-1">{totalItems}</p>
                 </div>
                 <div className="bg-white rounded-lg p-4 shadow-md border border-gray-100 relative overflow-hidden">
                     <div className="absolute right-2 top-2">
                         <AlertTriangle className={`h-5 w-5 ${lowStockItems > 0 ? 'text-red-500' : 'text-gray-300'}`} />
                     </div>
                     <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Low Stock</p>
                     <p className={`text-3xl font-bold mt-1 ${lowStockItems > 0 ? 'text-red-600' : 'text-gray-800'}`}>{lowStockItems}</p>
                 </div>
             </div>

             {/* Stock Graph */}
             <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <div className="flex items-center space-x-2 mb-4">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                  <h3 className="font-bold text-gray-800">Live Stock Levels</h3>
                </div>
                <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                  {items.map(item => {
                    const percentage = Math.min(100, (item.stock / 50) * 100); 
                    let barColor = 'bg-emerald-500';
                    if (item.stock < 10) barColor = 'bg-red-500';
                    else if (item.stock < 20) barColor = 'bg-yellow-500';

                    return (
                      <div key={item.id} className="flex items-center text-xs">
                        <div className="w-24 truncate font-medium text-gray-600" title={item.name}>{item.name}</div>
                        <div className="flex-1 mx-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${barColor} transition-all duration-500`} 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <div className="w-8 text-right font-mono text-gray-500">{item.stock}</div>
                      </div>
                    );
                  })}
                </div>
             </div>

            <div className="flex justify-between items-center pt-2">
                <h2 className="text-lg font-bold text-gray-800">Catalog</h2>
                <button 
                    onClick={handleAddNew}
                    className="flex items-center space-x-2 bg-emerald-600 text-white px-3 py-1.5 rounded-md hover:bg-emerald-700 transition text-sm shadow-sm"
                >
                    <Plus className="h-4 w-4" />
                    <span>Add Item</span>
                </button>
            </div>

            <div className="space-y-3">
                {items.map(item => (
                    <ItemCard 
                        key={item.id} 
                        item={item} 
                        role={user.role} 
                        isOwner={true}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        variant="horizontal"
                    />
                ))}
                {items.length === 0 && (
                    <div className="text-center py-8 text-gray-400 text-sm">
                        No items in inventory. Add your first item!
                    </div>
                )}
            </div>
        </div>
      )}

      {activeTab === 'orders' && (
         <div className="space-y-4 flex-1 overflow-y-auto pb-20 pr-1">
            <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
              {['ALL', 'PENDING', 'CONFIRMED', 'DELIVERED'].map(status => (
                <button
                  key={status}
                  onClick={() => setOrderFilter(status)}
                  className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap border ${
                    orderFilter === status 
                    ? 'bg-emerald-600 text-white border-emerald-600' 
                    : 'bg-white text-gray-600 border-gray-300'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            {filteredOrders.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <ClipboardList className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p>No {orderFilter !== 'ALL' ? orderFilter.toLowerCase() : ''} orders found.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map(order => (
                  <div key={order.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex justify-between items-start border-b border-gray-100 pb-2 mb-2">
                       <div>
                          <span className="text-xs font-bold text-gray-500">Order #{order.id.slice(-6)}</span>
                          <div className="text-sm font-semibold text-gray-900 mt-1">
                             {new Date(order.timestamp).toLocaleTimeString()} · {new Date(order.timestamp).toLocaleDateString()}
                          </div>
                       </div>
                       <span className={`px-2 py-1 rounded text-xs font-bold ${
                         order.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-700' :
                         order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                         'bg-gray-100 text-gray-700'
                       }`}>
                         {order.status}
                       </span>
                    </div>

                    <div className="space-y-2 mb-3">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                             <span className="text-gray-600">{item.quantity}x {item.name}</span>
                             <span className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-gray-100 mb-3">
                        <span className="font-bold text-gray-700">Total</span>
                        <span className="font-bold text-emerald-700 text-lg">₹{order.totalAmount.toFixed(2)}</span>
                    </div>

                    <div className="bg-gray-50 rounded p-2 flex items-start space-x-2 text-xs text-gray-600 mb-3">
                        <MapPin className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                        <div className="flex-1">
                           <p className="font-semibold text-gray-800">Customer Location</p>
                           <p>Lat: {order.deliveryLocation.lat.toFixed(4)}, Lng: {order.deliveryLocation.lng.toFixed(4)}</p>
                           {order.deliveryAddressDetails && (
                               <p className="mt-1 font-medium">{order.deliveryAddressDetails.fullAddress}</p>
                           )}
                           <p className="mt-1 text-emerald-600 flex items-center">
                             <Truck className="h-3 w-3 mr-1" /> 
                             {order.deliveryDistanceKm} km ({order.estimatedDeliveryMinutes} mins)
                           </p>
                        </div>
                        
                        <button 
                            onClick={() => openRouteMap(order)}
                            className="bg-blue-600 text-white p-1.5 rounded shadow hover:bg-blue-700 transition-colors flex flex-col items-center justify-center space-y-0.5 w-16"
                        >
                            <Navigation className="h-4 w-4" />
                            <span className="text-[9px] font-bold">Route</span>
                        </button>
                    </div>

                    {/* Order Actions */}
                    <div className="flex space-x-2">
                        {order.status === 'PENDING' && (
                            <button 
                                onClick={() => updateOrderStatus(order.id, 'CONFIRMED')}
                                className="flex-1 bg-emerald-600 text-white py-2 rounded font-bold text-sm hover:bg-emerald-700 transition"
                            >
                                Confirm Order
                            </button>
                        )}
                        {order.status === 'CONFIRMED' && (
                             <button 
                                onClick={() => updateOrderStatus(order.id, 'DELIVERED')}
                                className="flex-1 bg-green-600 text-white py-2 rounded font-bold text-sm hover:bg-green-700 transition"
                            >
                                Mark Delivered
                            </button>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            )}
         </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
          <div className="flex-1 overflow-y-auto pb-20 p-4 bg-white rounded-lg shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                  <Settings className="h-6 w-6 mr-2 text-emerald-600" />
                  Shop Settings
              </h2>
              
              <form onSubmit={handleUpdateShop} className="space-y-6">
                  <div>
                      <label className="block text-sm font-medium text-gray-700">Store Name</label>
                      <input 
                          type="text"
                          value={shopSettings.name}
                          onChange={e => setShopSettings({...shopSettings, name: e.target.value})}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 border p-2 bg-white text-gray-900"
                      />
                  </div>

                  <div>
                      <label className="block text-sm font-medium text-gray-700">Description</label>
                      <textarea 
                          rows={3}
                          value={shopSettings.description}
                          onChange={e => setShopSettings({...shopSettings, description: e.target.value})}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 border p-2 bg-white text-gray-900"
                      />
                  </div>

                  {/* Location Setting */}
                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Shop Location</label>
                      <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                          {/* Simulated Map Visual */}
                          <div className="relative w-full h-40 bg-blue-50 rounded-md overflow-hidden mb-3 group border border-blue-100">
                                <div 
                                  className="absolute inset-0 opacity-20"
                                  style={{ backgroundImage: 'linear-gradient(#cbd5e1 1px, transparent 1px), linear-gradient(90deg, #cbd5e1 1px, transparent 1px)', backgroundSize: '20px 20px' }}
                                ></div>
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    {isSearchingMap ? (
                                        <div className="bg-white/90 p-2 rounded-full shadow-lg flex items-center space-x-2">
                                            <Loader2 className="animate-spin h-4 w-4 text-emerald-600" />
                                            <span className="text-xs font-bold text-gray-600">Searching...</span>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center">
                                            <MapPin className="h-8 w-8 text-red-600 drop-shadow-md" fill="currentColor" />
                                            {shopSettings.location && (
                                                <span className="bg-white px-2 py-0.5 rounded shadow text-[10px] font-bold mt-1">
                                                    {shopSettings.location.lat.toFixed(4)}, {shopSettings.location.lng.toFixed(4)}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                          </div>

                          {/* Search Input */}
                          <div className="flex space-x-2">
                              <div className="relative flex-grow">
                                  <Search className="h-4 w-4 text-gray-400 absolute left-3 top-3" />
                                  <input 
                                      type="text" 
                                      placeholder="Search new address..." 
                                      className="block w-full pl-9 text-sm rounded-md border-gray-300 py-2 border outline-none focus:border-emerald-500"
                                      value={locationQuery}
                                      onChange={(e) => setLocationQuery(e.target.value)}
                                  />
                              </div>
                              <button 
                                  type="button"
                                  onClick={handleLocationSearch}
                                  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-bold shadow-sm hover:bg-blue-700 transition-colors"
                              >
                                  Set
                              </button>
                          </div>
                      </div>
                  </div>

                  <div className="pt-4">
                      <button 
                          type="submit"
                          disabled={shopUpdateLoading}
                          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors disabled:opacity-50"
                      >
                          {shopUpdateLoading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Save Changes'}
                      </button>
                  </div>
              </form>
          </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6 animate-in zoom-in-95 duration-200">
                <div className="flex items-center space-x-3 text-red-600 mb-4">
                    <div className="bg-red-100 p-2 rounded-full">
                        <AlertTriangle className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Delete Item?</h3>
                </div>
                <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                    Are you sure you want to delete <span className="font-bold text-gray-900">{itemToDelete.name}</span>? 
                    This action cannot be undone and will remove it from your inventory.
                </p>
                <div className="flex justify-end space-x-3">
                    <button 
                        onClick={() => setItemToDelete(null)}
                        className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium text-sm transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={confirmDelete}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm shadow-sm transition-colors"
                    >
                        Delete Item
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Modal for Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
                <h3 className="text-lg font-bold mb-4">{editingItem ? 'Edit Item' : 'Add New Item'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    
                    <div className="flex justify-center mb-4">
                        <div className="relative group">
                            <div className="w-32 h-32 bg-gray-100 rounded-lg overflow-hidden border border-gray-300 flex items-center justify-center">
                                {formData.imageUrl ? (
                                    <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <ImageIcon className="h-10 w-10 text-gray-400" />
                                )}
                            </div>
                            <label className="absolute bottom-0 right-0 bg-emerald-600 text-white p-2 rounded-full shadow-lg cursor-pointer hover:bg-emerald-700 transition-colors">
                                <Upload className="h-4 w-4" />
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    className="hidden" 
                                    onChange={handleImageUpload}
                                />
                            </label>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Item Name</label>
                        <input 
                            type="text" required 
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 border p-2 bg-white text-gray-900"
                            value={formData.name || ''}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Category</label>
                        <select 
                             className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 border p-2 bg-white text-gray-900"
                             value={formData.category || 'Produce'}
                             onChange={e => setFormData({...formData, category: e.target.value})}
                        >
                            <option value="Produce">Produce</option>
                            <option value="Dairy">Dairy</option>
                            <option value="Bakery">Bakery</option>
                            <option value="Snacks">Snacks</option>
                            <option value="Beverages">Beverages</option>
                            <option value="Pantry">Pantry</option>
                            <option value="General">General</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Price (₹)</label>
                            <input 
                                type="number" step="0.01" required min="0"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 border p-2 bg-white text-gray-900"
                                value={formData.price || ''}
                                onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Stock Qty</label>
                            <input 
                                type="number" required min="0"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 border p-2 bg-white text-gray-900"
                                value={formData.stock || ''}
                                onChange={e => setFormData({...formData, stock: parseInt(e.target.value)})}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea 
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 border p-2 bg-white text-gray-900"
                            rows={3}
                            value={formData.description || ''}
                            onChange={e => setFormData({...formData, description: e.target.value})}
                        />
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700">Save Item</button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};
