// app/preview/supplier/[id]/page.js - FIXED VERSION

import { notFound } from 'next/navigation'
import SupplierPreviewPage from '@/components/supplier/supplier-preview-page'
import { getSupplierById } from '@/lib/suppliers-api'


export default async function SupplierPreview({ params }) {
    try {
      const resolvedParams = await params
      const supplier = await getSupplierById(resolvedParams.id)
      
      if (!supplier) {
        console.log('Supplier not found:', resolvedParams.id)
        notFound()
      }
  
      return (
        <SupplierPreviewPage 
          backendSupplier={supplier}
          isPreview={true}
        />
      )
    } catch (error) {
      console.error('Error loading supplier preview:', error)
      notFound()
    }
  }
  
  // Generate metadata for better email previews
  export async function generateMetadata({ params }) {
    try {
      const resolvedParams = await params
      const supplier = await getSupplierById(resolvedParams.id)
      
      if (supplier) {
        return {
          title: `${supplier.name} - Party Supplier Preview`,
          description: supplier.description || `View ${supplier.name}'s party services and packages`,
          openGraph: {
            title: supplier.name,
            description: supplier.description || `Party services by ${supplier.name}`,
            images: supplier.image ? [supplier.image] : [],
          },
        }
      }
    } catch (error) {
      console.error('Error generating metadata:', error)
    }
    
    return {
      title: 'Supplier Preview',
      description: 'Preview party supplier services'
    }
  }