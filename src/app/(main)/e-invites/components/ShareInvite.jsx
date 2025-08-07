// 3. Share Button Component: /components/ShareInvite.jsx
import { useState } from 'react'
import { Share, Copy, MessageCircle, Send, Download, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export function ShareInvite({ sharing, imageUrl, onDownload }) {
  const [copied, setCopied] = useState(false)
  const [downloadMode, setDownloadMode] = useState(false)
  
  if (!sharing || !sharing.inviteUrl) {
    return (
      <Card className="mt-4">
        <CardContent className="p-4 text-center text-gray-500">
          <p>Sharing features not available</p>
        </CardContent>
      </Card>
    )
  }

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: sharing.socialTitle,
          text: sharing.socialDescription,
          url: sharing.inviteUrl,
        })
      } catch (err) {
        console.log('Share cancelled')
      }
    }
  }
  
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(sharing.inviteUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.log('Copy failed')
    }
  }

  const handleDownloadImage = async () => {
    try {
      setDownloadMode(true)
      
      // Use the reliable Cloudinary URL or fallback to original
      const downloadUrl = sharing.imageUrl || imageUrl
      
      const response = await fetch(downloadUrl)
      const blob = await response.blob()
      
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${sharing.slug || 'party-invite'}.jpg`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      if (onDownload) onDownload()
    } catch (err) {
      console.error('Download failed:', err)
    } finally {
      setDownloadMode(false)
    }
  }
  
  // Create sharing URLs
  const whatsappMessage = `${sharing.whatsappText} ${sharing.inviteUrl}`
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(sharing.inviteUrl)}&text=${encodeURIComponent(sharing.socialDescription)}`
  
  return (
    <Card className="mt-6 border-2 border-dashed border-primary-200 bg-primary-50/30">
      <CardContent className="p-6">
        <div className="text-center mb-4">
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            🚀 Share Your Invite!
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Send this magical invitation to your guests
          </p>
          
          {/* Friendly URL Display */}
          <div className="bg-white rounded-lg border p-3 mb-4">
            <div className="flex items-center justify-between">
              <code className="text-sm text-gray-600 flex-1 truncate">
                {sharing.inviteUrl}
              </code>
              <Button
                onClick={handleCopyLink}
                size="sm"
                variant="ghost"
                className="ml-2 flex-shrink-0"
              >
                <Copy className="w-4 h-4" />
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Download Image */}
          <Button 
            onClick={handleDownloadImage}
            disabled={downloadMode}
            className="bg-gray-600 hover:bg-gray-700 text-white"
          >
            <Download className="w-4 h-4 mr-2" />
            {downloadMode ? 'Downloading...' : 'Download Image'}
          </Button>

          {/* Native Share (mobile) */}
          {navigator?.share ? (
            <Button onClick={handleNativeShare} className="bg-primary-600 hover:bg-primary-700 text-white">
              <Share className="w-4 h-4 mr-2" />
              Share Link
            </Button>
          ) : (
            <Button onClick={handleCopyLink} variant="outline">
              <Copy className="w-4 h-4 mr-2" />
              {copied ? 'Copied!' : 'Copy Link'}
            </Button>
          )}
        </div>

        {/* Social Sharing Buttons */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700 text-center">Share via:</p>
          <div className="grid grid-cols-2 gap-2">
            {/* WhatsApp */}
            <Button asChild variant="outline" className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200">
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="w-4 h-4 mr-2" />
                WhatsApp
              </a>
            </Button>
            
            {/* Telegram */}
            <Button asChild variant="outline" className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200">
              <a href={telegramUrl} target="_blank" rel="noopener noreferrer">
                <Send className="w-4 h-4 mr-2" />
                Telegram
              </a>
            </Button>
          </div>
        </div>

        {/* Gift Registry Link */}
        {sharing.registryUrl && (
          <div className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
            <div className="text-center">
              <p className="text-sm font-medium text-purple-800 mb-2">
                🎁 Don't forget the gift registry!
              </p>
              <Button asChild size="sm" className="bg-purple-600 hover:bg-purple-700 text-white">
                <a href={sharing.registryUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Gift Registry
                </a>
              </Button>
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="text-center">
            <p className="text-xs text-blue-700">
              💡 <strong>Pro tip:</strong> The invite link works perfectly in WhatsApp - your guests will see a beautiful preview!
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
