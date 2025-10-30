"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Package, 
  Users, 
  ShoppingCart, 
  TrendingUp, 
  Calendar,
  ArrowUp,
  ArrowDown,
  CreditCard,
  Sparkles
} from "lucide-react";

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  revenueGrowth: number;
  orderGrowth: number;
  recentOrders: any[];
  topProducts: any[];
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('week');

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/dashboard?range=${timeRange}`);
      const data = await response.json();

      if (response.ok) {
        setStats(data);
      } else {
        console.error('Error fetching dashboard data:', data.error);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      day: 'numeric',
      month: 'short',
    });
  };

  const getStatusColor = (status: string) => {
    const colors = {
      delivered: 'bg-green-500/10 text-green-600 border-green-500/20',
      pending: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
      confirmed: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
      shipped: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
      cancelled: 'bg-red-500/10 text-red-600 border-red-500/20'
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-500 border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-400 text-lg">Loading dashboard...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <main className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Sparkles className="h-6 w-6 text-blue-400" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Dashboard
              </h1>
            </div>
            <p className="text-gray-400 ml-12">Welcome to your store overview</p>
          </div>
          <div className="flex space-x-2 mt-4 sm:mt-0 bg-gray-800/50 rounded-lg p-1">
            {['today', 'week', 'month'].map((range) => (
              <Button
                key={range}
                variant="ghost"
                size="sm"
                onClick={() => setTimeRange(range as any)}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-all ${
                  timeRange === range
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                {range === 'today' ? 'Today' : range === 'week' ? 'This Week' : 'This Month'}
              </Button>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Revenue Card */}
          <Card className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 border-gray-700/50 backdrop-blur-sm shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400 mb-2">Total Revenue</p>
                  <p className="text-2xl font-bold text-white mb-3">
                    {stats ? formatPrice(stats.totalRevenue) : '₦0'}
                  </p>
                  <div className="flex items-center">
                    {stats?.revenueGrowth && (
                      <>
                        <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          stats.revenueGrowth >= 0 
                            ? 'bg-green-500/10 text-green-400' 
                            : 'bg-red-500/10 text-red-400'
                        }`}>
                          {stats.revenueGrowth >= 0 ? (
                            <ArrowUp className="h-3 w-3 mr-1" />
                          ) : (
                            <ArrowDown className="h-3 w-3 mr-1" />
                          )}
                          {Math.abs(stats.revenueGrowth)}%
                        </div>
                        <span className="text-gray-500 text-sm ml-2">vs last period</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                  <CreditCard className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Orders Card */}
          <Card className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 border-gray-700/50 backdrop-blur-sm shadow-2xl hover:shadow-green-500/10 transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400 mb-2">Total Orders</p>
                  <p className="text-2xl font-bold text-white mb-3">
                    {stats?.totalOrders || 0}
                  </p>
                  <div className="flex items-center">
                    {stats?.orderGrowth && (
                      <>
                        <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          stats.orderGrowth >= 0 
                            ? 'bg-green-500/10 text-green-400' 
                            : 'bg-red-500/10 text-red-400'
                        }`}>
                          {stats.orderGrowth >= 0 ? (
                            <ArrowUp className="h-3 w-3 mr-1" />
                          ) : (
                            <ArrowDown className="h-3 w-3 mr-1" />
                          )}
                          {Math.abs(stats.orderGrowth)}%
                        </div>
                        <span className="text-gray-500 text-sm ml-2">vs last period</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
                  <ShoppingCart className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Products Card */}
          <Card className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 border-gray-700/50 backdrop-blur-sm shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400 mb-2">Products</p>
                  <p className="text-2xl font-bold text-white mb-3">
                    {stats?.totalProducts || 0}
                  </p>
                  <div className="flex items-center">
                    <span className="text-gray-500 text-sm">Active in store</span>
                  </div>
                </div>
                <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
                  <Package className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customers Card */}
          <Card className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 border-gray-700/50 backdrop-blur-sm shadow-2xl hover:shadow-orange-500/10 transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400 mb-2">Customers</p>
                  <p className="text-2xl font-bold text-white mb-3">
                    {stats?.totalCustomers || 0}
                  </p>
                  <div className="flex items-center">
                    <span className="text-gray-500 text-sm">Newsletter subscribers</span>
                  </div>
                </div>
                <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <Card className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 border-gray-700/50 backdrop-blur-sm shadow-2xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-white flex items-center text-lg">
                <div className="p-2 bg-blue-500/10 rounded-lg mr-3">
                  <ShoppingCart className="h-5 w-5 text-blue-400" />
                </div>
                Recent Orders
                <span className="ml-2 text-sm text-gray-400 font-normal">
                  ({stats?.recentOrders?.length || 0})
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {stats?.recentOrders && stats.recentOrders.length > 0 ? (
                <div className="space-y-3">
                  {stats.recentOrders.slice(0, 5).map((order) => (
                    <div 
                      key={order._id} 
                      className="flex items-center justify-between p-4 bg-gray-700/30 rounded-xl border border-gray-600/30 hover:border-gray-500/50 transition-all duration-200"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-gray-600/50 rounded-lg">
                          <CreditCard className="h-4 w-4 text-gray-300" />
                        </div>
                        <div>
                          <p className="font-semibold text-white text-sm">#{order.orderNumber}</p>
                          <p className="text-xs text-gray-400">{formatDate(order.createdAt)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-white text-sm">{formatPrice(order.totalAmount)}</p>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <ShoppingCart className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">No recent orders</p>
                  <p className="text-gray-500 text-sm mt-1">Orders will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Products */}
          <Card className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 border-gray-700/50 backdrop-blur-sm shadow-2xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-white flex items-center text-lg">
                <div className="p-2 bg-green-500/10 rounded-lg mr-3">
                  <TrendingUp className="h-5 w-5 text-green-400" />
                </div>
                Top Products
                <span className="ml-2 text-sm text-gray-400 font-normal">
                  ({stats?.topProducts?.length || 0})
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {stats?.topProducts && stats.topProducts.length > 0 ? (
                <div className="space-y-3">
                  {stats.topProducts.slice(0, 5).map((product, index) => (
                    <div 
                      key={product._id} 
                      className="flex items-center justify-between p-4 bg-gray-700/30 rounded-xl border border-gray-600/30 hover:border-gray-500/50 transition-all duration-200"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg text-white text-sm font-bold">
                          {index + 1}
                        </div>
                        <div className="max-w-[140px]">
                          <p className="font-semibold text-white text-sm truncate">{product.name}</p>
                          <p className="text-xs text-gray-400">{product.sold || 0} sold</p>
                        </div>
                      </div>
                      <p className="font-semibold text-white text-sm">{formatPrice(product.price)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">No products data</p>
                  <p className="text-gray-500 text-sm mt-1">Products will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats Footer */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            Last updated: {new Date().toLocaleTimeString('en-NG', { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: true 
            })}
          </p>
        </div>
      </main>
    </div>
  );
}