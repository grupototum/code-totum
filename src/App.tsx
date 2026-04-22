import { useState, useEffect } from 'react'
import { useLocation } from 'wouter'
import { ChevronLeft, ChevronRight, Code2, Brain, Settings, Zap } from 'lucide-react'
import Claudio from './pages/Claudio'
import Craudio from './pages/Craudio'
import Ada from './pages/Ada'
import SettingsPage from './pages/Settings'

export default function App() {
  const [location, setLocation] = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // Redirect to /claudio if on home
  useEffect(() => {
    if (location === '/') {
      setLocation('/claudio')
    }
  }, [location, setLocation])

  const currentPage = location.split('/')[1] || 'claudio'

  const handleNavigate = (path: string) => {
    setLocation(path)
  }

  return (
    <div className="h-screen bg-black dark text-white flex flex-col overflow-hidden" style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a2e 50%, #0f0f1e 100%)' }}>
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-md" style={{ background: 'rgba(10, 10, 10, 0.5)' }}>
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #ff006e 0%, #d7007d 100%)' }}>
              <Code2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg">TOTUM CODE</h1>
              <p className="text-xs text-gray-400 uppercase tracking-wide">AI-Powered Workspace</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-full" style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#86efac' }}>
              <div className="w-2 h-2 rounded-full" style={{ background: '#22c55e' }}></div> ONLINE
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} border-r border-white/10 backdrop-blur-md overflow-y-auto transition-all duration-300`} style={{ background: 'rgba(10, 10, 10, 0.6)' }}>
          <div className="p-4 space-y-6 flex flex-col h-full">
            {/* Logo/Header */}
            <div className="flex items-center justify-between">
              {sidebarOpen && <h2 className="text-xl font-bold" style={{ background: 'linear-gradient(135deg, #ff006e 0%, #d7007d 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>TOTUM</h2>}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-white/10 rounded-lg transition text-gray-400 hover:text-white"
              >
                {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
              </button>
            </div>

            {/* Navigation - Main Pages Only */}
            <nav className="space-y-2 flex-1">
              {[
                { icon: Code2, label: 'Claudio', path: '/claudio', active: currentPage === 'claudio' },
                { icon: Zap, label: 'Cráudio', path: '/craudio', active: currentPage === 'craudio' },
                { icon: Brain, label: 'Ada', path: '/ada', active: currentPage === 'ada' },
                { icon: Settings, label: 'Configuração', path: '/settings', active: currentPage === 'settings' },
              ].map((item) => (
                <button
                  key={item.path}
                  onClick={() => handleNavigate(item.path)}
                  className={`w-full flex items-center gap-3 px-3 py-3 text-sm rounded-lg transition backdrop-blur-sm ${
                    item.active
                      ? 'text-white'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                  style={item.active ? { background: 'linear-gradient(135deg, rgba(255, 0, 110, 0.2) 0%, rgba(215, 0, 125, 0.1) 100%)' } : {}}
                  title={item.label}
                >
                  <item.icon size={18} />
                  {sidebarOpen && <span className="font-medium">{item.label}</span>}
                </button>
              ))}
            </nav>

            {/* User Profile - Bottom */}
            {sidebarOpen && (
              <div className="p-3 rounded-lg border border-white/10 backdrop-blur-sm" style={{ background: 'rgba(255, 0, 110, 0.08)' }}>
                <p className="text-sm font-medium text-white">Totum Dev</p>
                <p className="text-xs text-gray-400">development@totum.com</p>
              </div>
            )}
          </div>
        </aside>

        {/* Chat area */}
        <div className="flex-1 flex flex-col">
          {/* Page content based on current location */}
          {currentPage === 'claudio' ? (
            <Claudio />
          ) : currentPage === 'craudio' ? (
            <Craudio />
          ) : currentPage === 'ada' ? (
            <Ada />
          ) : (
            <SettingsPage />
          )}
        </div>
      </div>
    </div>
  )
}
