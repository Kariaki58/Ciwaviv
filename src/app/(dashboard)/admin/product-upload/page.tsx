"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";


interface Category {
  _id: string;
  name: string;
}

interface SelectOption {
  value: string;
  label: string;
  __isNew__?: boolean;
}


export default function ProductUpload() {
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
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [categorySuggestions, setCategorySuggestions] = useState([]);
  const router = useRouter();

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Update category suggestions when categories change
  useEffect(() => {
    const categoryNames = categories.map(category => category.name);
    
    // Add default categories if they don't exist
    const defaultCategories = ['Men', 'Women'];
    defaultCategories.forEach(cat => {
      if (!categoryNames.find(name => name.toLowerCase() === cat.toLowerCase())) {
        categoryNames.push(cat);
      }
    });
    
    setCategorySuggestions(categoryNames);
  }, [categories]);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setImages(prev => [...prev, ...filesArray]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Validate category
      if (!formData.category) {
        throw new Error("Please select or create a category");
      }

      // Step 1: Upload images first
      if (images.length === 0) {
        throw new Error("At least one image is required");
      }

      const uploadFormData = new FormData();
      images.forEach(image => {
        uploadFormData.append('files', image);
      });

      // Upload images
      const uploadResponse = await fetch('/api/upload-image', {
        method: 'POST',
        body: uploadFormData,
      });

      const uploadData = await uploadResponse.json();

      if (!uploadResponse.ok) {
        throw new Error(uploadData.error || 'Failed to upload images');
      }

      // Step 2: Create product with the uploaded image URLs
      const productResponse = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          images: uploadData.urls // Use the uploaded image URLs
        }),
      });

      const productData = await productResponse.json();

      if (!productResponse.ok) {
        throw new Error(productData.error || 'Failed to create product');
      }

      setSuccess('Product created successfully!');
      
      // Reset form
      setFormData({
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
      setImages([]);

    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-700 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-100 mb-4"
          >
            ← Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-100">Add New Product</h1>
          <p className="mt-2 text-sm text-gray-100">
            List a new product in your store
          </p>
        </div>

        <div className="bg-gray-800 shadow rounded-lg">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}

            {success && (
              <div className="rounded-md bg-green-50 p-4">
                <div className="text-sm text-green-700">{success}</div>
              </div>
            )}

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
                  placeholder="Enter product name"
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
                  className="mt-1 block w-full bg-gray-800 text-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Describe your product in detail"
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
                  className="mt-1 bg-gray-800 text-white block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="0.00"
                />
              </div>

              {/* Category - Regular Input with Suggestions */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-100">
                Category *
              </label>
              <input
                type="text"
                id="category"
                name="category"
                required
                list="category-suggestions"
                value={formData.category}
                onChange={handleInputChange}
                className="mt-1 bg-gray-800 text-white block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter category or select from suggestions"
              />
              <datalist id="category-suggestions">
                {categorySuggestions.map((category, index) => (
                  <option key={index} value={category} />
                ))}
              </datalist>
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
                  className="mt-1 bg-gray-800 text-white block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="0"
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
                  className="mt-1 bg-gray-800 text-white block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="S, M, L, XL"
                />
                <p className="mt-1 text-sm text-gray-500">Separate sizes with commas</p>
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
                  className="mt-1 block w-full border bg-gray-800 text-white border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Red, Blue, Green"
                />
                <p className="mt-1 text-sm text-gray-500">Separate colors with commas</p>
              </div>

              {/* Images Upload */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-100">
                  Product Images *
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-100"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="images"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                      >
                        <span>Upload images</span>
                        <input
                          id="images"
                          name="images"
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageChange}
                          className="sr-only"
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, WEBP up to 10MB each
                    </p>
                  </div>
                </div>

                {/* Preview Images */}
                {images.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-100 mb-2">
                      Selected Images ({images.length})
                    </p>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                      {images.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={URL.createObjectURL(image)}
                            alt={`Preview ${index + 1}`}
                            className="h-24 w-full object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold hover:bg-red-600 transition-colors"
                          >
                            ×
                          </button>
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all rounded-lg"></div>
                        </div>
                      ))}
                    </div>
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
                onClick={() => router.back()}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-100 bg-red-950 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Creating Product..." : "Create Product"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}