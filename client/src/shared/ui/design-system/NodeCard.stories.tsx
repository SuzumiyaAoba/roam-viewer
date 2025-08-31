import type { Meta, StoryObj } from "@storybook/react";
import { NodeCard, NodeCardCompact, NodeCardGrid } from "./NodeCard";

const meta = {
  title: "Design System/NodeCard",
  component: NodeCard,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "A modern card component for displaying knowledge nodes with rich metadata, tags, and interactive features. Designed with hover effects and modern UI patterns.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["default", "elevated", "minimal", "accent", "glass"],
      description: "The visual variant of the node card",
    },
    size: {
      control: { type: "select" },
      options: ["sm", "default", "lg"],
      description: "The size of the node card",
    },
    interactive: {
      control: "boolean",
      description: "Whether the card has hover animations",
    },
    title: {
      control: "text",
      description: "The node title",
    },
    content: {
      control: "text",
      description: "Content preview text",
    },
    file: {
      control: "text",
      description: "File path of the node",
    },
    selected: {
      control: "boolean",
      description: "Whether the card is selected",
    },
    showActions: {
      control: "boolean",
      description: "Whether to show action buttons",
    },
  },
} satisfies Meta<typeof NodeCard>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic examples
export const Default: Story = {
  args: {
    title: "React Components Best Practices",
    content:
      "Learn how to build scalable and maintainable React components with modern patterns, proper state management, and performance optimizations.",
    file: "react/components-best-practices.md",
    tags: ["React", "Components", "Best Practices", "Frontend"],
    onCardClick: () => alert("Card clicked"),
    onEdit: () => alert("Edit clicked"),
    onDelete: () => alert("Delete clicked"),
  },
};

export const WithTodo: Story = {
  args: {
    title: "Database Design Patterns",
    content:
      "Comprehensive guide to database design patterns including normalization, indexing strategies, and performance optimization techniques.",
    file: "database/design-patterns.md",
    tags: ["Database", "SQL", "Design Patterns"],
    todo: "Add performance benchmarks",
    date: new Date("2024-01-15"),
    onCardClick: () => alert("Card clicked"),
    onEdit: () => alert("Edit clicked"),
    onDelete: () => alert("Delete clicked"),
  },
};

export const LongContent: Story = {
  args: {
    title: "Advanced TypeScript Techniques for Large Scale Applications",
    content:
      "This is a very long piece of content that demonstrates how the card handles text truncation. TypeScript provides powerful type safety features that can help prevent runtime errors and improve developer experience. In large applications, proper type definitions, generic constraints, and advanced utility types become essential for maintaining code quality and developer productivity. This content should be truncated with an ellipsis to maintain the card layout.",
    file: "typescript/advanced-techniques-for-enterprise-applications.md",
    tags: ["TypeScript", "Enterprise", "Architecture", "Types", "Generics", "Utilities"],
    date: new Date(),
    onCardClick: () => alert("Card clicked"),
    onEdit: () => alert("Edit clicked"),
    onDelete: () => alert("Delete clicked"),
  },
};

// Variants
export const Elevated: Story = {
  args: {
    variant: "elevated",
    title: "Node.js Microservices Architecture",
    content: "Building scalable microservices with Node.js, Docker, and Kubernetes.",
    file: "nodejs/microservices.md",
    tags: ["Node.js", "Microservices", "Docker", "Kubernetes"],
    onCardClick: () => alert("Card clicked"),
    onEdit: () => alert("Edit clicked"),
    onDelete: () => alert("Delete clicked"),
  },
};

export const Minimal: Story = {
  args: {
    variant: "minimal",
    title: "CSS Grid Layout Guide",
    content: "Master CSS Grid with practical examples and real-world use cases.",
    file: "css/grid-layout.md",
    tags: ["CSS", "Grid", "Layout"],
    onCardClick: () => alert("Card clicked"),
    onEdit: () => alert("Edit clicked"),
    onDelete: () => alert("Delete clicked"),
  },
};

export const Accent: Story = {
  args: {
    variant: "accent",
    title: "Machine Learning Fundamentals",
    content: "Introduction to machine learning concepts, algorithms, and practical applications.",
    file: "ml/fundamentals.md",
    tags: ["ML", "AI", "Data Science", "Python"],
    onCardClick: () => alert("Card clicked"),
    onEdit: () => alert("Edit clicked"),
    onDelete: () => alert("Delete clicked"),
  },
};

