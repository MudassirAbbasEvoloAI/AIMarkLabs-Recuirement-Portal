import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const map = r => ({
  _id: r.id, title: r.title, department: r.department, location: r.location,
  type: r.type, experience: r.experience, description: r.description,
  requirements: r.requirements, salary: r.salary, active: r.active,
  createdAt: r.created_at,
});

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('positions')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return NextResponse.json({ positions: data.map(map) });
  } catch (e) {
    console.error('Positions GET:', e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { data, error } = await supabase
      .from('positions')
      .insert({ ...body, active: true })
      .select().single();
    if (error) throw error;
    return NextResponse.json({ position: map(data) }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
