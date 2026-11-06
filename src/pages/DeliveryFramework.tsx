import React from 'react';
import { Navigate } from 'react-router-dom';

export const DeliveryFramework: React.FC = () => {
  return <Navigate to="/about#delivery-framework" replace />;
};

export default DeliveryFramework;
