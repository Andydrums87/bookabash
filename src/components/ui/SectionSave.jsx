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
  error = null,
  variant = 'default', // 'default' or 'airbnb'
  hideOnMobile = true // Hide on mobile by default (mobile modals have their own footer)
}) => {
  // Don't show anything if no changes and never saved
  if (!hasChanges && !lastSaved && !error) return null;

  const mobileClass = hideOnMobile ? 'hidden md:flex' : 'flex';

  // Airbnb-style footer variant
  if (variant === 'airbnb') {
    return (
      <div className={`${mobileClass} items-center justify-between pt-6 border-t border-gray-100`}>
        <div className="text-sm text-gray-500">
          {error && <span className="text-red-600">Save failed</span>}
          {!error && lastSaved && !hasChanges && (
            <span className="text-gray-500">Saved {formatLastSaved(lastSaved)}</span>
          )}
        </div>

        {(hasChanges || error) && (
          <button
            onClick={onSave}
            disabled={saving}
            className={`px-6 py-3 rounded-lg text-base font-medium transition-colors ${
              saving
                ? 'bg-gray-200 text-gray-400'
                : 'bg-gray-900 text-white hover:bg-gray-800'
            }`}
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        )}
      </div>
    );
  }

  // Default style - now uses Airbnb black style
  return (
    <div className={`${mobileClass} items-center justify-between pt-6 border-t border-gray-100`}>
      <div className="flex items-center gap-2 text-sm">
        {error && (
          <span className="flex items-center gap-1 text-red-600">
            <AlertCircle className="w-4 h-4" />
            Save failed
          </span>
        )}

        {!error && lastSaved && !hasChanges && (
          <span className="flex items-center gap-1 text-gray-500">
            <Check className="w-4 h-4" />
            Saved {formatLastSaved(lastSaved)}
          </span>
        )}

        {!error && hasChanges && (
          <span className="text-gray-500 font-medium">
            Unsaved changes
          </span>
        )}
      </div>

      {(hasChanges || error) && (
        <button
          onClick={onSave}
          disabled={saving}
          className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            saving
              ? 'bg-gray-200 text-gray-400'
              : error
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-gray-900 text-white hover:bg-gray-800'
          }`}
        >
          {saving ? 'Saving...' : error ? 'Retry' : 'Save'}
        </button>
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