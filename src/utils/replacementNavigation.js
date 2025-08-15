// 7. Update your navigation helper to include timestamp:
export const setReplacementContext = (replacement, showUpgrade = false) => {
    const context = {
      replacementId: replacement.id,
      oldSupplierName: replacement.oldSupplier.name,
      newSupplierName: replacement.newSupplier.name,
      supplierName: replacement.newSupplier.name,
      isReplacement: true,
      category: replacement.category,
      returnUrl: '/dashboard',
      showUpgrade: showUpgrade,
      timestamp: new Date().toISOString() // ✅ Add timestamp
    }
    
    console.log('📦 Setting replacement context:', context)
    sessionStorage.setItem('replacementContext', JSON.stringify(context))
    
    return context
  }
  export const getReplacementContext = () => {
    try {
      const stored = sessionStorage.getItem('replacementContext')
      if (stored) {
        const context = JSON.parse(stored)
        console.log('📖 Retrieved replacement context:', context)
        return context
      }
    } catch (error) {
      console.error('❌ Error retrieving replacement context:', error)
    }
    return null
  }
  
  export const clearReplacementContext = () => {
    console.log('🧹 Clearing replacement context')
    sessionStorage.removeItem('replacementContext')
    sessionStorage.removeItem('shouldRestoreReplacementModal')
    sessionStorage.removeItem('modalShowUpgrade')
  }
  
  export const navigateToSupplierWithReplacement = (router, supplierId, replacement, showUpgrade = false) => {
    // Set the context before navigation
    setReplacementContext(replacement, showUpgrade)
    
    // Navigate with replacement flag
    const url = `/suppliers/${supplierId}?from=replacement`
    console.log('🚀 Navigating to supplier with replacement context:', url)
    
    router.push(url)
  }
  
  export const prepareModalRestore = (showUpgrade = false) => {
    console.log('🔄 Preparing modal restore with showUpgrade:', showUpgrade)
    sessionStorage.setItem('shouldRestoreReplacementModal', 'true')
    
    if (showUpgrade) {
      sessionStorage.setItem('modalShowUpgrade', 'true')
    }
  }
  
  // Update your MobileAutoReplacementFlow to use this helper:
  
  // In your handleViewSupplier function:
  const handleViewSupplier = (e) => {
    e.preventDefault()
    e.stopPropagation()
    console.log('👀 View supplier clicked:', replacement.newSupplier.id)
    
    // Use the helper function instead of manual context setting
    navigateToSupplierWithReplacement(
      router, // You'll need to pass router to this component
      replacement.newSupplier.id,
      replacement,
      showUpgrade // Pass current upgrade state
    )
    
    // Call the parent's view supplier function
    onViewSupplier?.(replacement.newSupplier.id)
  }