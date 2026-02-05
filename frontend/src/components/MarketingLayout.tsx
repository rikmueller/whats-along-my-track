import type { ReactNode } from 'react'
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
          <a href="mailto:rik@getwhatsaround.app">© {new Date().getFullYear()} WhatsAround</a>
        </div>
      </footer>
    </div>
  )
}
