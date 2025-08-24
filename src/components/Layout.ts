export function Layout(title: string, content: string): string {
  return `
    <!DOCTYPE html>
    <html lang="ja">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title} - Roam Web</title>
      <link href="/static/styles.css" rel="stylesheet">
      <script src="https://unpkg.com/htmx.org@1.9.6"></script>
    </head>
    <body class="bg-gray-100 min-h-screen">
      <nav class="bg-white shadow-sm border-b">
        <div class="container mx-auto px-4 py-3">
          <div class="flex items-center justify-between">
            <h1 class="text-xl font-bold text-gray-800">
              <a href="/" class="hover:text-blue-600">Roam Web</a>
            </h1>
            <div class="flex space-x-4">
              <a href="/nodes" class="text-gray-600 hover:text-blue-600 font-medium">Nodes</a>
              <a href="/nodes/new" class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                New Node
              </a>
            </div>
          </div>
        </div>
      </nav>
      <main class="container mx-auto px-4 py-8">
        ${content}
      </main>
    </body>
    </html>
  `
}