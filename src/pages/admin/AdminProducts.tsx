import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import type { Product } from '../../types';
import { Plus, Edit2, Trash2, X, Video, Loader2, Image as ImageIcon, AlertCircle } from 'lucide-react';
import ProductImageUploader from '../../components/admin/ProductImageUploader';
import { uploadProductVideo } from '../../lib/storageService';

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form submission and upload activity tracking
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [isVideoUploading, setIsVideoUploading] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    price: '',
    description: '',
    categoryId: 'silk',
    fabric: '',
    color: '',
    stockQuantity: '10',
    images: [] as string[],
    videos: [] as string[],
    newVideoUrl: '',
    isActive: true,
  });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'products'));
      const prods = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      setProducts(prods);
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setVideoError(null);
    setIsVideoUploading(true);
    setVideoProgress(5);

    try {
      const downloadURL = await uploadProductVideo(file, (progress, stage, err) => {
        if (stage === 'error') {
          setVideoError(err || 'Video upload failed.');
        } else {
          setVideoProgress(progress);
        }
      });

      setFormData(prev => ({
        ...prev,
        videos: [...(prev.videos || []), downloadURL]
      }));
    } catch (err: any) {
      setVideoError(err?.message || 'Video upload failed. Please try again.');
    } finally {
      setIsVideoUploading(false);
      setVideoProgress(0);
      if (e.target) e.target.value = '';
    }
  };

  const removeVideo = (index: number) => {
    setFormData(prev => ({
      ...prev,
      videos: (prev.videos || []).filter((_, i) => i !== index)
    }));
  };

  const handleAddVideo = () => {
    if (formData.newVideoUrl.trim()) {
      setFormData(prev => ({
        ...prev,
        videos: [...(prev.videos || []), prev.newVideoUrl.trim()],
        newVideoUrl: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (isUploadingImages) {
      setFormError('Please wait for all image uploads to finish before saving.');
      return;
    }

    if (isVideoUploading) {
      setFormError('Please wait for video upload to finish before saving.');
      return;
    }

    if (formData.images.length === 0) {
      setFormError('Please upload at least one product photo.');
      return;
    }

    setIsSaving(true);
    try {
      const productData = {
        name: formData.name.trim(),
        sku: formData.sku.trim(),
        price: Number(formData.price),
        description: formData.description.trim(),
        categoryId: formData.categoryId,
        fabric: formData.fabric.trim(),
        color: formData.color.trim(),
        stockQuantity: Number(formData.stockQuantity),
        images: formData.images,
        videos: formData.videos || [],
        isActive: formData.isActive,
        createdAt: new Date().toISOString(),
      };

      if (editingId) {
        await updateDoc(doc(db, 'products', editingId), productData);
      } else {
        await addDoc(collection(db, 'products'), productData);
      }

      await fetchProducts();
      setShowModal(false);
      resetForm();
    } catch (err: any) {
      console.error('Error saving product:', err);
      setFormError(err?.message || 'Failed to save product to database. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      await deleteDoc(doc(db, 'products', id));
      fetchProducts();
    }
  };

  const editProduct = (product: Product) => {
    setFormData({
      name: product.name,
      sku: product.sku,
      price: product.price.toString(),
      description: product.description,
      categoryId: product.categoryId,
      fabric: product.fabric || '',
      color: product.color || '',
      stockQuantity: product.stockQuantity.toString(),
      images: product.images || [],
      videos: product.videos || [],
      newVideoUrl: '',
      isActive: product.isActive,
    });
    setEditingId(product.id);
    setFormError(null);
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      sku: '',
      price: '',
      description: '',
      categoryId: 'silk',
      fabric: '',
      color: '',
      stockQuantity: '10',
      images: [],
      videos: [],
      newVideoUrl: '',
      isActive: true
    });
    setEditingId(null);
    setFormError(null);
    setVideoError(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-stone-900" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-serif text-stone-900">Products & Catalog</h1>
          <p className="text-sm text-stone-500 mt-1">Manage saree inventory, upload high-definition photos, and organize catalog.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setShowModal(true); }}
          className="bg-stone-900 text-white px-5 py-2.5 rounded-xl hover:bg-stone-800 flex items-center justify-center gap-2 font-medium shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" /> Add New Product
        </button>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-stone-50 border-b border-stone-200">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-stone-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-4 text-xs font-semibold text-stone-500 uppercase tracking-wider">SKU</th>
                <th className="px-6 py-4 text-xs font-semibold text-stone-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-4 text-xs font-semibold text-stone-500 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-4 text-xs font-semibold text-stone-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-stone-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-stone-400">
                    <ImageIcon className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    No products added yet. Click &quot;Add New Product&quot; to create one.
                  </td>
                </tr>
              ) : (
                products.map(product => (
                  <tr key={product.id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-12 h-12 rounded-lg object-cover border border-stone-200 shadow-sm"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-400">
                            <ImageIcon className="w-5 h-5" />
                          </div>
                        )}
                        <div>
                          <span className="font-medium text-stone-900 block">{product.name}</span>
                          <span className="text-xs text-stone-400">{product.fabric} • {product.color}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-stone-600 font-mono text-xs">{product.sku}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-stone-900 font-medium">₹{product.price.toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-stone-600">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${product.stockQuantity > 0 ? 'bg-stone-100 text-stone-700' : 'bg-red-50 text-red-600'}`}>
                        {product.stockQuantity} in stock
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${product.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-stone-100 text-stone-600 border border-stone-200'}`}>
                        {product.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => editProduct(product)}
                          className="p-2 text-stone-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Edit Product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-2 text-stone-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto my-6 shadow-2xl border border-stone-100">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-5 border-b border-stone-200 sticky top-0 bg-white z-20">
              <div>
                <h2 className="text-xl font-serif text-stone-900">{editingId ? 'Edit Product' : 'Add New Product'}</h2>
                <p className="text-xs text-stone-500">Provide details and upload saree catalog images.</p>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {formError && (
                <div className="flex items-center gap-2 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Product Photos Section */}
              <div className="bg-stone-50/70 border border-stone-200/80 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-semibold text-stone-900">
                    Product Images <span className="text-red-500">*</span>
                  </label>
                  <span className="text-xs text-stone-500">
                    First image will be the primary cover
                  </span>
                </div>

                <ProductImageUploader
                  images={formData.images}
                  onChange={(newImages) => setFormData(prev => ({ ...prev, images: newImages }))}
                  onUploadingChange={(uploading) => setIsUploadingImages(uploading)}
                  maxImages={6}
                  folder="products"
                />
              </div>
              
              {/* Product Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Pure Silk Banarasi Saree"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
                    SKU Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. SILK-001"
                    value={formData.sku}
                    onChange={e => setFormData({...formData, sku: e.target.value})}
                    className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-hidden uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
                    Price (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    type="number"
                    min="1"
                    placeholder="e.g. 2499"
                    value={formData.price}
                    onChange={e => setFormData({...formData, price: e.target.value})}
                    className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
                    Stock Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    type="number"
                    min="0"
                    placeholder="e.g. 10"
                    value={formData.stockQuantity}
                    onChange={e => setFormData({...formData, stockQuantity: e.target.value})}
                    className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
                    Category
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={e => setFormData({...formData, categoryId: e.target.value})}
                    className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-hidden bg-white"
                  >
                    <option value="silk">Silk Sarees</option>
                    <option value="cotton">Cotton Sarees</option>
                    <option value="wedding">Wedding Collection</option>
                    <option value="party">Party Wear</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
                    Fabric <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Tussar Silk, Katan"
                    value={formData.fabric}
                    onChange={e => setFormData({...formData, fabric: e.target.value})}
                    className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
                    Color <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Crimson Red & Gold"
                    value={formData.color}
                    onChange={e => setFormData({...formData, color: e.target.value})}
                    className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
                    Listing Status
                  </label>
                  <select
                    value={formData.isActive.toString()}
                    onChange={e => setFormData({...formData, isActive: e.target.value === 'true'})}
                    className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-hidden bg-white"
                  >
                    <option value="true">Active (Visible in Store)</option>
                    <option value="false">Inactive (Hidden)</option>
                  </select>
                </div>
              </div>

              {/* Product Videos Section */}
              <div className="border border-stone-200 rounded-2xl p-4 space-y-3 bg-stone-50/50">
                <label className="block text-sm font-semibold text-stone-900">
                  Product Videos (Optional)
                </label>
                
                {videoError && (
                  <div className="text-xs text-red-600 bg-red-50 p-2 rounded-lg border border-red-200 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{videoError}</span>
                  </div>
                )}

                <div className="flex gap-2">
                  <input 
                    value={formData.newVideoUrl} 
                    onChange={e => setFormData({...formData, newVideoUrl: e.target.value})} 
                    placeholder="Paste YouTube or video link..." 
                    className="flex-1 border border-stone-300 rounded-xl px-3.5 py-2 text-sm bg-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden" 
                  />
                  <button 
                    type="button" 
                    onClick={handleAddVideo}
                    className="bg-stone-200 hover:bg-stone-300 text-stone-800 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                  >
                    Add URL
                  </button>
                </div>
                
                <label className="flex items-center justify-center gap-2 px-4 py-3 bg-white hover:bg-amber-50/50 text-stone-700 rounded-xl cursor-pointer transition-colors border border-stone-200 border-dashed text-sm font-medium">
                  {isVideoUploading ? <Loader2 className="w-4 h-4 animate-spin text-amber-600" /> : <Video className="w-4 h-4 text-amber-600" />}
                  <span>{isVideoUploading ? `Uploading Video (${videoProgress}%)...` : 'Or Upload Short Video Clip (Max 15MB)'}</span>
                  <input 
                    type="file" 
                    accept="video/mp4,video/webm,video/quicktime,video/*"
                    onChange={handleVideoUpload}
                    className="hidden" 
                    disabled={isVideoUploading}
                  />
                </label>
                
                {formData.videos && formData.videos.length > 0 && (
                  <div className="space-y-2 mt-2">
                    {formData.videos.map((vid, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-stone-200 text-xs">
                        <div className="flex items-center gap-2 truncate">
                          <Video className="w-4 h-4 text-amber-600 shrink-0" />
                          <span className="truncate max-w-xs">{vid}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeVideo(idx)}
                          className="p-1 text-stone-400 hover:text-red-600 rounded-md transition-colors"
                          title="Remove Video"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Description */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Detailed description of the saree, design, zari work, pallu, blouse piece, etc."
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full border border-stone-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>
              
              {/* Modal Footer Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 text-stone-600 hover:bg-stone-100 rounded-xl text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving || isUploadingImages || isVideoUploading}
                  className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {isSaving ? 'Saving to Catalog...' : (editingId ? 'Save Changes' : 'Create Product')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
