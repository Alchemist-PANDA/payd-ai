import React from 'react';
import { AppShell } from '../../../components/layout/AppShell';

export default function DashboardPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Dashboard (Phase 1 Scaffold)</h1>
        <div className="grid grid-cols-3 gap-6">
          <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
            <h2 className="text-sm font-medium text-gray-500">Total Outstanding</h2>
            <p className="text-3xl font-bold mt-2">$0.00</p>
          </div>
          <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
            <h2 className="text-sm font-medium text-gray-500">Overdue</h2>
            <p className="text-3xl font-bold mt-2 text-red-600">$0.00</p>
          </div>
          <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
            <h2 className="text-sm font-medium text-gray-500">Pending Actions</h2>
            <p className="text-3xl font-bold mt-2">0</p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
