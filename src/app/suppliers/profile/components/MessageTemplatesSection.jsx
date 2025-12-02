"use client"

import { useState, useEffect, useRef } from "react"
import { X, Plus, ChevronRight, MessageSquare, Check, Loader2, Trash2, Edit2 } from "lucide-react"
import { supabase } from "@/lib/supabase"

// Default confirmation message template
const DEFAULT_CONFIRMATION_TEMPLATE = `Hi {customer_name},

Great news! I'm delighted to confirm your booking for {child_name}'s party on {event_date}.

I'm looking forward to making it a special celebration!

Best regards,
{business_name}`

export default function MessageTemplatesSection({ supplier, currentBusiness }) {
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState(null)

  useEffect(() => {
    if (supplier?.id) {
      loadTemplates()
    }
  }, [supplier?.id, currentBusiness?.id])

  const loadTemplates = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('supplier_message_templates')
        .select('*')
        .eq('supplier_id', supplier.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) throw error

      // If no templates exist, we'll show the option to create one
      setTemplates(data || [])
    } catch (error) {
      console.error('Error loading templates:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTemplate = () => {
    setEditingTemplate(null)
    setShowCreateModal(true)
  }

  const handleEditTemplate = (template) => {
    setEditingTemplate(template)
    setShowCreateModal(true)
  }

  const handleCloseModal = () => {
    setShowCreateModal(false)
    setEditingTemplate(null)
  }

  const handleSaveComplete = () => {
    loadTemplates()
    handleCloseModal()
  }

  // Get templates for current business
  const businessTemplates = templates.filter(
    t => !t.business_id || t.business_id === currentBusiness?.id
  )

  const defaultTemplate = businessTemplates.find(t => t.is_default && t.template_type === 'acceptance')

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-6 w-48 bg-gray-200 rounded mb-4" />
          <div className="h-24 bg-gray-100 rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-gray-500 text-sm">
          Create message templates to quickly respond to booking enquiries
        </p>
      </div>

      {/* Template cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Default template card */}
          {defaultTemplate ? (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="w-4 h-4 text-primary-500" />
                  <span className="text-xs font-medium text-primary-500">Default</span>
                </div>
                <p className="font-semibold text-gray-900 text-sm mb-1 truncate">{defaultTemplate.template_name}</p>
                <p className="text-xs text-gray-500 line-clamp-2">
                  {defaultTemplate.message_template}
                </p>
              </div>
              <button
                onClick={() => handleEditTemplate(defaultTemplate)}
                className="w-full px-4 py-2.5 border-t border-gray-100 text-center text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors"
              >
                Edit template
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden border-dashed">
              <div className="p-4">
                <p className="text-xs text-gray-500 mb-3">
                  Create a reusable confirmation message
                </p>
                <button
                  onClick={handleCreateTemplate}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Create
                </button>
              </div>
            </div>
          )}

          {/* Other template cards */}
          {businessTemplates
            .filter(t => !t.is_default || t.template_type !== 'acceptance')
            .map(template => (
              <div
                key={template.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="w-4 h-4 text-gray-400" />
                    <span className="text-xs font-medium text-gray-400">Template</span>
                  </div>
                  <p className="font-semibold text-gray-900 text-sm mb-1 truncate">{template.template_name}</p>
                  <p className="text-xs text-gray-500 line-clamp-2">
                    {template.message_template}
                  </p>
                </div>
                <button
                  onClick={() => handleEditTemplate(template)}
                  className="w-full px-4 py-2.5 border-t border-gray-100 text-center text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors"
                >
                  Edit template
                </button>
              </div>
            ))}
      </div>

      {/* Add another template button */}
      {businessTemplates.length > 0 && (
        <button
          onClick={handleCreateTemplate}
          className="flex items-center gap-2 text-gray-900 font-medium hover:underline"
        >
          <Plus className="w-4 h-4" />
          Add another template
        </button>
      )}

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <TemplateModal
          template={editingTemplate}
          supplier={supplier}
          currentBusiness={currentBusiness}
          onClose={handleCloseModal}
          onSave={handleSaveComplete}
        />
      )}
    </div>
  )
}

