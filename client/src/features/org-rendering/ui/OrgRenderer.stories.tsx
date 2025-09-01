import type { Meta, StoryObj } from "@storybook/react";
import { OrgRenderer } from "./OrgRenderer";

const meta: Meta<typeof OrgRenderer> = {
  title: "Components/OrgRenderer",
  component: OrgRenderer,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A component for rendering Org-mode content using uniorg. Supports headers, lists, links, code blocks, tables, and more with consistent styling.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    content: {
      control: "text",
      description: "The org-mode content to render",
    },
    className: {
      control: "text",
      description: "Additional CSS classes",
    },
    enableSyntaxHighlight: {
      control: "boolean",
      description: "Whether to enable syntax highlighting for code blocks",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Sample org content for stories
const basicOrgContent = `* Introduction
This is a basic Org-mode document with various elements.

** Subsection
Here's a subsection with some /italic/ and *bold* text.

*** Sub-subsection
- First item
- Second item
- Third item
  - Nested item
  - Another nested item

Some regular paragraph text with a [[https://orgmode.org][link to Org-mode]].`;

const codeBlockContent = `* Code Examples with Shiki Syntax Highlighting

Here's some inline =code= in a paragraph.

** JavaScript Example
#+BEGIN_SRC javascript
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// ES6 arrow function version
const fibonacciArrow = (n) => n <= 1 ? n : fibonacciArrow(n - 1) + fibonacciArrow(n - 2);

console.log(fibonacci(10));
#+END_SRC

** TypeScript Example
#+BEGIN_SRC typescript
interface User {
  id: number;
  name: string;
  email?: string;
}

class UserService {
  private users: User[] = [];

  addUser(user: User): void {
    this.users.push(user);
  }

  findUser(id: number): User | undefined {
    return this.users.find(user => user.id === id);
  }
}

const userService = new UserService();
userService.addUser({ id: 1, name: "Alice", email: "alice@example.com" });
#+END_SRC

** Python Example
#+BEGIN_SRC python
def quicksort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quicksort(left) + middle + quicksort(right)

# List comprehension example
numbers = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5]
sorted_numbers = quicksort(numbers)
print(f"Original: {numbers}")
print(f"Sorted: {sorted_numbers}")
#+END_SRC

** Timestamp Examples
Meeting from <2025-08-30 Fri 09:00> to <2025-08-30 Fri 17:00>

Conference call: <2025-01-15 Wed 14:30>--<2025-01-15 Wed 16:00>

Simple date: <2025-02-01 Sat>

Inactive timestamp: [2025-03-01 Sun 10:00]

Multi-day event: <2025-04-01 Mon>--<2025-04-03 Wed>

** Go Example
#+BEGIN_SRC go
package main

import (
    "fmt"
    "sort"
)

type Person struct {
    Name string
    Age  int
}

func main() {
    people := []Person{
        {"Alice", 25},
        {"Bob", 30},
        {"Charlie", 20},
    }

    sort.Slice(people, func(i, j int) bool {
        return people[i].Age < people[j].Age
    })

    for _, person := range people {
        fmt.Printf("%s is %d years old\n", person.Name, person.Age)
    }
}
#+END_SRC

** Rust Example  
#+BEGIN_SRC rust
use std::collections::HashMap;

#[derive(Debug)]
struct Book {
    title: String,
    author: String,
    year: u16,
}

fn main() {
    let mut library: HashMap<String, Book> = HashMap::new();
    
    let book = Book {
        title: "The Rust Programming Language".to_string(),
        author: "Steve Klabnik and Carol Nichols".to_string(),
        year: 2018,
    };
    
    library.insert("rust_book".to_string(), book);
    
    match library.get("rust_book") {
        Some(book) => println!("{:?}", book),
        None => println!("Book not found"),
    }
}
#+END_SRC

** JSON Example
#+BEGIN_SRC json
{
  "name": "my-project",
  "version": "1.0.0",
  "dependencies": {
    "react": "^18.0.0",
    "typescript": "^4.9.0",
    "shiki": "^0.12.0"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test"
  },
  "eslintConfig": {
    "extends": [
      "react-app"
    ]
  }
}
#+END_SRC

** Shell Script Example
#+BEGIN_SRC bash
#!/bin/bash

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Install dependencies based on OS
install_deps() {
    if command_exists apt-get; then
        sudo apt-get update && sudo apt-get install -y git curl
    elif command_exists brew; then
        brew install git curl
    else
        echo "Package manager not found"
        exit 1
    fi
}

echo "Installing dependencies..."
install_deps
echo "Done!"
#+END_SRC`;

const tableContent = `* Data Tables

Here's a sample table with data:

| Name     | Age | City        | Country |
|----------|-----|-------------|---------|
| Alice    |  25 | New York    | USA     |
| Bob      |  30 | London      | UK      |
| Charlie  |  35 | Tokyo       | Japan   |
| Diana    |  28 | Sydney      | Australia |

** Summary
The table above shows information about four individuals from different countries.`;

const listAndTaskContent = `* Task Management

** TODO Items
- TODO Learn Org-mode
- DONE Set up development environment
- TODO Write documentation
  - TODO Create user guide
  - DONE Set up repository

** Shopping List
1. Groceries
   - Milk
   - Bread
   - Eggs
2. Hardware store
   - Screws
   - Paint
3. Pharmacy
   - Medicine
   - Vitamins

** Priorities
- [#A] High priority task
- [#B] Medium priority task  
- [#C] Low priority task`;

const quotesAndNotesContent = `* Quotes and Notes

#+BEGIN_QUOTE
"The best way to predict the future is to create it."
— Peter Drucker
#+END_QUOTE

** Important Notes
#+BEGIN_EXAMPLE
This is an example block that preserves
formatting and spacing exactly as written.

  Even indentation is preserved.
#+END_EXAMPLE

** Code Documentation
The =OrgRenderer= component supports:
- Headers (up to 6 levels)
- *Bold* and /italic/ text
- =Code= spans and blocks
- Links: [[https://example.com][Example]]
- Lists (ordered and unordered)
- Tables with proper formatting`;

const mathAndSymbolsContent = `* Mathematical Content

** Equations
The quadratic formula: $x = \frac{-b pm sqrt{b^2 - 4ac}}{2a}$

** Greek Letters
α (alpha), β (beta), γ (gamma), δ (delta)
Δ (Delta), Σ (Sigma), π (pi), λ (lambda)

** Symbols
→ (arrow), ∞ (infinity), ≤ (less than or equal)
∀ (for all), ∃ (exists), ∈ (element of)

** Special Characters
em-dash: —
en-dash: –
Ellipsis: …
Copyright: ©
Trademark: ™`;

export const Default: Story = {
  args: {
    content: basicOrgContent,
  },
};

export const CodeBlocks: Story = {
  args: {
    content: codeBlockContent,
    enableSyntaxHighlight: true,
  },
};

export const Tables: Story = {
  args: {
    content: tableContent,
  },
};

export const ListsAndTasks: Story = {
  args: {
    content: listAndTaskContent,
  },
};

export const QuotesAndNotes: Story = {
  args: {
    content: quotesAndNotesContent,
  },
};

export const MathAndSymbols: Story = {
  args: {
    content: mathAndSymbolsContent,
  },
};

export const NoSyntaxHighlighting: Story = {
  args: {
    content: codeBlockContent,
    enableSyntaxHighlight: false,
  },
};

export const CustomStyling: Story = {
  args: {
    content: basicOrgContent,
    className: "bg-gray-50 p-6 rounded-lg border",
  },
};

export const MinimalContent: Story = {
  args: {
    content: `* Simple Header
Just a simple paragraph with some text.`,
  },
};

const todoLabelsContent = `* TODO プロジェクトの企画書を作成
新しいプロジェクトの企画書を作成する必要があります。

* DONE 要件定義書のレビュー
要件定義書のレビューが完了しました。✓

* DOING APIの実装
現在進行中のAPIの実装作業です。

** TODO データベース設計
** DONE 認証機能の実装

* NEXT テストケースの作成
次に取り組む予定のタスクです。

* WAITING クライアントからの承認待ち
クライアントからの最終承認を待っています。

* CANCELLED 不要な機能の実装
この機能は不要になったためキャンセルしました。

** Subtasks with different states
** TODO サブタスク1
** DONE 完了したサブタスク
** DOING 進行中のサブタスク

通常のテキスト。ここにある TODO は単なる文字列です。`;

export const TodoLabels: Story = {
  args: {
    content: todoLabelsContent,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Demonstrates TODO keyword labels with different states: TODO (orange), DONE (green), DOING (blue), NEXT (purple), WAITING (yellow), and CANCELLED (gray). The labels are styled as small badges next to the headers.",
      },
    },
  },
};

