import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const map = r => ({
  _id: r.id, name: r.name, email: r.email, phone: r.phone,
  details: r.details, status: r.status, source: r.source,
  createdAt: r.created_at, updatedAt: r.updated_at,
});

export async function PATCH(req, { params }) {
  try {
    const body = await req.json();
    const { data, error } = await supabase
      .from('leads')
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq('id', params.id)
      .select().single();
    if (error) throw error;
    return NextResponse.json({ lead: map(data) });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { error } = await supabase.from('leads').delete().eq('id', params.id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
