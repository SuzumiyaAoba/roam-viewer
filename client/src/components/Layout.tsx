import React from 'react'
import { Link } from 'react-router-dom'
import { Header, HeaderLogo, HeaderNav, HeaderNavItem, HeaderActions, Footer, FooterSection, FooterLink, FooterBottom } from './design-system'
import { Button } from './design-system'

interface LayoutProps {
  children: React.ReactNode
  title?: string
}

export function Layout({ children, title }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header
        logo={
          <HeaderLogo href="/nodes">
            <span className="text-blue-600">🌐</span>
            <span className="ml-2">Roam Web</span>
          </HeaderLogo>
        }
        navigation={
          <HeaderNav>
            <HeaderNavItem href="/nodes">Nodes</HeaderNavItem>
            <HeaderNavItem href="/nodes/new">Create</HeaderNavItem>
          </HeaderNav>
        }
        actions={
          <HeaderActions>
          </HeaderActions>
        }
      />
      
      <main className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full">
        {title && (
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          </div>
        )}
        {children}
      </main>

      <Footer
        variant="minimal"
        size="sm"
        bottom={
          <FooterBottom copyright="© 2024 Roam Web. All rights reserved." />
        }
      />
    </div>
  )
}