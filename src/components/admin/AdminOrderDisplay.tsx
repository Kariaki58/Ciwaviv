'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  Edit, 
  Eye,
  ChevronLeft,
  ChevronRight,
  User,
  Calendar,
  DollarSign,
  Package,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { format } from 'date-fns';
import OrderEditModal from './OrderEditModal';
import OrderViewModal from './OrderViewModal';

interface OrderItem {
  id: string;
  product: {
    id: string;
    name: string;
    slug: string;
    image: string;
  } | null;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  size?: string;
  color?: string;
  subtotal: number;
}

interface Order {
  id: string;
  orderNumber: string;
  customer: {
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
  };
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  taxAmount: number;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  paystackReference?: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode?: string;
  };
  trackingNumber?: string;
  shippingProvider?: string;
  estimatedDelivery?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalOrders: number;
  hasNext: boolean;
  hasPrev: boolean;
  limit: number;
}

export default function AdminOrderDisplay() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalOrders: 0,
    hasNext: false,
    hasPrev: false,
    limit: 10
  });
  const [filters, setFilters] = useState({
    status: 'all',
    search: ''
  });
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'refunded', label: 'Refunded' }
  ];

  const paymentStatusOptions = [
    { value: 'pending', label: 'Pending', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' },
    { value: 'paid', label: 'Paid', color: 'bg-green-500/20 text-green-300 border-green-500/30' },
    { value: 'failed', label: 'Failed', color: 'bg-red-500/20 text-red-300 border-red-500/30' },
    { value: 'refunded', label: 'Refunded', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' }
  ];

  const statusColors: { [key: string]: string } = {
    pending: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    confirmed: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    processing: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    shipped: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    delivered: 'bg-green-500/20 text-green-300 border-green-500/30',
    cancelled: 'bg-red-500/20 text-red-300 border-red-500/30',
    refunded: 'bg-gray-500/20 text-gray-300 border-gray-500/30'
  };

  const fetchOrders = async (page: number = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(filters.status !== 'all' && { status: filters.status }),
        ...(filters.search && { search: filters.search })
      });

      const response = await fetch(`/api/admin/orders?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch orders');
      }

      setOrders(data.orders);
      setPagination(data.pagination);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filters]);

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
    fetchOrders(page);
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleEditOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsEditModalOpen(true);
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsViewModalOpen(true);
  };

  const handleOrderUpdate = (updatedOrder: Order) => {
    setOrders(prev => prev.map(order => 
      order.id === updatedOrder.id ? updatedOrder : order
    ));
    
    if (selectedOrder && selectedOrder.id === updatedOrder.id) {
      setIsViewModalOpen(false);
      setTimeout(() => {
        setSelectedOrder(updatedOrder);
        setIsViewModalOpen(true);
      }, 100);
    }
  };

  const renderPagination = () => {
    const { currentPage, totalPages } = pagination;
    const pages = [];
    const maxVisiblePages = 3; // Reduced for mobile

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Previous button
    if (currentPage > 1) {
      pages.push(
        <Button
          key="prev"
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          className="flex items-center gap-1 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white text-xs"
        >
          <ChevronLeft className="h-3 w-3" />
          <span>Prev</span>
        </Button>
      );
    }

    // Page numbers - show only current page on mobile
    if (totalPages <= 5) {
      for (let i = startPage; i <= endPage; i++) {
        pages.push(
          <Button
            key={i}
            variant={currentPage === i ? "default" : "outline"}
            size="sm"
            onClick={() => handlePageChange(i)}
            className={`min-w-8 text-xs ${
              currentPage === i 
                ? "bg-primary text-white border-primary" 
                : "border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
            }`}
          >
            {i}
          </Button>
        );
      }
    } else {
      // Show only current page on mobile for many pages
      pages.push(
        <Button
          key={currentPage}
          variant="default"
          size="sm"
          className="min-w-8 text-xs bg-primary text-white border-primary"
        >
          {currentPage}
        </Button>
      );
    }

    // Next button
    if (currentPage < totalPages) {
      pages.push(
        <Button
          key="next"
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          className="flex items-center gap-1 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white text-xs"
        >
          <span>Next</span>
          <ChevronRight className="h-3 w-3" />
        </Button>
      );
    }

    return pages;
  };

  if (loading && orders.length === 0) {
    return (
      <div className="flex-1 bg-gray-800 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-3 text-gray-300 text-sm">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-800 p-3 overflow-auto">
      <div className="max-w-screen-2xl mx-auto">
        {/* Header - Mobile Optimized */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-white">Orders</h1>
              <p className="mt-1 text-xs text-gray-300">
                {pagination.totalOrders} total orders
              </p>
            </div>
          </div>
        </div>

        {/* Filters - Mobile Optimized */}
        <Card className="mb-4 bg-gray-700 border-gray-600">
          <CardContent className="p-3">
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3" />
                <Input
                  placeholder="Search orders..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-9 bg-gray-600 border-gray-500 text-white placeholder-gray-400 focus:border-primary text-sm h-9"
                />
              </div>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 bg-gray-600 border border-gray-500 text-white rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm h-9"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <div className="mb-4 rounded-md bg-red-500/20 border border-red-500/30 p-3">
            <div className="text-xs text-red-300">{error}</div>
          </div>
        )}

        {/* Mobile Cards - Enhanced */}
        <div className="space-y-3">
          {orders.map((order) => (
            <Card key={order.id} className="bg-gray-700 border-gray-600 hover:bg-gray-600/50 transition-colors">
              <CardContent className="p-4">
                {/* Order Header */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="text-sm font-bold text-white">
                        #{order.orderNumber}
                      </div>
                      <Badge className={`border text-xs ${statusColors[order.status] || 'bg-gray-500/20 text-gray-300 border-gray-500/30'}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-300 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(order.createdAt), 'MMM dd, yyyy')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-white">
                      {formatPrice(order.totalAmount)}
                    </div>
                    <Badge className={`border text-xs mt-1 ${
                      paymentStatusOptions.find(p => p.value === order.paymentStatus)?.color || 
                      'bg-gray-500/20 text-gray-300 border-gray-500/30'
                    }`}>
                      {order.paymentStatus}
                    </Badge>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="space-y-2 mb-3">
                  <div className="flex items-center gap-2">
                    <User className="h-3 w-3 text-gray-400 flex-shrink-0" />
                    <div className="text-xs text-gray-300 truncate">
                      {order.customer.firstName} {order.customer.lastName}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-3 w-3 text-gray-400 flex-shrink-0" />
                    <div className="text-xs text-gray-300 truncate">
                      {order.customer.email}
                    </div>
                  </div>
                  {order.customer.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-3 w-3 text-gray-400 flex-shrink-0" />
                      <div className="text-xs text-gray-300">
                        {order.customer.phone}
                      </div>
                    </div>
                  )}
                </div>

                {/* Order Details */}
                <div className="grid grid-cols-2 gap-3 text-xs mb-3 p-2 bg-gray-600/50 rounded-lg">
                  <div>
                    <div className="text-gray-400">Items</div>
                    <div className="text-white font-medium flex items-center gap-1">
                      <Package className="h-3 w-3" />
                      {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400">Payment</div>
                    <div className="text-white font-medium capitalize">
                      {order.paymentMethod}
                    </div>
                  </div>
                </div>

                {/* Shipping Address Preview */}
                {order.shippingAddress && (
                  <div className="flex items-start gap-2 mb-3 p-2 bg-gray-600/30 rounded-lg">
                    <MapPin className="h-3 w-3 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-gray-300">
                      {order.shippingAddress.city}, {order.shippingAddress.state}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-between items-center pt-3 border-t border-gray-600">
                  <div className="text-xs text-gray-400">
                    {order.items.reduce((total, item) => total + item.quantity, 0)} units
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewOrder(order)}
                      className="border-gray-500 bg-gray-600 text-gray-300 hover:bg-gray-500 hover:text-white text-xs h-8 px-3"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditOrder(order)}
                      className="border-gray-500 bg-gray-600 text-green-300 hover:bg-gray-500 hover:text-white text-xs h-8 px-3"
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {orders.length === 0 && !loading && (
          <Card className="bg-gray-700 border-gray-600">
            <CardContent className="p-6 text-center">
              <div className="text-gray-400 mb-3">
                <Filter className="mx-auto h-8 w-8" />
              </div>
              <h3 className="text-sm font-medium text-white mb-2">No orders found</h3>
              <p className="text-gray-400 text-xs">
                {filters.search || filters.status !== 'all' 
                  ? "Try adjusting your search or filters." 
                  : "No orders have been placed yet."
                }
              </p>
            </CardContent>
          </Card>
        )}

        {/* Pagination - Mobile Optimized */}
        {pagination.totalPages > 1 && (
          <div className="mt-4 flex flex-col items-center justify-center gap-3">
            <div className="text-xs text-gray-300 text-center">
              Page {pagination.currentPage} of {pagination.totalPages}
            </div>
            <div className="flex gap-2 justify-center">
              {renderPagination()}
            </div>
            <div className="text-xs text-gray-400 text-center">
              Showing {Math.min(pagination.currentPage * pagination.limit, pagination.totalOrders)} of {pagination.totalOrders} orders
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <OrderViewModal
        key={selectedOrder?.id}
        order={selectedOrder}
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
      />

      <OrderEditModal
        order={selectedOrder}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onUpdate={handleOrderUpdate}
      />
    </div>
  );
}