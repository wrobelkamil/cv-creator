const SUPABASE_URL = 'https://nkxsrltadfwuygqbybxc.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTA5NDQ5MywiZXhwIjoyMDg0NjcwNDkzfQ.RBN7bTO3IpoQcxrPD0kIv4n1EIXrBlg3JKHml-c8Pqs';
const PROJECT_ID = '82cba8f6-6ed7-4c90-b99d-a23f13ce66ca';

async function testConnection() {
    console.log('Testing Supabase RPC with Service Role Key...');

    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/gpt_manage_entries`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SERVICE_KEY,
                'Authorization': `Bearer ${SERVICE_KEY}`
            },
            body: JSON.stringify({
                action: 'get_entries',
                p_project_id: PROJECT_ID
            })
        });

        const text = await response.text();
        console.log(`Status: ${response.status}`);
        console.log('Response Body:', text);

    } catch (err) {
        console.error('Fetch error:', err);
    }
}

testConnection();
