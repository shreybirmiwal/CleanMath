const express = require('express');
const fs = require('fs');
const OpenAI = require('openAI');
const mathjax = require('mathjax-node');
const admin = require('firebase-admin');

require('dotenv').config();

const PORT = process.env.PORT || 3001;
const app = express();

// Initialize OpenAI API client
const client = new OpenAI({
    apiKey: process.env.OPEN_AI_KEY,
    dangerouslyAllowBrowser: true, // This is the default and can be omitted
});

// Initialize Firebase app
admin.initializeApp({
    apiKey: "AIzaSyBwrS8GbmfMdJBo7UEkMBX5VKwqegUhN10",
    authDomain: "cleanmath-388dd.firebaseapp.com",
    projectId: "cleanmath-388dd",
    storageBucket: "cleanmath-388dd.appspot.com",
    messagingSenderId: "386540317866",
    appId: "1:386540317866:web:dbfaeb926364731885f4d3"
});

const bucket = admin.storage().bucket();

async function convertToLatex(userInputEquation) {

    var latexEquation = `0`;
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
        client.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: promptText,
                },
            ],
            temperature: 0,
            response_format: { "type": "json_object" },
        }).then((data) => {
            const response = JSON.parse(data.choices[0].message.content);
            console.log("response STRINGIFIED " + JSON.stringify(data.choices[0].message.content))
            console.log("latex:", response.latexEquation);
            latexEquation = response.latexEquation;
            return latexEquation;

        });

    } catch (error) {
        console.error("Error converting equation to LaTeX:", error);
        throw error;
    }
}

app.get("/renderEquation", async (req, res) => {
    const userInputEquation = req.query.equation;
    try {
        const { latex } = await convertToLatex(userInputEquation);

        res.json({ latex, downloadURL });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error converting and storing equation");
    }
});

app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});
