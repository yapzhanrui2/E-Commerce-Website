'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Header from '@/components/Header';
import { useCart } from '@/context/CartContext';
import toast from 'react-hot-toast';
import ReviewForm from '@/components/ReviewForm';
import Auth from '@/components/Auth';

interface Review {
  id: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: string;
  user?: {
    name: string;
  };
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  categories: string[];
}

export default function ProductDetail() {
  const { updateCartCount } = useCart();
  const { id } = useParams() as { id: string };
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [sortBy, setSortBy] = useState<'recent' | 'rating'>('recent');
  const [addingToCart, setAddingToCart] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      setIsAuthenticated(!!token);
    };

    checkAuth();
  }, []);

  useEffect(() => {
    const fetchProductAndReviews = async () => {
      try {
        // Fetch product details
        const productResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${id}`);
        if (!productResponse.ok) {
          throw new Error(`HTTP error! status: ${productResponse.status}`);
        }
        const productData = await productResponse.json();
        setProduct(productData.product);

        // Fetch reviews
        const reviewsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reviews/${id}`);
        if (!reviewsResponse.ok) {
          throw new Error('Failed to fetch reviews');
        }
        const reviewsData = await reviewsResponse.json();
        setReviews(reviewsData.reviews);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to fetch product details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProductAndReviews();
    }
  }, [id]);

  const handleQuantityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setQuantity(parseInt(e.target.value));
  };

  const handleAddToCart = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please sign in to add items to your cart', {
          icon: '🔒',
        });
        return;
      }

      setAddingToCart(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: product?.id,
          quantity: quantity,
        }),
      });

      const data = await response.json();
      console.log('Add to cart response:', data);

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          toast.error('Please sign in again to add items to your cart', {
            icon: '🔒',
          });
          return;
        }
        throw new Error('Failed to add to cart');
      }

      // Update cart count
      console.log('Updating cart count after adding item');
      await updateCartCount();
      
      // Show success message
      toast.success(`Added ${quantity} ${quantity === 1 ? 'item' : 'items'} to cart`, {
        icon: '🛒',
      });
    } catch (error) {
      console.error('Add to cart error:', error);
      toast.error('Failed to add to cart. Please try again.', {
        icon: '❌',
      });
    } finally {
      setAddingToCart(false);
    }
  };

  const getAverageRating = () => {
    if (!reviews.length) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const getSortedReviews = () => {
    return [...reviews].sort((a, b) => {
      if (sortBy === 'recent') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return b.rating - a.rating;
    });
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-5 h-5 ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  const handleReviewSubmitted = async () => {
    try {
      const reviewsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reviews/${id}`);
      if (!reviewsResponse.ok) {
        throw new Error('Failed to fetch reviews');
      }
      const reviewsData = await reviewsResponse.json();
      setReviews(reviewsData.reviews);
    } catch (error) {
      console.error('Error fetching updated reviews:', error);
      toast.error('Failed to refresh reviews');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-center">
            <h2 className="text-xl font-bold mb-2 text-red-500">Error</h2>
            <p className="text-gray-600 mb-4">{error || 'Product not found'}</p>
            <Link 
              href="/"
              className="text-blue-500 hover:text-blue-600 underline"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <Link
          href="/"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6 md:mb-8 group"
        >
          <svg
            className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform duration-200"
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
          Back to Products
        </Link>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 p-4 md:p-8">
            {/* Product Image */}
            <div className="relative h-[300px] md:h-[500px] rounded-xl overflow-hidden group">
              <Image
                src={`${process.env.NEXT_PUBLIC_S3_BASE_URL}/products/${product.name}.webp`}
                alt={product.name}
                fill
                className="object-cover transform group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-500" />
            </div>

            {/* Product Details */}
            <div className="flex flex-col px-4 md:px-0">
              <div className="flex-1">
                <div className="flex gap-2 mb-4 flex-wrap">
                  {product.categories.map((category, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 text-xs md:text-sm bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors"
                    >
                      {category}
                    </span>
                  ))}
                </div>
                
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
                
                <p className="text-xl md:text-2xl font-bold text-gray-900 mb-6">
                  ${product.price.toFixed(2)}
                </p>

                <p className="text-gray-600 mb-8 leading-relaxed text-sm md:text-base">
                  {product.description}
                </p>

                <div className="space-y-4 md:space-y-6 mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 text-blue-600">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-gray-700">Premium quality coffee beans</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 text-blue-600">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-gray-700">Roasted to order for maximum freshness</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 text-blue-600">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-gray-700">Free shipping on orders over $50</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
                <select
                  value={quantity}
                  onChange={handleQuantityChange}
                  className="w-full sm:w-24 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  ))}
                </select>

                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                  className={`flex-1 px-6 py-3 md:px-8 md:py-4 rounded-lg font-semibold text-white shadow-lg 
                    ${addingToCart 
                      ? 'bg-blue-400 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700 transform hover:scale-[1.02] hover:shadow-xl'
                    } transition-all duration-200`}
                >
                  {addingToCart ? (
                    <span className="flex items-center justify-center">
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
                      Adding to Cart...
                    </span>
                  ) : (
                    'Add to Cart'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-8 md:mt-16">
          <div className="bg-white rounded-2xl shadow-lg p-4 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
              <div className="mb-4 md:mb-0">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                  Customer Reviews
                </h2>
                <div className="flex items-center gap-2">
                  {renderStars(Number(getAverageRating()))}
                  <span className="text-sm md:text-base text-gray-600">
                    {getAverageRating()} out of 5 ({reviews.length} reviews)
                  </span>
                </div>
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'recent' | 'rating')}
                className="w-full md:w-auto rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="recent">Most Recent</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>

            {/* Review Form */}
            {isAuthenticated ? (
              <div className="mb-12 bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Write a Review</h3>
                <ReviewForm productId={id} onReviewSubmitted={handleReviewSubmitted} />
              </div>
            ) : (
              <div className="bg-gray-50 rounded-xl p-6 mb-12 text-center">
                <p className="text-gray-600 mb-3">Sign in to leave a review</p>
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
                >
                  Sign In
                </button>
              </div>
            )}

            <div className="space-y-8">
              {getSortedReviews().map((review) => (
                <div
                  key={review.id}
                  className="border-b border-gray-200 pb-8 last:border-b-0"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold">
                        {review.user?.name?.[0] || 'U'}
                      </div>
                      <div className="ml-4">
                        <p className="font-semibold text-gray-900">
                          {review.user?.name || 'Anonymous'}
                        </p>
                        <div className="flex items-center gap-2">
                          {renderStars(review.rating)}
                          <span className="text-sm text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 leading-relaxed">{review.comment}</p>
                </div>
              ))}

              {reviews.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  No reviews yet. Be the first to review this product!
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Auth Modal */}
      {showAuthModal && (
        <Auth onClose={() => setShowAuthModal(false)} />
      )}

      <style jsx>{`
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateY(1rem);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        main {
          animation: slide-in 0.6s ease-out;
        }
      `}</style>
    </div>
  );
} 