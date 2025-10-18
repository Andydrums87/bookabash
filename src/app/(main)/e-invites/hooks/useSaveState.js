// hooks/useSaveState.js

import { useState, useEffect } from 'react'
import { AlertCircle, Check, Send } from 'lucide-react'
import { getCurrentState, checkForUnsavedChanges, generateInviteId, copyToClipboard, formatThemeDisplayName } from '../utils/helperFunctions'
import { SAVE_BUTTON_STATES } from '../constants/inviteConstants'
import { urlGenerator } from '@/utils/urlGenerator'

export const useSaveState = (selectedTheme, inviteData, guestList, generatedImage, useAIGeneration, themes) => {
  const [isSaved, setIsSaved] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [lastSavedState, setLastSavedState] = useState(null)
  const [shareableLink, setShareableLink] = useState("")
  const [isSaving, setIsSaving] = useState(false) // Add loading state
  const [saveSuccess, setSaveSuccess] = useState(false) // Add success state


  // Update unsaved changes status
  useEffect(() => {
    const currentState = getCurrentState(selectedTheme, inviteData, guestList, generatedImage, useAIGeneration)
    const hasChanges = checkForUnsavedChanges(lastSavedState, currentState)
    setHasUnsavedChanges(hasChanges)
    if (hasChanges && isSaved) {
      setIsSaved(false)
    }
  }, [selectedTheme, inviteData, guestList, generatedImage, lastSavedState, useAIGeneration])

  // Generate shareable link
  const generateShareableLink = async () => {
    console.log("🔍 generateShareableLink called")
    const inviteId = generateInviteId()
    const link = `${window.location.origin}/e-invites/${inviteId}`
    console.log("🔗 Generated link:", link)
    console.log("🌐 Window location origin:", window.location.origin)
    setShareableLink(link)

    try {
      // Import the database backend
      const { partyDatabaseBackend } = await import("@/utils/partyDatabaseBackend")
      
      // Get current party ID
      const partyResult = await partyDatabaseBackend.getCurrentParty()
      
      if (partyResult.success && partyResult.party) {
        // Create public invite record in database
        const publicInviteResult = await partyDatabaseBackend.createPublicInvite({
          inviteId,
          partyId: partyResult.party.id,
          theme: selectedTheme,
          inviteData: inviteData,
          generatedImage: generatedImage,
          generationType: useAIGeneration ? "ai" : "template",
          shareableLink: link,
        })

        if (publicInviteResult.success) {
          console.log("✅ Public invite saved to database")
        } else {
          console.error("❌ Database save failed, using localStorage")
          // Fallback to localStorage
          const publicInvite = {
            id: inviteId,
            theme: selectedTheme,
            inviteData,
            generatedImage,
            generationType: useAIGeneration ? "ai" : "template",
            createdAt: new Date().toISOString(),
          }
          localStorage.setItem(`public_invite_${inviteId}`, JSON.stringify(publicInvite))
        }
      }
    } catch (error) {
      console.error("❌ Error:", error)
      // Fallback to localStorage
      const publicInvite = {
        id: inviteId,
        theme: selectedTheme,
        inviteData,
        generatedImage,
        generationType: useAIGeneration ? "ai" : "template",
        createdAt: new Date().toISOString(),
      }
      localStorage.setItem(`public_invite_${inviteId}`, JSON.stringify(publicInvite))
    }

    return link
  }

  // Copy shareable link
  const copyShareableLink = async () => {
    const link = await generateShareableLink() 
    const success = await copyToClipboard(link)
    if (success) {
      alert("Invite link copied to clipboard!")
    }
  }

// Update your useSaveState.js hook - replace the saveInviteToPartyPlan function

// Update your useSaveState.js hook - replace the saveInviteToPartyPlan function

// Updated save function with loading states
const saveInviteToPartyPlan = async (finalImageUrl = null, selectedAiOption = null) => {
  // Start loading
  setIsSaving(true);
  setSaveSuccess(false);
  
  console.log("💾 Starting save process...");
  console.log("📊 AI Option:", selectedAiOption);
  console.log("📝 Invite Data:", inviteData);
  
  const imageToSave = finalImageUrl || selectedAiOption?.imageUrl || generatedImage;
  
  if (!imageToSave) {
    setIsSaving(false);
    console.error("❌ No invite image available");
    alert("Please wait for the invite to generate before saving.");
    return false;
  }

  // For AI generation, we need the AI option
  if (useAIGeneration && !selectedAiOption) {
    setIsSaving(false);
    console.error("❌ No AI option selected");
    alert("Please select an AI option before saving.");
    return false;
  }

  try {
    const { partyDatabaseBackend } = await import("@/utils/partyDatabaseBackend");
    console.log("🔍 Getting current party...");
    const partyResult = await partyDatabaseBackend.getCurrentParty();

    if (!partyResult.success || !partyResult.party) {
      setIsSaving(false);
      console.error("❌ Failed to get current party:", partyResult.error);
      alert("No active party found. Please create a party first from the Party Builder.");
      return false;
    }

    const party = partyResult.party;
    console.log("✅ Found party:", party.id, "-", party.child_name);

    // Generate invite ID (for internal use)
    const inviteId = generateInviteId();

    // Generate user-friendly slug from child name and party date
    const partyData = {
      childName: party.child_name || inviteData.childName,
      child_name: party.child_name,
      date: party.party_date || inviteData.date,
      party_date: party.party_date
    };

    let inviteSlug = urlGenerator.createInviteSlug(partyData, inviteId);
    console.log("🔗 Generated base slug:", inviteSlug);

    // Check if slug already exists and make it unique if needed
    let slugExists = await partyDatabaseBackend.checkInviteSlugExists(inviteSlug);
    let counter = 2;
    while (slugExists) {
      inviteSlug = `${urlGenerator.createInviteSlug(partyData, inviteId)}-${counter}`;
      console.log(`🔗 Slug exists, trying: ${inviteSlug}`);
      slugExists = await partyDatabaseBackend.checkInviteSlugExists(inviteSlug);
      counter++;
    }

    const generatedShareableLink = `${window.location.origin}/e-invites/${inviteSlug}`;

    console.log("🔗 Final invite ID (internal):", inviteId);
    console.log("🔗 Final invite slug (URL):", inviteSlug);
    console.log("🔗 Generated shareable link:", generatedShareableLink);

    // Prepare the data for your existing saveEInvites function
    const einviteData = {
      inviteId: inviteId,
      inviteSlug: inviteSlug, // Add the friendly slug
      theme: useAIGeneration ? "ai_generated" : selectedTheme,
      inviteData: inviteData,
      guestList: guestList,
      image: imageToSave,
      generatedImage: imageToSave,
      generationType: useAIGeneration ? "ai" : "template",
      shareableLink: generatedShareableLink,
      // Include AI option data if available
      ...(selectedAiOption && {
        aiOption: {
          id: selectedAiOption.id,
          index: selectedAiOption.index,
          imageUrl: selectedAiOption.imageUrl
        }
      })
    };

    console.log("📤 Calling saveEInvites with data:", einviteData);

    // 1. Save to party_plan first
    const saveResult = await partyDatabaseBackend.saveEInvites(party.id, einviteData);

    if (!saveResult.success) {
      setIsSaving(false);
      console.error("❌ Failed to save to party plan:", saveResult.error);
      alert(`Failed to save e-invite to party plan.\n\nError: ${saveResult.error}`);
      return false;
    }

    console.log("✅ E-invite saved to party plan successfully!");

    // 2. ALWAYS create public invite record for shareable links
    console.log("📤 Creating public invite record...");

    const publicInviteResult = await partyDatabaseBackend.createPublicInvite({
      inviteId: inviteId,
      inviteSlug: inviteSlug, // Add the friendly slug
      partyId: party.id,
      theme: useAIGeneration ? "ai_generated" : selectedTheme,
      inviteData: inviteData,
      generatedImage: imageToSave,
      generationType: useAIGeneration ? "ai" : "template",
      shareableLink: generatedShareableLink
    });

    if (publicInviteResult.success) {
      console.log("✅ Public invite created successfully!");
      console.log("🔗 Shareable link active:", generatedShareableLink);
    } else {
      console.error("⚠️ Failed to create public invite:", publicInviteResult.error);
      // Don't fail the whole save, but note it
    }

    // Update state
    setIsSaved(true);
    setHasUnsavedChanges(false);
    setLastSavedState(getCurrentState(selectedTheme, inviteData, guestList, generatedImage, useAIGeneration));
    setShareableLink(generatedShareableLink);
    
    // Stop loading and show success
    setIsSaving(false);
    setSaveSuccess(true);

    // Return success data instead of showing alert here
    return {
      success: true,
      party: party,
      inviteId: inviteId,
      inviteSlug: inviteSlug, // Return the slug for navigation
      shareableLink: generatedShareableLink
    };

  } catch (error) {
    setIsSaving(false);
    console.error("❌ Error saving invite:", error);
    alert(`Error saving e-invite: ${error.message}`);
    return false;
  }
};

  // Get save button state
 
  // Update save button state to include loading
  const getSaveButtonState = () => {
    if (isSaving) {
      return {
        disabled: true,
        className: "bg-blue-500 cursor-not-allowed",
        text: "Saving...",
        icon: <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>,
      };
    }

    if (!generatedImage) {
      return {
        disabled: true,
        className: "bg-gray-400",
        text: "Generating...",
        icon: <AlertCircle className="w-4 h-4 mr-2" />,
      };
    }

    if (isSaved && !hasUnsavedChanges) {
      return {
        disabled: false,
        className: "bg-green-600 hover:bg-green-700",
        text: "Saved to Dashboard",
        icon: <Check className="w-4 h-4 mr-2" />,
      };
    }

    if (hasUnsavedChanges) {
      return {
        disabled: false,
        className: "bg-orange-600 hover:bg-orange-700",
        text: "Save Changes",
        icon: <AlertCircle className="w-4 h-4 mr-2" />,
      };
    }

    return {
      disabled: false,
      className: "bg-blue-600 hover:bg-blue-700",
      text: "Save to Dashboard",
      icon: <Send className="w-4 h-4 mr-2" />,
    };
  };


  return {
    isSaved,
    setIsSaved,
    hasUnsavedChanges,
    lastSavedState,
    setLastSavedState,
    shareableLink,
    setShareableLink,
    isSaving, // Export loading state
    saveSuccess, // Export success state
    setSaveSuccess, // Export success setter
    generateShareableLink,
    copyShareableLink,
    saveInviteToPartyPlan,
    getSaveButtonState,
  }
}