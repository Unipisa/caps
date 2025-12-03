import React from 'react';
import NavBar from './NavBar';
import TopBar from './TopBar';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div id="wrapper">
      <NavBar />
      <div id="content-wrapper" className="d-flex flex-column">
        <TopBar />
        <div id="content" className="px-4">
          {children}
        </div>
        <Footer />
      </div>
    </div>
  );
}