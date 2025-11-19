import { NextRequest } from 'next/server'
import { getDb } from 'app/lib/mongodb'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function badRequest(message: string) {
  return new Response(JSON.stringify({ error: message }), { status: 400, headers: { 'content-type': 'application/json' } })
}

function serverError(message: string, e?: unknown) {
  console.error('[views-api]', message, e)
  return new Response(JSON.stringify({ error: message }), { status: 500, headers: { 'content-type': 'application/json' } })
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return badRequest('Missing id query parameter')

    const db = await getDb()
    const doc = await db.collection('views').findOne<{ _id: string; count: number }>({ _id: id })
    const count = doc?.count ?? 0

    return new Response(JSON.stringify({ id, count }), {
      status: 200,
      headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
    })
  } catch (e) {
    return serverError('Failed to fetch view count', e)
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null)
    const id = body?.id as string | undefined
    if (!id || typeof id !== 'string') return badRequest('Missing id in JSON body')

    const db = await getDb()
    const res = await db.collection('views').findOneAndUpdate(
      { _id: id },
      { $inc: { count: 1 }, $setOnInsert: { createdAt: new Date() }, $set: { updatedAt: new Date() } },
      { upsert: true, returnDocument: 'after' }
    )

    const count = res?.count ?? (res && (res as any).value?.count) ?? 0

    // Handle different driver return shapes
    const finalCount = typeof count === 'number' ? count : ((res as any)?.value?.count ?? 0)

    return new Response(JSON.stringify({ id, count: finalCount }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    })
  } catch (e) {
    return serverError('Failed to increment view count', e)
  }
}
