import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const map = r => ({
  _id: r.id, title: r.title, department: r.department, location: r.location,
  type: r.type, experience: r.experience, description: r.description,
  requirements: r.requirements, salary: r.salary, active: r.active,
  createdAt: r.created_at,
});

export async function PATCH(req, { params }) {
  try {
    const body = await req.json();
    const { data, error } = await supabase
      .from('positions')
      .update(body)
      .eq('id', params.id)
      .select().single();
    if (error) throw error;
    return NextResponse.json({ position: map(data) });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { error } = await supabase.from('positions').delete().eq('id', params.id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
