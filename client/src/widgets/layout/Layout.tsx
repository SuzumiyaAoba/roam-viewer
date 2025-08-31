import type React from "react";
import { Link } from "react-router-dom";

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function Layout({ children, title }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/nodes" className="flex items-center text-xl font-bold text-gray-900">
              <span className="text-blue-600 mr-2">🌐</span>
              Roam Web
            </Link>
            <nav className="flex space-x-4">
              <Link to="/nodes" className="text-gray-600 hover:text-gray-900">
                Nodes
              </Link>
              <Link to="/tags" className="text-gray-600 hover:text-gray-900">
                Tags
              </Link>
              <Link
                to="/nodes/new"
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
              >
                Create
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full">
        {title && (
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          </div>
        )}
        {children}
      </main>

      <footer className="bg-white border-t">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <p className="text-sm text-gray-500 text-center">© 2024 Roam Web. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
