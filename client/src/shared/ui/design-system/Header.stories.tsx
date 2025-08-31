import type { Meta, StoryObj } from '@storybook/react'
import React from 'react'
import { Badge } from './Badge'
import { Button } from './Button'
import { Header, HeaderActions, HeaderLogo, HeaderNav, HeaderNavItem } from './Header'

const meta = {
  title: 'Design System/Header',
  component: Header,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A flexible header component with logo, navigation, and actions. Supports responsive design with mobile menu and multiple variants.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'elevated', 'minimal', 'transparent'],
      description: 'The visual variant of the header',
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'default', 'lg'],
      description: 'The size of the header',
    },
    position: {
      control: { type: 'select' },
      options: ['static', 'sticky', 'fixed'],
      description: 'The positioning of the header',
    },
    showMobileMenu: {
      control: 'boolean',
      description: 'Whether to show mobile menu toggle',
    },
  },
} satisfies Meta<typeof Header>

export default meta
type Story = StoryObj<typeof meta>

// Basic examples
export const Default: Story = {
  render: () => (
    <Header
      logo={
        <HeaderLogo href="/">
          <span className="text-blue-600">🌐</span>
          <span className="ml-2">Roam Web</span>
        </HeaderLogo>
      }
      navigation={
        <HeaderNav>
          <HeaderNavItem href="/" active>
            Home
          </HeaderNavItem>
          <HeaderNavItem href="/nodes">Nodes</HeaderNavItem>
          <HeaderNavItem href="/search">Search</HeaderNavItem>
          <HeaderNavItem href="/about">About</HeaderNavItem>
        </HeaderNav>
      }
      actions={<HeaderActions></HeaderActions>}
    />
  ),
}

export const Elevated: Story = {
  render: () => (
    <Header
      variant="elevated"
      logo={
        <HeaderLogo href="/">
          <span className="text-blue-600">🌐</span>
          <span className="ml-2">Roam Web</span>
        </HeaderLogo>
      }
      navigation={
        <HeaderNav>
          <HeaderNavItem href="/" active>
            Home
          </HeaderNavItem>
          <HeaderNavItem href="/nodes">Nodes</HeaderNavItem>
          <HeaderNavItem href="/search">Search</HeaderNavItem>
          <HeaderNavItem href="/about">About</HeaderNavItem>
        </HeaderNav>
      }
      actions={<HeaderActions></HeaderActions>}
    />
  ),
}

export const Minimal: Story = {
  render: () => (
    <Header
      variant="minimal"
      logo={
        <HeaderLogo href="/">
          <span className="text-gray-900">Roam Web</span>
        </HeaderLogo>
      }
      navigation={
        <HeaderNav>
          <HeaderNavItem href="/" active>
            Home
          </HeaderNavItem>
          <HeaderNavItem href="/nodes">Nodes</HeaderNavItem>
          <HeaderNavItem href="/search">Search</HeaderNavItem>
        </HeaderNav>
      }
      actions={<HeaderActions></HeaderActions>}
    />
  ),
}

export const Transparent: Story = {
  render: () => (
    <div className="bg-gradient-to-r from-blue-500 to-purple-600 min-h-96">
      <Header
        variant="transparent"
        logo={
          <HeaderLogo href="/">
            <span className="text-white">🌐</span>
            <span className="ml-2 text-white">Roam Web</span>
          </HeaderLogo>
        }
        navigation={
          <HeaderNav>
            <HeaderNavItem
              href="/"
              active
              className="text-white hover:text-blue-200 hover:bg-white/10 data-[active]:bg-white/20 data-[active]:text-white"
            >
              Home
            </HeaderNavItem>
            <HeaderNavItem
              href="/nodes"
              className="text-white hover:text-blue-200 hover:bg-white/10"
            >
              Nodes
            </HeaderNavItem>
            <HeaderNavItem
              href="/search"
              className="text-white hover:text-blue-200 hover:bg-white/10"
            >
              Search
            </HeaderNavItem>
          </HeaderNav>
        }
        actions={<HeaderActions></HeaderActions>}
      />
      <div className="p-8 text-center text-white">
        <h1 className="text-4xl font-bold mb-4">Transparent Header Demo</h1>
        <p className="text-lg">This header has a transparent background with backdrop blur</p>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Transparent header with backdrop blur effect, perfect for hero sections',
      },
    },
  },
}

