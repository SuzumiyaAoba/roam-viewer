import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { ReactNode } from 'react'
import { Layout } from '../../client/src/components/Layout'

describe('Layout', () => {
  let wrapper: ({ children }: { children: ReactNode }) => JSX.Element

  beforeEach(() => {
    wrapper = ({ children }) => <BrowserRouter>{children}</BrowserRouter>
    vi.clearAllMocks()
  })

  it('should render basic layout structure', () => {
    render(
      <Layout>
        <div>Test content</div>
      </Layout>,
      { wrapper }
    )

    expect(screen.getByRole('banner')).toBeInTheDocument() // header
    expect(screen.getByRole('main')).toBeInTheDocument() // main
    expect(screen.getByRole('contentinfo')).toBeInTheDocument() // footer
    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('should render header with logo and navigation', () => {
    render(
      <Layout>
        <div>Content</div>
      </Layout>,
      { wrapper }
    )

    // Logo/brand
    expect(screen.getByText('Roam Web')).toBeInTheDocument()
    expect(screen.getByText('🌐')).toBeInTheDocument()

    // Navigation links
    expect(screen.getByRole('link', { name: /roam web/i })).toHaveAttribute('href', '/nodes')
    expect(screen.getByRole('link', { name: 'Nodes' })).toHaveAttribute('href', '/nodes')
    expect(screen.getByRole('link', { name: 'Tags' })).toHaveAttribute('href', '/tags')
    expect(screen.getByRole('link', { name: 'Create' })).toHaveAttribute('href', '/nodes/new')
  })

  it('should render children content', () => {
    const testContent = (
      <div>
        <h2>Test Title</h2>
        <p>Test paragraph</p>
      </div>
    )

    render(<Layout>{testContent}</Layout>, { wrapper })

    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.getByText('Test paragraph')).toBeInTheDocument()
  })

  it('should render title when provided', () => {
    render(
      <Layout title="Page Title">
        <div>Content</div>
      </Layout>,
      { wrapper }
    )

    expect(screen.getByText('Page Title')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Page Title')
  })

  it('should not render title section when title is not provided', () => {
    render(
      <Layout>
        <div>Content</div>
      </Layout>,
      { wrapper }
    )

    // Should not have an h1 heading when no title is provided
    expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument()
  })

  it('should render footer with copyright', () => {
    render(
      <Layout>
        <div>Content</div>
      </Layout>,
      { wrapper }
    )

    expect(screen.getByText(/© 2024 Roam Web\. All rights reserved\./)).toBeInTheDocument()
  })

  it('should have correct CSS classes for responsive layout', () => {
    const { container } = render(
      <Layout>
        <div>Content</div>
      </Layout>,
      { wrapper }
    )

    // Root container should have min-height and flex classes
    const rootDiv = container.firstChild as HTMLElement
    expect(rootDiv).toHaveClass('min-h-screen', 'bg-gray-50', 'flex', 'flex-col')
  })

  it('should style create button differently from other nav links', () => {
    render(
      <Layout>
        <div>Content</div>
      </Layout>,
      { wrapper }
    )

    const createButton = screen.getByRole('link', { name: 'Create' })
    const nodesLink = screen.getByRole('link', { name: 'Nodes' })

    // Create button should have blue background classes
    expect(createButton).toHaveClass('bg-blue-600', 'text-white')
    
    // Regular nav links should have gray text classes
    expect(nodesLink).toHaveClass('text-gray-600')
  })

  it('should render with semantic HTML structure', () => {
    render(
      <Layout title="Test Title">
        <div>Content</div>
      </Layout>,
      { wrapper }
    )

    // Should have proper semantic elements
    expect(screen.getByRole('banner')).toBeInTheDocument() // header
    expect(screen.getByRole('navigation')).toBeInTheDocument() // nav
    expect(screen.getByRole('main')).toBeInTheDocument() // main
    expect(screen.getByRole('contentinfo')).toBeInTheDocument() // footer
  })

  it('should handle empty children gracefully', () => {
    render(<Layout />, { wrapper })

    expect(screen.getByRole('main')).toBeInTheDocument()
    expect(screen.getByText('Roam Web')).toBeInTheDocument()
  })

  it('should handle multiple children', () => {
    render(
      <Layout>
        <div>First child</div>
        <div>Second child</div>
        <span>Third child</span>
      </Layout>,
      { wrapper }
    )

    expect(screen.getByText('First child')).toBeInTheDocument()
    expect(screen.getByText('Second child')).toBeInTheDocument()
    expect(screen.getByText('Third child')).toBeInTheDocument()
  })

  it('should render title with proper heading hierarchy', () => {
    render(
      <Layout title="Main Page Title">
        <h2>Subtitle</h2>
        <div>Content</div>
      </Layout>,
      { wrapper }
    )

    // Should have h1 for main title and allow h2 in content
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Main Page Title')
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Subtitle')
  })
})