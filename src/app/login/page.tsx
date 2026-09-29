import { login } from './actions'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Package } from 'lucide-react'

export default async function LoginPage(props: { searchParams: Promise<{ message?: string }> }) {
  const searchParams = await props.searchParams

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#0B1220] px-4 py-12 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-1/4 -left-20 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="absolute bottom-1/4 -right-20 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />
      
      <div className="w-full max-w-sm space-y-6 rounded-2xl bg-white/5 p-6 md:p-8 shadow-2xl ring-1 ring-white/10 backdrop-blur-xl relative z-10">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
            <Package className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white">LogisticsPro</h2>
            <p className="mt-1 text-sm text-slate-400">Sign in to manage operations</p>
          </div>
        </div>
        
        {searchParams.message && (
          <div className="rounded-lg bg-red-500/10 p-4 text-sm text-red-400 border border-red-500/20 text-center">
            {searchParams.message}
          </div>
        )}

        <form className="mt-6 space-y-5">
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300">Email address</label>
              <div className="mt-1.5">
                <Input 
                  id="email" 
                  name="email" 
                  type="email" 
                  required 
                  placeholder="admin@example.com"
                  className="bg-slate-900/50 border-slate-700/50 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500" 
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300">Password</label>
              <div className="mt-1.5">
                <Input 
                  id="password" 
                  name="password" 
                  type="password" 
                  required 
                  className="bg-slate-900/50 border-slate-700/50 text-white focus:border-blue-500 focus:ring-blue-500" 
                />
              </div>
            </div>
          </div>
          <Button type="submit" formAction={login} className="w-full mt-2 shadow-lg shadow-blue-600/20">Sign in</Button>
        </form>
      </div>
    </div>
  )
}
