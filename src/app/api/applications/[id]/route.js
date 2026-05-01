import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const map = r => ({
  _id: r.id, positionId: r.position_id, positionTitle: r.position_title,
  name: r.name, email: r.email, phone: r.phone,
  experience: r.experience, currentRole: r.role, details: r.details,
  resumeName: r.resume_name, resumeUrl: r.resume_url,
  status: r.status, createdAt: r.created_at, updatedAt: r.updated_at,
});

export async function PATCH(req, { params }) {
  try {
    const body = await req.json();
    const { data, error } = await supabase
      .from('applications')
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq('id', params.id)
      .select().single();
    if (error) throw error;
    return NextResponse.json({ application: map(data) });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { error } = await supabase.from('applications').delete().eq('id', params.id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
