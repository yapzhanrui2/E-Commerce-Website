'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Auth from './Auth';
import { useCart } from '@/context/CartContext';

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
}

export default function Header() {
  const { cartCount, cartItems } = useCart();
  const [showAuth, setShowAuth] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showCartPreview, setShowCartPreview] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const cartPreviewRef = useRef<HTMLDivElement>(null);
  const cartPreviewTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          // If token is invalid, remove it
          localStorage.removeItem('token');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        localStorage.removeItem('token');
        setUser(null);
        window.location.reload();
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleCartMouseEnter = () => {
    if (cartPreviewTimeoutRef.current) {
      clearTimeout(cartPreviewTimeoutRef.current);
    }
    setShowCartPreview(true);
  };

  const handleCartMouseLeave = () => {
    cartPreviewTimeoutRef.current = setTimeout(() => {
      setShowCartPreview(false);
    }, 300);
  };

  const handlePreviewMouseEnter = () => {
    if (cartPreviewTimeoutRef.current) {
      clearTimeout(cartPreviewTimeoutRef.current);
    }
  };

  const handlePreviewMouseLeave = () => {
    setShowCartPreview(false);
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = item.product?.price || item.Product?.price || 0;
      return total + (price * item.quantity);
    }, 0);
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-gray-900">
              Coffee Bean
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {!loading && (
              <>
                {user ? (
                  <div className="flex items-center space-x-4">
                    <div 
                      className="relative"
                      onMouseEnter={handleCartMouseEnter}
                      onMouseLeave={handleCartMouseLeave}
                    >
                      <Link href="/cart" className="text-gray-600 hover:text-gray-900 relative">
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                          />
                        </svg>
                        {cartCount > 0 && (
                          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">
                            {cartCount}
                          </span>
                        )}
                      </Link>

                      {/* Cart Preview Dropdown */}
                      {showCartPreview && cartCount > 0 && (
                        <div
                          ref={cartPreviewRef}
                          onMouseEnter={handlePreviewMouseEnter}
                          onMouseLeave={handlePreviewMouseLeave}
                          className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg py-4 z-50"
                        >
                          <div className="px-4 py-2 border-b border-gray-100">
                            <h3 className="text-sm font-semibold text-gray-900">Shopping Cart ({cartCount} items)</h3>
                          </div>
                          <div className="max-h-96 overflow-auto">
                            {cartItems.map((item) => (
                              <div key={item.id} className="px-4 py-3 hover:bg-gray-50 flex items-center gap-3">
                                <div className="relative h-16 w-16 flex-shrink-0">
                                  <Image
                                    src={(item.product?.image || item.Product?.image) || '/placeholder-product.jpg'}
                                    alt={(item.product?.name || item.Product?.name) || 'Product'}
                                    fill
                                    className="object-cover rounded"
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {(item.product?.name || item.Product?.name) || 'Product'}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    Qty: {item.quantity}
                                  </p>
                                  <p className="text-sm font-medium text-gray-900">
                                    ${((item.product?.price || item.Product?.price || 0) * item.quantity).toFixed(2)}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="px-4 py-3 border-t border-gray-100">
                            <div className="flex justify-between text-sm font-medium text-gray-900 mb-4">
                              <span>Total</span>
                              <span>${calculateTotal().toFixed(2)}</span>
                            </div>
                            <Link
                              href="/cart"
                              className="block w-full bg-blue-600 text-white text-center px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                            >
                              View Cart
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="relative" ref={dropdownRef}>
                      <button 
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex items-center space-x-1 text-gray-600 hover:text-gray-900"
                        onTouchEnd={(e) => {
                          e.preventDefault();
                          setIsDropdownOpen(!isDropdownOpen);
                        }}
                      >
                        <span>{user.username}</span>
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>
                      {isDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1">
                          {user.role === 'admin' && (
                            <Link
                              href="/admin"
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              Admin Dashboard
                            </Link>
                          )}
                          <Link
                            href="/orders"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            My Orders
                          </Link>
                          <button
                            onClick={handleLogout}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Sign Out
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowAuth(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Sign In
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {showAuth && <Auth onClose={() => setShowAuth(false)} />}
    </header>
  );
} 