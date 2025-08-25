import React from 'react'
import { Link } from 'react-router-dom'
import { Layout } from '../components/Layout.simple'

export function NodeListPage() {
  return (
    <Layout>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Nodes</h1>
        <Link 
          to="/nodes/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
        >
          Create New Node
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
        <p className="text-gray-600">
          NodeListページ（シンプル版）が正常に動作しています。
        </p>
        <p className="mt-4 text-sm text-gray-500">
          APIフック無し、基本的なレイアウトのみ
        </p>
      </div>
    </Layout>
  )
}