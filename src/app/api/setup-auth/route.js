import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );

  const { data, error } = await supabase.auth.signUp({
    email: 'Areeba@aimarklabs.com',
    password: 'Areeba@darling',
  });

  if (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }

  return Response.json({
    message: 'Verification email sent. Check your inbox and confirm before logging in.',
    email: data.user?.email,
  });
}
