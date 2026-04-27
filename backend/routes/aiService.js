// backend/services/aiService.js

const AI_SERVICE_URL = process.env.AI_SERVICE_URL;

if (!AI_SERVICE_URL) {
  console.error("❌ Missing AI_SERVICE_URL in environment variables");
}

export const callAIService = async (payload) => {
  try {
    const response = await fetch(`${AI_SERVICE_URL}/detect`, {   // ← Change this if your AI endpoint is different
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`AI Service Error: ${response.status} - ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("AI Service call failed:", error.message);
    throw new Error("Failed to connect to AI service. Please try again.");
  }
};