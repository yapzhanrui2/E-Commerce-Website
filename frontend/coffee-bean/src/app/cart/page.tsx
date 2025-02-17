'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import Header from '@/components/Header';
import toast from 'react-hot-toast';

export default function CartPage() {
  const { cartItems, updateCartCount } = useCart();
  const [loading, setLoading] = useState(false);
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      const price = item.product?.price || item.Product?.price || 0;
      return total + (price * item.quantity);
    }, 0);
  };

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    try {
      setUpdatingItemId(itemId);
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please sign in to update your cart');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart/items/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ quantity: newQuantity })
      });

      if (!response.ok) {
        throw new Error('Failed to update quantity');
      }

      await updateCartCount();
      toast.success('Cart updated successfully');
    } catch (error) {
      toast.error('Failed to update quantity');
      console.error('Error updating quantity:', error);
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      setUpdatingItemId(itemId);
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please sign in to remove items');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart/items/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to remove item');
      }

      await updateCartCount();
      toast.success('Item removed from cart');
    } catch (error) {
      toast.error('Failed to remove item');
      console.error('Error removing item:', error);
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please sign in to checkout');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/checkout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      window.location.href = data.sessionUrl;
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to proceed to checkout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#121212]">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-[#1D1D1F] rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Shopping Cart</h1>
          </div>

          {cartItems.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-gray-500 dark:text-gray-400 mb-4">Your cart is empty</p>
              <Link
                href="/"
                className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Continue Shopping
              </Link>
            </div>
          ) : (
            <>
              <div className="px-6 py-4">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center py-5 first:pt-0 last:pb-0 border-b last:border-b-0 border-gray-200 dark:border-gray-800"
                  >
                    <div className="relative h-24 w-24 flex-shrink-0">
                      <Image
                        src={`${process.env.NEXT_PUBLIC_S3_BASE_URL}/products/${item.product?.name}.webp`}
                        alt={(item.product?.name || item.Product?.name) || 'Product'}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            {(item.product?.name || item.Product?.name) || 'Product'}
                          </h3>
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            ${((item.product?.price || item.Product?.price || 0)).toFixed(2)} each
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={updatingItemId === item.id}
                          className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
                        >
                          <span className="sr-only">Remove</span>
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      <div className="mt-4 flex items-center">
                        <select
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value))}
                          disabled={updatingItemId === item.id}
                          className="rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-[#2D2D2F] dark:text-white sm:text-sm"
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                            <option key={num} value={num}>
                              {num}
                            </option>
                          ))}
                        </select>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            ${((item.product?.price || item.Product?.price || 0) * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="px-6 py-4 bg-gray-50 dark:bg-[#2D2D2F] rounded-b-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-lg font-medium text-gray-900 dark:text-white">Subtotal</p>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Shipping and taxes calculated at checkout</p>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${calculateSubtotal().toFixed(2)}
                  </div>
                </div>
                <div className="mt-4">
                  <button
                    onClick={handleCheckout}
                    disabled={loading}
                    className={`w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-[#2D2D2F] ${
                      loading ? 'opacity-75 cursor-not-allowed' : ''
                    }`}
                  >
                    {loading ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      'Proceed to Checkout'
                    )}
                  </button>
                  <div className="mt-4 text-center">
                    <Link
                      href="/"
                      className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                    >
                      Continue Shopping
                    </Link>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
} 