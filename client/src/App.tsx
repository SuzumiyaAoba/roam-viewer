import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { NodeListPage } from './pages/NodeList.simple'
// import { NodeDetailPage } from './pages/NodeDetail'
// import { NodeCreatePage, NodeEditPage } from './pages/NodeForm'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/nodes" replace />} />
      <Route path="/nodes" element={<NodeListPage />} />
      {/* <Route path="/nodes/new" element={<NodeCreatePage />} />
      <Route path="/nodes/:id" element={<NodeDetailPage />} />
      <Route path="/nodes/:id/edit" element={<NodeEditPage />} /> */}
      <Route path="*" element={<Navigate to="/nodes" replace />} />
    </Routes>
  )
}

export default App