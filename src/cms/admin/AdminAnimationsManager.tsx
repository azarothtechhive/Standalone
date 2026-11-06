// src/pages/admin/AdminAnimationsManager.tsx
import React from 'react';
import { AnimationManager } from '../../components/admin/AnimationManager';

export const AdminAnimationsManager: React.FC = () => {
  return (
    <div style={{ maxWidth: '100%', margin: '0 auto', padding: '0', overflowX: 'hidden' }}>
      <AnimationManager />
    </div>
  );
};

export default AdminAnimationsManager;


