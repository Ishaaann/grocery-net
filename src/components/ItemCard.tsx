
import React from 'react';
import { Item, UserRole } from '../types';
import { Plus, Pencil, Trash2, ShoppingCart } from 'lucide-react';

interface ItemCardProps {
  item: Item;
  role: UserRole;
  onAdd?: (item: Item) => void;
  onEdit?: (item: Item) => void;
  onDelete?: (item: Item) => void;
  isOwner?: boolean;
  variant?: 'vertical' | 'horizontal' | 'compact';
}

export const ItemCard: React.FC<ItemCardProps> = ({ 
  item, 
  role, 
  onAdd, 
  onEdit, 
  onDelete, 
  isOwner, 
  variant = 'vertical' 
}) => {
  const isOutOfStock = item.stock <= 0;
  
  // Variant styles
  if (variant === 'compact') {
      return (
        <div className="bg-white rounded-lg p-2 border border-gray-100 flex items-center shadow-sm mb-2">
            <div className="relative h-16 w-16 bg-gray-100 rounded-md overflow-hidden shrink-0">
                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                {isOutOfStock && (
                     <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="text-[10px] font-bold text-white bg-red-600 px-1 rounded">Out</span>
                     </div>
                )}
            </div>
            
            <div className="ml-3 flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 text-sm truncate">{item.name}</h4>
                <p className="text-xs text-gray-500 truncate">{item.description}</p>
                <div className="flex items-center space-x-2 mt-1">
                    <span className="font-bold text-emerald-700 text-sm">₹{item.price.toFixed(2)}</span>
                    <span className="text-[10px] text-gray-400">Stock: {item.stock}</span>
                </div>
            </div>

            {role === UserRole.CUSTOMER && (
                <button
                    onClick={() => onAdd && onAdd(item)}
                    // Removed disabled={isOutOfStock} to allow adding even if out of stock
                    className={`ml-2 p-2 rounded-full transition-colors ${
                        isOutOfStock 
                        ? 'bg-red-50 text-red-600 hover:bg-red-100' // Visual warning style
                        : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white'
                    }`}
                >
                    <Plus className="h-5 w-5" />
                </button>
            )}
        </div>
      );
  }

  const isHorizontal = variant === 'horizontal';

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex hover:shadow-md transition-shadow ${isHorizontal ? 'flex-row h-32' : 'flex-col'}`}>
      <div className={`relative bg-gray-100 ${isHorizontal ? 'w-32 h-full' : 'h-48 w-full'}`}>
        <img 
          src={item.imageUrl} 
          alt={item.name} 
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {isOutOfStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className={`bg-red-600 text-white rounded-full font-semibold ${isHorizontal ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1'}`}>
                  {isHorizontal ? 'Out' : 'Out of Stock'}
                </span>
            </div>
        )}
        {!isHorizontal && (
          <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded text-xs font-bold text-gray-700">
              Stock: {item.stock}
          </div>
        )}
      </div>
      
      <div className={`p-4 flex-grow flex flex-col ${isHorizontal ? 'justify-between py-2 px-4' : ''}`}>
        <div className={isHorizontal ? "flex justify-between items-start" : "flex justify-between items-start mb-2"}>
            <div>
                <h3 className={`font-semibold text-gray-900 line-clamp-1 ${isHorizontal ? 'text-base' : 'text-lg'}`} title={item.name}>{item.name}</h3>
                <span className="inline-block px-2 py-0.5 rounded text-xs bg-emerald-100 text-emerald-800 mt-1">
                    {item.category}
                </span>
                {isHorizontal && (
                   <span className={`ml-2 text-xs font-bold ${item.stock < 10 ? 'text-red-600' : 'text-gray-500'}`}>
                     Qty: {item.stock}
                   </span>
                )}
            </div>
            <p className={`font-bold text-emerald-700 ${isHorizontal ? 'text-base' : 'text-lg'}`}>₹{item.price.toFixed(2)}</p>
        </div>
        
        {!isHorizontal && (
            <p className="text-gray-500 text-sm mb-4 line-clamp-2 flex-grow">{item.description}</p>
        )}
        
        <div className={isHorizontal ? "mt-1" : "mt-auto pt-4 border-t border-gray-100"}>
            {role === UserRole.CUSTOMER ? (
                <button
                    onClick={() => onAdd && onAdd(item)}
                    // Removed disabled check to allow adding to cart freely
                    className={`w-full flex items-center justify-center space-x-2 rounded-md text-sm font-medium transition-colors ${
                        isOutOfStock 
                        ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                        : 'bg-emerald-600 text-white hover:bg-emerald-700'
                    } ${isHorizontal ? 'py-1.5' : 'py-2 px-4'}`}
                >
                    <Plus className="h-4 w-4" />
                    <span>{isOutOfStock ? 'Add (OOS)' : 'Add'}</span>
                </button>
            ) : isOwner ? (
                <div className="flex space-x-2 justify-end">
                    <button
                        onClick={() => onEdit && onEdit(item)}
                        className={`flex items-center justify-center space-x-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 ${isHorizontal ? 'px-3 py-1' : 'flex-1 py-2 px-3'}`}
                    >
                        <Pencil className="h-3 w-3" />
                        {!isHorizontal && <span>Edit</span>}
                    </button>
                    <button
                        onClick={() => onDelete && onDelete(item)}
                        className={`flex items-center justify-center border border-red-200 rounded-md text-red-600 hover:bg-red-50 ${isHorizontal ? 'px-3 py-1' : 'flex-none p-2'}`}
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            ) : null}
        </div>
      </div>
    </div>
  );
};
