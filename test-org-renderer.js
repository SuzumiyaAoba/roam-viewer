// 簡単なコードブロックのテスト
const testContent = `#+BEGIN_SRC javascript
console.log('Hello, World!');
const x = 42;
#+END_SRC

Regular paragraph text.`

console.log('Testing org-mode code block parsing:')
console.log('Input content:')
console.log(testContent)
console.log('\n--- Expected behavior ---')
console.log('Code block should be rendered as <pre><code>...</code></pre>')
console.log('Regular text should be rendered as <p>...</p>')

// テストしたい org コンテンツの例
const examples = [
  {
    name: 'Simple code block',
    content: `#+BEGIN_SRC javascript
console.log('test');
#+END_SRC`,
  },
  {
    name: 'Code block with content after',
    content: `#+BEGIN_SRC python
def hello():
    print("Hello")
#+END_SRC

This is a paragraph after the code block.`,
  },
  {
    name: 'Multiple elements',
    content: `* Header

Some text with *bold* formatting.

#+BEGIN_SRC bash
echo "Hello World"
#+END_SRC

Final paragraph.`,
  },
]

console.log('\nThese are the test cases that should work:')
examples.forEach((example, index) => {
  console.log(`\n${index + 1}. ${example.name}:`)
  console.log('---')
  console.log(example.content)
  console.log('---')
})
