import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import Header from './Header'
import './MarketingLayout.css'

type Props = {
  children: ReactNode
}

export default function MarketingLayout({ children }: Props) {
  return (
    <div className="marketing-shell">
      <Header logoHref="/home" />

      <main className="marketing-main">{children}</main>

      <footer className="marketing-footer">
        <div className="marketing-footer-inner">
          <div>© {new Date().getFullYear()} WhatsAround</div>
          <div className="marketing-footer-links">
            <Link to="/home">Home</Link>
            <Link to="/how-it-works">How it works</Link>
            <Link to="/about">About</Link>
            <Link to="/map">Open App</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
