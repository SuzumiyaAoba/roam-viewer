import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button";
import {
  Footer,
  FooterBottom,
  FooterCTA,
  FooterLink,
  FooterSection,
  FooterSocial,
  FooterSocialLink,
} from "./Footer";

const meta = {
  title: "Design System/Footer",
  component: Footer,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "A flexible footer component with multiple variants and composable parts. Perfect for displaying site information, links, and calls-to-action with proper spacing and visual hierarchy.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["default", "minimal", "dark", "accent"],
      description: "The visual variant of the footer",
    },
    size: {
      control: { type: "select" },
      options: ["sm", "default", "lg"],
      description: "The size of the footer",
    },
    layout: {
      control: { type: "select" },
      options: ["simple", "multi", "centered"],
      description: "The layout style of the footer",
    },
  },
} satisfies Meta<typeof Footer>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic examples
export const Default: Story = {
  render: () => (
    <Footer bottom={<FooterBottom copyright="© 2024 Roam Web. All rights reserved." />} />
  ),
};

export const Minimal: Story = {
  render: () => (
    <Footer
      variant="minimal"
      bottom={<FooterBottom copyright="© 2024 Roam Web. All rights reserved." />}
    />
  ),
};

export const Dark: Story = {
  render: () => (
    <Footer
      variant="dark"
      bottom={<FooterBottom copyright="© 2024 Roam Web. All rights reserved." />}
    />
  ),
};

export const Accent: Story = {
  render: () => (
    <Footer
      variant="accent"
      bottom={<FooterBottom copyright="© 2024 Roam Web. All rights reserved." />}
    />
  ),
};

// Size variations
export const Small: Story = {
  render: () => (
    <Footer size="sm" bottom={<FooterBottom copyright="© 2024 Roam Web. All rights reserved." />} />
  ),
};

export const Large: Story = {
  render: () => (
    <Footer size="lg" bottom={<FooterBottom copyright="© 2024 Roam Web. All rights reserved." />} />
  ),
};

// Complete footer with sections
export const WithSections: Story = {
  render: () => (
    <Footer
      layout="multi"
      sections={
        <>
          <FooterSection title="Product">
            <FooterLink href="/features">Features</FooterLink>
            <FooterLink href="/pricing">Pricing</FooterLink>
            <FooterLink href="/api">API</FooterLink>
            <FooterLink href="/documentation">Documentation</FooterLink>
          </FooterSection>

          <FooterSection title="Company">
            <FooterLink href="/about">About</FooterLink>
            <FooterLink href="/blog">Blog</FooterLink>
            <FooterLink href="/careers">Careers</FooterLink>
            <FooterLink href="/contact">Contact</FooterLink>
          </FooterSection>
        </>
      }
      social={
        <FooterSocial>
          <FooterSocialLink platform="Twitter" icon="🐦" href="https://twitter.com" />
          <FooterSocialLink platform="GitHub" icon="🐙" href="https://github.com" />
          <FooterSocialLink platform="LinkedIn" icon="💼" href="https://linkedin.com" />
          <FooterSocialLink platform="Discord" icon="💬" href="https://discord.com" />
        </FooterSocial>
      }
      cta={
        <FooterCTA
          title="Newsletter"
          description="Stay up to date with the latest news and updates"
          action={
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button size="sm">Subscribe</Button>
            </div>
          }
        />
      }
      bottom={
        <FooterBottom
          copyright="© 2024 Roam Web. All rights reserved."
          links={
            <>
              <FooterLink href="/privacy">Privacy Policy</FooterLink>
              <FooterLink href="/terms">Terms of Service</FooterLink>
              <FooterLink href="/cookies">Cookie Policy</FooterLink>
            </>
          }
        />
      }
    />
  ),
};

