import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const map = r => ({
  _id: r.id, title: r.title, department: r.department, location: r.location,
  type: r.type, experience: r.experience, description: r.description,
  requirements: r.requirements, salary: r.salary, active: r.active,
  createdAt: r.created_at,
});

// Returns all positions (active + inactive) — used by the admin panel only
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('positions')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return NextResponse.json({ positions: data.map(map) });
  } catch (e) {
    console.error('Positions/all GET:', e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
