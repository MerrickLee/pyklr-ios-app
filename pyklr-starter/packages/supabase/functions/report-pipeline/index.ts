import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

/**
 * report-pipeline — Supabase Edge Function
 *
 * Triggered by INSERT on the `reports` table via database webhook.
 * Processes new reports:
 * 1. Validates the report
 * 2. Checks for repeat offenders (auto-escalation)
 * 3. Sends a push notification to admins
 * 4. If threshold exceeded, auto-suspends the target
 */

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

const AUTO_SUSPEND_THRESHOLD = 5; // Reports before auto-suspension

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

    const payload = await req.json();

    // Handle database webhook trigger (new report inserted)
    const report = payload.record ?? payload;

    if (!report.id || !report.reporter_id || !report.target_id) {
      return new Response(JSON.stringify({ error: 'Invalid report payload' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`[report-pipeline] Processing report ${report.id} for ${report.target_type}:${report.target_id}`);

    // Count total reports against this target
    const { count: reportCount } = await supabase
      .from('reports')
      .select('*', { count: 'exact', head: true })
      .eq('target_id', report.target_id)
      .eq('target_type', report.target_type)
      .eq('status', 'pending');

    const totalReports = reportCount ?? 0;

    console.log(`[report-pipeline] Target has ${totalReports} pending reports`);

    // Auto-escalate if threshold reached
    if (totalReports >= AUTO_SUSPEND_THRESHOLD && report.target_type === 'user') {
      // Auto-suspend the user
      await supabase
        .from('profiles')
        .update({
          suspended: true,
          suspended_at: new Date().toISOString(),
          suspension_reason: `Auto-suspended: ${totalReports} reports received`,
        })
        .eq('id', report.target_id);

      // Mark all pending reports as actioned
      await supabase
        .from('reports')
        .update({ status: 'actioned', resolved_at: new Date().toISOString() })
        .eq('target_id', report.target_id)
        .eq('target_type', report.target_type)
        .eq('status', 'pending');

      console.log(`[report-pipeline] Auto-suspended user ${report.target_id}`);
    }

    // Notify admin users about the new report
    const { data: admins } = await supabase
      .from('profiles')
      .select('id')
      .eq('is_admin', true);

    if (admins && admins.length > 0) {
      const notifications = admins.map((admin) => ({
        user_id: admin.id,
        type: 'admin_report',
        title: `New ${report.target_type} report`,
        body: `A ${report.target_type} has been reported${totalReports > 1 ? ` (${totalReports} total)` : ''}. Review in the admin dashboard.`,
        data: { report_id: report.id, target_type: report.target_type, target_id: report.target_id },
      }));

      await supabase.from('notifications').insert(notifications);
    }

    return new Response(
      JSON.stringify({
        success: true,
        report_id: report.id,
        total_reports: totalReports,
        auto_suspended: totalReports >= AUTO_SUSPEND_THRESHOLD && report.target_type === 'user',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('[report-pipeline] Error:', (err as Error).message);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