// Centered layout
export const Centered: Story = {
  render: () => (
    <Footer
      layout="centered"
      sections={
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">🌐 Roam Web</h2>
            <p className="text-gray-600 max-w-md mx-auto">
              The modern knowledge management platform for organizing and connecting your ideas.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-6">
            <FooterLink href="/about">About</FooterLink>
            <FooterLink href="/features">Features</FooterLink>
            <FooterLink href="/pricing">Pricing</FooterLink>
            <FooterLink href="/blog">Blog</FooterLink>
            <FooterLink href="/contact">Contact</FooterLink>
          </div>
        </div>
      }
      social={
        <FooterSocial title="">
          <FooterSocialLink platform="Twitter" icon="🐦" href="https://twitter.com" />
          <FooterSocialLink platform="GitHub" icon="🐙" href="https://github.com" />
          <FooterSocialLink platform="LinkedIn" icon="💼" href="https://linkedin.com" />
          <FooterSocialLink platform="Discord" icon="💬" href="https://discord.com" />
        </FooterSocial>
      }
      bottom={
        <div className="text-center">
          <FooterBottom copyright="© 2024 Roam Web. All rights reserved." />
        </div>
      }
    />
  ),
};

// App footer example
export const AppFooter: Story = {
  render: () => (
    <Footer
      variant="minimal"
      size="sm"
      sections={
        <>
          <FooterSection title="Roam Web">
            <FooterLink href="/nodes">My Nodes</FooterLink>
            <FooterLink href="/shared">Shared Nodes</FooterLink>
            <FooterLink href="/search">Search</FooterLink>
            <FooterLink href="/tags">Tags</FooterLink>
          </FooterSection>

          <FooterSection title="Account">
            <FooterLink href="/profile">Profile</FooterLink>
            <FooterLink href="/settings">Settings</FooterLink>
            <FooterLink href="/billing">Billing</FooterLink>
            <FooterLink href="/export">Export Data</FooterLink>
          </FooterSection>

          <FooterSection title="Resources">
            <FooterLink href="/help">Help Center</FooterLink>
            <FooterLink href="/docs">Documentation</FooterLink>
            <FooterLink href="/api">API Reference</FooterLink>
            <FooterLink href="/keyboard-shortcuts">Shortcuts</FooterLink>
          </FooterSection>
        </>
      }
      social={
        <FooterSocial title="Community">
          <FooterSocialLink platform="Discord" icon="💬" href="https://discord.com" />
          <FooterSocialLink platform="GitHub" icon="🐙" href="https://github.com" />
          <FooterSocialLink platform="Twitter" icon="🐦" href="https://twitter.com" />
        </FooterSocial>
      }
      bottom={
        <FooterBottom
          copyright="© 2024 Roam Web. All rights reserved."
          links={
            <>
              <FooterLink href="/privacy">Privacy</FooterLink>
              <FooterLink href="/terms">Terms</FooterLink>
              <FooterLink href="/status" external>
                Status
              </FooterLink>
            </>
          }
        />
      }
    />
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Footer specifically designed for the Roam Web application with relevant links and sections",
      },
    },
  },
};

