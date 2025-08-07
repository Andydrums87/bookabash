import { ImageResponse } from 'next/og'

export async function GET() {
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
            backgroundColor: '#fef3c7',
            backgroundImage: 'radial-gradient(circle at 25px 25px, #f59e0b20 2%, transparent 0%), radial-gradient(circle at 75px 75px, #f59e0b20 2%, transparent 0%)',
            backgroundSize: '100px 100px',
          }}
        >
          {/* Party Elements */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '40px',
          }}>
            <div style={{
              fontSize: 48,
              marginRight: '20px',
            }}>
              🎉
            </div>
            <div style={{
              fontSize: 32,
              fontWeight: 'bold',
              color: '#1f2937',
            }}>
              PartySnap
            </div>
          </div>
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '40px',
            backgroundColor: 'white',
            borderRadius: '20px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            maxWidth: '800px',
            textAlign: 'center',
          }}>
            <div style={{
              fontSize: 64,
              marginBottom: '20px',
            }}>
              🎂
            </div>
            
            <div style={{
              fontSize: 36,
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '16px',
            }}>
              You are Invited to a Birthday Party!
            </div>
            
            <div style={{
              fontSize: 24,
              color: '#6b7280',
              marginBottom: '20px',
            }}>
              🎊 RSVP and see all the party details
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      },
    )
  } catch (e) {
    return new Response(`Failed to generate image`, {
      status: 500,
    })
  }
}
