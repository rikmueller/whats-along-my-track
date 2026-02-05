import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import './Header.css'

type HeaderProps = {
  logoHref?: string
}

const THEME_KEY = 'whatsaround.theme'

type ThemeMode = 'light' | 'dark'

const getPreferredTheme = (): ThemeMode => {
  if (typeof window === 'undefined') return 'light'
  const stored = localStorage.getItem(THEME_KEY)
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const applyTheme = (theme: ThemeMode) => {
  if (typeof document === 'undefined') return
  document.documentElement.classList.toggle('theme-dark', theme === 'dark')
}

const LogoIcon = () => (
  <svg
    className="wa-logo-icon"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M12 3c3.314 0 6 2.602 6 5.816 0 4.54-4.22 8.678-6 10.684-1.78-2.006-6-6.144-6-10.684C6 5.602 8.686 3 12 3z"
      stroke="currentColor"
      strokeWidth="1.6"
    />
    <circle cx="12" cy="8.6" r="2.2" stroke="currentColor" strokeWidth="1.6" />
    <path
      d="M4 20.2c2.4-1.4 5.3-2.1 8-2.1 2.7 0 5.6.7 8 2.1"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </svg>
)

const SunIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.6" />
    <path
      d="M12 2.5v2.2M12 19.3v2.2M4.2 4.2l1.6 1.6M18.2 18.2l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.2 19.8l1.6-1.6M18.2 5.8l1.6-1.6"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </svg>
)

const MoonIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M18.6 15.4c-1.1.6-2.3.9-3.7.9-4.1 0-7.4-3.3-7.4-7.4 0-1.4.4-2.6 1-3.7-3.2.7-5.5 3.6-5.5 6.9 0 3.9 3.2 7.1 7.1 7.1 3.3 0 6.2-2.3 6.9-5.5z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const MenuIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
)

export default function Header({ logoHref = '/home' }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [theme, setTheme] = useState<ThemeMode>(() => getPreferredTheme())
  const menuRef = useRef<HTMLDivElement>(null)
  const location = useLocation()

  useEffect(() => {
    applyTheme(theme)
    localStorage.setItem(THEME_KEY, theme)
  }, [theme])

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!menuOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

  const nextTheme = useMemo(() => (theme === 'dark' ? 'light' : 'dark'), [theme])

  return (
    <header className="wa-header">
      <div className="wa-header-inner">
        <Link to={logoHref} className="wa-logo" aria-label="WhatsAround">
          <LogoIcon />
          <span className="wa-logo-text">WhatsAround</span>
        </Link>

        <nav className="wa-nav" aria-label="Primary">
          <NavLink to="/home" className={({ isActive }) => `wa-nav-link ${isActive ? 'active' : ''}`}>
            Home
          </NavLink>
          <NavLink to="/app" className={({ isActive }) => `wa-nav-link ${isActive ? 'active' : ''}`}>
            App
          </NavLink>
          <NavLink to="/how-it-works" className={({ isActive }) => `wa-nav-link ${isActive ? 'active' : ''}`}>
            Help
          </NavLink>
        </nav>

        <div className="wa-header-actions" ref={menuRef}>
          <button
            type="button"
            className="wa-theme-toggle"
            onClick={() => setTheme(nextTheme)}
            aria-label={`Switch to ${nextTheme} mode`}
            title={`Switch to ${nextTheme} mode`}
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>

          <button
            type="button"
            className="wa-menu-toggle"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-expanded={menuOpen}
            aria-controls="wa-menu-dropdown"
            aria-label="Open navigation menu"
            title="Menu"
          >
            <MenuIcon />
          </button>

          <div
            id="wa-menu-dropdown"
            className={`wa-menu-dropdown ${menuOpen ? 'open' : ''}`}
            role="menu"
          >
            <NavLink
              to="/home"
              className={({ isActive }) => `wa-menu-item ${isActive ? 'active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              Home
            </NavLink>
            <NavLink
              to="/app"
              className={({ isActive }) => `wa-menu-item ${isActive ? 'active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              App
            </NavLink>
            <NavLink
              to="/how-it-works"
              className={({ isActive }) => `wa-menu-item ${isActive ? 'active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              Help
            </NavLink>
          </div>
        </div>
      </div>
    </header>
  )
}
