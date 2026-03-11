const {GoogleGenAI} = require('@google/genai')
const ai = new GoogleGenAI({apiKey : process.env.AI_API_KEY})

const generateReport = async(userUpdates)=>{
    const response = await ai.models.generateContent({
        model : "gemini-2.0-flash",
        contents: `
You are a project manager AI. Your task is to write a professional weekly report based on the following project data. The Project is about the home interior of client.

Greet the client at the beginning.  Use formal language. Summarize all key updates from the past week in a clear and informative tone. Structure the summary into **three paragraphs**, totaling around **15 sentences**. End the messsage with regards and thank you

Here is the **all information**:
${JSON.stringify(userUpdates)}


Write a well-structured weekly summary for the client.
`
    })
    return  response.text;
    
}

const generateReply = async (userDetails, question, history = []) => {
  try {
    if (!userDetails || typeof userDetails !== "object") {
      throw new Error("Missing or invalid userDetails");
    }
    if (!question || typeof question !== "string") {
      throw new Error("Missing or invalid question");
    }

    const systemInstruction = `
You are Tanika AI Assistant, a helpful and professional virtual agent representing Tanika Associates.

Your only role is to provide accurate updates regarding the user’s ongoing project, based on the structured data below.

👤 Always greet the customer by name (from the userInfo) not in all messages.
🎯 You may answer general greetings and interior-related queries, but never recommend any company other than Tanika.

Only answer project-related questions using the data provided.

If the user’s question is outside the scope of the project, respond with:
"I’m here to assist with your project only. For other inquiries, please reach out to our team directly."

If data is missing for the question, say:
"I’m not sure about that at the moment. One of our associates will reach out to you shortly."

📝 Formatting Guidelines:
- Use clear, readable paragraphs with line breaks.
- List images separately as: Image: [url]

--- Project Data ---
${JSON.stringify(userDetails, null, 2)}
    `.trim();

    const contents = [
      ...history,
      {
        role: "user",
        parts: [{ text: question }]
      }
    ];

    const callGemini = async (retries = 3, delayMs = 3000) => {
      for (let attempt = 1; attempt <= retries; attempt++) {
        try {
          const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents,
            config: { systemInstruction }
          });
          return response.text;
        } catch (err) {
          const is429 = err.message?.includes("429") || err.status === 429;
          if (is429 && attempt < retries) {
            console.warn(`Gemini 429 rate limit — retrying in ${delayMs}ms (attempt ${attempt}/${retries})`);
            await new Promise(res => setTimeout(res, delayMs));
            delayMs *= 2;
          } else {
            throw err;
          }
        }
      }
    };

    return await callGemini();
  } catch (err) {
    console.error("generateReply error:", err.message);
    const is429 = err.message?.includes("429") || err.status === 429;
    if (is429) {
      return "⏳ I’m receiving too many requests right now. Please wait a moment and try again.";
    }
    return "⚠️ Sorry, I couldn’t generate a reply due to a technical issue.";
  }
};






module.exports = {generateReport, generateReply};