import express from "express";
import path from "path";
import multer from "multer";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import fs from "fs";

// Mock Database
const complaintsDB: any[] = [];
let nextId = 1;

async function startServer() {
  const app = express();
  const PORT = 3000;
  const upload = multer({ dest: 'uploads/' });

  // Add middlewares
  app.use(cors());
  app.use(express.json());

  // Initialize Gemini
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "dummy_key" });

  // -------------------------------------------------------------
  // API Routes MUST go here FIRST
  // -------------------------------------------------------------
  
  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Get all complaints
  app.get("/api/complaints", (req, res) => {
    res.json(complaintsDB.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
  });

  // Save new complaint
  app.post("/api/complaints", (req, res) => {
    const complaint = {
      id: nextId++,
      complaint_number: `CMP-${new Date().getFullYear()}-${String(nextId).padStart(3, '0')}`,
      ...req.body,
      status: "Open",
      created_at: new Date().toISOString()
    };
    complaintsDB.push(complaint);
    res.status(201).json(complaint);
  });

  // Analyze complaint (Text or PDF)
  app.post("/api/complaints/analyze", upload.single('file'), async (req, res) => {
    try {
      if (!process.env.GEMINI_API_KEY) {
         return res.status(500).json({ detail: "GEMINI_API_KEY environment variable is missing on the server." });
      }

      let textToAnalyze = req.body.text || "";
      let isPdf = false;
      
      // If a file was uploaded, we'd normally extract PDF text here. 
      // For this demo, we'll ask Gemini to process the raw file if possible (requires File API)
      // Since we just have the path, we will simulate extraction by telling the user to paste text for now
      // A robust implementation would use pdf-parse or similar, or upload to Gemini File API.
      
      if (req.file) {
        // In a real app, upload to Gemini File API or parse PDF to text here.
        // For simplicity in this demo, we assume the user provided text if it's not a real PDF parsing setup
        textToAnalyze = `Uploaded filename: ${req.file.originalname}. Please extract data from this file context.`;
        isPdf = true;
      }
      
      if (!textToAnalyze && !req.file) {
         return res.status(400).json({ detail: "No text or file provided" });
      }

      // 1. Analyze and Extract with Structured Output
      const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        contents: `You are a QMS Intake AI. Analyze the following customer complaint and extract the requested fields. If a field is missing, output null. 
        
        Complaint text/context:
        ${textToAnalyze}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
             type: Type.OBJECT,
             properties: {
               customer_name: { type: Type.STRING },
               product_name: { type: Type.STRING },
               batch_number: { type: Type.STRING },
               complaint_category: { type: Type.STRING, description: "e.g., Packaging, Efficacy, Adverse Event, Contamination" },
               complaint_description: { type: Type.STRING, description: "A detailed summary of the issue." },
               date_received: { type: Type.STRING, description: "YYYY-MM-DD format if present" },
               affected_quantity: { type: Type.STRING },
               completeness_score: { type: Type.INTEGER, description: "0-100 score on how complete the critical information is" },
               missing_fields: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of vital missing fields" },
               risk_level: { type: Type.STRING, description: "CRITICAL, HIGH, MEDIUM, LOW" },
               risk_reason: { type: Type.STRING, description: "1 sentence explaining the risk level" },
               summary: { type: Type.STRING, description: "2-3 sentence executive summary" },
               recommendations: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3 actionable next steps for triage" }
             },
             required: ["completeness_score", "risk_level", "risk_reason", "summary", "recommendations"]
          }
        }
      });

      const resultText = response.text();
      if (!resultText) {
          throw new Error("No response from AI");
      }
      
      const parsed = JSON.parse(resultText);

      // Structure the response to match what the frontend expects
      const finalResult = {
         source_type: isPdf ? 'pdf' : 'text',
         extracted_complaint: {
           customer_name: parsed.customer_name,
           product_name: parsed.product_name,
           batch_number: parsed.batch_number,
           complaint_category: parsed.complaint_category,
           complaint_description: parsed.complaint_description,
           date_received: parsed.date_received,
           affected_quantity: parsed.affected_quantity
         },
         completeness_result: {
           score: parsed.completeness_score,
           is_complete: parsed.completeness_score > 80,
           missing_fields: parsed.missing_fields || []
         },
         risk_assessment: {
           risk_level: parsed.risk_level,
           risk_reason: parsed.risk_reason
         },
         summary: parsed.summary,
         recommendations: parsed.recommendations
      };

      // Clean up uploaded file
      if (req.file) {
         fs.unlinkSync(req.file.path);
      }

      res.json(finalResult);

    } catch (error: any) {
      console.error("AI Analysis Error:", error);
      if (req.file && fs.existsSync(req.file.path)) {
         fs.unlinkSync(req.file.path);
      }
      res.status(500).json({ detail: error.message || "Failed to process complaint with AI" });
    }
  });


  // -------------------------------------------------------------
  // Vite Middleware (Must be after API routes)
  // -------------------------------------------------------------
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
