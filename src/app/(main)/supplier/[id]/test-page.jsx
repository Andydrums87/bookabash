"use client"

import { use } from 'react';
import { useSupplier } from '@/utils/mockBackend';
import { usePartyPlan } from '@/utils/partyPlanBackend'; 
import { useContextualNavigation } from '@/hooks/useContextualNavigation';

export default function TestSupplierPage({ params }) {
  console.log('Test page render start');
  
  const { id } = use(params);
  console.log('1. ID extracted:', id);
  
  const { supplier: backendSupplier, loading: supplierLoading, error } = useSupplier(id);
  console.log('2. useSupplier returned - Loading:', supplierLoading, 'Error:', error, 'Supplier:', !!backendSupplier);
  
  const { partyPlan, addSupplier, addAddon, hasAddon } = usePartyPlan();
  console.log('3. usePartyPlan returned');
  
  const { navigateWithContext, navigationContext } = useContextualNavigation();
  console.log('4. useContextualNavigation returned');
  
  console.log('5. About to render JSX');

  if (supplierLoading) {
    return <div>Loading...</div>;
  }

  if (error || !backendSupplier) {
    return <div>Error or no supplier found</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Supplier Page</h1>
      <div className="space-y-2">
        <p><strong>ID:</strong> {id}</p>
        <p><strong>Name:</strong> {backendSupplier.name}</p>
        <p><strong>Category:</strong> {backendSupplier.category}</p>
        <p><strong>Price:</strong> £{backendSupplier.priceFrom}</p>
        <p><strong>Loading:</strong> {String(supplierLoading)}</p>
      </div>
    </div>
  );
}