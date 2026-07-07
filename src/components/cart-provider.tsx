'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export interface CartItem {
  productId: string;
  name: string;
  price: number;       // Precio base original
  discount: number;    // Porcentaje de descuento, ej. 15 para 15%
  quantity: number;
  imageUrl: string;
  maxStock: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  isLoaded: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Cargar carrito de localStorage
  useEffect(() => {
    const storedCart = localStorage.getItem('cart_3d');
    if (storedCart) {
      try {
        setCartItems(JSON.parse(storedCart));
      } catch (error) {
        console.error('Error al inicializar el carrito desde localStorage:', error);
      }
    }
    setIsLoaded(true);
  }, []);

  // Guardar cambios en localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('cart_3d', JSON.stringify(cartItems));
    }
  }, [cartItems, isLoaded]);

  const addToCart = (product: Omit<CartItem, 'quantity'>, quantity: number) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.productId === product.productId);
      
      if (existingItem) {
        // Validar no sobrepasar el stock disponible
        const newQuantity = Math.min(existingItem.quantity + quantity, product.maxStock);
        return prevItems.map((item) =>
          item.productId === product.productId
            ? { ...item, quantity: newQuantity }
            : item
        );
      }
      
      return [...prevItems, { ...product, quantity: Math.min(quantity, product.maxStock) }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.productId !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setCartItems((prevItems) =>
      prevItems.map((item) => {
        if (item.productId === productId) {
          const newQty = Math.max(1, Math.min(quantity, item.maxStock));
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // Calcular el total aplicando descuentos
  const cartTotal = cartItems.reduce((acc, item) => {
    const finalPrice = item.price * (1 - item.discount / 100);
    return acc + finalPrice * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
        isLoaded,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe utilizarse dentro de un CartProvider');
  }
  return context;
}
