import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const POSITIONS = [
  { title: 'Senior Software Engineer', department: 'Technology & IT', location: 'Dubai, UAE', type: 'Remote/Hybrid', experience: '5+ Years', description: 'Build scalable web applications and lead technical initiatives across the Gulf region.', requirements: ['5+ years React/Node.js', 'Cloud (AWS/Azure)', 'Team leadership experience', 'Strong problem-solving skills'], salary: 'Competitive' },
  { title: 'Financial Analyst', department: 'Finance & Banking', location: 'Riyadh, KSA', type: 'Onsite', experience: '3+ Years', description: 'Support investment decisions and financial planning for Gulf-region operations at a leading financial group.', requirements: ['CFA Level 2+', '3+ years investment banking', 'Excel/Power BI proficiency', 'Arabic preferred'], salary: 'Competitive' },
  { title: 'Civil Engineer', department: 'Engineering', location: 'Doha, Qatar', type: 'Onsite', experience: '7+ Years', description: 'Lead large-scale infrastructure projects across Qatar. PMP certification highly preferred.', requirements: ['PMP certified', '7+ years infrastructure', 'AutoCAD/BIM proficiency', 'Gulf Region experience'], salary: 'Competitive' },
  { title: 'HR Manager', department: 'HR & Operations', location: 'Kuwait City, Kuwait', type: 'Remote/Hybrid', experience: '5+ Years', description: 'Lead HR operations, talent acquisition, and HR strategy across the Gulf region.', requirements: ['SHRM certified', '5+ years HR management', 'Gulf region experience', 'Arabic fluency'], salary: 'Competitive' },
  { title: 'Petroleum Engineer', department: 'Oil & Gas', location: 'Abu Dhabi, UAE', type: 'Onsite', experience: '10+ Years', description: 'Manage upstream operations in Abu Dhabi. ADNOC experience strongly preferred.', requirements: ['10+ years O&G experience', 'ADNOC background preferred', 'Reservoir simulation skills', 'Arabic beneficial'], salary: 'Competitive' },
];

const LEADS = [
  { name: 'Khalid Al Mansoori', email: 'khalid@techcorp.ae', phone: '+971 52 777 8888', details: 'Dubai fintech startup. Need 5 software engineers and 2 data scientists. Immediate start. Remote-first culture.', status: 'new', source: 'linkedin-ad' },
  { name: 'Mariam Hassan', email: 'mariam@saudico.sa', phone: '+966 55 321 9876', details: 'Construction company in Riyadh. Need 10 civil engineers for a 2-year infrastructure project. Onsite roles.', status: 'contacted', source: 'linkedin-ad' },
  { name: 'Yusuf Al Qahtani', email: 'yusuf@oilgas.qa', phone: '+974 44 555 6666', details: 'Oil & Gas company Qatar. Need petroleum engineers x5, 10+ years ADNOC experience preferred. Competitive package.', status: 'in-progress', source: 'linkedin-ad' },
  { name: 'Sara Al Farsi', email: 'sara@fingroup.ae', phone: '+971 50 123 9900', details: 'Financial services group in Abu Dhabi. Looking for 3 senior financial analysts with CFA and banking background.', status: 'new', source: 'website' },
];

export async function GET() {
  try {
    // Create storage bucket (ignore error if already exists)
    await supabase.storage.createBucket('resumes', { public: true }).catch(() => {});

    // Clear existing data
    await supabase.from('applications').delete().not('id', 'is', null);
    await supabase.from('leads').delete().not('id', 'is', null);
    await supabase.from('positions').delete().not('id', 'is', null);

    // Insert positions
    const { data: positions, error: posErr } = await supabase.from('positions').insert(POSITIONS).select();
    if (posErr) throw posErr;

    // Insert leads
    const { data: leads, error: leadErr } = await supabase.from('leads').insert(LEADS).select();
    if (leadErr) throw leadErr;

    // Insert applications referencing real position IDs
    const { data: applications, error: appErr } = await supabase.from('applications').insert([
      { position_id: positions[0].id, position_title: positions[0].title, name: 'Ahmed Al Rashidi', email: 'ahmed.rashidi@gmail.com', phone: '+971 50 123 4567', experience: '6 years', role: 'Full Stack Developer', details: '6 years React and Node.js. AWS certified, strong in microservices.', status: 'reviewing' },
      { position_id: positions[1].id, position_title: positions[1].title, name: 'Fatima Al Zahra', email: 'fatima.alzahra@outlook.com', phone: '+966 55 987 6543', experience: '4 years', role: 'Junior Analyst at HSBC', details: 'CFA Level 2 candidate. 4 years investment banking. Strong Excel and Power BI.', status: 'shortlisted' },
      { position_id: positions[2].id, position_title: positions[2].title, name: 'Omar Abdullah', email: 'omar.a@yahoo.com', phone: '+974 33 456 7890', experience: '8 years', role: 'Senior Civil Engineer', details: 'PMP certified. 8 years in Qatar infrastructure. Managed $200M+ projects.', status: 'pending' },
      { position_id: positions[0].id, position_title: positions[0].title, name: 'Sara Khalid', email: 'sara.k@hotmail.com', phone: '+965 99 111 2222', experience: '5 years', role: 'Backend Developer', details: '5 years Node.js and Python. AWS certified. Currently at Kuwait tech startup.', status: 'pending' },
    ]).select();
    if (appErr) throw appErr;

    return NextResponse.json({
      message: 'Seeded successfully',
      counts: { positions: positions.length, leads: leads.length, applications: applications.length },
    });
  } catch (e) {
    console.error('Seed error:', e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
