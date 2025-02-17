'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Auth from './Auth';
import { useCart } from '@/context/CartContext';
import { useTheme } from '@/context/ThemeContext';

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
}

export default function Header() {
  const { cartCount, cartItems } = useCart();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [showAuth, setShowAuth] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showCartPreview, setShowCartPreview] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const cartPreviewRef = useRef<HTMLDivElement>(null);
  const cartPreviewTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    <header className="bg-white/80 dark:bg-[#1D1D1F]/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/80 dark:supports-[backdrop-filter]:bg-[#1D1D1F]/80 sticky top-0 z-50 border-b border-[#E7E7E7] dark:border-[#2D2D2F]">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center h-16 px-6">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-3">
              <Image
                src="/favicon.ico"
                alt="The Coffee Bean Project"
                width={32}
                height={32}
                className="w-8 h-8"
              />
              <span className="text-lg font-medium dark:text-white">The Coffee Bean Project</span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden inline-flex items-center justify-center p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100/50 focus:outline-none"
          >
            <span className="sr-only">Open main menu</span>
            {!isMobileMenuOpen ? (
              <svg className="block h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            ) : (
              <svg className="block h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </button>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-6">
            {/* Dark mode toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#2D2D2F] transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {!loading && (
              <>
                {user ? (
                  <div className="flex items-center space-x-6">
                    <div 
                      className="relative"
                      onMouseEnter={handleCartMouseEnter}
                      onMouseLeave={handleCartMouseLeave}
                    >
                      <Link href="/cart" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white relative p-2 rounded-lg hover:bg-gray-100/50 dark:hover:bg-[#2D2D2F] transition-colors">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                          />
                        </svg>
                        {cartCount > 0 && (
                          <div className="absolute -top-2 -right-2">
                            <div className="bg-[#FF4B4B] text-white text-xs font-medium rounded-full min-w-[15px] h-[15px] flex items-center justify-center px-1 transform translate-y-8 translate-x-3">
                              {cartCount}
                            </div>
                          </div>
                        )}
                      </Link>

                      {/* Cart Preview Dropdown */}
                      {showCartPreview && cartCount > 0 && (
                        <div
                          ref={cartPreviewRef}
                          onMouseEnter={handlePreviewMouseEnter}
                          onMouseLeave={handlePreviewMouseLeave}
                          className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-[#1D1D1F] rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 z-50 overflow-hidden"
                        >
                          <div className="p-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Cart ({cartCount})</h3>
                            <div className="space-y-3 max-h-60 overflow-y-auto">
                              {cartItems.map((item) => (
                                <div key={item.id} className="flex items-center gap-3">
                                  <div className="relative h-16 w-16 flex-shrink-0">
                                    <Image
                                      src={`${process.env.NEXT_PUBLIC_S3_BASE_URL}/products/${item.product?.name || item.Product?.name}.webp`}
                                      alt={item.product?.name || item.Product?.name || 'Product'}
                                      fill
                                      className="object-cover rounded"
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                      {item.product?.name || item.Product?.name}
                                    </h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                      Qty: {item.quantity}
                                    </p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                      ${((item.product?.price || item.Product?.price || 0) * item.quantity).toFixed(2)}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                              <div className="flex justify-between mb-4">
                                <span className="text-sm font-medium text-gray-900 dark:text-white">Subtotal</span>
                                <span className="text-sm font-medium text-gray-900 dark:text-white">${calculateTotal().toFixed(2)}</span>
                              </div>
                              <Link
                                href="/cart"
                                className="block w-full px-4 py-2 text-center text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200"
                              >
                                View Cart
                              </Link>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="relative" ref={dropdownRef}>
                      <button 
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white p-2 rounded-lg hover:bg-gray-100/50 dark:hover:bg-[#2D2D2F] transition-colors"
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
                            strokeWidth={1.5}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>
                      {isDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#1D1D1F] rounded-xl shadow-lg py-1 z-50 border border-[#E7E7E7] dark:border-[#2D2D2F]">
                          {user.role === 'admin' && (
                            <Link
                              href="/admin"
                              className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2D2D2F]"
                            >
                              Admin Dashboard
                            </Link>
                          )}
                          <Link
                            href="/orders"
                            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2D2D2F]"
                          >
                            My Orders
                          </Link>
                          <button
                            onClick={handleLogout}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2D2D2F]"
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
                    className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-white bg-[#1D1D1F] dark:bg-white dark:text-[#1D1D1F] hover:bg-[#2D2D2F] dark:hover:bg-gray-100 transition-colors"
                  >
                    Sign In
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:hidden bg-white/80 dark:bg-[#1D1D1F]/80 backdrop-blur-md border-t border-[#E7E7E7] dark:border-[#2D2D2F] shadow-lg absolute w-full z-50`}>
        <div className="px-2 pt-2 pb-3 space-y-1">
          {!loading && (
            <>
              {user ? (
                <>
                  <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-200">
                    Signed in as <span className="font-medium">{user.username}</span>
                  </div>
                  <Link
                    href="/cart"
                    className="block px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Cart ({cartCount})
                  </Link>
                  {user.role === 'admin' && (
                    <Link
                      href="/admin"
                      className="block px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <Link
                    href="/orders"
                    className="block px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    My Orders
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setShowAuth(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                >
                  Sign In
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {showAuth && <Auth onClose={() => setShowAuth(false)} />}
    </header>
  );
} 