// Dark theme footer
export const DarkTheme: Story = {
  render: () => (
    <div className="bg-gray-800 min-h-96 flex items-end">
      <Footer
        variant="dark"
        className="bg-gray-900"
        sections={
          <>
            <FooterSection title="Product">
              <FooterLink href="/features" className="text-gray-300 hover:text-white">
                Features
              </FooterLink>
              <FooterLink href="/pricing" className="text-gray-300 hover:text-white">
                Pricing
              </FooterLink>
              <FooterLink href="/api" className="text-gray-300 hover:text-white">
                API
              </FooterLink>
              <FooterLink href="/docs" className="text-gray-300 hover:text-white">
                Documentation
              </FooterLink>
            </FooterSection>

            <FooterSection title="Company">
              <FooterLink href="/about" className="text-gray-300 hover:text-white">
                About
              </FooterLink>
              <FooterLink href="/blog" className="text-gray-300 hover:text-white">
                Blog
              </FooterLink>
              <FooterLink href="/careers" className="text-gray-300 hover:text-white">
                Careers
              </FooterLink>
              <FooterLink href="/contact" className="text-gray-300 hover:text-white">
                Contact
              </FooterLink>
            </FooterSection>
          </>
        }
        social={
          <FooterSocial title="Connect">
            <FooterSocialLink
              platform="Twitter"
              icon="🐦"
              href="https://twitter.com"
              className="bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white"
            />
            <FooterSocialLink
              platform="GitHub"
              icon="🐙"
              href="https://github.com"
              className="bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white"
            />
            <FooterSocialLink
              platform="Discord"
              icon="💬"
              href="https://discord.com"
              className="bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white"
            />
          </FooterSocial>
        }
        cta={
          <FooterCTA
            title="Stay Updated"
            description="Get the latest updates and news"
            action={
              <div className="flex flex-col gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="px-3 py-2 text-sm bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Button size="sm" className="w-full">
                  Subscribe
                </Button>
              </div>
            }
          />
        }
        bottom={
          <FooterBottom
            copyright="© 2024 Roam Web. All rights reserved."
            links={
              <>
                <FooterLink href="/privacy" className="text-gray-400 hover:text-white">
                  Privacy
                </FooterLink>
                <FooterLink href="/terms" className="text-gray-400 hover:text-white">
                  Terms
                </FooterLink>
                <FooterLink href="/security" className="text-gray-400 hover:text-white">
                  Security
                </FooterLink>
              </>
            }
          />
        }
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Dark theme footer with custom styling for dark backgrounds",
      },
    },
  },
};

// Simple footer variations
export const SimpleFooter: Story = {
  render: () => (
    <Footer
      bottom={
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
          <div className="flex items-center space-x-4">
            <span className="text-2xl">🌐</span>
            <span className="font-semibold text-gray-900">Roam Web</span>
          </div>
          <div className="flex items-center space-x-6 text-sm">
            <FooterLink href="/about">About</FooterLink>
            <FooterLink href="/privacy">Privacy</FooterLink>
            <FooterLink href="/terms">Terms</FooterLink>
            <FooterLink href="/contact">Contact</FooterLink>
          </div>
          <div className="text-sm text-gray-500">© 2024 All rights reserved</div>
        </div>
      }
    />
  ),
};

// Newsletter focused footer
export const NewsletterFocus: Story = {
  render: () => (
    <Footer
      variant="accent"
      sections={
        <div className="text-center space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Stay in the loop</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Get notified about new features, updates, and tips for better knowledge management.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email address"
              className="flex-1 px-4 py-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Button size="default" className="sm:px-8">
              Subscribe
            </Button>
          </div>

          <p className="text-xs text-gray-500">We respect your privacy. Unsubscribe at any time.</p>
        </div>
      }
      bottom={
        <FooterBottom
          copyright="© 2024 Roam Web. All rights reserved."
          links={
            <>
              <FooterLink href="/privacy">Privacy Policy</FooterLink>
              <FooterLink href="/terms">Terms of Service</FooterLink>
            </>
          }
        />
      }
    />
  ),
  parameters: {
    docs: {
      description: {
        story: "Footer focused on newsletter signup with accent styling",
      },
    },
  },
};

// All variants showcase
export const AllVariants: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Default</h3>
        <Footer bottom={<FooterBottom copyright="© 2024 Roam Web. All rights reserved." />} />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Minimal</h3>
        <Footer
          variant="minimal"
          bottom={<FooterBottom copyright="© 2024 Roam Web. All rights reserved." />}
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Accent</h3>
        <Footer
          variant="accent"
          bottom={<FooterBottom copyright="© 2024 Roam Web. All rights reserved." />}
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Dark</h3>
        <Footer
          variant="dark"
          bottom={<FooterBottom copyright="© 2024 Roam Web. All rights reserved." />}
        />
      </div>
    </div>
  ),
  parameters: {
    layout: "padded",
    docs: {
      description: {
        story: "Overview of all available footer variants",
      },
    },
  },
};
