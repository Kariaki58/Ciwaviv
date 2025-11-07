"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Customer {
  _id: string;
  email: string;
  createdAt: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchEmail, setSearchEmail] = useState("");
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async (email?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (email) params.append('email', email);
      
      const response = await fetch(`/api/customers?${params}`);
      const data = await response.json();

      if (response.ok) {
        setCustomers(data.customers || []);
      } else {
        console.error('Error fetching customers:', data.error);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCustomers(searchEmail);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Newsletter Subscribers</h1>
          <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-300">
            Manage your email list and newsletter subscribers
          </p>
        </div>

        {/* Search and Actions */}
        <Card className="mb-4 sm:mb-6 bg-gray-700 border-gray-600">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col gap-4">
              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 w-full">
                <div className="flex-1 flex flex-col sm:flex-row gap-2">
                  <Input
                    type="email"
                    placeholder="Search by email..."
                    value={searchEmail}
                    onChange={(e) => setSearchEmail(e.target.value)}
                    className="flex-grow bg-gray-600 border-gray-500 text-white placeholder-gray-400 text-sm sm:text-base"
                  />
                  <div className="flex gap-2">
                    <Button 
                      type="submit" 
                      className="bg-blue-600 hover:bg-blue-700 text-white flex-1 sm:flex-none"
                      size="sm"
                    >
                      Search
                    </Button>
                    {searchEmail && (
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => {
                          setSearchEmail("");
                          fetchCustomers();
                        }}
                        className="border-gray-500 text-gray-300 hover:bg-gray-600 hover:text-white flex-1 sm:flex-none"
                        size="sm"
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </CardContent>
        </Card>

        {/* Customers List */}
        <Card className="bg-gray-700 border-gray-600">
          <CardHeader className="px-4 sm:px-6 py-4">
            <CardTitle className="text-white text-lg sm:text-xl">
              Subscribers ({customers.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 sm:p-6">
            {loading ? (
              <div className="text-center py-8 px-4">
                <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-white mx-auto"></div>
                <p className="mt-2 text-gray-300 text-sm sm:text-base">Loading subscribers...</p>
              </div>
            ) : customers.length === 0 ? (
              <div className="text-center py-8 px-4 text-gray-400 text-sm sm:text-base">
                {searchEmail ? 'No subscribers found matching your search.' : 'No subscribers yet.'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                {/* Desktop Table */}
                <div className="hidden sm:block">
                  <table className="min-w-full divide-y divide-gray-600">
                    <thead>
                      <tr>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Date Subscribed
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-600">
                      {customers.map((customer) => (
                        <tr key={customer._id} className="hover:bg-gray-600 transition-colors">
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-white">
                              {customer.email}
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-300">
                              {formatDate(customer.createdAt)}
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-900 text-green-200">
                              Active
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="sm:hidden space-y-3 p-4">
                  {customers.map((customer) => (
                    <div key={customer._id} className="bg-gray-600 rounded-lg p-4 hover:bg-gray-500 transition-colors">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <div className="text-sm font-medium text-white truncate flex-1 mr-2">
                            {customer.email}
                          </div>
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-900 text-green-200 shrink-0">
                            Active
                          </span>
                        </div>
                        <div className="text-xs text-gray-300">
                          Joined: {formatDate(customer.createdAt)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}