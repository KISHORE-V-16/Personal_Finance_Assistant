const fs = require("fs");
const Tesseract = require("tesseract.js");
const pdfParse = require("pdf-parse");

const processReceipt = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    let text;
    if (req.file.mimetype === "application/pdf") {
      const dataBuffer = fs.readFileSync(req.file.path);
      const data = await pdfParse(dataBuffer);
      text = data.text;
    } else {
      const result = await Tesseract.recognize(req.file.path, "eng");
      text = result.data.text;
    }

    fs.unlinkSync(req.file.path); // cleanup

    // Naive parsing (amount, merchant, category detection etc.)
    res.json({ rawText: text });
  } catch (err) {
    res.status(500).json({ error: "Failed to process receipt" });
  }
};

module.exports = {processReceipt};
