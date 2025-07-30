"use client"
import { useParams } from 'next/navigation';

export default function TestRegistryPage() {
  const params = useParams();
  
  return (
    <div className="p-8">
      <h1>Test Registry Page</h1>
      <p>Registry ID: {params.registryId || 'NOT FOUND'}</p>
      <p>All params: {JSON.stringify(params)}</p>
    </div>
  );
}