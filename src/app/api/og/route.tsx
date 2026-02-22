import { ImageResponse } from 'next/og';
 
export const runtime = 'edge';
 
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Calculate Ramadan Day (Approx)
    // Assume Start: Feb 18, 2026
    const start = new Date('2026-02-18');
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - start.getTime());
    const day = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Clamp day to 1-30 for display safety
    const displayDay = day > 0 && day <= 30 ? day : "Journey";

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
            backgroundColor: '#064e3b', // Emerald-900
            backgroundImage: 'radial-gradient(circle at 25px 25px, rgba(255, 255, 255, 0.2) 2%, transparent 0%), radial-gradient(circle at 75px 75px, rgba(255, 255, 255, 0.2) 2%, transparent 0%)',
            backgroundSize: '100px 100px',
            color: 'white',
          }}
        >
          {/* Decorative Circle/Moon */}
          <div
             style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 150,
                height: 150,
                borderRadius: '50%',
                backgroundColor: '#fbbf24', // Amber-400
                marginBottom: 40,
                boxShadow: '0 0 50px rgba(251, 191, 36, 0.5)',
                fontSize: 80,
             }}
          >
             ☪
          </div>

          <div
            style={{
              display: 'flex',
              fontSize: 60,
              fontWeight: 'bold',
              letterSpacing: '-0.025em',
              color: 'white',
              lineHeight: 1,
              margin: 0,
              padding: 0,
            }}
          >
            Ramadan Tracker
          </div>

          <div
            style={{
              display: 'flex',
              fontSize: 30,
              color: '#a7f3d0', // Emerald-200
              marginTop: 20,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}
          >
            Day {displayDay} of 30
          </div>
          
           <div
            style={{
              position: 'absolute',
              bottom: 40,
              fontSize: 20,
              color: '#6ee7b7', // Emerald-300
              opacity: 0.8,
            }}
          >
            ramadan-diary.vercel.app
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      },
    );
  } catch (e: any) {
    console.log(`${e.message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
