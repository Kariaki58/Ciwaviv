// app/dashboard/orders/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import useSWR from "swr";

// Types
/**
 * @typedef {Object} OrderItem
 * @property {string} productName
 * @property {string} productImage
 * @property {number} quantity
 * @property {number} price
 * @property {string} [size]
 * @property {string} [color]
 * @property {number} subtotal
 */

/**
 * @typedef {Object} CustomerInfo
 * @property {string} email
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} phone
 */

/**
 * @typedef {Object} ShippingAddress
 * @property {string} street
 * @property {string} city
 * @property {string} state
 * @property {string} country
 * @property {string} [zipCode]
 */

/**
 * @typedef {Object} Order
 * @property {string} id
 * @property {string} orderNumber
 * @property {CustomerInfo} customer
 * @property {OrderItem[]} items
 * @property {number} subtotal
 * @property {number} shippingFee
 * @property {number} taxAmount
 * @property {number} totalAmount
 * @property {'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'} status
 * @property {'pending' | 'paid' | 'failed' | 'refunded'} paymentStatus
 * @property {string} paymentMethod
 * @property {ShippingAddress} shippingAddress
 * @property {string} [shippingProvider]
 * @property {string} [estimatedDelivery]
 * @property {string} [notes]
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} OrdersResponse
 * @property {boolean} success
 * @property {Order[]} orders
 * @property {Object} pagination
 * @property {number} pagination.currentPage
 * @property {number} pagination.totalPages
 * @property {number} pagination.totalOrders
 * @property {boolean} pagination.hasNext
 * @property {boolean} pagination.hasPrev
 */

/**
 * @typedef {Object} ShippingProvider
 * @property {string} id
 * @property {string} name
 */

/**
 * @typedef {Object} StatusConfig
 * @property {string} label
 * @property {string} color
 */

/**
 * @typedef {Object} EditDialogState
 * @property {boolean} open
 * @property {Order | null} order
 */

/**
 * @typedef {Object} DetailDialogState
 * @property {boolean} open
 * @property {Order | null} order
 */

/**
 * @typedef {Object} FormData
 * @property {string} status
 * @property {string} shippingProvider
 * @property {string} estimatedDelivery
 * @property {string} notes
 */

const fetcher = (url) => fetch(url).then((res) => res.json());

/** @type {Record<string, StatusConfig>} */
const statusConfig = {
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  confirmed: { label: "Confirmed", color: "bg-blue-100 text-blue-800 border-blue-200" },
  processing: { label: "Processing", color: "bg-purple-100 text-purple-800 border-purple-200" },
  shipped: { label: "Shipped", color: "bg-indigo-100 text-indigo-800 border-indigo-200" },
  delivered: { label: "Delivered", color: "bg-green-100 text-green-800 border-green-200" },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-800 border-red-200" },
  refunded: { label: "Refunded", color: "bg-gray-100 text-gray-800 border-gray-200" },
};

