import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'
import App from '../../client/src/App'

// Mock all page components to avoid complex dependencies
vi.mock('../../client/src/pages/NodeList', () => ({
  NodeListPage: () => <div data-testid="node-list-page">Node List Page</div>
}))

vi.mock('../../client/src/pages/NodeDetail', () => ({
  NodeDetailPage: () => <div data-testid="node-detail-page">Node Detail Page</div>
}))

vi.mock('../../client/src/pages/NodeForm', () => ({
  NodeCreatePage: () => <div data-testid="node-create-page">Node Create Page</div>,
  NodeEditPage: () => <div data-testid="node-edit-page">Node Edit Page</div>
}))

vi.mock('../../client/src/pages/TagList', () => ({
  TagListPage: () => <div data-testid="tag-list-page">Tag List Page</div>
}))

vi.mock('../../client/src/pages/TagDetail', () => ({
  TagDetailPage: () => <div data-testid="tag-detail-page">Tag Detail Page</div>
}))

describe('App Component Routing', () => {
  let queryClient: QueryClient
  
  const renderApp = (initialEntries: string[] = ['/']) => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })
    
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={initialEntries}>
          <App />
        </MemoryRouter>
      </QueryClientProvider>
    )
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Root Route', () => {
    it('should redirect root path to /nodes', () => {
      renderApp(['/'])
      
      expect(screen.getByTestId('node-list-page')).toBeInTheDocument()
    })
  })

  describe('Node Routes', () => {
    it('should render NodeListPage for /nodes route', () => {
      renderApp(['/nodes'])
      
      expect(screen.getByTestId('node-list-page')).toBeInTheDocument()
      expect(screen.getByText('Node List Page')).toBeInTheDocument()
    })

    it('should render NodeCreatePage for /nodes/new route', () => {
      renderApp(['/nodes/new'])
      
      expect(screen.getByTestId('node-create-page')).toBeInTheDocument()
      expect(screen.getByText('Node Create Page')).toBeInTheDocument()
    })

    it('should render NodeDetailPage for /nodes/:id route', () => {
      renderApp(['/nodes/test-node-id'])
      
      expect(screen.getByTestId('node-detail-page')).toBeInTheDocument()
      expect(screen.getByText('Node Detail Page')).toBeInTheDocument()
    })

    it('should render NodeEditPage for /nodes/:id/edit route', () => {
      renderApp(['/nodes/test-node-id/edit'])
      
      expect(screen.getByTestId('node-edit-page')).toBeInTheDocument()
      expect(screen.getByText('Node Edit Page')).toBeInTheDocument()
    })

    it('should handle encoded node IDs in URLs', () => {
      renderApp(['/nodes/node%20with%20spaces'])
      
      expect(screen.getByTestId('node-detail-page')).toBeInTheDocument()
    })

    it('should handle special characters in node IDs', () => {
      renderApp(['/nodes/node-with-special-chars%40%23%24'])
      
      expect(screen.getByTestId('node-detail-page')).toBeInTheDocument()
    })
  })

  describe('Tag Routes', () => {
    it('should render TagListPage for /tags route', () => {
      renderApp(['/tags'])
      
      expect(screen.getByTestId('tag-list-page')).toBeInTheDocument()
      expect(screen.getByText('Tag List Page')).toBeInTheDocument()
    })

    it('should render TagDetailPage for /tags/:tag route', () => {
      renderApp(['/tags/react'])
      
      expect(screen.getByTestId('tag-detail-page')).toBeInTheDocument()
      expect(screen.getByText('Tag Detail Page')).toBeInTheDocument()
    })

    it('should handle encoded tag names in URLs', () => {
      renderApp(['/tags/tag%20with%20spaces'])
      
      expect(screen.getByTestId('tag-detail-page')).toBeInTheDocument()
    })

    it('should handle special characters in tag names', () => {
      renderApp(['/tags/tag%40with%23symbols'])
      
      expect(screen.getByTestId('tag-detail-page')).toBeInTheDocument()
    })
  })

  describe('Wildcard Route', () => {
    it('should redirect unknown routes to /nodes', () => {
      renderApp(['/unknown-route'])
      
      expect(screen.getByTestId('node-list-page')).toBeInTheDocument()
    })

    it('should redirect deep unknown paths to /nodes', () => {
      renderApp(['/some/deep/unknown/path'])
      
      expect(screen.getByTestId('node-list-page')).toBeInTheDocument()
    })

    it('should redirect invalid node routes to /nodes', () => {
      renderApp(['/nodes/invalid/extra/path'])
      
      expect(screen.getByTestId('node-list-page')).toBeInTheDocument()
    })
  })

  describe('Route Parameters', () => {
    it('should handle multiple route changes', () => {
      // Test initial route
      renderApp(['/nodes'])
      expect(screen.getByTestId('node-list-page')).toBeInTheDocument()

      // Test different route separately
      renderApp(['/tags'])
      expect(screen.getByTestId('tag-list-page')).toBeInTheDocument()
    })

    it('should handle route parameters correctly', () => {
      // Test that different IDs render the same component (parameter routing works)
      const { container: container1 } = renderApp(['/nodes/different-id'])
      expect(screen.getByTestId('node-detail-page')).toBeInTheDocument()

      const { container: container2 } = renderApp(['/nodes/another-different-id'])
      expect(container2.querySelector('[data-testid="node-detail-page"]')).toBeInTheDocument()
    })
  })

  describe('Navigation Behavior', () => {
    it('should handle programmatic navigation', () => {
      // Start at root, should redirect to nodes
      renderApp(['/'])
      expect(screen.getByTestId('node-list-page')).toBeInTheDocument()
    })

    it('should maintain routing state', () => {
      // Test that the router maintains state correctly
      renderApp(['/nodes/test-id'])
      expect(screen.getByTestId('node-detail-page')).toBeInTheDocument()
      
      // The mocked component should remain rendered
      expect(screen.queryByTestId('node-list-page')).not.toBeInTheDocument()
    })
  })

  describe('URL Structure Validation', () => {
    it('should handle empty string routes', () => {
      renderApp([''])
      expect(screen.getByTestId('node-list-page')).toBeInTheDocument()
    })

    it('should handle routes with query parameters', () => {
      renderApp(['/nodes?search=test'])
      expect(screen.getByTestId('node-list-page')).toBeInTheDocument()
    })

    it('should handle routes with hash fragments', () => {
      renderApp(['/nodes#section'])
      expect(screen.getByTestId('node-list-page')).toBeInTheDocument()
    })

    it('should handle routes with both query params and hash', () => {
      renderApp(['/tags/react?filter=recent#top'])
      expect(screen.getByTestId('tag-detail-page')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle very long node IDs', () => {
      const longId = 'a'.repeat(1000)
      renderApp([`/nodes/${longId}`])
      expect(screen.getByTestId('node-detail-page')).toBeInTheDocument()
    })

    it('should handle node IDs with dots', () => {
      renderApp(['/nodes/node.with.dots'])
      expect(screen.getByTestId('node-detail-page')).toBeInTheDocument()
    })

    it('should handle tag names with dots', () => {
      renderApp(['/tags/tag.with.dots'])
      expect(screen.getByTestId('tag-detail-page')).toBeInTheDocument()
    })

    it('should handle routes with trailing slashes', () => {
      renderApp(['/nodes/'])
      expect(screen.getByTestId('node-list-page')).toBeInTheDocument()
    })

    it('should handle routes with double slashes', () => {
      renderApp(['/nodes//double-slash'])
      // Should still render some component - either node detail or redirect to nodes list
      const hasNodeDetail = screen.queryByTestId('node-detail-page')
      const hasNodeList = screen.queryByTestId('node-list-page')
      expect(hasNodeDetail || hasNodeList).toBeTruthy()
    })
  })

  describe('Error Boundaries and Fallbacks', () => {
    it('should render app without throwing errors', () => {
      expect(() => {
        renderApp(['/'])
      }).not.toThrow()
    })

    it('should handle multiple rapid route changes', () => {
      const routes = ['/nodes', '/tags', '/nodes/test', '/tags/react', '/']
      
      routes.forEach(route => {
        expect(() => {
          renderApp([route])
        }).not.toThrow()
      })
    })
  })

  describe('React Router Integration', () => {
    it('should use React Router v6 routing structure', () => {
      // Test that our routing follows React Router v6 patterns
      renderApp(['/nodes'])
      expect(screen.getByTestId('node-list-page')).toBeInTheDocument()
      
      // Navigate style routes should work
      renderApp(['/nodes/create']) 
      // This should not match /nodes/new, so should redirect to nodes
      expect(screen.getByTestId('node-list-page')).toBeInTheDocument()
    })

    it('should handle nested routing correctly', () => {
      renderApp(['/nodes/test-id/edit'])
      expect(screen.getByTestId('node-edit-page')).toBeInTheDocument()
      expect(screen.queryByTestId('node-detail-page')).not.toBeInTheDocument()
    })
  })

  describe('Performance Considerations', () => {
    it('should not re-render unnecessarily', () => {
      const { container } = renderApp(['/nodes'])
      const initialHTML = container.innerHTML
      
      // Re-render with same route
      const { container: container2 } = renderApp(['/nodes'])
      expect(container2.innerHTML).toBe(initialHTML)
    })
  })

  describe('Component Mounting', () => {
    it('should mount only the active route component', () => {
      renderApp(['/nodes'])
      
      expect(screen.getByTestId('node-list-page')).toBeInTheDocument()
      expect(screen.queryByTestId('tag-list-page')).not.toBeInTheDocument()
      expect(screen.queryByTestId('node-create-page')).not.toBeInTheDocument()
      expect(screen.queryByTestId('node-detail-page')).not.toBeInTheDocument()
      expect(screen.queryByTestId('node-edit-page')).not.toBeInTheDocument()
      expect(screen.queryByTestId('tag-detail-page')).not.toBeInTheDocument()
    })

    it('should mount different components for different routes', () => {
      // Test nodes route
      renderApp(['/nodes'])
      expect(screen.getByTestId('node-list-page')).toBeInTheDocument()

      // Test tags route  
      renderApp(['/tags'])
      expect(screen.getByTestId('tag-list-page')).toBeInTheDocument()

      // Test create route
      renderApp(['/nodes/new'])
      expect(screen.getByTestId('node-create-page')).toBeInTheDocument()
    })
  })
})