import type { Meta, StoryObj } from '@storybook/react'
import React from 'react'
import { Avatar, AvatarGroup } from './Avatar'

const meta = {
  title: 'Design System/Avatar',
  component: Avatar,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'An avatar represents a user or entity with an image, initials, or icon. Supports status indicators and grouping.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: { type: 'select' },
      options: ['sm', 'default', 'lg', 'xl', '2xl'],
      description: 'The size of the avatar'
    },
    src: {
      control: 'text',
      description: 'The source URL of the avatar image'
    },
    alt: {
      control: 'text',
      description: 'Alternative text for the avatar image'
    },
    name: {
      control: 'text',
      description: 'Name to generate initials from'
    },
    fallback: {
      control: 'text',
      description: 'Custom fallback content'
    },
    status: {
      control: { type: 'select' },
      options: ['online', 'offline', 'away', 'busy'],
      description: 'Status indicator'
    }
  },
} satisfies Meta<typeof Avatar>

export default meta
type Story = StoryObj<typeof meta>

// Basic examples
export const Default: Story = {
  args: {
    src: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    alt: 'John Doe',
  },
}

export const WithInitials: Story = {
  args: {
    name: 'John Doe',
  },
}

export const WithCustomFallback: Story = {
  render: () => <Avatar fallback="👤" />,
}

// Sizes
export const Small: Story = {
  args: {
    size: 'sm',
    src: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    alt: 'John Doe',
  },
}

export const Large: Story = {
  args: {
    size: 'lg',
    src: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    alt: 'John Doe',
  },
}

export const ExtraLarge: Story = {
  args: {
    size: 'xl',
    src: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    alt: 'John Doe',
  },
}

// Status indicators
export const OnlineStatus: Story = {
  args: {
    src: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    alt: 'John Doe',
    status: 'online',
  },
}

export const BusyStatus: Story = {
  args: {
    src: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    alt: 'John Doe',
    status: 'busy',
  },
}

// Fallback scenarios
export const BrokenImage: Story = {
  args: {
    src: 'https://broken-url.jpg',
    name: 'Jane Smith',
    alt: 'Jane Smith',
  },
}

export const NoImageWithName: Story = {
  args: {
    name: 'Alice Johnson',
  },
}

export const NoImageNoName: Story = {
  args: {},
}

// Avatar groups
export const AvatarGroupStory: Story = {
  render: () => (
    <AvatarGroup>
      <Avatar src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face" alt="John" />
      <Avatar name="Jane Smith" />
      <Avatar src="https://images.unsplash.com/photo-1494790108755-2616b612b647?w=150&h=150&fit=crop&crop=face" alt="Alice" />
      <Avatar name="Bob Wilson" />
    </AvatarGroup>
  ),
  parameters: {
    docs: {
      description: {
        story: 'A group of avatars with overlapping layout'
      }
    }
  },
}

export const AvatarGroupWithLimit: Story = {
  render: () => (
    <AvatarGroup max={3}>
      <Avatar src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face" alt="John" />
      <Avatar name="Jane Smith" />
      <Avatar src="https://images.unsplash.com/photo-1494790108755-2616b612b647?w=150&h=150&fit=crop&crop=face" alt="Alice" />
      <Avatar name="Bob Wilson" />
      <Avatar name="Charlie Brown" />
      <Avatar name="Diana Prince" />
    </AvatarGroup>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Avatar group with maximum limit showing overflow count'
      }
    }
  },
}

// All sizes showcase
export const AllSizes: Story = {
  render: () => (
    <div className="flex items-end gap-4 p-6">
      <Avatar size="sm" name="SM" />
      <Avatar size="default" name="MD" />
      <Avatar size="lg" name="LG" />
      <Avatar size="xl" name="XL" />
      <Avatar size="2xl" name="2XL" />
    </div>
  ),
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'Comparison of all available avatar sizes'
      }
    }
  },
}