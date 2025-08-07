// 1. CREATE a proper Open Graph image API: /app/api/og-partysnap/route.js

import { ImageResponse } from 'next/og'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const childName = searchParams.get('child') || 'Birthday Child'
  const theme = searchParams.get('theme') || 'birthday'
  const date = searchParams.get('date') || ''
  
  try {
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#1e293b', // Dark blue background
            backgroundImage: 'radial-gradient(circle at 30% 20%, #3b82f6 0%, transparent 50%), radial-gradient(circle at 70% 80%, #8b5cf6 0%, transparent 50%)',
          }}
        >
          {/* PartySnap Branding */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '30px',
          }}>
            <div style={{
              fontSize: 48,
              marginRight: '15px',
            }}>
              🎉
            </div>
            <div style={{
              fontSize: 42,
              fontWeight: 'bold',
              color: 'white',
              fontFamily: 'system-ui',
            }}>
              PartySnap
            </div>
          </div>
          
          {/* Main Content */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '40px',
            backgroundColor: 'white',
            borderRadius: '20px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            maxWidth: '900px',
            textAlign: 'center',
            margin: '0 40px',
          }}>
            {/* Party Icon */}
            <div style={{
              fontSize: 80,
              marginBottom: '20px',
            }}>
              {getThemeEmoji(theme)}
            </div>
            
            {/* Title */}
            <div style={{
              fontSize: 38,
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '16px',
              lineHeight: 1.2,
            }}>
              You&apos;re Invited to {childName}&apos;s Party!
            </div>
            
            {/* Subtitle */}
            <div style={{
              fontSize: 28,
              color: '#6b7280',
              marginBottom: '20px',
              textTransform: 'capitalize',
            }}>
              🎊 {theme} Birthday Celebration
            </div>
            
            {/* Date */}
            {date && (
              <div style={{
                fontSize: 22,
                color: '#9ca3af',
                marginBottom: '15px',
              }}>
                📅 {new Date(date).toLocaleDateString('en-US', { 
                  weekday: 'long',
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            )}
            
            {/* Call to action */}
            <div style={{
              fontSize: 20,
              color: '#9ca3af',
            }}>
              RSVP and see all the party details
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630, // Perfect for social sharing
      },
    )
  } catch (e) {
    return new Response(`Failed to generate image`, {
      status: 500,
    })
  }
}

function getThemeEmoji(theme) {
  const themeEmojis = {
    'princess': '👑',
    'superhero': '🦸',
    'pirate': '🏴‍☠️',
    'unicorn': '🦄',
    'dinosaur': '🦕',
    'space': '🚀',
    'mermaid': '🧜‍♀️',
    'football': '⚽',
    'cars': '🏎️',
    'animals': '🐾',
  }
  
  return themeEmojis[theme?.toLowerCase()] || '🎂'
}
