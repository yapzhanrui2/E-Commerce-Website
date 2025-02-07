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
    <div className="min-h-screen">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8"
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
          Back to Products
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="relative h-96 md:h-[600px] rounded-lg overflow-hidden">
            <Image
              src={`${process.env.NEXT_PUBLIC_S3_BASE_URL}/products/${product.name}.webp`}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </div>

          {/* Product Details */}
          <div className="flex flex-col">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
            
            <div className="flex gap-2 mb-6">
              {product.categories.map((category, index) => (
                <span
                  key={index}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded-full"
                >
                  {category}
                </span>
              ))}
            </div>

            <p className="text-2xl font-bold text-gray-900 mb-6">
              ${product.price.toFixed(2)}
            </p>

            <p className="text-gray-600 mb-8 leading-relaxed">
              {product.description}
            </p>

            <div className="flex gap-4 items-center mb-8">
              <select
                value={quantity}
                onChange={handleQuantityChange}
                className="block w-24 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
                className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-colors duration-200 
                  ${addingToCart 
                    ? 'bg-blue-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
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
                    Adding...
                  </span>
                ) : (
                  'Add to Cart'
                )}
              </button>
            </div>

            {/* Additional Product Information */}
            <div className="border-t border-gray-200 pt-8">
              <h2 className="text-xl font-semibold mb-4">Product Details</h2>
              <ul className="space-y-2 text-gray-600">
                <li>• Premium quality coffee beans</li>
                <li>• Carefully selected and roasted</li>
                <li>• Packaged for maximum freshness</li>
                <li>• Sourced from sustainable farms</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-16">
          <div className="border-t border-gray-200 pt-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Customer Reviews
                </h2>
                <div className="flex items-center mt-2">
                  {renderStars(Number(getAverageRating()))}
                  <span className="ml-2 text-gray-600">
                    {getAverageRating()} out of 5 ({reviews.length} reviews)
                  </span>
                </div>
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'recent' | 'rating')}
                className="rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="recent">Most Recent</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>

            {/* Review Form */}
            {isAuthenticated ? (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Write a Review</h3>
                <ReviewForm productId={id} onReviewSubmitted={handleReviewSubmitted} />
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-4 mb-8 text-center">
                <p className="text-gray-600 mb-2">Sign in to leave a review</p>
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="text-blue-600 hover:text-blue-700 font-medium"
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
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-600 font-semibold">
                          {review.user?.name?.[0] || 'U'}
                        </span>
                      </div>
                      <div className="ml-4">
                        <p className="font-semibold text-gray-900">
                          {review.user?.name || 'Anonymous'}
                        </p>
                        <div className="flex items-center">
                          {renderStars(review.rating)}
                          <span className="ml-2 text-sm text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600">{review.comment}</p>
                </div>
              ))}

              {reviews.length === 0 && (
                <div className="text-center py-8 text-gray-500">
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
    </div>
  );
} 