export const ErrorHandling: Story = {
  render: () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Error Handling Example</h3>
      <p className="text-gray-600">
        This demonstrates how the component handles malformed or problematic content:
      </p>
      <OrgRenderer content="" />
      <p className="text-sm text-gray-500 mt-2">
        Empty content is handled gracefully without errors.
      </p>
    </div>
  ),
};

// Comprehensive example showcasing all features
export const ComprehensiveExample: Story = {
  args: {
    content: `#+TITLE: Comprehensive Org-mode Example
#+AUTHOR: Demo User
#+DATE: 2024-01-15

* Introduction
This document demonstrates various Org-mode features supported by the OrgRenderer component.

** Text Formatting
You can use *bold*, /italic/, _underlined_, and =code= text formatting.
You can also use +strikethrough+ text when needed.

** Links
- External link: [[https://orgmode.org][Org-mode official site]]
- Internal link: [[#section-2][Jump to Section 2]]
- Email: [[mailto:user@example.com][Contact us]]

** Lists
*** Unordered Lists
- First item
- Second item
  - Nested item A
  - Nested item B
    - Deep nested item
- Third item

*** Ordered Lists
1. First step
2. Second step
   1. Sub-step A
   2. Sub-step B
3. Third step

*** Mixed Lists
1. Numbered item
   - Bulleted sub-item
   - Another bulleted sub-item
2. Another numbered item

** Code Examples
Inline code: =console.log('Hello, World!')=

Block code:
#+BEGIN_SRC javascript
// JavaScript function example
function greet(name) {
  return \`Hello, \${name}!\`;
}

const message = greet('World');
console.log(message);
#+END_SRC

** Tables
| Feature    | Supported | Notes                |
|------------|-----------|----------------------|
| Headers    | ✓         | Up to 6 levels       |
| Lists      | ✓         | Ordered & unordered  |
| Code       | ✓         | Inline & blocks      |
| Tables     | ✓         | With proper styling  |
| Links      | ✓         | External & internal  |
| Formatting | ✓         | Bold, italic, etc.   |

** Quotes
#+BEGIN_QUOTE
"Org mode is for keeping notes, maintaining TODO lists, planning projects,
and authoring documents with a fast and effective plain-text system."
— Org-mode documentation
#+END_QUOTE

** Notes and Examples
#+BEGIN_EXAMPLE
This is an example block.
It preserves formatting exactly.

  Including indentation.
#+END_EXAMPLE

** TODO Items
- TODO Complete documentation
- DONE Set up the component
- TODO Add more features
- DONE Write tests

---

This concludes the comprehensive example of Org-mode rendering capabilities.`,
  },
};

