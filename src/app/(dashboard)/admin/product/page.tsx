"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import EditProductModal from "@/components/EditProductModal";
import { 
  Search, 
  Package, 
  DollarSign, 
  BarChart3,
  Calendar,
  Edit,
  Trash2,
  Plus,
  Filter
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  inventory: number;
  featured: boolean;
  rating: number;
  reviewCount: number;
  images: Array<{ src: string; alt: string }>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalProducts: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalProducts: 0,
    hasNext: false,
    hasPrev: false
  });
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPagination(prev => ({ ...prev, currentPage: 1 }));
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  // Fetch products
  useEffect(() => {
    fetchProducts();
  }, [pagination.currentPage, debouncedSearch]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.currentPage.toString(),
        limit: "10",
        ...(debouncedSearch && { search: debouncedSearch })
      });

      const response = await fetch(`/api/products?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch products");
      }

      setProducts(data.products);
      setPagination(data.pagination);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
        return;
    }

    try {
        setDeleteLoading(productId);
        const response = await fetch(`/api/products?id=${productId}`, {
            method: 'DELETE',
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Failed to delete product");
        }

        // Refresh the products list
        fetchProducts();
    } catch (error: any) {
        setError(error.message);
    } finally {
        setDeleteLoading(null);
    }
  };

  const handleUpdateComplete = () => {
    fetchProducts(); // Refresh the list
  };

  const renderPagination = () => {
    const { currentPage, totalPages } = pagination;
    const pages = [];

    // Previous button
    if (currentPage > 1) {
      pages.push(
        <button
          key="prev"
          onClick={() => handlePageChange(currentPage - 1)}
          className="px-3 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-1"
        >
          <span>←</span>
          Prev
        </button>
      );
    }

    // Current page info
    pages.push(
      <div key="current" className="px-3 py-2 text-xs text-gray-500 bg-gray-100 rounded-lg">
        Page {currentPage} of {totalPages}
      </div>
    );

    // Next button
    if (currentPage < totalPages) {
      pages.push(
        <button
          key="next"
          onClick={() => handlePageChange(currentPage + 1)}
          className="px-3 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-1"
        >
          Next
          <span>→</span>
        </button>
      );
    }

    return pages;
  };

  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen bg-gray-800 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-3 text-gray-100 text-sm">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-800 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-white">Products</h1>
              <p className="mt-1 text-xs text-gray-300">
                {pagination.totalProducts} total products
              </p>
            </div>
            <Link
              href="/admin/product-upload"
              className="inline-flex items-center gap-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4" />
              Add New
            </Link>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm placeholder-gray-400"
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 rounded-lg bg-red-900/50 border border-red-700 p-4">
            <div className="text-sm text-red-200">{error}</div>
          </div>
        )}

        {/* Products Grid */}
        <div className="space-y-3">
          {products.map((product) => (
            <div key={product.id} className="bg-gray-700 rounded-xl p-4 border border-gray-600 hover:border-gray-500 transition-colors">
              {/* Product Header */}
              <div className="flex items-start gap-3 mb-3">
                <div className="flex-shrink-0">
                  {product.images.length > 0 ? (
                    <img
                      className="h-14 w-14 rounded-lg object-cover"
                      src={product.images[0].src}
                      alt={product.images[0].alt}
                    />
                  ) : (
                    <div className="h-14 w-14 rounded-lg bg-gray-600 flex items-center justify-center">
                      <Package className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-white line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-xs text-gray-300 mt-1 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs px-2 py-1 bg-gray-600 text-gray-300 rounded-full">
                      {product.category}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <BarChart3 className="h-3 w-3" />
                      {product.inventory} in stock
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Details Grid */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-400" />
                    <div>
                      <div className="text-xs text-gray-400">Price</div>
                      <div className="text-sm font-semibold text-white">
                        {formatPrice(product.price)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-400" />
                    <div>
                      <div className="text-xs text-gray-400">Created</div>
                      <div className="text-xs text-white">
                        {formatDate(product.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Status</div>
                    <div className="flex flex-wrap gap-1">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          product.isActive
                            ? "bg-green-900 text-green-200"
                            : "bg-red-900 text-red-200"
                        }`}
                      >
                        {product.isActive ? "Active" : "Inactive"}
                      </span>
                      {product.featured && (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-900 text-blue-200">
                          Featured
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-between items-center pt-3 border-t border-gray-600">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <div className={`w-2 h-2 rounded-full ${product.isActive ? 'bg-green-400' : 'bg-red-400'}`}></div>
                  {product.isActive ? 'Active' : 'Inactive'}
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleEdit(product)}
                    className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium text-indigo-400 hover:text-indigo-300 bg-indigo-900/20 rounded-lg hover:bg-indigo-900/30 transition-colors"
                  >
                    <Edit className="h-3 w-3" />
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(product.id)}
                    disabled={deleteLoading === product.id}
                    className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium text-red-400 hover:text-red-300 bg-red-900/20 rounded-lg hover:bg-red-900/30 disabled:opacity-50 transition-colors"
                  >
                    <Trash2 className="h-3 w-3" />
                    {deleteLoading === product.id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <EditProductModal
          product={editingProduct}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onUpdate={handleUpdateComplete}
        />

        {/* Empty State */}
        {products.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Package className="mx-auto h-12 w-12" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No products found</h3>
            <p className="text-gray-300 text-sm mb-6 max-w-sm mx-auto">
              {debouncedSearch ? "Try adjusting your search terms." : "Get started by adding your first product."}
            </p>
            <Link
              href="/admin/product-upload"
              className="inline-flex items-center gap-2 px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 w-full justify-center"
            >
              <Plus className="h-5 w-5" />
              Add New Product
            </Link>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-6 flex flex-col items-center justify-center gap-4">
            <div className="text-xs text-gray-400 text-center">
              Showing {Math.min(pagination.currentPage * 10, pagination.totalProducts)} of {pagination.totalProducts} products
            </div>
            <div className="flex gap-2 justify-center">
              {renderPagination()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}