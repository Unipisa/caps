// add bootstrap css 
// import 'bootstrap/dist/css/bootstrap.css'
import type { Metadata } from 'next'
import "@fortawesome/fontawesome-svg-core/styles.css";
import { config } from "@fortawesome/fontawesome-svg-core";
import 'bootstrap/dist/css/bootstrap.css';

import './main.scss'
import './caps.scss'
import './forms.scss'
import NavBar from './NavBar'

config.autoAddCss = false;

export const metadata: Metadata = {
  title: 'CAPS',
  description: 'CAPS',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="it">
      <body>
        <NavBar />
        <div className="d-flex flex-column">
          {children}
        </div>
      </body>
    </html>
  )
}
