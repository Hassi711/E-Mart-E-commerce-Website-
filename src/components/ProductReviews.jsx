import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { Star, User, Loader, Send } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const ProductReviews = ({ productId }) => {
    const { user } = useAuth()
    const [reviews, setReviews] = useState([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [newReview, setNewReview] = useState({ rating: 5, comment: '' })
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const { data, error } = await supabase
                    .from('reviews')
                    .select('*')
                    .eq('product_id', productId)
                    .order('created_at', { ascending: false })

                if (error) throw error
                setReviews(data || [])
            } catch (err) {
                console.error('Error fetching reviews:', err)
                // Don't show error to user if it's just that the table doesn't exist yet or empty
            } finally {
                setLoading(false)
            }
        }

        if (productId) {
            fetchReviews()
        }
    }, [productId])

    const handleSubmitReview = async (e) => {
        e.preventDefault()
        if (!user) return

        setSubmitting(true)
        setError(null)

        try {
            const reviewData = {
                product_id: productId,
                user_id: user.id,
                user_name: user.user_metadata?.full_name || user.email.split('@')[0],
                rating: newReview.rating,
                comment: newReview.comment,
                created_at: new Date().toISOString()
            }

            const { data, error } = await supabase
                .from('reviews')
                .insert([reviewData])
                .select()

            if (error) throw error

            setReviews([data[0], ...reviews])
            setNewReview({ rating: 5, comment: '' })
        } catch (err) {
            console.error('Error submitting review:', err)
            setError('Failed to submit review. Please try again.')
        } finally {
            setSubmitting(false)
        }
    }

    const averageRating = reviews.length
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
        : 0

    return (
        <div className="mt-16 border-t border-slate-100 pt-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
                Customer Reviews
                {reviews.length > 0 && (
                    <span className="text-base font-normal text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                        {reviews.length}
                    </span>
                )}
            </h2>

            <div className="grid md:grid-cols-3 gap-12">
                {/* Summary & Form */}
                <div className="md:col-span-1 space-y-8">
                    {/* Rating Summary */}
                    <div className="bg-slate-50 p-6 rounded-2xl text-center border border-slate-100">
                        <div className="text-5xl font-bold text-slate-900 mb-2">{averageRating}</div>
                        <div className="flex justify-center gap-1 mb-2 text-yellow-400">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    className={`w-5 h-5 ${star <= Math.round(averageRating) ? 'fill-current' : 'text-slate-300'}`}
                                />
                            ))}
                        </div>
                        <p className="text-slate-500 text-sm">Based on {reviews.length} reviews</p>
                    </div>

                    {/* Add Review Form */}
                    {user ? (
                        <form onSubmit={handleSubmitReview} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                            <h3 className="font-bold text-slate-900 mb-4">Write a Review</h3>

                            {error && (
                                <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">
                                    {error}
                                </div>
                            )}

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-slate-700 mb-2">Rating</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setNewReview({ ...newReview, rating: star })}
                                            className="focus:outline-none transition-transform hover:scale-110"
                                        >
                                            <Star
                                                className={`w-8 h-8 ${star <= newReview.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-slate-700 mb-2">Comment</label>
                                <textarea
                                    value={newReview.comment}
                                    onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                                    rows="4"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none"
                                    placeholder="Share your experience..."
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-primary transition-colors shadow-lg shadow-blue-900/10 flex items-center justify-center gap-2 disabled:opacity-70"
                            >
                                {submitting ? <Loader className="animate-spin h-5 w-5" /> : <Send className="h-5 w-5" />}
                                Submit Review
                            </button>
                        </form>
                    ) : (
                        <div className="bg-slate-50 p-6 rounded-2xl text-center border border-slate-200 border-dashed">
                            <p className="text-slate-600 mb-4">Please log in to write a review.</p>
                            <a href="/login" className="text-primary font-bold hover:underline">Log In Now</a>
                        </div>
                    )}
                </div>

                {/* Reviews List */}
                <div className="md:col-span-2 space-y-6">
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loader className="animate-spin h-8 w-8 text-primary" />
                        </div>
                    ) : reviews.length === 0 ? (
                        <div className="text-center py-12 text-slate-400 bg-slate-50 rounded-3xl">
                            <Star className="h-12 w-12 mx-auto mb-3 opacity-20" />
                            <p>No reviews yet. Be the first to review!</p>
                        </div>
                    ) : (
                        <AnimatePresence>
                            {reviews.map((review, index) => (
                                <motion.div
                                    key={review.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-700 font-bold">
                                                {review.user_name ? review.user_name.charAt(0).toUpperCase() : <User className="h-5 w-5" />}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900">{review.user_name || 'Anonymous'}</h4>
                                                <div className="flex text-yellow-400 text-xs mt-0.5">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            className={`w-3 h-3 ${i < review.rating ? 'fill-current' : 'text-slate-200'}`}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <span className="text-xs text-slate-400">
                                            {new Date(review.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-slate-600 leading-relaxed bg-slate-50/50 p-4 rounded-xl">
                                        {review.comment}
                                    </p>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ProductReviews
