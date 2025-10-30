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
  ChevronRight
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
    const maxVisiblePages = 5;

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
          className="flex items-center gap-1 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Previous</span>
        </Button>
      );
    }

    // First page and ellipsis
    if (startPage > 1) {
      pages.push(
        <Button
          key={1}
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(1)}
          className="min-w-10 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
        >
          1
        </Button>
      );
      if (startPage > 2) {
        pages.push(
          <span key="ellipsis-start" className="px-2 py-1 text-sm text-gray-400">
            ...
          </span>
        );
      }
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Button
          key={i}
          variant={currentPage === i ? "default" : "outline"}
          size="sm"
          onClick={() => handlePageChange(i)}
          className={`min-w-10 ${
            currentPage === i 
              ? "bg-primary text-white border-primary" 
              : "border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
          }`}
        >
          {i}
        </Button>
      );
    }

    // Last page and ellipsis
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span key="ellipsis-end" className="px-2 py-1 text-sm text-gray-400">
            ...
          </span>
        );
      }
      pages.push(
        <Button
          key={totalPages}
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(totalPages)}
          className="min-w-10 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
        >
          {totalPages}
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
          className="flex items-center gap-1 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      );
    }

    return pages;
  };

  if (loading && orders.length === 0) {
    return (
      <div className="flex-1 bg-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-300">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-800 p-4 overflow-auto">
      <div className="max-w-screen-lg mx-auto">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-white">Orders Management</h1>
          <p className="mt-2 text-sm text-gray-300">
            Manage and track customer orders
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6 bg-gray-700 border-gray-600">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search orders, customers..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10 bg-gray-600 border-gray-500 text-white placeholder-gray-400 focus:border-primary"
                />
              </div>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="px-3 py-2 bg-gray-600 border border-gray-500 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
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
          <div className="mb-6 rounded-md bg-red-500/20 border border-red-500/30 p-4">
            <div className="text-sm text-red-300">{error}</div>
          </div>
        )}

        {/* Orders Table */}
        <Card className="bg-gray-700 border-gray-600">
          <CardHeader>
            <CardTitle className="text-white">All Orders ({pagination.totalOrders})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-600">
                <thead className="bg-gray-600">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Order
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider hidden sm:table-cell">
                      Customer
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider hidden md:table-cell">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider hidden lg:table-cell">
                      Payment
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider hidden xl:table-cell">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-700 divide-y divide-gray-600">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-600/50 transition-colors">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">
                          {order.orderNumber}
                        </div>
                        <div className="text-sm text-gray-300 sm:hidden">
                          {order.customer.firstName} {order.customer.lastName}
                        </div>
                        <div className="text-xs text-gray-400 md:hidden">
                          {order.items.length} item{order.items.length !== 1 ? 's' : ''} • {formatPrice(order.totalAmount)}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap hidden sm:table-cell">
                        <div className="text-sm font-medium text-white">
                          {order.customer.firstName} {order.customer.lastName}
                        </div>
                        <div className="text-sm text-gray-300">
                          {order.customer.email}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-white hidden sm:table-cell">
                        {formatPrice(order.totalAmount)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap hidden md:table-cell">
                        <Badge className={`border ${statusColors[order.status] || 'bg-gray-500/20 text-gray-300 border-gray-500/30'}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap hidden lg:table-cell">
                        <Badge className={`border ${
                          paymentStatusOptions.find(p => p.value === order.paymentStatus)?.color || 
                          'bg-gray-500/20 text-gray-300 border-gray-500/30'
                        }`}>
                          {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300 hidden xl:table-cell">
                        {format(new Date(order.createdAt), 'MMM dd, yyyy')}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewOrder(order)}
                            className="border-gray-500 bg-transparent text-gray-300 hover:bg-gray-600 hover:text-white"
                            title="View Order"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditOrder(order)}
                            className="border-gray-500 text-green-300 bg-transparent hover:bg-gray-600 hover:text-white"
                            title="Edit Order"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Empty State */}
            {orders.length === 0 && !loading && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Filter className="mx-auto h-12 w-12" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">No orders found</h3>
                <p className="text-gray-400">
                  {filters.search || filters.status !== 'all' 
                    ? "Try adjusting your search or filters." 
                    : "No orders have been placed yet."
                  }
                </p>
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-300">
                  Showing{" "}
                  <span className="font-medium text-white">
                    {(pagination.currentPage - 1) * pagination.limit + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium text-white">
                    {Math.min(pagination.currentPage * pagination.limit, pagination.totalOrders)}
                  </span>{" "}
                  of <span className="font-medium text-white">{pagination.totalOrders}</span> orders
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                  {renderPagination()}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

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
    </div>
  );
}