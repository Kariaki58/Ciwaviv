import AdminOrderDisplay from '@/components/admin/AdminOrderDisplay';
import type { Metadata } from 'next';


export const metadata: Metadata = {
  title: 'Orders Management - Fithub Admin',
  description: 'Manage and track customer orders',
};

export default function AdminOrdersPage() {
  return <AdminOrderDisplay />;
}