// Size variations
export const Small: Story = {
  render: () => (
    <Header
      size="sm"
      logo={
        <HeaderLogo href="/" size="sm">
          <span className="text-blue-600">🌐</span>
          <span className="ml-2">Roam Web</span>
        </HeaderLogo>
      }
      navigation={
        <HeaderNav>
          <HeaderNavItem href="/" active>
            Home
          </HeaderNavItem>
          <HeaderNavItem href="/nodes">Nodes</HeaderNavItem>
          <HeaderNavItem href="/search">Search</HeaderNavItem>
        </HeaderNav>
      }
      actions={<HeaderActions></HeaderActions>}
    />
  ),
}

export const Large: Story = {
  render: () => (
    <Header
      size="lg"
      logo={
        <HeaderLogo href="/" size="lg">
          <span className="text-blue-600 text-2xl">🌐</span>
          <span className="ml-2">Roam Web</span>
        </HeaderLogo>
      }
      navigation={
        <HeaderNav>
          <HeaderNavItem href="/" active>
            Home
          </HeaderNavItem>
          <HeaderNavItem href="/nodes">Nodes</HeaderNavItem>
          <HeaderNavItem href="/search">Search</HeaderNavItem>
          <HeaderNavItem href="/about">About</HeaderNavItem>
        </HeaderNav>
      }
      actions={<HeaderActions></HeaderActions>}
    />
  ),
}

// Position variations
export const Sticky: Story = {
  render: () => (
    <div className="h-96 overflow-y-auto">
      <Header
        position="sticky"
        logo={
          <HeaderLogo href="/">
            <span className="text-blue-600">🌐</span>
            <span className="ml-2">Sticky Header</span>
          </HeaderLogo>
        }
        navigation={
          <HeaderNav>
            <HeaderNavItem href="/" active>
              Home
            </HeaderNavItem>
            <HeaderNavItem href="/nodes">Nodes</HeaderNavItem>
            <HeaderNavItem href="/search">Search</HeaderNavItem>
          </HeaderNav>
        }
        actions={<HeaderActions></HeaderActions>}
      />
      <div className="p-8 space-y-4">
        <div className="h-32 bg-gray-100 rounded flex items-center justify-center">
          <p className="text-gray-600">Scroll to see sticky header behavior</p>
        </div>
        <div className="h-32 bg-gray-200 rounded flex items-center justify-center">
          <p className="text-gray-600">Content section 1</p>
        </div>
        <div className="h-32 bg-gray-100 rounded flex items-center justify-center">
          <p className="text-gray-600">Content section 2</p>
        </div>
        <div className="h-32 bg-gray-200 rounded flex items-center justify-center">
          <p className="text-gray-600">Content section 3</p>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Sticky header that remains at the top when scrolling',
      },
    },
  },
}

// User authenticated state
export const WithUserMenu: Story = {
  render: () => (
    <Header
      logo={
        <HeaderLogo href="/">
          <span className="text-blue-600">🌐</span>
          <span className="ml-2">Roam Web</span>
        </HeaderLogo>
      }
      navigation={
        <HeaderNav>
          <HeaderNavItem href="/dashboard" active>
            Dashboard
          </HeaderNavItem>
          <HeaderNavItem href="/nodes">
            My Nodes
            <Badge size="sm" className="ml-2">
              12
            </Badge>
          </HeaderNavItem>
          <HeaderNavItem href="/shared">Shared</HeaderNavItem>
          <HeaderNavItem href="/search">Search</HeaderNavItem>
        </HeaderNav>
      }
      actions={
        <HeaderActions>
          <Button variant="ghost" size="sm">
            <span className="relative">
              🔔
              <Badge size="sm" className="absolute -top-1 -right-1 min-w-0 h-4 w-4 p-0 text-xs">
                3
              </Badge>
            </span>
          </Button>
          <Button variant="ghost" size="sm" className="rounded-full w-8 h-8 p-0">
            <span className="text-xs font-medium">JD</span>
          </Button>
        </HeaderActions>
      }
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Header for authenticated users with notifications and user avatar',
      },
    },
  },
}

