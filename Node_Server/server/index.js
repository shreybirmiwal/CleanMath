const express = require("express");
const mjAPI = require("mathjax-node-sre");
const fs = require("fs");
const { exec } = require("child_process");

const PORT = process.env.PORT || 3001;
const app = express();

// Configure MathJax
mjAPI.config({
    MathJax: {
        SVG: { font: "TeX" }
    }
});
mjAPI.start();

// Route to render equation and return PNG image
app.get("/renderEquation", async (req, res) => {
    // Get the equation from the query parameter
    const equation = req.query.equation;

    // Process the equation using MathJax
    mjAPI.typeset({
        math: equation,
        format: "TeX",
        png: true,
        scale: 1,
        ex: 6,
        width: 100,
        linebreaks: true,
        timeout: 20 * 1000
    }, async (result) => {
        if (!result.errors) {
            // Ensure result.png is defined
            if (!result.png) {
                console.error("MathJax Error: No PNG data returned");
                console.log(result)
                return res.status(500).json({ error: "Error rendering equation: No PNG data returned" });
            }

            // Write the PNG image to a file
            const fileName = `equation_${Date.now()}.png`;
            const filePath = `${__dirname}/${fileName}`;
            fs.writeFileSync(filePath, Buffer.from(result.png.replace('data:image/png;base64,', ''), 'base64'));

            // Send the PNG image as response
            res.sendFile(filePath, (err) => {
                // Delete the file after sending
                fs.unlinkSync(filePath);
            });
        } else {
            console.error("MathJax Errors:", result.errors);
            res.status(500).json({ error: "Error rendering equation", details: result.errors });
        }
    });
});



app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});
