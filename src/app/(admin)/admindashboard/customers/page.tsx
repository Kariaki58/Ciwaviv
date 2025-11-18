// app/dashboard/customers/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import {
  Users,
  Mail,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Shield,
  User as UserIcon,
  Loader2,
  Download,
} from "lucide-react";

interface Customer {
  id: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "customer";
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CustomersResponse {
  success: boolean;
  customers: Customer[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCustomers: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

interface UsersResponse {
  success: boolean;
  users: User[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalUsers: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function CustomersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<"newsletter" | "users">("newsletter");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [deleteDialog, setDeleteDialog] = useState({ open: false, type: "", id: "", name: "" });
  const [roleDialog, setRoleDialog] = useState({ open: false, user: null as User | null });

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  // Fetch newsletter subscribers
  const { data: customersData, error: customersError, mutate: mutateCustomers, isLoading: customersLoading } = useSWR<CustomersResponse>(
    session && activeTab === "newsletter" 
      ? `/api/customers?page=${page}&limit=10&search=${debouncedSearch}`
      : null,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  // Fetch users
  const { data: usersData, error: usersError, mutate: mutateUsers, isLoading: usersLoading } = useSWR<UsersResponse>(
    session && activeTab === "users" 
      ? `/api/admin/users?page=${page}&limit=10&search=${debouncedSearch}&role=${roleFilter === "all" ? "" : roleFilter}`
      : null,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  const handleDelete = async () => {
    try {
      const url = deleteDialog.type === "newsletter" 
        ? `/api/customers?id=${deleteDialog.id}`
        : `/api/admin/users?id=${deleteDialog.id}`;

      const response = await fetch(url, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: data.message,
        });
        
        if (deleteDialog.type === "newsletter") {
          mutateCustomers();
        } else {
          mutateUsers();
        }
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDeleteDialog({ open: false, type: "", id: "", name: "" });
    }
  };

  const handleRoleChange = async (user: User, newRole: "admin" | "customer") => {
    try {
      const response = await fetch("/api/admin/users", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: user.id,
          role: newRole,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: data.message,
        });
        mutateUsers();
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setRoleDialog({ open: false, user: null });
    }
  };

  const exportData = () => {
    const data = activeTab === "newsletter" ? customersData?.customers : usersData?.users;
    if (!data || data.length === 0) return;

    const headers = activeTab === "newsletter" 
      ? ["Email", "Subscribed Date"]
      : ["Name", "Email", "Role", "Status", "Joined Date"];

    const csvContent = [
      headers.join(","),
      ...data.map(item => 
        activeTab === "newsletter"
          ? `"${item.email}","${new Date(item.createdAt).toLocaleDateString()}"`
          : `"${item.name}","${item.email}","${item.role}","${item.isVerified ? 'Verified' : 'Unverified'}","${new Date(item.createdAt).toLocaleDateString()}"`
      )
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeTab}-subscribers-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Success",
      description: "Data exported successfully",
    });
  };

  const customers = customersData?.customers || [];
  const users = usersData?.users || [];
  const totalPages = activeTab === "newsletter" 
    ? customersData?.pagination.totalPages || 1
    : usersData?.pagination.totalPages || 1;

  const isLoading = activeTab === "newsletter" ? customersLoading : usersLoading;

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Users className="w-8 h-8" />
          <div>
            <h1 className="text-3xl font-bold">Customer Management</h1>
            <p className="text-gray-500">Manage newsletter subscribers and user accounts</p>
          </div>
        </div>
        <Button onClick={exportData} className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      </div>

      {/* Tabs */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              <Button
                variant={activeTab === "newsletter" ? "default" : "ghost"}
                size="sm"
                onClick={() => {
                  setActiveTab("newsletter");
                  setPage(1);
                  setRoleFilter("all");
                }}
                className="flex items-center gap-2"
              >
                <Mail className="w-4 h-4" />
                Newsletter Subscribers
                <Badge variant="secondary" className="ml-1">
                  {customersData?.pagination.totalCustomers || 0}
                </Badge>
              </Button>
              <Button
                variant={activeTab === "users" ? "default" : "ghost"}
                size="sm"
                onClick={() => {
                  setActiveTab("users");
                  setPage(1);
                }}
                className="flex items-center gap-2"
              >
                <UserIcon className="w-4 h-4" />
                User Accounts
                <Badge variant="secondary" className="ml-1">
                  {usersData?.pagination.totalUsers || 0}
                </Badge>
              </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder={`Search ${activeTab === "newsletter" ? "emails" : "users"}...`}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {activeTab === "users" && (
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-full sm:w-32">
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4" />
                      <SelectValue placeholder="Role" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="customer">Customer</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Newsletter Subscribers Table */}
          {activeTab === "newsletter" && (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Subscribed Date</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">{customer.email}</TableCell>
                      <TableCell>
                        {new Date(customer.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => setDeleteDialog({
                                open: true,
                                type: "newsletter",
                                id: customer.id,
                                name: customer.email,
                              })}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Remove Subscriber
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {customers.length === 0 && !isLoading && (
                <div className="text-center py-12">
                  <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">No subscribers found</h3>
                  <p className="text-gray-500 mt-1">
                    {debouncedSearch ? "Try adjusting your search" : "No newsletter subscribers yet."}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Users Table */}
          {activeTab === "users" && (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined Date</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={user.role === "admin" ? "default" : "secondary"}
                          className="flex items-center gap-1 w-20 justify-center"
                        >
                          {user.role === "admin" ? (
                            <Shield className="w-3 h-3" />
                          ) : (
                            <UserIcon className="w-3 h-3" />
                          )}
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.isVerified ? "default" : "secondary"}>
                          {user.isVerified ? "Verified" : "Unverified"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => setRoleDialog({ open: true, user })}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Change Role
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setDeleteDialog({
                                open: true,
                                type: "user",
                                id: user.id,
                                name: user.name,
                              })}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {users.length === 0 && !isLoading && (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">No users found</h3>
                  <p className="text-gray-500 mt-1">
                    {debouncedSearch || roleFilter !== "all" ? "Try adjusting your filters" : "No users found."}
                  </p>
                </div>
              )}
            </div>
          )}

          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <Button
                    key={pageNum}
                    variant={page === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => !open && setDeleteDialog({ open: false, type: "", id: "", name: "" })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {deleteDialog.type === "newsletter" ? "Subscriber" : "User"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {deleteDialog.name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Role Change Dialog */}
      <AlertDialog open={roleDialog.open} onOpenChange={(open) => !open && setRoleDialog({ open: false, user: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change User Role</AlertDialogTitle>
            <AlertDialogDescription>
              Change role for {roleDialog.user?.name} ({roleDialog.user?.email})
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 py-4">
            <Button
              variant={roleDialog.user?.role === "admin" ? "default" : "outline"}
              onClick={() => handleRoleChange(roleDialog.user!, "admin")}
              className="flex-1"
            >
              <Shield className="w-4 h-4 mr-2" />
              Make Admin
            </Button>
            <Button
              variant={roleDialog.user?.role === "customer" ? "default" : "outline"}
              onClick={() => handleRoleChange(roleDialog.user!, "customer")}
              className="flex-1"
            >
              <UserIcon className="w-4 h-4 mr-2" />
              Make Customer
            </Button>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}