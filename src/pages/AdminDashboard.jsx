import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { Plus, Edit, Trash2, Eye, EyeOff, Loader, CheckCircle, AlertCircle, RefreshCw, X, Save } from 'lucide-react'

const AdminDashboard = () => {
    const { isAdmin } = useAuth()
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [successMsg, setSuccessMsg] = useState('')

    // Edit Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [editingProduct, setEditingProduct] = useState(null)
    const [editFormData, setEditFormData] = useState({
        name: '',
        description: '',
        price: '',
        stock: ''
    })
    const [updateLoading, setUpdateLoading] = useState(false)

    // Fetch products
    const fetchProducts = async () => {
        setLoading(true)
        setError(null)
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error
            setProducts(data)
        } catch (err) {
            console.error('Error fetching products:', err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (isAdmin) {
            fetchProducts()
        }
    }, [isAdmin])

    const deleteProduct = async (id) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return

        try {
            const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', id)

            if (error) throw error

            setProducts(products.filter(p => p.id !== id))
            showSuccess('Product deleted successfully')
        } catch (err) {
            console.error('Error deleting product:', err)
            setError('Failed to delete product')
            setTimeout(() => setError(null), 3000)
        }
    }

    // Prepare Edit Modal
    const openEditModal = (product) => {
        setEditingProduct(product)
        setEditFormData({
            name: product.name,
            description: product.description || '',
            price: product.price,
            stock: product.stock
        })
        setIsEditModalOpen(true)
    }

    const closeEditModal = () => {
        setIsEditModalOpen(false)
        setEditingProduct(null)
    }

    const handleEditChange = (e) => {
        setEditFormData({ ...editFormData, [e.target.name]: e.target.value })
    }

    const handleUpdateProduct = async (e) => {
        e.preventDefault()
        setUpdateLoading(true)
        try {
            const { error } = await supabase
                .from('products')
                .update({
                    name: editFormData.name,
                    description: editFormData.description,
                    price: parseFloat(editFormData.price),
                    stock: parseInt(editFormData.stock)
                })
                .eq('id', editingProduct.id)

            if (error) throw error

            // Update local state
            setProducts(products.map(p =>
                p.id === editingProduct.id
                    ? { ...p, ...editFormData, price: parseFloat(editFormData.price), stock: parseInt(editFormData.stock) }
                    : p
            ))

            showSuccess('Product updated successfully')
            closeEditModal()
        } catch (err) {
            console.error('Error updating product:', err)
            setError('Failed to update product')
            setTimeout(() => setError(null), 3000)
        } finally {
            setUpdateLoading(false)
        }
    }

    const toggleProductStatus = async (id, currentStatus) => {
        try {
            const { error } = await supabase
                .from('products')
                .update({ is_active: !currentStatus })
                .eq('id', id)

            if (error) throw error

            // Update local state
            setProducts(products.map(p =>
                p.id === id ? { ...p, is_active: !currentStatus } : p
            ))
            showSuccess('Product status updated')
        } catch (err) {
            console.error('Error updating product:', err)
            setError('Failed to update product status')
            setTimeout(() => setError(null), 3000)
        }
    }

    const showSuccess = (msg) => {
        setSuccessMsg(msg)
        setTimeout(() => setSuccessMsg(''), 3000)
    }

    if (!isAdmin) {
        return (
            <div className="min-h-screen pt-24 px-4 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-red-600">Access Denied</h2>
                    <p className="text-slate-600 mt-2">You do not have permission to view this page.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen pt-24 pb-12 bg-slate-50 relative">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">Admin Dashboard</h1>
                        <p className="text-slate-500 mt-1">Manage your products and inventory</p>
                    </div>
                    <div className="mt-4 md:mt-0 flex gap-3">
                        <button
                            onClick={fetchProducts}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Refresh
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                            <Plus className="h-5 w-5" />
                            Add Product
                        </button>
                    </div>
                </div>

                {/* Notifications */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2 border border-red-100"
                    >
                        <AlertCircle className="h-5 w-5" />
                        {error}
                    </motion.div>
                )}

                {successMsg && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg flex items-center gap-2 border border-green-100"
                    >
                        <CheckCircle className="h-5 w-5" />
                        {successMsg}
                    </motion.div>
                )}

                {/* Products Table */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    {loading ? (
                        <div className="p-12 flex justify-center">
                            <Loader className="animate-spin h-8 w-8 text-primary" />
                        </div>
                    ) : products.length === 0 ? (
                        <div className="p-12 text-center text-slate-500">
                            No products found. Add your first product to get started.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold text-slate-700">Product</th>
                                        <th className="px-6 py-4 font-semibold text-slate-700">Price</th>
                                        <th className="px-6 py-4 font-semibold text-slate-700">Stock</th>
                                        <th className="px-6 py-4 font-semibold text-slate-700">Status</th>
                                        <th className="px-6 py-4 font-semibold text-slate-700 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {products.map((product) => (
                                        <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-12 w-12 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
                                                        {product.images && product.images[0] ? (
                                                            <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
                                                        ) : (
                                                            <span className="text-xs text-slate-400">No Img</span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-medium text-slate-900">{product.name}</h3>
                                                        <p className="text-xs text-slate-500 truncate max-w-[200px]">{product.description}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-medium text-slate-700">
                                                ${parseFloat(product.price).toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${product.stock > 10 ? 'bg-green-100 text-green-800' :
                                                    product.stock > 0 ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-red-100 text-red-800'
                                                    }`}>
                                                    {product.stock} in stock
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => toggleProductStatus(product.id, product.is_active)}
                                                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-colors border ${product.is_active
                                                        ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                                                        : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                                                        }`}
                                                >
                                                    {product.is_active ? (
                                                        <>
                                                            <Eye className="h-3 w-3" /> Visible
                                                        </>
                                                    ) : (
                                                        <>
                                                            <EyeOff className="h-3 w-3" /> Hidden
                                                        </>
                                                    )}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => openEditModal(product)}
                                                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => deleteProduct(product.id)}
                                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Modal */}
            <AnimatePresence>
                {isEditModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden"
                        >
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                <h3 className="text-xl font-bold text-slate-800">Edit Product</h3>
                                <button onClick={closeEditModal} className="text-slate-400 hover:text-slate-600 transition-colors">
                                    <X className="h-6 w-6" />
                                </button>
                            </div>

                            <form onSubmit={handleUpdateProduct} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Product Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={editFormData.name}
                                        onChange={handleEditChange}
                                        required
                                        className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                                    <textarea
                                        name="description"
                                        rows="3"
                                        value={editFormData.description}
                                        onChange={handleEditChange}
                                        className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Price ($)</label>
                                        <input
                                            type="number"
                                            name="price"
                                            step="0.01"
                                            min="0"
                                            value={editFormData.price}
                                            onChange={handleEditChange}
                                            required
                                            className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Stock</label>
                                        <input
                                            type="number"
                                            name="stock"
                                            min="0"
                                            value={editFormData.stock}
                                            onChange={handleEditChange}
                                            required
                                            className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 flex gap-3 justify-end">
                                    <button
                                        type="button"
                                        onClick={closeEditModal}
                                        className="px-6 py-2 rounded-xl text-slate-600 font-semibold hover:bg-slate-100 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={updateLoading}
                                        className="px-6 py-2 bg-primary text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-900/10 flex items-center gap-2 disabled:opacity-70"
                                    >
                                        {updateLoading ? <Loader className="animate-spin h-5 w-5" /> : <Save className="h-5 w-5" />}
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default AdminDashboard
