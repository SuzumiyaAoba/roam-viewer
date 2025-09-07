import type { Meta, StoryObj } from "@storybook/react";
import { Input } from "./Input";
import { Icon } from "@iconify/react";

const meta = {
  title: "Design System/Input",
  component: Input,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A comprehensive input component built on top of shadcn/ui with enhanced features including variants, sizes, icons, labels, helper text, and error states. Designed for accessibility and consistent styling across the application.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["default", "error", "success"],
      description: "The visual variant of the input",
    },
    size: {
      control: { type: "select" },
      options: ["sm", "default", "lg"],
      description: "The size of the input",
    },
    label: {
      control: "text",
      description: "Optional label for the input field",
    },
    helperText: {
      control: "text",
      description: "Helper text displayed below the input",
    },
    errorMessage: {
      control: "text",
      description: "Error message (overrides helperText when present)",
    },
    leftIcon: {
      control: false,
      description: "Icon to display on the left side of the input",
    },
    rightIcon: {
      control: false,
      description: "Icon to display on the right side of the input",
    },
    placeholder: {
      control: "text",
      description: "Placeholder text",
    },
    disabled: {
      control: "boolean",
      description: "Whether the input is disabled",
    },
    required: {
      control: "boolean",
      description: "Whether the input is required",
    },
    type: {
      control: { type: "select" },
      options: ["text", "email", "password", "number", "tel", "url", "search"],
      description: "HTML input type",
    },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic variants
export const Default: Story = {
  args: {
    placeholder: "Enter text...",
  },
};

export const WithLabel: Story = {
  args: {
    label: "Full Name",
    placeholder: "Enter your full name",
  },
};

export const WithHelperText: Story = {
  args: {
    label: "Email Address",
    placeholder: "your.email@example.com",
    helperText: "We'll never share your email with anyone else",
  },
};

export const Required: Story = {
  args: {
    label: "Password",
    type: "password",
    placeholder: "Enter secure password",
    required: true,
    helperText: "Must be at least 8 characters long",
  },
};

// Error states
export const WithError: Story = {
  args: {
    label: "Email Address",
    type: "email",
    value: "invalid-email",
    errorMessage: "Please enter a valid email address",
  },
};

export const ErrorVariant: Story = {
  args: {
    variant: "error",
    placeholder: "This input has an error state",
  },
};

// Success state
export const SuccessVariant: Story = {
  args: {
    variant: "success",
    placeholder: "This input indicates success",
    value: "Valid input",
  },
};

export const WithSuccessMessage: Story = {
  args: {
    label: "Username",
    variant: "success",
    value: "john_doe",
    helperText: "Username is available!",
  },
};

// Sizes
export const Small: Story = {
  args: {
    size: "sm",
    label: "Small Input",
    placeholder: "Small size input",
  },
};

export const Large: Story = {
  args: {
    size: "lg",
    label: "Large Input",
    placeholder: "Large size input",
  },
};

// Icons
export const WithLeftIcon: Story = {
  args: {
    label: "Search",
    placeholder: "Search for something...",
    leftIcon: <Icon icon="lucide:search" className="w-4 h-4" />,
  },
};

export const WithRightIcon: Story = {
  args: {
    label: "Website URL",
    type: "url",
    placeholder: "https://example.com",
    rightIcon: <Icon icon="lucide:external-link" className="w-4 h-4" />,
  },
};

export const WithBothIcons: Story = {
  args: {
    label: "Amount",
    type: "number",
    placeholder: "0.00",
    leftIcon: <Icon icon="lucide:dollar-sign" className="w-4 h-4" />,
    rightIcon: <Icon icon="lucide:calculator" className="w-4 h-4" />,
  },
};

export const PasswordWithToggle: Story = {
  args: {
    label: "Password",
    type: "password",
    placeholder: "Enter your password",
    rightIcon: <Icon icon="lucide:eye" className="w-4 h-4 cursor-pointer" />,
    helperText: "Click the eye icon to toggle visibility",
  },
};

// Input types
export const EmailInput: Story = {
  args: {
    label: "Email Address",
    type: "email",
    placeholder: "your.email@example.com",
    leftIcon: <Icon icon="lucide:mail" className="w-4 h-4" />,
  },
};

export const PhoneInput: Story = {
  args: {
    label: "Phone Number",
    type: "tel",
    placeholder: "+1 (555) 000-0000",
    leftIcon: <Icon icon="lucide:phone" className="w-4 h-4" />,
  },
};

export const NumberInput: Story = {
  args: {
    label: "Age",
    type: "number",
    placeholder: "25",
    min: 0,
    max: 120,
  },
};

export const UrlInput: Story = {
  args: {
    label: "Website",
    type: "url",
    placeholder: "https://example.com",
    leftIcon: <Icon icon="lucide:globe" className="w-4 h-4" />,
  },
};

export const SearchInput: Story = {
  args: {
    type: "search",
    placeholder: "Search...",
    leftIcon: <Icon icon="lucide:search" className="w-4 h-4" />,
  },
};

// States
export const Disabled: Story = {
  args: {
    label: "Disabled Input",
    placeholder: "You cannot edit this",
    value: "Disabled value",
    disabled: true,
    helperText: "This input is disabled",
  },
};

export const ReadOnly: Story = {
  args: {
    label: "Read-only Field",
    value: "This value cannot be changed",
    readOnly: true,
    helperText: "This field is read-only",
  },
};

