import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

/**
 * digest-mailer — Supabase Edge Function
 *
 * Handles two types of requests:
 * 1. Data export: Collects all user data and emails a JSON digest
 * 2. Email digest: Sends a periodic activity summary
 *
 * Triggered via POST from the mobile app or a cron job.
 */

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { type, user_id } = await req.json();

    if (type === 'data_export') {
      // Collect all user data for GDPR/Apple data export compliance
      if (!user_id) {
        return new Response(JSON.stringify({ error: 'user_id required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Fetch user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user_id)
        .single();

      // Fetch user's messages
      const { data: messages } = await supabase
        .from('messages')
        .select('id, chat_id, body, created_at')
        .eq('sender_id', user_id)
        .order('created_at', { ascending: false })
        .limit(1000);

      // Fetch user's events
      const { data: events } = await supabase
        .from('event_rsvps')
        .select('event_id, status, created_at')
        .eq('user_id', user_id);

      // Fetch user's forum posts
      const { data: posts } = await supabase
        .from('forum_posts')
        .select('id, title, body, created_at')
        .eq('author_id', user_id);

      // Fetch user's follows
      const { data: following } = await supabase
        .from('follows')
        .select('followed_id, created_at')
        .eq('follower_id', user_id);

      // Fetch user's court submissions
      const { data: courts } = await supabase
        .from('courts')
        .select('id, name, status, created_at')
        .eq('submitted_by', user_id);

      const exportData = {
        exported_at: new Date().toISOString(),
        profile,
        messages: messages ?? [],
        event_rsvps: events ?? [],
        forum_posts: posts ?? [],
        following: following ?? [],
        court_submissions: courts ?? [],
      };

      // Send via Resend email
      if (RESEND_API_KEY && profile?.email) {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'PYKLR <noreply@pyklr.app>',
            to: profile.email,
            subject: 'Your PYKLR data export',
            html: `
              <h2>Your PYKLR Data Export</h2>
              <p>Here's a complete export of your PYKLR data as requested.</p>
              <p><strong>Profile:</strong> ${profile.display_name ?? profile.username}</p>
              <p><strong>Messages sent:</strong> ${(messages ?? []).length}</p>
              <p><strong>Events attended:</strong> ${(events ?? []).length}</p>
              <p><strong>Forum posts:</strong> ${(posts ?? []).length}</p>
              <p><strong>Following:</strong> ${(following ?? []).length}</p>
              <p><strong>Courts submitted:</strong> ${(courts ?? []).length}</p>
              <br/>
              <p>Full data is attached as JSON below:</p>
              <pre style="background: #f5f5f5; padding: 16px; border-radius: 8px; font-size: 12px; overflow: auto; max-height: 400px;">
${JSON.stringify(exportData, null, 2)}
              </pre>
            `,
          }),
        });
      }

      return new Response(JSON.stringify({ success: true, data: exportData }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Unknown type' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
