import { GoogleGenerativeAI } from "@google/generative-ai";

const gemini = async (prompt: string) => {
    try {
        const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY || "");
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        // console.log("model");
        
        const result = await model.generateContent(prompt);
        const response = result.response;
        let text = response.text();
        console.log(text, "text");
        
        // Hapus markdown formatting (```json, ```text, dll) sebelum parsing
        text = text.replace(/^```json\s*/i, '')  // Hapus ```json di awal
                   .replace(/\s*```(\s*text)?\s*$/i, '')  // Hapus ``` atau ```text di akhir
                   .replace(/`/g, '')  // Hapus backtick lain
                   .trim();  // Hapus whitespace di awal dan akhir
        
        text = JSON.parse(text);

        console.log(text, "text");

        if (typeof text === "string") {
            throw new Error("Failed to get project recommendations");
        }
        
        return text;
    } catch (error) {
        throw new Error(error instanceof Error ? error.message : "Failed to get project recommendations");
    }
};

export default gemini;