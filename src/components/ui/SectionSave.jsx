// components/ui/SectionSave.jsx
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Check, Loader2, AlertCircle } from 'lucide-react';

// Helper function
const formatLastSaved = (timestamp) => {
  const now = new Date();
  const saved = new Date(timestamp);
  const diffSeconds = Math.floor((now - saved) / 1000);
  
  if (diffSeconds < 60) return 'just now';
  if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
  return saved.toLocaleTimeString();
};

export const SectionSave = ({ 
  sectionName, 
  hasChanges, 
  onSave, 
  saving = false,
  lastSaved = null,
  error = null 
}) => {
  // Don't show anything if no changes and never saved
  if (!hasChanges && !lastSaved && !error) return null;

  return (
    <div className="flex items-center justify-between pt-4 mt-6 border-t border-gray-200">
      <div className="flex items-center gap-2 text-sm">
        {error && (
          <span className="flex items-center gap-1 text-red-600">
            <AlertCircle className="w-4 h-4" />
            Save failed
          </span>
        )}
        
        {!error && lastSaved && !hasChanges && (
          <span className="flex items-center gap-1 text-green-600">
            <Check className="w-4 h-4" />
            Saved {formatLastSaved(lastSaved)}
          </span>
        )}
        
        {!error && hasChanges && (
          <span className="text-orange-600 font-medium">
            Unsaved changes
          </span>
        )}
      </div>
      
      {(hasChanges || error) && (
        <Button 
          onClick={onSave}
          disabled={saving}
          size="sm"
          className={error ? 
            "bg-red-600 hover:bg-red-700 text-white" : 
            "bg-orange-600 hover:bg-orange-700 text-white"
          }
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              {error ? 'Retry' : `Save ${sectionName}`}
            </>
          )}
        </Button>
      )}
    </div>
  );
};

export const useSectionSave = (currentFormData, sectionKey, updateFunction) => {
    const originalDataRef = useRef(null);
    
    // Only set original data once, on first call
    if (originalDataRef.current === null) {
      originalDataRef.current = JSON.parse(JSON.stringify(currentFormData)); // Deep copy
    }
    
    const [saving, setSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState(null);
    const [error, setError] = useState(null);
  
    const hasChanges = JSON.stringify(currentFormData) !== JSON.stringify(originalDataRef.current);
  
    console.log('useSectionSave debug:', {
      sectionKey,
      currentFormData,
      originalData: originalDataRef.current,
      hasChanges
    });
  
    const saveSection = async () => {
      setSaving(true);
      setError(null);
      
      try {
        const result = await updateFunction(sectionKey, currentFormData);
        
        if (result.success) {
          originalDataRef.current = JSON.parse(JSON.stringify(currentFormData)); // Update original after save
          setLastSaved(new Date());
        } else {
          throw new Error(result.error || 'Save failed');
        }
      } catch (err) {
        console.error('Section save failed:', err);
        setError(err.message);
      } finally {
        setSaving(false);
      }
    };
  
    const resetChanges = (newData) => {
      originalDataRef.current = JSON.parse(JSON.stringify(newData));
      setError(null);
    };
  
    return {
      hasChanges,
      saving,
      lastSaved,
      error,
      saveSection,
      resetChanges
    };
  };