// Mobile responsive example
export const MobileResponsive: Story = {
  render: () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)

    return (
      <Header
        logo={
          <HeaderLogo href="/">
            <span className="text-blue-600">🌐</span>
            <span className="ml-2">Roam Web</span>
          </HeaderLogo>
        }
        navigation={
          <HeaderNav>
            <HeaderNavItem href="/" active>
              Home
            </HeaderNavItem>
            <HeaderNavItem href="/nodes">Nodes</HeaderNavItem>
            <HeaderNavItem href="/search">Search</HeaderNavItem>
            <HeaderNavItem href="/about">About</HeaderNavItem>
            <HeaderNavItem href="/contact">Contact</HeaderNavItem>
          </HeaderNav>
        }
        actions={<HeaderActions></HeaderActions>}
        isMobileMenuOpen={isMobileMenuOpen}
        onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />
    )
  },
  parameters: {
    docs: {
      description: {
        story: 'Responsive header with mobile menu (resize viewport to see mobile behavior)',
      },
    },
  },
}

// App-like header with breadcrumbs
export const WithBreadcrumbs: Story = {
  render: () => (
    <Header
      logo={
        <HeaderLogo href="/">
          <span className="text-blue-600">🌐</span>
          <span className="ml-2">Roam Web</span>
        </HeaderLogo>
      }
      actions={
        <HeaderActions>
          <Button variant="ghost" size="sm">
            <span className="relative">
              🔔
              <Badge
                size="sm"
                variant="destructive"
                className="absolute -top-1 -right-1 min-w-0 h-4 w-4 p-0 text-xs"
              >
                5
              </Badge>
            </span>
          </Button>
          <Button variant="ghost" size="sm">
            ⚙️
          </Button>
          <Button variant="ghost" size="sm" className="rounded-full w-8 h-8 p-0">
            <span className="text-xs font-medium">JD</span>
          </Button>
        </HeaderActions>
      }
    >
      <div className="border-t border-gray-200 px-6 py-2">
        <nav className="flex items-center space-x-2 text-sm text-gray-500">
          <a href="/" className="hover:text-gray-700">
            Home
          </a>
          <span>›</span>
          <a href="/nodes" className="hover:text-gray-700">
            Nodes
          </a>
          <span>›</span>
          <span className="text-gray-900 font-medium">React Components</span>
        </nav>
      </div>
    </Header>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Header with breadcrumb navigation for deeper app navigation',
      },
    },
  },
}

// Search-focused header
export const WithSearch: Story = {
  render: () => (
    <Header
      logo={
        <HeaderLogo href="/">
          <span className="text-blue-600">🌐</span>
          <span className="ml-2">Roam Web</span>
        </HeaderLogo>
      }
      navigation={
        <div className="flex-1 max-w-lg mx-8">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400">🔍</span>
            </div>
            <input
              type="search"
              placeholder="Search nodes..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>
      }
      actions={
        <HeaderActions>
          <Button variant="ghost" size="sm">
            Create
          </Button>
          <Button variant="ghost" size="sm" className="rounded-full w-8 h-8 p-0">
            <span className="text-xs font-medium">JS</span>
          </Button>
        </HeaderActions>
      }
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Header with prominent search functionality',
      },
    },
  },
}
