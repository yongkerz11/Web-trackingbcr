import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // We can mock the role for now since we don't have the profile setup yet in DB
  const role = "OPERATOR" // Placeholder

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome back. Here&apos;s what&apos;s happening with your operations today.
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Current User</p>
          <p className="mt-2 truncate text-lg font-semibold text-gray-900">{user?.email}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Role</p>
          <p className="mt-2 text-lg font-semibold text-gray-900">{role}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">System Status</p>
          <div className="mt-2 flex items-center gap-2">
            <span className="flex h-3 w-3 rounded-full bg-green-500"></span>
            <p className="text-lg font-semibold text-gray-900">Operational</p>
          </div>
        </div>
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-400">Future Module</p>
          <p className="mt-2 text-lg font-semibold text-gray-400">Available Soon</p>
        </div>
      </div>
    </div>
  )
}
