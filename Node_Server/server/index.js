const OpenAI = require('openai');
const express = require('express');
const fs = require('fs');
require('dotenv').config()

const PORT = process.env.PORT || 3001;
const app = express();

// Initialize OpenAI API client
const client = new OpenAI({
    apiKey: process.env.OPEN_AI_KEY,
    dangerouslyAllowBrowser: true // This is the default and can be omitted
});


app.get("/renderEquation", async (req, res) => {
    const userInputEquation = req.query.equation;
    const latexEquation = await convertToLatex(userInputEquation);
});


async function convertToLatex(userInputEquation) {
    try {
        // Generate prompt for GPT API
        const jsonOutput = JSON.stringify({
            latexEquation: "Latex Equation",
        });

        const promptText = `
        Convert the following math equation into LaTeX format:\n${userInputEquation}

        Return in JSON format:
        ${jsonOutput}
        `;

        // Call GPT API to convert equation to LaTeX
        const response = await client.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: promptText,
                }
            ],
            temperature: 0,
            response_format: { "type": "json_object" },
        });

        const latexEquation = response.choices[0].message.content.latexEquation;
        console.log("LATEX CONVERTED EQUTION + " + latexEquation)
        return latexEquation;
    } catch (error) {
        console.error("Error converting equation to LaTeX:", error);
        throw error;
    }
}

app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});
