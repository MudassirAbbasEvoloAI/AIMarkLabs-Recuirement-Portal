import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const map = r => ({
  _id: r.id, name: r.name, email: r.email, phone: r.phone,
  details: r.details, status: r.status, source: r.source,
  createdAt: r.created_at, updatedAt: r.updated_at,
});

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search')?.toLowerCase();
    const sort   = searchParams.get('sort') || 'newest';

    let q = supabase.from('leads').select('*');
    if (status && status !== 'All') q = q.eq('status', status);
    q = q.order(sort === 'name' ? 'name' : 'created_at', { ascending: sort === 'oldest' || sort === 'name' });

    const { data, error } = await q;
    if (error) throw error;

    let leads = data.map(map);
    if (search) {
      leads = leads.filter(l =>
        l.name?.toLowerCase().includes(search) ||
        l.email?.toLowerCase().includes(search) ||
        l.phone?.includes(search) ||
        l.details?.toLowerCase().includes(search)
      );
    }

    return NextResponse.json({ leads, total: leads.length });
  } catch (e) {
    console.error('Leads GET:', e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, email, phone, details } = body;
    if (!name || !email || !phone || !details)
      return NextResponse.json({ error: 'All fields required' }, { status: 400 });

    const { data, error } = await supabase
      .from('leads')
      .insert({ name, email, phone, details, source: body.source || 'website' })
      .select().single();
    if (error) throw error;

    return NextResponse.json(
      { lead: map(data), message: 'We will reach out to you within 48 hours!' },
      { status: 201 }
    );
  } catch (e) {
    console.error('Leads POST:', e.message);
    return NextResponse.json({ error: 'Failed to save. Please try again.' }, { status: 500 });
  }
}
