"use client";

import { useState, useEffect } from "react";
import Select from 'react-select';
import makeAnimated from 'react-select/animated';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  inventory: number;
  sizes?: string[]; // Make optional
  colors?: string[]; // Make optional
  featured: boolean;
  aiHint: string;
  images: Array<{ src: string; alt: string }>;
}

interface Category {
  _id: string;
  name: string;
}

interface SelectOption {
  value: string;
  label: string;
}

interface EditProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const animatedComponents = makeAnimated();

export default function EditProductModal({ product, isOpen, onClose, onUpdate }: EditProductModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    inventory: "",
    sizes: "",
    colors: "",
    featured: false,
    aiHint: ""
  });
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [removedImages, setRemovedImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<SelectOption[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<SelectOption | null>(null);

  useEffect(() => {
    if (product && isOpen) {
      // Safely handle sizes and colors arrays
      const sizesArray = product.sizes || [];
      const colorsArray = product.colors || [];
      
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        category: product.category,
        inventory: product.inventory.toString(),
        sizes: sizesArray.join(', '), // Safe join
        colors: colorsArray.join(', '), // Safe join
        featured: product.featured,
        aiHint: product.aiHint || ""
      });
      setExistingImages(product.images.map(img => img.src));
      setNewImages([]);
      setRemovedImages([]);
      fetchCategories();
    }
  }, [product, isOpen]);

  useEffect(() => {
    const options: SelectOption[] = categories.map(category => ({
      value: category._id,
      label: category.name
    }));
    setCategoryOptions(options);

    // Set selected category
    if (product?.category) {
      const currentCategory = options.find(opt => 
        opt.value === product.category || opt.label.toLowerCase() === product.category.toLowerCase()
      );
      setSelectedCategory(currentCategory || null);
    }
  }, [categories, product]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleCreateCategory = async (inputValue: string) => {
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: inputValue,
          slug: inputValue.toLowerCase().replace(/[^a-z0-9]/g, '-')
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create category');
      }

      const newOption = {
        value: data._id,
        label: data.name
      };
      
      setCategoryOptions(prev => [...prev, newOption]);
      setSelectedCategory(newOption);
      setFormData(prev => ({ ...prev, category: data._id }));
      
      return newOption;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  };

  const handleCategoryChange = (selectedOption: SelectOption | null) => {
    setSelectedCategory(selectedOption);
    if (selectedOption) {
      setFormData(prev => ({
        ...prev,
        category: selectedOption.value
      }));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleNewImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setNewImages(prev => [...prev, ...filesArray]);
    }
  };

  const removeExistingImage = (imageUrl: string) => {
    setExistingImages(prev => prev.filter(img => img !== imageUrl));
    setRemovedImages(prev => [...prev, imageUrl]);
  };

  const removeNewImage = (index: number) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    setLoading(true);
    setError("");

    try {
      // Step 1: Upload new images
      const newImageUrls: string[] = [];
      if (newImages.length > 0) {
        const uploadFormData = new FormData();
        newImages.forEach(image => {
          uploadFormData.append('files', image);
        });

        const uploadResponse = await fetch('/api/upload-image', {
          method: 'POST',
          body: uploadFormData,
        });

        const uploadData = await uploadResponse.json();

        if (!uploadResponse.ok) {
          throw new Error(uploadData.error || 'Failed to upload images');
        }

        newImageUrls.push(...uploadData.urls);
      }

      // Step 2: Update product with all images
      const allImages = [...existingImages, ...newImageUrls];
      
      const updateResponse = await fetch('/api/products', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: product.id,
          ...formData,
          images: allImages,
          removedImages
        }),
      });

      const updateData = await updateResponse.json();

      if (!updateResponse.ok) {
        throw new Error(updateData.error || 'Failed to update product');
      }

      onUpdate();
      onClose();

    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-100">Edit Product</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <span className="text-2xl">×</span>
            </button>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4 mb-6">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* Product Name */}
              <div className="sm:col-span-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-100">
                  Product Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border bg-gray-800 text-white border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              {/* Description */}
              <div className="sm:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-100">
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  required
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange}
                  className="mt-1 bg-gray-800 text-white block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              {/* Price */}
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-100">
                  Price (₦) *
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  required
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="mt-1 text-white bg-gray-800 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-100 mb-1">
                  Category *
                </label>
                <Select
                  components={animatedComponents}
                  options={categoryOptions}
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                  onCreateOption={handleCreateCategory}
                  isSearchable
                  isClearable
                  placeholder="Select or create a category..."
                  className="react-select-container bg-gray-800"
                  classNamePrefix="react-select"
                />
              </div>

              {/* Inventory */}
              <div>
                <label htmlFor="inventory" className="block text-sm font-medium text-gray-100">
                  Inventory *
                </label>
                <input
                  type="number"
                  id="inventory"
                  name="inventory"
                  required
                  min="0"
                  value={formData.inventory}
                  onChange={handleInputChange}
                  className="mt-1 text-white bg-gray-800 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              {/* Sizes */}
              <div>
                <label htmlFor="sizes" className="block text-sm font-medium text-gray-100">
                  Sizes
                </label>
                <input
                  type="text"
                  id="sizes"
                  name="sizes"
                  value={formData.sizes}
                  onChange={handleInputChange}
                  className="mt-1 text-white bg-gray-800 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="S, M, L, XL"
                />
              </div>

              {/* Colors */}
              <div>
                <label htmlFor="colors" className="block text-sm font-medium text-gray-100">
                  Colors
                </label>
                <input
                  type="text"
                  id="colors"
                  name="colors"
                  value={formData.colors}
                  onChange={handleInputChange}
                  className="mt-1 text-white bg-gray-800 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Red, Blue, Green"
                />
              </div>
              {/* Existing Images */}
              {existingImages.length > 0 && (
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-100">
                    Existing Images
                  </label>
                  <div className="mt-2 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                    {existingImages.map((imageUrl, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={imageUrl}
                          alt={`Product image ${index + 1}`}
                          className="h-24 w-full object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(imageUrl)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold hover:bg-red-600 transition-colors"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New Images Upload */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-100">
                  Add New Images
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="new-images"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500"
                      >
                        <span>Upload new images</span>
                        <input
                          id="new-images"
                          name="new-images"
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleNewImageChange}
                          className="sr-only"
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {/* New Images Preview */}
                {newImages.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                    {newImages.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`New image ${index + 1}`}
                          className="h-24 w-full object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeNewImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold hover:bg-red-600 transition-colors"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Featured */}
              <div className="sm:col-span-2">
                <div className="flex items-center">
                  <input
                    id="featured"
                    name="featured"
                    type="checkbox"
                    checked={formData.featured}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="featured" className="ml-2 block text-sm text-gray-100">
                    Feature this product
                  </label>
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 text-red-800 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? "Updating..." : "Update Product"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}