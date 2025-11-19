import { NextRequest, NextResponse } from 'next/server'
import { getDb } from 'app/lib/mongodb'

export async function POST(req: NextRequest) {
    const apiKey = req.headers.get('x-api-key')
    if (apiKey !== process.env.SPOTIFY_API_KEY) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await req.json()
        const { track, artist, isPlaying, imageUrl, timestamp, duration, position } = body

        const db = await getDb()
        const collection = db.collection('spotify')

        await collection.updateOne(
            { _id: 'current_status' as any }, // Cast to any to avoid TS issues with custom _id
            {
                $set: {
                    track,
                    artist,
                    isPlaying,
                    imageUrl,
                    duration,
                    position,
                    timestamp: timestamp || Date.now(),
                    updatedAt: Date.now(),
                },
            },
            { upsert: true }
        )

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error updating spotify status:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