export const Glass: Story = {
  args: {
    variant: "glass",
    title: "Design Systems at Scale",
    content: "How to build and maintain design systems for large organizations.",
    file: "design/systems-at-scale.md",
    tags: ["Design", "Systems", "UI/UX"],
    onCardClick: () => alert("Card clicked"),
    onEdit: () => alert("Edit clicked"),
    onDelete: () => alert("Delete clicked"),
  },
  parameters: {
    backgrounds: {
      default: "gradient",
      values: [{ name: "gradient", value: "linear-gradient(45deg, #667eea 0%, #764ba2 100%)" }],
    },
  },
};

// Sizes
export const Small: Story = {
  args: {
    size: "sm",
    title: "Quick Note",
    content: "A brief note about something important.",
    file: "notes/quick-note.md",
    tags: ["Notes"],
    onCardClick: () => alert("Card clicked"),
    onEdit: () => alert("Edit clicked"),
    onDelete: () => alert("Delete clicked"),
  },
};

export const Large: Story = {
  args: {
    size: "lg",
    title: "Comprehensive API Documentation",
    content:
      "Complete API documentation with examples, authentication methods, rate limiting, and best practices for integration.",
    file: "api/documentation.md",
    tags: ["API", "Documentation", "REST", "GraphQL"],
    date: new Date(),
    onCardClick: () => alert("Card clicked"),
    onEdit: () => alert("Edit clicked"),
    onDelete: () => alert("Delete clicked"),
  },
};

// States
export const Selected: Story = {
  args: {
    title: "Selected Node",
    content: "This node is currently selected.",
    file: "selected/node.md",
    tags: ["Selected"],
    selected: true,
    onCardClick: () => alert("Card clicked"),
    onEdit: () => alert("Edit clicked"),
    onDelete: () => alert("Delete clicked"),
  },
};

export const NoActions: Story = {
  args: {
    title: "Read-Only Node",
    content: "This node has no action buttons visible.",
    file: "readonly/node.md",
    tags: ["Read-Only"],
    showActions: false,
    onCardClick: () => alert("Card clicked"),
  },
};

export const CustomActions: Story = {
  args: {
    title: "Custom Actions Node",
    content: "This node has custom action buttons.",
    file: "custom/actions.md",
    tags: ["Custom"],
    actions: (
      <div className="flex items-center space-x-1">
        <button className="p-1 text-blue-500 hover:text-blue-700" onClick={() => alert("Share")}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
            />
          </svg>
        </button>
        <button
          className="p-1 text-yellow-500 hover:text-yellow-700"
          onClick={() => alert("Bookmark")}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
            />
          </svg>
        </button>
        <button
          className="p-1 text-green-500 hover:text-green-700"
          onClick={() => alert("Download")}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </button>
      </div>
    ),
    onCardClick: () => alert("Card clicked"),
  },
};

// Compact variant
export const Compact: Story = {
  render: () => (
    <div className="space-y-2">
      <NodeCardCompact
        title="First Compact Node"
        content="Brief content for the first node."
        file="compact/first.md"
        tags={["Compact", "List"]}
        onCardClick={() => alert("First node clicked")}
        onEdit={() => alert("Edit first")}
        onDelete={() => alert("Delete first")}
      />
      <NodeCardCompact
        title="Second Compact Node"
        content="Brief content for the second node."
        file="compact/second.md"
        tags={["Compact", "List"]}
        onCardClick={() => alert("Second node clicked")}
        onEdit={() => alert("Edit second")}
        onDelete={() => alert("Delete second")}
      />
      <NodeCardCompact
        title="Third Compact Node"
        content="Brief content for the third node."
        file="compact/third.md"
        tags={["Compact", "List"]}
        onCardClick={() => alert("Third node clicked")}
        onEdit={() => alert("Edit third")}
        onDelete={() => alert("Delete third")}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Compact variant for dense list layouts",
      },
    },
  },
};