// Comparison with Markdown
export const ComparisonExample: Story = {
  render: () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Org-mode</h3>
        <OrgRenderer
          content={`* Header Level 1
** Header Level 2

Some text with *bold* and /italic/ formatting.

- Unordered list
  - Nested item
- Another item

| Table | Column |
|-------|--------|
| Cell  | Data   |

#+BEGIN_SRC javascript
console.log('Code block');
#+END_SRC`}
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Similar in Markdown</h3>
        <div className="prose max-w-none">
          <div className="font-mono text-sm bg-gray-100 p-4 rounded">
            {`# Header Level 1
## Header Level 2

Some text with **bold** and *italic* formatting.

- Unordered list
  - Nested item
- Another item

| Table | Column |
|-------|--------|
| Cell  | Data   |

\`\`\`javascript
console.log('Code block');
\`\`\``}
          </div>
        </div>
      </div>
    </div>
  ),
};


// Timestamp-focused story
const timestampContent = `* Meeting Schedule
SCHEDULED: <2025-08-30 Fri 09:00>--<2025-08-30 Fri 17:00>
DEADLINE: <2025-09-01 Sun>

** DEADLINE Examples (End-of-Day Handling)
*** Task with date-only deadline (treated as 23:59)
DEADLINE: <2024-12-25 Wed>

*** Task with specific deadline time
DEADLINE: <2024-12-25 Wed 15:30>

** Today's Events
- Morning standup: <2025-01-15 Wed 09:00>--<2025-01-15 Wed 09:30>
- Client meeting from <2025-01-15 Wed 14:00> to <2025-01-15 Wed 15:30>
- Planning session: <2025-01-15 Wed 16:00>--<2025-01-15 Wed 17:00>

** Upcoming Deadlines
- Project proposal due: <2025-01-20 Mon>
- Design review: [2025-01-25 Sat 10:00]
- Launch date: <2025-02-01 Thu>--<2025-02-03 Sat>

** Notes  
Remember to check the calendar for any conflicts with <2025-01-16 Thu 14:00> meeting.

Inactive reminder: [2025-01-18 Sat] - Weekend work session (optional)
`;

export const TimestampStyling = {
  args: {
    content: timestampContent,
    enableSyntaxHighlight: false,
  },
};
