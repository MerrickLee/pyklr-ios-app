require('dotenv').config({ path: 'apps/mobile/.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

async function test() {
  await supabase.auth.signInWithPassword({ email: 'testuser123@example.com', password: 'TestPassword123!' });
  const user = (await supabase.auth.getUser()).data.user;

  const { data: newChat } = await supabase
    .from('chats')
    .insert({ type: 'dm', name: 'Test Chat 3', created_by: user.id })
    .select('id').single();
  
  // Insert MYSELF
  const { error: err1 } = await supabase.from('chat_members').insert([ { chat_id: newChat.id, user_id: user.id, role: 'owner' } ]).select();
  console.log("Self insert error:", err1);

  // Insert OTHER
  // Find another user
  const { data: others } = await supabase.from('profiles').select('id').neq('id', user.id).limit(1);
  const otherId = others[0].id;
  
  const { error: err2 } = await supabase.from('chat_members').insert([ { chat_id: newChat.id, user_id: otherId, role: 'member' } ]).select();
  console.log("Other insert error:", err2);
}
test();
