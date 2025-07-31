// src/App.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import BuilderPage from './pages/BuilderPage';
import ChatPage from './pages/ChatPage';

export default function App() {
  return (
    <Routes>
      {/* Redirect “/” to “/builder” */}
      <Route path="/" element={<Navigate to="/builder" replace />} />

      {/* Your builder UI */}
      <Route path="/builder" element={<BuilderPage />} />

      {/* Shared/chat view */}
      <Route path="/agents/:agentId" element={<ChatPage />} />
    </Routes>
  );
}
