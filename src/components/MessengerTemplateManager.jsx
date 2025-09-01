"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import {
  CheckCircle,
  XCircle,
  Edit,
  Save,
  X,
  MessageSquare,
  Plus,
  Loader2
} from "lucide-react"
import { supabase } from "@/lib/supabase"

const MessageTemplatesManager = ({ supplierCategory, supplierId }) => {
  const [templates, setTemplates] = useState({ acceptance: null, decline: null })
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState({ acceptance: false, decline: false })
  const [tempText, setTempText] = useState({ acceptance: '', decline: '' })
  const [saving, setSaving] = useState({ acceptance: false, decline: false })

  useEffect(() => {
    if (supplierCategory && supplierId) {
      loadTemplates()
    }
  }, [supplierCategory, supplierId])

  const loadTemplates = async () => {
    try {
      setLoading(true)

      // Get supplier's custom templates
      const { data: customTemplates, error } = await supabase
        .from('supplier_message_templates')
        .select('*')
        .eq('supplier_id', supplierId)
        .eq('supplier_category', supplierCategory)

      if (error) {
        console.error('Error loading templates:', error)
        return
      }

      // Organize by template type
      const templatesMap = {
        acceptance: customTemplates?.find(t => t.template_type === 'acceptance') || null,
        decline: customTemplates?.find(t => t.template_type === 'decline') || null
      }

      setTemplates(templatesMap)
      
      // Set temp text for editing
      setTempText({
        acceptance: templatesMap.acceptance?.message_template || '',
        decline: templatesMap.decline?.message_template || ''
      })

    } catch (error) {
      console.error('Error loading templates:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveTemplate = async (templateType) => {
    try {
      setSaving(prev => ({ ...prev, [templateType]: true }))

      const templateData = {
        supplier_id: supplierId,
        supplier_category: supplierCategory,
        template_type: templateType,
        template_name: `My ${templateType} template`,
        message_template: tempText[templateType],
        is_default: true,
        is_system_template: false
      }

      if (templates[templateType]) {
        // Update existing template
        const { error } = await supabase
          .from('supplier_message_templates')
          .update({
            message_template: tempText[templateType],
            updated_at: new Date().toISOString()
          })
          .eq('id', templates[templateType].id)

        if (error) throw error
      } else {
        // Create new template
        const { data: newTemplate, error } = await supabase
          .from('supplier_message_templates')
          .insert(templateData)
          .select()
          .single()

        if (error) throw error

        setTemplates(prev => ({ ...prev, [templateType]: newTemplate }))
      }

      setEditing(prev => ({ ...prev, [templateType]: false }))

    } catch (error) {
      console.error('Error saving template:', error)
      alert('Failed to save template. Please try again.')
    } finally {
      setSaving(prev => ({ ...prev, [templateType]: false }))
    }
  }

  const startEditing = (templateType) => {
    setEditing(prev => ({ ...prev, [templateType]: true }))
  }

  const cancelEditing = (templateType) => {
    setEditing(prev => ({ ...prev, [templateType]: false }))
    setTempText(prev => ({ 
      ...prev, 
      [templateType]: templates[templateType]?.message_template || '' 
    }))
  }

  const getTemplateVariables = () => {
    const baseVariables = [
      '{customer_name}', '{child_name}', '{party_date}', '{party_theme}', '{final_price}', '{guest_count}'
    ]

    const categorySpecific = {
      entertainment: ['{performance_duration}', '{setup_time}'],
      catering: ['{dietary_requirements}', '{delivery_time}'],
      venue: ['{venue_name}', '{capacity}', '{parking_info}'],
      photography: ['{session_length}', '{delivery_timeframe}']
    }

    return [...baseVariables, ...(categorySpecific[supplierCategory] || [])]
  }

  if (!supplierCategory) {
    return (
      <div className="text-center py-8">
        <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">Please select your business type first</p>
        <p className="text-sm text-gray-400 mt-1">
          Templates are category-specific
        </p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        <span className="ml-3 text-gray-600">Loading templates...</span>
      </div>
    )
  }

  const templateTypes = [
    { key: 'acceptance', label: 'Acceptance Message', icon: CheckCircle, color: 'green' },
    { key: 'decline', label: 'Decline Message', icon: XCircle, color: 'red' }
  ]

  return (
    <div className="space-y-6">


      {/* Template Cards */}
      {templateTypes.map(({ key, label, icon: Icon, color }) => (
        <Card key={key} className={`border-l-4 border-l-${color}-400`}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon className={`w-5 h-5 text-${color}-600`} />
                <span>{label}</span>
              </div>
              
              <div className="flex items-center gap-2">
                {templates[key] && (
                  <Badge className={`bg-${color}-100 text-${color}-800`}>
                    Custom
                  </Badge>
                )}
                
                {!editing[key] && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => startEditing(key)}
                  >
                    {templates[key] ? <Edit className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {templates[key] ? 'Edit' : 'Create'}
                  </Button>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            {editing[key] ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor={`${key}-template`} className="text-sm font-medium">
                    Message Template
                  </Label>
                  <Textarea
                    id={`${key}-template`}
                    value={tempText[key]}
                    onChange={(e) => setTempText(prev => ({ ...prev, [key]: e.target.value }))}
                    placeholder={`Enter your default ${key} message...`}
                    rows={4}
                    className="mt-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This message will auto-populate when you {key === 'acceptance' ? 'accept' : 'decline'} enquiries
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    onClick={() => saveTemplate(key)}
                    disabled={saving[key] || !tempText[key].trim()}
                    className={`bg-${color}-600 hover:bg-${color}-700 text-white`}
                  >
                    {saving[key] ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Template
                      </>
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => cancelEditing(key)}
                    disabled={saving[key]}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : templates[key] ? (
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-800 whitespace-pre-wrap">
                    {templates[key].message_template}
                  </p>
                </div>
                <p className="text-xs text-gray-500">
                  This template will auto-populate when you {key === 'acceptance' ? 'accept' : 'decline'} enquiries
                </p>
              </div>
            ) : (
              <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded-lg">
                <MessageSquare className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No custom template set</p>
                <p className="text-xs text-gray-400 mt-1">
                  System default will be used for {key === 'acceptance' ? 'acceptance' : 'decline'} messages
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default MessageTemplatesManager