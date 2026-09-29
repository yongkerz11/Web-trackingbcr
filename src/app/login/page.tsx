import { login } from './actions'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default async function LoginPage(props: { searchParams: Promise<{ message?: string }> }) {
  const searchParams = await props.searchParams

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-sm">
        <div className="text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-gray-900">Sign in to Logistics</h2>
          <p className="mt-2 text-sm text-gray-600">Enter your credentials to continue</p>
        </div>
        
        {searchParams.message && (
          <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
            {searchParams.message}
          </div>
        )}

        <form className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
              <div className="mt-1">
                <Input id="email" name="email" type="email" required placeholder="admin@example.com" />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <div className="mt-1">
                <Input id="password" name="password" type="password" required />
              </div>
            </div>
          </div>
          <Button type="submit" formAction={login} className="w-full">Sign in</Button>
        </form>
      </div>
    </div>
  )
}
