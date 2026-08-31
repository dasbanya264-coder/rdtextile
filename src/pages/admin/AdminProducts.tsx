import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../lib/firebase';
import { compressImage, compressImageToBase64 } from '../../lib/utils';
import type { Product } from '../../types';
import { Plus, Edit2, Trash2, X, UploadCloud, Video, Loader2 } from 'lucide-react';

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Upload States
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [uploadError, setUploadError] = useState<string | null>(null);

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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    setUploadError(null);
    try {
      const uploadedUrls: string[] = [];
      const fileArray = Array.from(files).slice(0, 4);
      if (files.length > 4) alert("Only the first 4 images will be uploaded to save space.");
      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i] as File;
        const fileId = `img-${Date.now()}-${Math.random().toString(36).substring(2, 9)}-${i}`;
        setUploadProgress(prev => ({ ...prev, [fileId]: 50 }));
        const base64Data = await compressImageToBase64(file, 800);
        setUploadProgress(prev => ({ ...prev, [fileId]: 100 }));
        uploadedUrls.push(base64Data);
      }
      setFormData(prev => ({ 
        ...prev, 
        images: [...prev.images.filter(img => !img.includes('unsplash.com')), ...uploadedUrls] 
      }));
    } catch (err) {
      setUploadError("Image compression failed. Please try again.");
      console.error(err);
    } finally {
      setUploading(false);
      setUploadProgress({});
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Video is too large! Please select a clip under 5MB.");
      return;
    }
    setUploading(true);
    setUploadError(null);
    const fileId = `vid-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    try {
      const storageRef = ref(storage, `products/videos/${fileId}-${file.name}`);
      setUploadProgress(prev => ({ ...prev, [fileId]: 10 }));
      const snapshot = await uploadBytes(storageRef, file);
      setUploadProgress(prev => ({ ...prev, [fileId]: 100 }));
      const downloadURL = await getDownloadURL(snapshot.ref);
      setFormData(prev => ({ ...prev, videos: [...(prev.videos || []), downloadURL] }));
    } catch (err) {
      setUploadError("Video upload failed. Please try again.");
    } finally {
      setUploading(false);
      setUploadProgress({});
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  const removeVideo = (index: number) => {
    setFormData(prev => ({ ...prev, videos: (prev.videos || []).filter((_, i) => i !== index) }));
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
    if (formData.images.length === 0) {
      alert("Please add at least one product image.");
      return;
    }
    
    setUploading(true);
    try {
      const productData = {
        name: formData.name,
        sku: formData.sku,
        price: Number(formData.price),
        description: formData.description,
        categoryId: formData.categoryId,
        fabric: formData.fabric,
        color: formData.color,
        stockQuantity: Number(formData.stockQuantity),
        images: formData.images,
        videos: formData.videos,
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
    } catch (err) {
      console.error("Error saving product:", err);
      alert("Failed to save product.");
    } finally {
      setUploading(false);
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
      images: product.images,
      videos: product.videos || [],
      newVideoUrl: '',
      isActive: product.isActive,
    });
    setEditingId(product.id);
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({ name: '', sku: '', price: '', description: '', categoryId: 'silk', fabric: '', color: '', stockQuantity: '10', images: [], videos: [], newVideoUrl: '', isActive: true });
    setEditingId(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-stone-900" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-serif text-stone-900">Products</h1>
        <button 
          onClick={() => { resetForm(); setShowModal(true); }}
          className="bg-stone-900 text-white px-4 py-2 rounded-md hover:bg-stone-800 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-stone-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-stone-50 border-b border-stone-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">SKU</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-stone-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {products.map(product => (
                <tr key={product.id} className="hover:bg-stone-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <img src={product.images[0]} alt={product.name} className="w-10 h-10 rounded-md object-cover" />
                      <span className="font-medium text-stone-900">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-stone-600">{product.sku}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-stone-600">₹{product.price}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-stone-600">{product.stockQuantity}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {product.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-3">
                      <button onClick={() => editProduct(product)} className="text-amber-600 hover:text-amber-900"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-900"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-stone-900/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto my-8">
            <div className="flex justify-between items-center p-6 border-b border-stone-200 sticky top-0 bg-white z-10">
              <h2 className="text-xl font-serif text-stone-900">{editingId ? 'Edit Product' : 'Add New Product'}</h2>
              <button onClick={() => setShowModal(false)} className="text-stone-400 hover:text-stone-600"><X className="w-6 h-6" /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {uploadError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
                  {uploadError}
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Product Name</label>
                  <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border border-stone-300 rounded-md p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">SKU</label>
                  <input required value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} className="w-full border border-stone-300 rounded-md p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Price (₹)</label>
                  <input required type="number" min="1" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full border border-stone-300 rounded-md p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Stock Quantity</label>
                  <input required type="number" min="0" value={formData.stockQuantity} onChange={e => setFormData({...formData, stockQuantity: e.target.value})} className="w-full border border-stone-300 rounded-md p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Category</label>
                  <select value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})} className="w-full border border-stone-300 rounded-md p-2">
                    <option value="silk">Silk</option>
                    <option value="cotton">Cotton</option>
                    <option value="wedding">Wedding</option>
                    <option value="party">Party Wear</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Fabric</label>
                  <input required value={formData.fabric} onChange={e => setFormData({...formData, fabric: e.target.value})} className="w-full border border-stone-300 rounded-md p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Color</label>
                  <input required value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} className="w-full border border-stone-300 rounded-md p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Status</label>
                  <select value={formData.isActive.toString()} onChange={e => setFormData({...formData, isActive: e.target.value === 'true'})} className="w-full border border-stone-300 rounded-md p-2">
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
                
                <div className="col-span-2 space-y-4">
                  <div className="border border-stone-200 rounded-md p-4">
                    <label className="block text-sm font-medium text-stone-700 mb-2">Product Images</label>
                    <div className="flex flex-wrap gap-3 mb-3">
                      {formData.images.map((img, idx) => (
                        <div key={idx} className="relative group">
                          <img src={img} alt={`Preview ${idx}`} className="w-20 h-20 object-cover rounded-md border border-stone-200" />
                          <button 
                            type="button" 
                            onClick={() => removeImage(idx)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-md hover:bg-red-600 transition-colors z-10"
                            title="Delete Image"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                    
                    {Object.keys(uploadProgress).length > 0 && (
                      <div className="mb-4 space-y-2">
                        {Object.entries(uploadProgress).map(([id, progress]) => (
                          <div key={id} className="w-full bg-stone-200 rounded-full h-2.5">
                            <div className="bg-amber-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <label className="flex flex-col items-center gap-1 px-4 py-4 bg-stone-50 hover:bg-stone-100 text-stone-700 rounded-md cursor-pointer transition-colors w-full justify-center border border-stone-300 border-dashed">
                      <div className="flex items-center gap-2">
                        {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <UploadCloud className="w-5 h-5" />}
                        <span className="font-medium">{uploading ? 'Uploading...' : 'Select Multiple Images'}</span>
                      </div>
                      <p className="text-xs text-stone-500 text-center">JPG, PNG, WEBP. Images will be automatically compressed.</p>
                      <input 
                        type="file" 
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload} 
                        className="hidden" 
                        disabled={uploading}
                      />
                    </label>
                  </div>
                    
                  <div className="border border-stone-200 rounded-md p-4">
                    <label className="block text-sm font-medium text-stone-700 mb-2">Product Videos</label>
                    <p className="text-xs text-stone-500 mb-3">Upload a short video (Max 5MB) or paste a YouTube link.</p>
                    <div className="flex gap-2 mb-3">
                      <input 
                        value={formData.newVideoUrl} 
                        onChange={e => setFormData({...formData, newVideoUrl: e.target.value})} 
                        placeholder="Paste video URL (e.g., YouTube)..." 
                        className="flex-1 border border-stone-300 rounded-md p-2 text-sm" 
                      />
                      <button 
                        type="button" 
                        onClick={handleAddVideo}
                        className="bg-stone-200 text-stone-700 px-3 py-2 rounded-md hover:bg-stone-300 text-sm whitespace-nowrap"
                      >
                        Add URL
                      </button>
                    </div>
                    
                    <label className="flex flex-col items-center gap-1 px-4 py-3 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-md cursor-pointer transition-colors w-full justify-center border border-amber-200 border-dashed mb-3">
                      <div className="flex items-center gap-2">
                        {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Video className="w-5 h-5" />}
                        <span className="font-medium">{uploading ? 'Uploading...' : 'Upload Video File'}</span>
                      </div>
                      <input 
                        type="file" 
                        accept="video/*"
                        onChange={handleVideoUpload}
                        className="hidden" 
                        disabled={uploading}
                      />
                    </label>
                    
                    {formData.videos && formData.videos.length > 0 && (
                    <div className="flex flex-col gap-2 mt-2">
                      {formData.videos.map((vid, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-stone-50 p-2 rounded border border-stone-200 text-sm">
                          <div className="flex items-center gap-2 truncate">
                            <Video className="w-4 h-4 text-amber-600 shrink-0" />
                            <span className="truncate max-w-[200px] sm:max-w-xs">{vid}</span>
                          </div>
                          <button type="button" onClick={() => removeVideo(idx)} className="text-red-500 hover:text-red-700 shrink-0">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Description</label>
                <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={3} className="w-full border border-stone-300 rounded-md p-2" />
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t border-stone-200">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-md font-medium">Cancel</button>
                <button type="submit" disabled={uploading || loading} className="px-6 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 disabled:opacity-50 font-medium flex items-center gap-2">
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {editingId ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