/** @type {Record<string, StatusConfig>} */
const paymentStatusConfig = {
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  paid: { label: "Paid", color: "bg-green-100 text-green-800 border-green-200" },
  failed: { label: "Failed", color: "bg-red-100 text-red-800 border-red-200" },
  refunded: { label: "Refunded", color: "bg-gray-100 text-gray-800 border-gray-200" },
};

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  /** @type {[number, React.Dispatch<React.SetStateAction<number>>]} */
  const [page, setPage] = useState(1);
  /** @type {[string, React.Dispatch<React.SetStateAction<string>>]} */
  const [search, setSearch] = useState("");
  /** @type {[string, React.Dispatch<React.SetStateAction<string>>]} */
  const [debouncedSearch, setDebouncedSearch] = useState("");
  /** @type {[string, React.Dispatch<React.SetStateAction<string>>]} */
  const [statusFilter, setStatusFilter] = useState("all");
  /** @type {[string, React.Dispatch<React.SetStateAction<string>>]} */
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
  /** @type {[EditDialogState, React.Dispatch<React.SetStateAction<EditDialogState>>]} */
  const [editDialog, setEditDialog] = useState({ open: false, order: null });
  /** @type {[DetailDialogState, React.Dispatch<React.SetStateAction<DetailDialogState>>]} */
  const [detailDialog, setDetailDialog] = useState({ open: false, order: null });
  /** @type {[string | null, React.Dispatch<React.SetStateAction<string | null>>]} */
  const [dropdownOpen, setDropdownOpen] = useState(null);

  /** @type {[FormData, React.Dispatch<React.SetStateAction<FormData>>]} */
  const [formData, setFormData] = useState({
    status: "",
    shippingProvider: "",
    estimatedDelivery: "",
    notes: "",
  });

  /** @type {import('swr').SWRResponse<{ success: boolean; providers: ShippingProvider[] }, any>} */
  const { data: providersData } = useSWR(
    session ? "/api/admin/orders" : null,
    (url) => fetch(url, { method: 'POST' }).then(res => res.json()),
    { revalidateOnFocus: false }
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  /** @type {import('swr').SWRResponse<OrdersResponse, any>} */
  const { data: ordersData, error: ordersError, mutate: mutateOrders, isLoading: ordersLoading } = useSWR(
    session 
      ? `/api/admin/orders?page=${page}&limit=10&search=${debouncedSearch}&status=${statusFilter === "all" ? "" : statusFilter}&paymentStatus=${paymentStatusFilter === "all" ? "" : paymentStatusFilter}`
      : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  /**
   * Handle opening the edit dialog for an order
   * @param {Order} order - The order to edit
   */
  const handleOpenEditDialog = (order) => {
    setEditDialog({ open: true, order });
    setFormData({
      status: order.status,
      shippingProvider: providersData?.providers.find(p => p.name === order.shippingProvider)?.id || "",
      estimatedDelivery: order.estimatedDelivery ? new Date(order.estimatedDelivery).toISOString().split('T')[0] : "",
      notes: order.notes || "",
    });
  };

  /**
   * Handle closing the edit dialog
   */
  const handleCloseEditDialog = () => {
    setEditDialog({ open: false, order: null });
    setFormData({
      status: "",
      shippingProvider: "",
      estimatedDelivery: "",
      notes: "",
    });
  };

  /**
   * Handle form submission for order updates
   * @param {React.FormEvent} e - The form event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editDialog.order) return;

    try {
      const response = await fetch("/api/admin/orders", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: editDialog.order.id,
          ...formData,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        toast.textContent = data.message || 'Order updated successfully';
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);

        mutateOrders();
        handleCloseEditDialog();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      toast.textContent = error.message || 'Failed to update order';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    }
  };

  /**
   * Get the SVG icon for a given status
   * @param {string} status - The order status
   * @returns {Object} Object with __html property containing SVG string
   */
  const getStatusIcon = (status) => {
    /** @type {Record<string, string>} */
    const icons = {
      pending: '<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>',
      confirmed: '<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>',
      processing: '<svg class="w-3 h-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>',
      shipped: '<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>',
      delivered: '<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>',
      cancelled: '<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>',
      refunded: '<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path></svg>'
    };
    return { __html: icons[status] || icons.pending };
  };

  /**
   * Get the SVG icon for a given payment status
   * @param {string} status - The payment status
   * @returns {Object} Object with __html property containing SVG string
   */
  const getPaymentStatusIcon = (status) => {
    /** @type {Record<string, string>} */
    const icons = {
      pending: '<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>',
      paid: '<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>',
      failed: '<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>',
      refunded: '<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path></svg>'
    };
    return { __html: icons[status] || icons.pending };
  };

  /** @type {Order[]} */
  const orders = ordersData?.orders || [];
  /** @type {number} */
  const totalPages = ordersData?.pagination.totalPages || 1;
  /** @type {ShippingProvider[]} */
  const shippingProviders = providersData?.providers || [];

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <svg className="w-8 h-8 animate-spin text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
        </svg>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
          </svg>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
            <p className="text-gray-500">Manage and track customer orders</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 sm:max-w-md">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
              <input
                type="text"
                placeholder="Search orders, customers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full sm:w-40 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
                <option value="refunded">Refunded</option>
              </select>

              <select 
                value={paymentStatusFilter} 
                onChange={(e) => setPaymentStatusFilter(e.target.value)}
                className="w-full sm:w-40 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              >
                <option value="all">All Payments</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Orders Table */}
          <div className="rounded-md border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Order</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Customer</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Payment</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Shipping</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 w-[100px]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">#{order.orderNumber}</div>
                      <div className="text-sm text-gray-500">
                        {order.items.length} item{order.items.length > 1 ? 's' : ''}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-gray-900">
                          {order.customer.firstName} {order.customer.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{order.customer.email}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">₦{order.totalAmount.toLocaleString()}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusConfig[order.status].color}`}>
                        <span dangerouslySetInnerHTML={getStatusIcon(order.status)} />
                        {statusConfig[order.status].label}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${paymentStatusConfig[order.paymentStatus].color}`}>
                        <span dangerouslySetInnerHTML={getPaymentStatusIcon(order.paymentStatus)} />
                        {paymentStatusConfig[order.paymentStatus].label}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {order.shippingProvider ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                          {order.shippingProvider}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">Not shipped</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="relative">
                        <button 
                          className="p-1 hover:bg-gray-100 rounded transition-colors dropdown-trigger"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDropdownOpen(dropdownOpen === order.id ? null : order.id);
                          }}
                        >
                          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"></path>
                          </svg>
                        </button>

                        {dropdownOpen === order.id && (
                          <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border border-gray-200 z-10 min-w-[150px]">
                            <button 
                              className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-sm"
                              onClick={() => {
                                setDetailDialog({ open: true, order });
                                setDropdownOpen(null);
                              }}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                              </svg>
                              View Details
                            </button>
                            <button 
                              className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-sm"
                              onClick={() => {
                                handleOpenEditDialog(order);
                                setDropdownOpen(null);
                              }}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                              </svg>
                              Update Order
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {orders.length === 0 && !ordersLoading && (
              <div className="text-center py-12">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                </svg>
                <h3 className="text-lg font-medium text-gray-900">No orders found</h3>
                <p className="text-gray-500 mt-1">
                  {debouncedSearch || statusFilter !== "all" || paymentStatusFilter !== "all" 
                    ? "Try adjusting your filters" 
                    : "No orders have been placed yet."}
                </p>
              </div>
            )}

            {ordersLoading && (
              <div className="flex items-center justify-center py-12">
                <svg className="w-6 h-6 animate-spin text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    className={`px-3 py-1 text-sm rounded border transition-colors ${
                      page === pageNum 
                        ? 'bg-blue-600 text-white border-blue-600' 
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => setPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Order Dialog */}
      {editDialog.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Update Order #{editDialog.order?.orderNumber}</h2>
              <p className="text-gray-500 mt-1">Update order status and shipping information</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Order Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                  >
                    <option value="">Select status</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>

                {formData.status === 'processing' && (
                  <div>
                    <label htmlFor="estimatedDelivery" className="block text-sm font-medium text-gray-700 mb-1">
                      Estimated Delivery *
                    </label>
                    <input
                      type="date"
                      id="estimatedDelivery"
                      value={formData.estimatedDelivery}
                      onChange={(e) => setFormData({ ...formData, estimatedDelivery: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Required when moving order to processing
                    </p>
                  </div>
                )}

                {formData.status === 'shipped' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Shipping Provider *</label>
                    <select
                      value={formData.shippingProvider}
                      onChange={(e) => setFormData({ ...formData, shippingProvider: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                    >
                      <option value="">Select shipping provider</option>
                      {shippingProviders.map((provider) => (
                        <option key={provider.id} value={provider.id}>
                          {provider.name}
                        </option>
                      ))}
                    </select>
                    <p className="text-sm text-gray-500 mt-1">
                      Select the shipping company used for this order
                    </p>
                  </div>
                )}

                {editDialog.order?.shippingProvider && (
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <label className="block text-sm font-medium text-blue-700 mb-1">Current Shipping Information</label>
                    <div className="mt-1">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                        {editDialog.order.shippingProvider}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Order Notes</label>
                <textarea
                  id="notes"
                  placeholder="Add any notes about this order (tracking info, special instructions, etc.)..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors resize-none"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Add tracking numbers, delivery instructions, or any other important information
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseEditDialog}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Update Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Details Dialog */}
      {detailDialog.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Order Details #{detailDialog.order?.orderNumber}</h2>
              <p className="text-gray-500 mt-1">Complete order information and customer details</p>
            </div>

            {detailDialog.order && (
              <div className="p-6 space-y-6">
                {/* Order Summary */}
                <div className="bg-white rounded-lg border border-gray-200">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Order Summary</h3>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Order Status</p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border mt-1 ${statusConfig[detailDialog.order.status].color}`}>
                          {statusConfig[detailDialog.order.status].label}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Payment Status</p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border mt-1 ${paymentStatusConfig[detailDialog.order.paymentStatus].color}`}>
                          {paymentStatusConfig[detailDialog.order.paymentStatus].label}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Total Amount</p>
                        <p className="font-medium text-gray-900 mt-1">₦{detailDialog.order.totalAmount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Order Date</p>
                        <p className="font-medium text-gray-900 mt-1">
                          {new Date(detailDialog.order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {detailDialog.order.shippingProvider && (
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-700">Shipping Provider</p>
                        <p className="font-medium text-blue-900">{detailDialog.order.shippingProvider}</p>
                      </div>
                    )}

                    {detailDialog.order.estimatedDelivery && (
                      <div>
                        <p className="text-sm text-gray-500">Estimated Delivery</p>
                        <p className="font-medium text-gray-900 mt-1">
                          {new Date(detailDialog.order.estimatedDelivery).toLocaleDateString()}
                        </p>
                      </div>
                    )}

                    {detailDialog.order.notes && (
                      <div>
                        <p className="text-sm text-gray-500">Notes</p>
                        <p className="text-sm text-gray-700 mt-1">{detailDialog.order.notes}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Customer Information */}
                <div className="bg-white rounded-lg border border-gray-200">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                      </svg>
                      Customer Information
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Name</p>
                        <p className="font-medium text-gray-900 mt-1">
                          {detailDialog.order.customer.firstName} {detailDialog.order.customer.lastName}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium text-gray-900 mt-1">{detailDialog.order.customer.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="font-medium text-gray-900 mt-1">{detailDialog.order.customer.phone}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="bg-white rounded-lg border border-gray-200">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      </svg>
                      Shipping Address
                    </h3>
                  </div>
                  <div className="p-6">
                    <p className="font-medium text-gray-900">{detailDialog.order.shippingAddress.street}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {detailDialog.order.shippingAddress.city}, {detailDialog.order.shippingAddress.state}
                    </p>
                    <p className="text-sm text-gray-600">
                      {detailDialog.order.shippingAddress.country} {detailDialog.order.shippingAddress.zipCode}
                    </p>
                  </div>
                </div>

                {/* Order Items */}
                <div className="bg-white rounded-lg border border-gray-200">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Order Items</h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {detailDialog.order.items.map((item, index) => (
                        <div key={index} className="flex items-center gap-4 py-3 border-b border-gray-200">
                          <img
                            src={item.productImage}
                            alt={item.productName}
                            className="w-12 h-12 rounded object-cover border border-gray-200"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{item.productName}</p>
                            <div className="flex gap-4 text-sm text-gray-500 mt-1">
                              <span>Qty: {item.quantity}</span>
                              {item.size && <span>Size: {item.size}</span>}
                              {item.color && <span>Color: {item.color}</span>}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900">₦{item.subtotal.toLocaleString()}</p>
                            <p className="text-sm text-gray-500">₦{item.price.toLocaleString()} each</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Order Totals */}
                    <div className="mt-6 space-y-2 border-t border-gray-200 pt-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subtotal</span>
                        <span>₦{detailDialog.order.subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Shipping</span>
                        <span>₦{detailDialog.order.shippingFee.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tax</span>
                        <span>₦{detailDialog.order.taxAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg border-t border-gray-200 pt-2">
                        <span>Total</span>
                        <span>₦{detailDialog.order.totalAmount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end p-6 border-t border-gray-200">
              <button
                onClick={() => setDetailDialog({ open: false, order: null })}
                className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}