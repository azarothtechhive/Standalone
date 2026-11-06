import React from 'react';
import { Navigate } from 'react-router-dom';

export const Values: React.FC = () => {
  return <Navigate to="/about#our-values" replace />;
};

export default Values;
