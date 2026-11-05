import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom'

interface PlaceholderPageProps {
  title: string
  description: string
}

function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center gap-3 px-6 text-center">
      <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
      <p className="max-w-lg text-slate-600">{description}</p>
    </main>
  )
}

function NotFoundPage() {
  return (
    <PlaceholderPage
      title="404 - Page Not Found"
      description="The page you are looking for does not exist."
    />
  )
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50">
        <header className="border-b border-slate-200 bg-white px-6 py-4">
          <nav className="mx-auto flex max-w-6xl items-center justify-between">
            <NavLink to="/" className="text-xl font-bold text-slate-900">
              Study Companion
            </NavLink>

            <div className="flex gap-5 text-sm font-medium text-slate-600">
              <NavLink to="/">Home</NavLink>
              <NavLink to="/login">Login</NavLink>
              <NavLink to="/dashboard">Dashboard</NavLink>
            </div>
          </nav>
        </header>

        <Routes>
          <Route
            path="/"
            element={
              <PlaceholderPage
                title="Study Companion"
                description="Your personal space for focused learning and better study habits."
              />
            }
          />

          <Route
            path="/login"
            element={
              <PlaceholderPage
                title="Login"
                description="Authentication will be implemented in a future sprint."
              />
            }
          />

          <Route
            path="/signup"
            element={
              <PlaceholderPage
                title="Create Account"
                description="Registration will be implemented in a future sprint."
              />
            }
          />

          <Route
            path="/dashboard"
            element={
              <PlaceholderPage
                title="Dashboard"
                description="Your study overview will be implemented in a future sprint."
              />
            }
          />

          <Route
            path="/subjects"
            element={
              <PlaceholderPage
                title="Subjects"
                description="Subject management will be implemented in a future sprint."
              />
            }
          />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