// Grid layout
export const Grid: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <NodeCardGrid
        title="React Hooks"
        content="Modern React development with hooks."
        file="react/hooks.md"
        tags={["React", "Hooks"]}
        onCardClick={() => alert("React Hooks clicked")}
        onEdit={() => alert("Edit React Hooks")}
        onDelete={() => alert("Delete React Hooks")}
      />
      <NodeCardGrid
        title="Vue 3 Composition API"
        content="Building components with Vue 3."
        file="vue/composition-api.md"
        tags={["Vue", "Composition"]}
        onCardClick={() => alert("Vue clicked")}
        onEdit={() => alert("Edit Vue")}
        onDelete={() => alert("Delete Vue")}
      />
      <NodeCardGrid
        title="Angular Reactive Forms"
        content="Form handling in Angular applications."
        file="angular/reactive-forms.md"
        tags={["Angular", "Forms"]}
        onCardClick={() => alert("Angular clicked")}
        onEdit={() => alert("Edit Angular")}
        onDelete={() => alert("Delete Angular")}
      />
      <NodeCardGrid
        title="Svelte Stores"
        content="State management with Svelte stores."
        file="svelte/stores.md"
        tags={["Svelte", "State"]}
        onCardClick={() => alert("Svelte clicked")}
        onEdit={() => alert("Edit Svelte")}
        onDelete={() => alert("Delete Svelte")}
      />
      <NodeCardGrid
        title="Web Components"
        content="Creating reusable web components."
        file="web/components.md"
        tags={["Web Components"]}
        todo="Add browser support table"
        onCardClick={() => alert("Web Components clicked")}
        onEdit={() => alert("Edit Web Components")}
        onDelete={() => alert("Delete Web Components")}
      />
      <NodeCardGrid
        title="GraphQL Schemas"
        content="Designing GraphQL APIs and schemas."
        file="graphql/schemas.md"
        tags={["GraphQL", "API"]}
        onCardClick={() => alert("GraphQL clicked")}
        onEdit={() => alert("Edit GraphQL")}
        onDelete={() => alert("Delete GraphQL")}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Grid layout with fixed aspect ratio cards",
      },
    },
  },
};

// Real-world example
export const RoamWebExample: Story = {
  render: () => (
    <div className="space-y-6">
      <NodeCard
        variant="elevated"
        title="Knowledge Management Systems"
        content="Exploring different approaches to personal knowledge management, including the Zettelkasten method, Building a Second Brain, and digital gardens. This comprehensive guide covers tools, workflows, and best practices for organizing and connecting ideas."
        file="knowledge/management-systems.md"
        tags={["PKM", "Zettelkasten", "Second Brain", "Knowledge"]}
        date={new Date("2024-01-10")}
        onCardClick={() => alert("Navigate to knowledge management")}
        onEdit={() => alert("Edit knowledge management")}
        onDelete={() => alert("Delete knowledge management")}
      />

      <NodeCard
        variant="accent"
        title="Roam Research vs Obsidian"
        content="A detailed comparison of two popular knowledge management tools, analyzing their features, workflows, and use cases."
        file="tools/roam-vs-obsidian.md"
        tags={["Roam Research", "Obsidian", "Comparison", "Tools"]}
        todo={"Update with latest features"}
        date={new Date("2024-01-05")}
        onCardClick={() => alert("Navigate to comparison")}
        onEdit={() => alert("Edit comparison")}
        onDelete={() => alert("Delete comparison")}
      />

      <NodeCard
        title="Daily Notes Template"
        content="A structured template for daily note-taking that includes sections for goals, reflections, and key learnings."
        file="templates/daily-notes.md"
        tags={["Templates", "Daily Notes", "Productivity"]}
        date={new Date("2024-01-20")}
        onCardClick={() => alert("Navigate to template")}
        onEdit={() => alert("Edit template")}
        onDelete={() => alert("Delete template")}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Example of how NodeCards might appear in the Roam Web application",
      },
    },
  },
};

// All variants showcase
export const AllVariants: Story = {
  render: () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <NodeCard
        variant="default"
        title="Default Variant"
        content="Standard card with subtle shadow and border."
        file="variants/default.md"
        tags={["Default"]}
        onCardClick={() => alert("Default clicked")}
      />

      <NodeCard
        variant="elevated"
        title="Elevated Variant"
        content="Enhanced shadow for more prominence."
        file="variants/elevated.md"
        tags={["Elevated"]}
        onCardClick={() => alert("Elevated clicked")}
      />

      <NodeCard
        variant="minimal"
        title="Minimal Variant"
        content="Clean design with subtle background."
        file="variants/minimal.md"
        tags={["Minimal"]}
        onCardClick={() => alert("Minimal clicked")}
      />

      <NodeCard
        variant="accent"
        title="Accent Variant"
        content="Blue gradient background for special content."
        file="variants/accent.md"
        tags={["Accent"]}
        onCardClick={() => alert("Accent clicked")}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Overview of all available NodeCard variants",
      },
    },
  },
};
