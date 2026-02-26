"use client"

import { useState } from 'react'

export default function TestCanvasAPIPage() {
  const [imageUrl, setImageUrl] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [formData, setFormData] = useState({
    childName: 'BAILEY',
    age: '10',
    date: '2028-06-20',
    time: '2pm - 4pm',
    venue: '123 Example Street, London SW1A 1AA',
    theme: 'superhero'
  })

  const generateInvite = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/generate-canvas-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (result.success) {
        setImageUrl(result.imageUrl)
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Canvas Invite API Tester</h1>
        <p className="text-gray-600 mb-6">Tests the actual server-side generation (like a real user)</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Party Details</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Child Name</label>
                <input
                  type="text"
                  value={formData.childName}
                  onChange={(e) => handleChange('childName', e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Age</label>
                <input
                  type="text"
                  value={formData.age}
                  onChange={(e) => handleChange('age', e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleChange('date', e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Time</label>
                <input
                  type="text"
                  value={formData.time}
                  onChange={(e) => handleChange('time', e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Venue</label>
                <textarea
                  value={formData.venue}
                  onChange={(e) => handleChange('venue', e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Theme</label>
                <select
                  value={formData.theme}
                  onChange={(e) => handleChange('theme', e.target.value)}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="superhero">Superhero</option>
                  <option value="mermaid">Mermaid</option>
                  <option value="pirate">Pirate</option>
                  <option value="princess">Princess</option>
                  <option value="dinosaur">Dinosaur</option>
                  <option value="science">Science</option>
                  <option value="space">Space</option>
                  <option value="spiderman">Spiderman</option>
                  <option value="safari">Safari</option>
                  <option value="frozen">Frozen</option>
                  <option value="unicorn">Unicorn</option>
                  <option value="kpop">K-Pop Demon Hunters</option>
                </select>
              </div>

              <button
                onClick={generateInvite}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"
              >
                {loading ? 'Generating from Server...' : 'Generate Invite (Server API)'}
              </button>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded">
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* Preview */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Server-Generated Result</h2>

            {imageUrl ? (
              <div className="border rounded overflow-hidden">
                <img
                  src={imageUrl}
                  alt="Generated invite"
                  className="w-full h-auto"
                />
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg h-96 flex items-center justify-center text-gray-400">
                Click "Generate Invite" to test the API
              </div>
            )}

            {imageUrl && (
              <div className="mt-4 flex gap-2">
                <a
                  href={imageUrl}
                  download="invite.png"
                  className="flex-1 bg-green-600 text-white py-2 rounded text-center hover:bg-green-700"
                >
                  Download PNG
                </a>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Real-time editor: <a href="/test-canvas" className="text-blue-600 underline">/test-canvas</a></p>
        </div>
      </div>
    </div>
  )
}
