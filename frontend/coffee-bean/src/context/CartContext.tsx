'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  categories: string[];
}

interface CartItem {
  id: string;
  quantity: number;
  productId: string;
  userId: string;
  Product?: Product; // Backend might send Product with capital P
  product?: Product; // Or with lowercase p
}

interface CartContextType {
  cartCount: number;
  cartItems: CartItem[];
  updateCartCount: () => Promise<void>;
}

interface CartResponse {
  message: string;
  cartItems: CartItem[];
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartCount, setCartCount] = useState(0);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const fetchCartCount = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setCartCount(0);
        setCartItems([]);
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data: CartResponse = await response.json();
        console.log('Cart data received:', data);

        if (!data.cartItems) {
          console.error('Unexpected cart data format:', data);
          return;
        }

        // Normalize the data structure
        const normalizedCartItems = data.cartItems.map(item => ({
          ...item,
          product: item.Product || item.product // Handle both cases
        }));

        setCartItems(normalizedCartItems);
        const totalItems = normalizedCartItems.reduce((sum, item) => {
          console.log('Item quantity:', item.quantity);
          return sum + item.quantity;
        }, 0);

        console.log('Setting cart count to:', totalItems);
        setCartCount(totalItems);
      } else if (response.status === 401) {
        console.log('Unauthorized access to cart, removing token');
        localStorage.removeItem('token');
        setCartCount(0);
        setCartItems([]);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  };

  useEffect(() => {
    console.log('CartProvider mounted, fetching initial cart count');
    fetchCartCount();
  }, []);

  const updateCartCount = async () => {
    console.log('Updating cart count...');
    await fetchCartCount();
  };

  return (
    <CartContext.Provider value={{ cartCount, cartItems, updateCartCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
} 