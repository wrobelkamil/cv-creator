const SUPABASE_URL = 'https://nkxsrltafwuygqbyebxc.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTA5NDQ5MywiZXhwIjoyMDg0NjcwNDkzfQ.RBN7bTO3IpoQcxrPD0kIv4n1EIXrBlg3JKHml-c8Pqs';
const PROJECT_ID = '82cba8f6-6ed7-4c90-b99d-a23f13ce66ca';

async function testConnection() {
    console.log('Testing Supabase RPC with CORRECT URL...');

    try {
        // 1. Get Entries
        console.log("--- TEST 1: Get Entries ---");
        const res1 = await fetch(`${SUPABASE_URL}/rest/v1/rpc/gpt_manage_entries`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'apikey': SERVICE_KEY, 'Authorization': `Bearer ${SERVICE_KEY}` },
            body: JSON.stringify({ action: 'get_entries', p_project_id: PROJECT_ID })
        });
        const json1 = await res1.json();
        console.log("Get Response:", JSON.stringify(json1, null, 2));

        // 2. Update Skills
        console.log("\n--- TEST 2: Update Skills ---");
        const newSkills = ["Node.js", "React", "Supabase", "AI"];
        const res2 = await fetch(`${SUPABASE_URL}/rest/v1/rpc/gpt_manage_entries`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'apikey': SERVICE_KEY, 'Authorization': `Bearer ${SERVICE_KEY}` },
            body: JSON.stringify({ action: 'update_skills', p_project_id: PROJECT_ID, p_entry_data: newSkills })
        });
        const json2 = await res2.json();
        console.log("Update Response:", JSON.stringify(json2, null, 2));

        // 3. Verify
        console.log("\n--- TEST 3: Verify Update ---");
        const res3 = await fetch(`${SUPABASE_URL}/rest/v1/rpc/gpt_manage_entries`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'apikey': SERVICE_KEY, 'Authorization': `Bearer ${SERVICE_KEY}` },
            body: JSON.stringify({ action: 'get_entries', p_project_id: PROJECT_ID })
        });
        const json3 = await res3.json();
        console.log("Verify Response:", JSON.stringify(json3.skills, null, 2));

        const text = await response.text();
        console.log(`Status: ${response.status}`);
        console.log('Response Body:', text);

    } catch (err) {
        console.error('Fetch error:', err);
    }
}

testConnection();
