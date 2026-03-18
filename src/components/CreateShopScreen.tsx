
import React, { useState } from 'react';
import { User, CreateShopPayload, Location } from '../types';
import { mockServer } from '../services/mockServer';
import { ArrowLeft, Store, Upload, MapPin, Search, Loader2 } from 'lucide-react';

interface CreateShopScreenProps {
  user: User;
  onBack: () => void;
  onSuccess: (newShopId: string) => void;
}

export const CreateShopScreen: React.FC<CreateShopScreenProps> = ({ user, onBack, onSuccess }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [loading, setLoading] = useState(false);

  // Map / Location State
  const [locationQuery, setLocationQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [isSearchingMap, setIsSearchingMap] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLocationSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!locationQuery) return;
    
    setIsSearchingMap(true);
    // Simulate API delay
    setTimeout(() => {
        setIsSearchingMap(false);
        // Generate a mock location based on the search
        setSelectedLocation({
            lat: 40.7128 + (Math.random() - 0.5) * 0.1,
            lng: -74.0060 + (Math.random() - 0.5) * 0.1
        });
    }, 1000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!name || !description || !selectedLocation) return;

      setLoading(true);
      const payload: CreateShopPayload = {
          ownerId: user.id,
          name,
          description,
          location: selectedLocation,
          imageUrl: image
      };

      const res = await mockServer.createShop(payload);
      if (res.success && res.data) {
          onSuccess(res.data.id);
      } else {
          alert('Failed to create shop');
          setLoading(false);
      }
  };

  return (
    <div className="h-full flex flex-col bg-white overflow-y-auto">
      {/* Header */}
      <div className="px-6 pt-8 pb-4 border-b border-gray-100 bg-white sticky top-0 z-20">
        <button onClick={onBack} className="flex items-center text-gray-500 hover:text-emerald-600 transition-colors mb-4">
          <ArrowLeft className="h-5 w-5 mr-1" />
          <span>Back</span>
        </button>
        <h2 className="text-2xl font-bold text-gray-900">Setup New Store</h2>
        <p className="text-gray-500 text-sm">Expand your business with a new location.</p>
      </div>

      <div className="flex-1 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Shop Image */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Store Cover Image</label>
                <div className="relative group">
                    <div className="w-full h-40 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center overflow-hidden">
                        {image ? (
                            <img src={image} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                            <div className="text-gray-400 flex flex-col items-center">
                                <Store className="h-10 w-10 mb-2" />
                                <span className="text-xs">Upload Storefront Photo</span>
                            </div>
                        )}
                    </div>
                    <label className="absolute bottom-3 right-3 bg-emerald-600 text-white p-3 rounded-full shadow-lg cursor-pointer hover:bg-emerald-700 transition-colors">
                        <Upload className="h-5 w-5" />
                        <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={handleImageUpload}
                        />
                    </label>
                </div>
            </div>

            {/* Shop Name */}
            <div>
                <label className="block text-sm font-medium text-gray-700">Store Name</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Store className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-3 border outline-none"
                        placeholder="e.g. Green Valley Organics"
                    />
                </div>
            </div>

            {/* Location Search (Simulated Google Maps) */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Store Location</label>
                <div className="bg-gray-100 p-1 rounded-lg border border-gray-300">
                    {/* Map Visual */}
                    <div className="relative w-full h-48 bg-blue-50 rounded-md overflow-hidden mb-2 group">
                         {/* Fake Map Grid */}
                        <div 
                          className="absolute inset-0 opacity-20"
                          style={{ backgroundImage: 'linear-gradient(#cbd5e1 1px, transparent 1px), linear-gradient(90deg, #cbd5e1 1px, transparent 1px)', backgroundSize: '20px 20px' }}
                        ></div>
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            {isSearchingMap ? (
                                <div className="bg-white/80 p-2 rounded-full shadow-lg flex items-center space-x-2">
                                    <Loader2 className="animate-spin h-4 w-4 text-emerald-600" />
                                    <span className="text-xs font-bold text-gray-600">Searching Maps...</span>
                                </div>
                            ) : selectedLocation ? (
                                <div className="flex flex-col items-center animate-bounce">
                                    <MapPin className="h-10 w-10 text-red-600 drop-shadow-md" fill="currentColor" />
                                    <span className="bg-white px-2 py-0.5 rounded shadow text-[10px] font-bold mt-1">{locationQuery}</span>
                                </div>
                            ) : (
                                <span className="text-gray-400 text-xs font-medium">Search to place pin</span>
                            )}
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="flex space-x-2">
                        <div className="relative flex-grow">
                             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-gray-400" />
                            </div>
                            <input 
                                type="text" 
                                placeholder="Search address (e.g. 123 Main St)..." 
                                className="block w-full pl-9 text-sm rounded-md border-gray-300 py-2 border outline-none focus:border-emerald-500"
                                value={locationQuery}
                                onChange={(e) => setLocationQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleLocationSearch(e)}
                            />
                        </div>
                        <button 
                            type="button"
                            onClick={handleLocationSearch}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-bold shadow-sm hover:bg-blue-700 transition-colors"
                        >
                            Find
                        </button>
                    </div>
                </div>
                {selectedLocation && (
                    <p className="mt-1 text-xs text-green-600 font-medium flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        Location confirmed: {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
                    </p>
                )}
            </div>

            {/* Description */}
            <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                    required
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="shadow-sm focus:ring-emerald-500 focus:border-emerald-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md p-3 outline-none"
                    placeholder="Tell customers what you sell..."
                />
            </div>

            <button
                type="submit"
                disabled={loading || !selectedLocation}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white transition-colors ${
                    loading || !selectedLocation 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500'
                }`}
            >
                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Launch Store'}
            </button>
        </form>
      </div>
    </div>
  );
};
