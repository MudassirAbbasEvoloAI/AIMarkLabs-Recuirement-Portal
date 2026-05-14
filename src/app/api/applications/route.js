import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const map = r => ({
  _id: r.id, positionId: r.position_id, positionTitle: r.position_title,
  name: r.name, email: r.email, phone: r.phone,
  experience: r.experience, currentRole: r.role, details: r.details,
  resumeName: r.resume_name, resumeUrl: r.resume_url,
  status: r.status, createdAt: r.created_at, updatedAt: r.updated_at,
});

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search')?.toLowerCase();
    const sort   = searchParams.get('sort') || 'newest';

    let q = supabase.from('applications').select('*');
    if (status && status !== 'All') q = q.eq('status', status);
    q = q.order(sort === 'name' ? 'name' : 'created_at', { ascending: sort === 'oldest' || sort === 'name' });

    const { data, error } = await q;
    if (error) throw error;

    let applications = data.map(map);
    if (search) {
      applications = applications.filter(a =>
        a.name?.toLowerCase().includes(search) ||
        a.email?.toLowerCase().includes(search) ||
        a.positionTitle?.toLowerCase().includes(search) ||
        a.details?.toLowerCase().includes(search)
      );
    }

    return NextResponse.json({ applications, total: applications.length });
  } catch (e) {
    console.error('Applications GET:', e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const formData      = await req.formData();
    const name          = formData.get('name');
    const email         = formData.get('email');
    const phone         = formData.get('phone');
    const positionId    = formData.get('positionId');
    const positionTitle = formData.get('positionTitle');
    const experience    = formData.get('experience') || '';
    const currentRole   = formData.get('currentRole') || '';
    const details       = formData.get('details') || '';
    const resumeFile    = formData.get('resume');

    if (!name || !phone || !positionId)
      return NextResponse.json({ error: 'Required fields missing' }, { status: 400 });

    let resume_name = null;
    let resume_url  = null;

    if (resumeFile && resumeFile.size > 0) {
      const buffer   = Buffer.from(await resumeFile.arrayBuffer());
      const filename = `${Date.now()}-${resumeFile.name.replace(/\s+/g, '_')}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(filename, buffer, { contentType: resumeFile.type || 'application/octet-stream' });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('resumes').getPublicUrl(uploadData.path);
      resume_name = resumeFile.name;
      resume_url  = publicUrl;
    }

    const { data, error } = await supabase
      .from('applications')
      .insert({
        position_id: positionId, position_title: positionTitle,
        name, email, phone, experience, role: currentRole, details,
        resume_name, resume_url,
      })
      .select().single();
    if (error) throw error;

    return NextResponse.json(
      { application: map(data), message: 'Application submitted! We will be in touch.' },
      { status: 201 }
    );
  } catch (e) {
    console.error('Applications POST:', e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
