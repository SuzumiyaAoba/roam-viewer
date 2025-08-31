import type { Meta, StoryObj } from '@storybook/react'
import React from 'react'
import { Modal, ModalHeader, ModalTitle, ModalDescription, ModalCloseButton, ModalContent, ModalFooter } from './Modal'
import { Button } from './Button'

const meta = {
  title: 'Design System/Modal',
  component: Modal,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A modal dialog component that displays content in a layer above the main interface. Supports different sizes, animations, and customizable behavior.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: { type: 'select' },
      options: ['sm', 'default', 'lg', 'xl', '2xl', '3xl', 'full'],
      description: 'The size of the modal'
    },
    open: {
      control: 'boolean',
      description: 'Whether the modal is open'
    },
    closeOnOverlayClick: {
      control: 'boolean',
      description: 'Whether clicking the overlay should close the modal'
    },
    closeOnEscape: {
      control: 'boolean',
      description: 'Whether pressing escape should close the modal'
    },
    animated: {
      control: 'boolean',
      description: 'Whether to show the modal with animation'
    }
  },
} satisfies Meta<typeof Modal>

export default meta
type Story = StoryObj<typeof meta>

// Basic modal
export const Default: Story = {
  render: (args) => {
    const [open, setOpen] = React.useState(false)
    
    return (
      <div>
        <Button onClick={() => setOpen(true)}>Open Modal</Button>
        <Modal open={open} onClose={() => setOpen(false)} size={args.size || 'default'}>
          <ModalHeader>
            <div>
              <ModalTitle>Modal Title</ModalTitle>
              <ModalDescription>This is a modal description.</ModalDescription>
            </div>
            <ModalCloseButton onClick={() => setOpen(false)} />
          </ModalHeader>
          <ModalContent>
            <p className="text-sm text-gray-600">
              This is the modal content. You can put any content here including forms, 
              images, or other components.
            </p>
          </ModalContent>
          <ModalFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => setOpen(false)}>Confirm</Button>
          </ModalFooter>
        </Modal>
      </div>
    )
  },
  args: {
    size: 'default',
  },
}

export const Small: Story = {
  render: () => {
    const [open, setOpen] = React.useState(false)
    
    return (
      <div>
        <Button onClick={() => setOpen(true)}>Small Modal</Button>
        <Modal open={open} onClose={() => setOpen(false)} size="sm">
          <ModalHeader>
            <ModalTitle>Small Modal</ModalTitle>
            <ModalCloseButton onClick={() => setOpen(false)} />
          </ModalHeader>
          <ModalContent>
            <p className="text-sm text-gray-600">This is a small modal.</p>
          </ModalContent>
        </Modal>
      </div>
    )
  },
}

export const Large: Story = {
  render: () => {
    const [open, setOpen] = React.useState(false)
    
    return (
      <div>
        <Button onClick={() => setOpen(true)}>Large Modal</Button>
        <Modal open={open} onClose={() => setOpen(false)} size="lg">
          <ModalHeader>
            <div>
              <ModalTitle>Large Modal</ModalTitle>
              <ModalDescription>This modal has more space for content.</ModalDescription>
            </div>
            <ModalCloseButton onClick={() => setOpen(false)} />
          </ModalHeader>
          <ModalContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                This is a large modal with more content space.
              </p>
              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="font-medium text-gray-900 mb-2">Additional Information</h4>
                <p className="text-sm text-gray-600">
                  Here's some additional content to demonstrate the larger size.
                </p>
              </div>
            </div>
          </ModalContent>
          <ModalFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => setOpen(false)}>Save Changes</Button>
          </ModalFooter>
        </Modal>
      </div>
    )
  },
}

export const ConfirmationDialog: Story = {
  render: () => {
    const [open, setOpen] = React.useState(false)
    
    return (
      <div>
        <Button variant="destructive" onClick={() => setOpen(true)}>Delete Item</Button>
        <Modal open={open} onClose={() => setOpen(false)} size="sm">
          <ModalHeader>
            <div>
              <ModalTitle>Confirm Deletion</ModalTitle>
              <ModalDescription>This action cannot be undone.</ModalDescription>
            </div>
          </ModalHeader>
          <ModalContent>
            <p className="text-sm text-gray-600">
              Are you sure you want to delete this item? All associated data will be 
              permanently removed from our servers.
            </p>
          </ModalContent>
          <ModalFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => setOpen(false)}>Delete</Button>
          </ModalFooter>
        </Modal>
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story: 'A confirmation dialog for destructive actions'
      }
    }
  },
}