/**
 * TEST SCRIPT: Inbound Email Ingestion
 * 
 * This script simulates a Postmark webhook hitting the Supabase Edge Function.
 * It uses a mock token and sample job alert data.
 */

async function testIngestion() {
    const EDGE_FUNCTION_URL = 'YOUR_SUPABASE_PROJECT_URL/functions/v1/inbound-email';
    const SERVICE_ROLE_KEY = 'YOUR_SERVICE_ROLE_KEY'; // REQUIRED for local/admin test
    const TEST_TOKEN = 'test-token-123'; // Assign this to a profile first!

    const mockPostmarkPayload = {
        "From": "job-alerts@cityoftoronto.ca",
        "To": `navigator-${TEST_TOKEN}@inbound.navigator.work`,
        "Subject": "New Job Alert: Student Planner",
        "TextBody": "We are looking for a Student Planner to join the Transportation Services team. Responsibilities include data collection, mapping, and report writing. Apply at https://toronto.ca/jobs/planner",
        "HtmlBody": "<div>...</div>",
        "MessageID": "uuid-123"
    };

    console.log("🚀 Sending mock webhook...");

    try {
        const response = await fetch(EDGE_FUNCTION_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
            },
            body: JSON.stringify(mockPostmarkPayload)
        });

        const result = await response.json();
        console.log("✅ Response:", result);

        if (result.success) {
            console.log("\nSUCCESS! Check your Job Feed in the Navigator UI.");
        } else {
            console.error("\nFAILED:", result.error);
        }
    } catch (error) {
        console.error("\nERROR:", error);
    }
}

// testIngestion();
