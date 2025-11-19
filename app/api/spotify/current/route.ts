import { NextResponse } from 'next/server'
import { getDb } from 'app/lib/mongodb'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const db = await getDb()
        const collection = db.collection('spotify')
        const status = await collection.findOne({ _id: 'current_status' as any })

        return NextResponse.json(status || { isPlaying: false })
    } catch (error) {
        console.error('Error fetching spotify status:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