// Airbnb-style modal for creating/editing templates
function TemplateModal({ template, supplier, currentBusiness, onClose, onSave }) {
  const [name, setName] = useState(template?.template_name || '')
  const [message, setMessage] = useState(template?.message_template || '')
  const [isDefault, setIsDefault] = useState(template?.is_default ?? true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const textareaRef = useRef(null)
  const cursorPositionRef = useRef(null)

  const isEditing = !!template

  const shortcodes = [
    { code: '{customer_name}', label: 'Customer name' },
    { code: '{child_name}', label: 'Child name' },
    { code: '{event_date}', label: 'Event date' },
    { code: '{event_time}', label: 'Event time' },
    { code: '{business_name}', label: 'Your business name' },
    { code: '{package_name}', label: 'Package name' },
    { code: '{total_price}', label: 'Total price' },
  ]

  const handleTextareaBlur = () => {
    const textarea = textareaRef.current
    if (textarea) {
      cursorPositionRef.current = {
        start: textarea.selectionStart,
        end: textarea.selectionEnd
      }
    }
  }

  const insertShortcode = (code) => {
    const textarea = textareaRef.current
    // Use saved cursor position, or append to end if no position saved
    const position = cursorPositionRef.current || { start: message.length, end: message.length }
    const start = position.start
    const end = position.end

    const newMessage = message.substring(0, start) + code + message.substring(end)
    setMessage(newMessage)

    // Update cursor position ref and focus textarea
    const newCursorPos = start + code.length
    cursorPositionRef.current = { start: newCursorPos, end: newCursorPos }

    setTimeout(() => {
      if (textarea) {
        textarea.focus()
        textarea.setSelectionRange(newCursorPos, newCursorPos)
      }
    }, 0)
  }

  const handleSave = async () => {
    if (!name.trim() || !message.trim()) return

    try {
      setSaving(true)

      // For business_id, only set it if it's different from supplier.id (multi-business scenario)
      const businessId = currentBusiness?.id && currentBusiness.id !== supplier.id
        ? currentBusiness.id
        : null

      const templateData = {
        supplier_id: supplier.id,
        business_id: businessId,
        supplier_category: currentBusiness?.serviceType || currentBusiness?.category || supplier?.category || 'general',
        template_type: 'acceptance',
        template_name: name.trim(),
        message_template: message.trim(),
        is_default: isDefault,
        is_system_template: false
      }

      console.log('Saving template with supplier_id:', supplier.id, 'business_id:', businessId)

      if (isEditing) {
        const { error } = await supabase
          .from('supplier_message_templates')
          .update({
            template_name: name.trim(),
            message_template: message.trim(),
            is_default: isDefault,
            updated_at: new Date().toISOString()
          })
          .eq('id', template.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('supplier_message_templates')
          .insert(templateData)

        if (error) throw error
      }

      onSave()
    } catch (error) {
      console.error('Error saving template:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!isEditing) return

    try {
      setDeleting(true)
      const { error } = await supabase
        .from('supplier_message_templates')
        .delete()
        .eq('id', template.id)

      if (error) throw error
      onSave()
    } catch (error) {
      console.error('Error deleting template:', error)
    } finally {
      setDeleting(false)
    }
  }

  const canSave = name.trim() && message.trim()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <button
            onClick={onClose}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
          <h2 className="font-semibold text-gray-900">
            {isEditing ? 'Edit template' : 'Create a message template'}
          </h2>
          <div className="w-9" />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Template name */}
          <div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Template name"
              className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
            <p className="mt-2 text-sm text-gray-500">
              This won't be shown to customers.
            </p>
          </div>

          {/* Message */}
          <div>
            <label className="font-medium text-gray-900 block mb-2">Message</label>

            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onBlur={handleTextareaBlur}
              placeholder="Write your message..."
              rows={8}
              className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
            />

            {/* Shortcode buttons */}
            <div className="mt-3">
              <p className="text-sm text-gray-500 mb-2">Click to insert personalisation:</p>
              <div className="flex flex-wrap gap-2">
                {shortcodes.map(({ code, label }) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => insertShortcode(code)}
                    className="inline-flex items-center px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Set as default */}
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                isDefault
                  ? 'bg-gray-900 border-gray-900'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onClick={() => setIsDefault(!isDefault)}
            >
              {isDefault && <Check className="w-3 h-3 text-white" />}
            </div>
            <span className="text-gray-900">Set as default confirmation message</span>
          </label>

          {/* Delete button for existing templates */}
          {isEditing && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium"
            >
              {deleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              Delete template
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-white">
          <button
            onClick={onClose}
            className="text-base font-medium text-gray-900 underline"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave || saving}
            className={`px-6 py-3 rounded-lg text-base font-medium transition-colors ${
              canSave && !saving
                ? 'bg-gray-900 text-white hover:bg-gray-800'
                : 'bg-gray-200 text-gray-400'
            }`}
          >
            {saving ? 'Saving...' : isEditing ? 'Save' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  )
}