// Size variations showcase
export const AllSizes: Story = {
  render: () => (
    <div className="space-y-6 w-80">
      <Input
        size="sm"
        label="Small"
        placeholder="Small size input"
        leftIcon={<Icon icon="lucide:user" className="w-3 h-3" />}
      />
      <Input
        size="default"
        label="Default"
        placeholder="Default size input"
        leftIcon={<Icon icon="lucide:user" className="w-4 h-4" />}
      />
      <Input
        size="lg"
        label="Large"
        placeholder="Large size input"
        leftIcon={<Icon icon="lucide:user" className="w-5 h-5" />}
      />
    </div>
  ),
  parameters: {
    layout: "padded",
    docs: {
      description: {
        story: "Comparison of all available input sizes with consistent icons",
      },
    },
  },
};

// Variant showcase
export const AllVariants: Story = {
  render: () => (
    <div className="space-y-6 w-80">
      <Input
        variant="default"
        label="Default Variant"
        placeholder="Default styling"
        value="Valid input"
      />
      <Input
        variant="error"
        label="Error Variant"
        placeholder="Error styling"
        value="Invalid input"
        errorMessage="This field has an error"
      />
      <Input
        variant="success"
        label="Success Variant"
        placeholder="Success styling"
        value="Valid input"
        helperText="Input is valid!"
      />
    </div>
  ),
  parameters: {
    layout: "padded",
    docs: {
      description: {
        story: "Overview of all available input variants with their respective styling",
      },
    },
  },
};

// Form example
export const CompleteFormExample: Story = {
  render: () => (
    <form className="space-y-6 w-96">
      <Input
        label="Full Name"
        placeholder="Enter your full name"
        required
        leftIcon={<Icon icon="lucide:user" className="w-4 h-4" />}
      />
      <Input
        label="Email Address"
        type="email"
        placeholder="your.email@example.com"
        required
        leftIcon={<Icon icon="lucide:mail" className="w-4 h-4" />}
        helperText="We'll use this to send you updates"
      />
      <Input
        label="Phone Number"
        type="tel"
        placeholder="+1 (555) 000-0000"
        leftIcon={<Icon icon="lucide:phone" className="w-4 h-4" />}
        helperText="Optional - for important notifications"
      />
      <Input
        label="Company Website"
        type="url"
        placeholder="https://yourcompany.com"
        leftIcon={<Icon icon="lucide:globe" className="w-4 h-4" />}
        rightIcon={<Icon icon="lucide:external-link" className="w-4 h-4" />}
      />
      <Input
        label="Password"
        type="password"
        placeholder="Create a secure password"
        required
        rightIcon={<Icon icon="lucide:eye" className="w-4 h-4" />}
        helperText="Must be at least 8 characters with mixed case and numbers"
      />
    </form>
  ),
  parameters: {
    layout: "padded",
    docs: {
      description: {
        story: "Complete form example showing various input types and configurations working together",
      },
    },
  },
};

// Real-world examples
export const LoginFormExample: Story = {
  render: () => (
    <div className="w-80 space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Sign In</h2>
        <p className="text-gray-600">Enter your credentials to continue</p>
      </div>
      <Input
        label="Email"
        type="email"
        placeholder="Enter your email"
        leftIcon={<Icon icon="lucide:mail" className="w-4 h-4" />}
        required
      />
      <Input
        label="Password"
        type="password"
        placeholder="Enter your password"
        leftIcon={<Icon icon="lucide:lock" className="w-4 h-4" />}
        rightIcon={<Icon icon="lucide:eye" className="w-4 h-4 cursor-pointer" />}
        required
      />
    </div>
  ),
  parameters: {
    layout: "padded",
    docs: {
      description: {
        story: "Login form example with email and password fields",
      },
    },
  },
};

export const SearchFormExample: Story = {
  render: () => (
    <div className="w-full max-w-md">
      <Input
        size="lg"
        placeholder="Search for anything..."
        leftIcon={<Icon icon="lucide:search" className="w-5 h-5" />}
        rightIcon={<Icon icon="lucide:filter" className="w-5 h-5 cursor-pointer" />}
      />
    </div>
  ),
  parameters: {
    layout: "padded",
    docs: {
      description: {
        story: "Search bar example with search and filter icons",
      },
    },
  },
};

// Error states showcase
export const ErrorStatesShowcase: Story = {
  render: () => (
    <div className="space-y-6 w-80">
      <Input
        label="Required Field"
        placeholder="This field is required"
        errorMessage="This field is required"
        required
      />
      <Input
        label="Email Validation"
        type="email"
        value="invalid-email"
        errorMessage="Please enter a valid email address"
        leftIcon={<Icon icon="lucide:mail" className="w-4 h-4" />}
      />
      <Input
        label="Password Strength"
        type="password"
        value="123"
        errorMessage="Password must be at least 8 characters long"
        rightIcon={<Icon icon="lucide:eye" className="w-4 h-4" />}
      />
      <Input
        label="Number Range"
        type="number"
        value="150"
        errorMessage="Value must be between 1 and 100"
        min={1}
        max={100}
      />
    </div>
  ),
  parameters: {
    layout: "padded",
    docs: {
      description: {
        story: "Various error states and validation messages",
      },
    },
  },
};