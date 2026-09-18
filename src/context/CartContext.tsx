/**
 * Costa Textil — Contexto de Solicitud de Pedido (Carrito de Metros)
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { OrderItem, Product } from '../types';

interface CartContextType {
  items: OrderItem[];
  addItem: (product: Product, meters?: number, notes?: string) => void;
  updateMeters: (productId: string, meters: number) => void;
  updateNotes: (productId: string, notes: string) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  totalMeters: number;
  totalItems: number;
  hasItem: (productId: string) => boolean;
  getItemMeters: (productId: string) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'costa_textil_cart_v1';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<OrderItem[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (err) {
      console.error("Error al guardar carrito:", err);
    }
  }, [items]);

  const addItem = (product: Product, meters: number = 2, notes: string = '') => {
    setItems(prev => {
      const existing = prev.find(i => i.productId === product.id);
      if (existing) {
        return prev.map(i => 
          i.productId === product.id 
            ? { ...i, meters: Math.round((i.meters + meters) * 10) / 10, notes: notes || i.notes }
            : i
        );
      }
      const newItem: OrderItem = {
        productId: product.id,
        articleCode: product.articleCode,
        name: product.name,
        composition: product.composition,
        color: product.color,
        imageUrl: product.imageUrl,
        meters: Math.max(0.5, meters),
        availabilityStatus: product.availabilityStatus,
        notes
      };
      return [...prev, newItem];
    });
  };

  const updateMeters = (productId: string, meters: number) => {
    if (meters <= 0) {
      removeItem(productId);
      return;
    }
    const cleanMeters = Math.round(meters * 10) / 10;
    setItems(prev => prev.map(i => i.productId === productId ? { ...i, meters: cleanMeters } : i));
  };

  const updateNotes = (productId: string, notes: string) => {
    setItems(prev => prev.map(i => i.productId === productId ? { ...i, notes } : i));
  };

  const removeItem = (productId: string) => {
    setItems(prev => prev.filter(i => i.productId !== productId));
  };

  const clearCart = () => {
    setItems([]);
  };

  const hasItem = (productId: string) => items.some(i => i.productId === productId);

  const getItemMeters = (productId: string) => {
    const item = items.find(i => i.productId === productId);
    return item ? item.meters : 0;
  };

  const totalMeters = items.reduce((acc, item) => acc + item.meters, 0);
  const totalItems = items.length;

  return (
    <CartContext.Provider value={{
      items,
      addItem,
      updateMeters,
      updateNotes,
      removeItem,
      clearCart,
      totalMeters: Math.round(totalMeters * 10) / 10,
      totalItems,
      hasItem,
      getItemMeters
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe ser utilizado dentro de un CartProvider');
  }
  return context;
};
