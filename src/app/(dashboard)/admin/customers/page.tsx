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
    <div className="min-h-screen bg-gray-800 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Newsletter Subscribers</h1>
          <p className="mt-2 text-sm text-gray-300">
            Manage your email list and newsletter subscribers
          </p>
        </div>

        {/* Search and Actions */}
        <Card className="mb-6 bg-gray-700 border-gray-600">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <form onSubmit={handleSearch} className="flex gap-2 flex-1 max-w-md">
                <Input
                  type="email"
                  placeholder="Search by email..."
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  className="flex-grow bg-gray-600 border-gray-500 text-white placeholder-gray-400"
                />
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
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
                    className="border-gray-500 text-gray-300 hover:bg-gray-600 hover:text-white"
                  >
                    Clear
                  </Button>
                )}
              </form>
            </div>
          </CardContent>
        </Card>

        {/* Customers List */}
        <Card className="bg-gray-700 border-gray-600">
          <CardHeader>
            <CardTitle className="text-white">
              Subscribers ({customers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
                <p className="mt-2 text-gray-300">Loading subscribers...</p>
              </div>
            ) : customers.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                {searchEmail ? 'No subscribers found matching your search.' : 'No subscribers yet.'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-600">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Date Subscribed
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-600">
                    {customers.map((customer) => (
                      <tr key={customer._id} className="hover:bg-gray-600 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-white">
                            {customer.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-300">
                            {formatDate(customer.createdAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-900 text-green-200">
                            Active
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}