import type { Metadata } from 'next'
import "@fortawesome/fontawesome-svg-core/styles.css";
import { config } from "@fortawesome/fontawesome-svg-core";
import 'bootstrap/dist/css/bootstrap.css';

import './scss/main.scss'
import './scss/caps.scss'
import './scss/forms.scss'
import Provider, { useUserProfile, f } from './components/Provider'
import NavBar from './components/NavBar'
import TopBar from './components/TopBar'
import { Container } from 'react-bootstrap';

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
        <div className="d-flex">
          <NavBar />
          <div className="d-flex flex-column">
              <Provider>
                <Internal>
                  {children}
                </Internal>
              </Provider>
          </div>
        </div>
      </body>
    </html>
  )
}

function Internal({children}:{
  children: React.ReactNode
}) {
  const user = true 
  if (user === null) return <p>
    not logged in.
  </p>
  return <>
    <TopBar />
    {children}
  </>
}