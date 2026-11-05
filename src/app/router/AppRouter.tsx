import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom'
import {
  Activity,
  BookOpen,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Compass,
  LayoutDashboard,
  Menu,
  MessageCircle,
  Search,
  Settings2,
  Sparkles,
  Users,
  X,
} from 'lucide-react'
import { useState } from 'react'

const navigation = [
  { label: 'Overview', path: '/', icon: LayoutDashboard },
  { label: 'Focus studio', path: '/focus', icon: Activity },
  { label: 'My subjects', path: '/subjects', icon: BookOpen },
  { label: 'Planner', path: '/planner', icon: CalendarDays },
  { label: 'Study rooms', path: '/rooms', icon: Users },
  { label: 'Community', path: '/community', icon: MessageCircle },
  { label: 'Mental reset', path: '/reset', icon: Compass },
]

function PlaceholderPage({ title }: { title: string }) {
  return (
    <section className="page-enter mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-600">
        Your learning space
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
        {title}
      </h1>
      <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
        A calm place to build steady study habits. This area will take shape in an
        upcoming sprint.
      </p>
      <div className="mt-8 rounded-3xl border border-slate-200/80 bg-white p-8 shadow-sm sm:p-12">
        <div className="mx-auto flex max-w-md flex-col items-center text-center">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
            <Sparkles size={23} />
          </span>
          <h2 className="mt-5 text-lg font-semibold text-slate-900">
            A little more focus, one day at a time
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Your {title.toLowerCase()} tools will live here. For now, take a breath and
            choose what you’d like to explore next.
          </p>
          <NavLink to="/focus" className="button-primary mt-6">
            Visit Focus Studio <ChevronRight size={16} />
          </NavLink>
        </div>
      </div>
    </section>
  )
}

function Sidebar({
  close,
  collapsed,
  toggle,
}: {
  close?: () => void
  collapsed?: boolean
  toggle?: () => void
}) {
  return (
    <aside
      className={`flex h-full flex-col bg-white ${collapsed ? 'w-[76px]' : 'w-[252px]'}`}
    >
      <div className="flex h-[76px] items-center gap-3 px-5">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white">
          <BookOpen size={19} />
        </span>
        {!collapsed && (
          <span className="text-[15px] font-semibold tracking-tight text-slate-900">
            study<span className="text-violet-600">companion</span>
          </span>
        )}
        {close && (
          <button
            onClick={close}
            className="icon-button ml-auto"
            aria-label="Close navigation"
          >
            <X size={19} />
          </button>
        )}
      </div>
      {!collapsed && (
        <p className="px-5 pb-3 pt-5 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
          Workspace
        </p>
      )}
      <nav className="flex-1 space-y-1 px-3" aria-label="Main navigation">
        {navigation.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            onClick={close}
            title={collapsed ? label : undefined}
            className={({ isActive }) =>
              `nav-link ${isActive ? 'nav-link-active' : ''} ${collapsed ? 'justify-center px-0' : ''}`
            }
          >
            <Icon size={18} strokeWidth={1.8} />
            <span className={collapsed ? 'sr-only' : ''}>{label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="mx-3 mb-3 rounded-2xl bg-violet-50 p-3.5">
        {!collapsed ? (
          <>
            <div className="flex items-center gap-2 text-sm font-semibold text-violet-900">
              <Sparkles size={16} /> Your companion
            </div>
            <p className="mt-1.5 text-xs leading-5 text-violet-800/70">
              A friendly reminder: small steps count.
            </p>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-violet-200">
              <div className="h-full w-2/5 rounded-full bg-violet-500" />
            </div>
          </>
        ) : (
          <Sparkles className="mx-auto text-violet-700" size={18} />
        )}
      </div>
      <div className="border-t border-slate-100 p-3">
        <NavLink
          to="/settings"
          title={collapsed ? 'Settings' : undefined}
          className={`nav-link ${collapsed ? 'justify-center px-0' : ''}`}
        >
          <Settings2 size={18} />
          <span className={collapsed ? 'sr-only' : ''}>Settings</span>
        </NavLink>
        {!collapsed && (
          <p className="px-3 pt-3 text-[11px] text-slate-400">
            Made for your next good session
          </p>
        )}
      </div>
      {toggle && (
        <button
          onClick={toggle}
          className="absolute -right-3 top-[84px] hidden size-7 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:text-violet-600 lg:flex"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
        </button>
      )}
    </aside>
  )
}

function Shell() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  return (
    <div className="min-h-screen bg-[#f8f9fc] text-slate-900">
      <div className="relative flex min-h-screen">
        <div
          className={`relative hidden shrink-0 border-r border-slate-200/80 transition-[width] duration-200 lg:block ${collapsed ? 'w-[76px]' : 'w-[252px]'}`}
        >
          <Sidebar collapsed={collapsed} toggle={() => setCollapsed(!collapsed)} />
        </div>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              className="absolute inset-0 bg-slate-950/30"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu overlay"
            />
            <div className="absolute inset-y-0 left-0 shadow-xl">
              <Sidebar close={() => setMobileOpen(false)} />
            </div>
          </div>
        )}
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-[68px] items-center justify-between border-b border-slate-200/70 bg-white/90 px-4 backdrop-blur-xl sm:px-7">
            <div className="flex items-center gap-3">
              <button
                className="icon-button lg:hidden"
                aria-label="Open navigation"
                onClick={() => setMobileOpen(true)}
              >
                <Menu size={20} />
              </button>
              <span className="hidden text-sm text-slate-400 sm:inline">
                Good things grow with practice
              </span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <button className="icon-button" aria-label="Search">
                <Search size={18} />
              </button>
              <button className="icon-button" aria-label="Help">
                <CircleHelp size={18} />
              </button>
              <span className="mx-1 h-7 border-l border-slate-200" />
              <button
                className="flex items-center gap-2 rounded-full p-1 pr-2 transition hover:bg-slate-50"
                aria-label="User profile"
              >
                <span className="flex size-8 items-center justify-center rounded-full bg-amber-100 text-sm font-semibold text-amber-800">
                  S
                </span>
                <span className="hidden text-sm font-medium text-slate-700 sm:inline">
                  Study buddy
                </span>
              </button>
            </div>
          </header>
          <main className="flex-1">
            <Routes>
              {navigation.map(({ label, path }) => (
                <Route
                  key={path}
                  path={path}
                  element={<PlaceholderPage title={label} />}
                />
              ))}
              <Route path="/settings" element={<PlaceholderPage title="Settings" />} />
              <Route path="*" element={<PlaceholderPage title="Page not found" />} />
            </Routes>
          </main>
          <footer className="px-5 py-4 text-center text-xs text-slate-400 sm:px-8">
            A gentle nudge toward the things you want to learn.
          </footer>
        </div>
      </div>
    </div>
  )
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Shell />
    </BrowserRouter>
  )
}
