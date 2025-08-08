// NEW: Save & Complete Step Component
function SaveCompleteStep({ inviteData, generatedImage, onComplete }) {
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [inviteId, setInviteId] = useState(null)
  
    const handleSave = async () => {
      setSaving(true)
      try {
        // Save the invite and get the invite ID
        const result = await saveInviteToPartyPlan({
          inviteData,
          generatedImage,
          // ... other data
        })
  
        if (result.success) {
          setSaved(true)
          setInviteId(result.inviteId)
          
          // Call completion callback
          onComplete?.(result)
        }
      } catch (error) {
        console.error('Save failed:', error)
      } finally {
        setSaving(false)
      }
    }
  
    return (
      <div className="max-w-2xl mx-auto text-center">
        {!saved ? (
          // Save State
          <div className="space-y-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Invitation Ready!</h2>
              <p className="text-gray-600">Your beautiful invitation has been created and is ready to share.</p>
            </div>
  
            {/* Preview */}
            <div className="aspect-[3/4] max-w-sm mx-auto bg-gray-100 rounded-xl overflow-hidden">
              <img src={generatedImage} alt="Your invitation" className="w-full h-full object-cover" />
            </div>
  
            <Button 
              onClick={handleSave}
              disabled={saving}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-3"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving Invitation...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save & Continue to Sharing
                </>
              )}
            </Button>
          </div>
        ) : (
          // Success State  
          <div className="space-y-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <Sparkles className="w-10 h-10 text-green-600" />
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">🎉 All Set!</h2>
              <p className="text-gray-600 mb-6">Your invitation has been saved successfully. Now let's get it to your guests!</p>
            </div>
  
            <div className="space-y-3">
              <Button 
                asChild
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3"
              >
                <Link href={`/e-invites/${inviteId}/manage`}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Manage & Share Invitation
                </Link>
              </Button>
              
              <Button 
                asChild
                variant="outline"
                className="w-full"
              >
                <Link href="/dashboard">
                  <Home className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
            </div>
  
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-700">
                💡 <strong>Next steps:</strong> Add guests, send invitations, and track RSVPs from the management page.
              </p>
            </div>
          </div>
        )}
      </div>
    )
  }