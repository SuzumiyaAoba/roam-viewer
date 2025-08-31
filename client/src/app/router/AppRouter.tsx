import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { NodeListPage } from '../../pages/node-list'
import { NodeDetailPage } from '../../pages/node-detail'
import { NodeFormPage, NodeEditPage } from '../../pages/node-form'
import { TagListPage } from '../../pages/tag-list'
import { TagDetailPage } from '../../pages/tag-detail'

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/nodes" replace />} />
      <Route path="/nodes" element={<NodeListPage />} />
      <Route path="/nodes/new" element={<NodeFormPage />} />
      <Route path="/nodes/:id" element={<NodeDetailPage />} />
      <Route path="/nodes/:id/edit" element={<NodeEditPage />} />
      <Route path="/tags" element={<TagListPage />} />
      <Route path="/tags/:tag" element={<TagDetailPage />} />
      <Route path="*" element={<Navigate to="/nodes" replace />} />
    </Routes>
  )
}