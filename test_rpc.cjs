const https = require('https');

const SUPABASE_URL = 'https://nkxsrltadfwuygqbybxc.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5reHNybHRhZnd1eWdxYnllYnhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwOTQ0OTMsImV4cCI6MjA4NDY3MDQ5M30.ATmpNso-EcAgBlPxr3IcSoQuCrPK5wefV-zQNPjz5WU';
const PROJECT_ID = '82cba8f6-6ed7-4c90-b99d-a23f13ce66ca';

const data = JSON.stringify({
    action: 'get_entries',
    p_project_id: PROJECT_ID
});

const options = {
    hostname: 'nkxsrltadfwuygqbybxc.supabase.co',
    path: '/rest/v1/rpc/gpt_manage_entries',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${ANON_KEY}`
    }
};

console.log(`Testing connection to: ${options.hostname}${options.path}`);

const req = https.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
        console.log('RESPONSE:', body);
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.write(data);
req.end();
