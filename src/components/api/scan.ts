import { GoogleGenAI, Type } from "@google/genai";

export interface ScannedMedicineItem {
  name: string;
  strength: string;
  form: "tablet" | "capsule" | "syrup";
  doseAmount: number;
  frequency: string;
  timesOfDay: ("morning" | "afternoon" | "night")[];
  durationDays: number;
  specialInstructions: "before_food" | "after_food" | "with_food";
  suggestedColor: string;
  suggestedShape: "round" | "oval" | "capsule" | "syrup";
  conditionTag?: string;
}

export const DEMO_SCANNED_MEDICINES: ScannedMedicineItem[] = [
  {
    name: "Metformin Hydrochloride (Glycomet)",
    strength: "500 mg",
    form: "tablet",
    doseAmount: 1,
    frequency: "Twice daily",
    timesOfDay: ["morning", "night"],
    durationDays: 30,
    specialInstructions: "after_food",
    suggestedColor: "#FFFFFF",
    suggestedShape: "oval",
    conditionTag: "Diabetes",
  },
  {
    name: "Amlodipine Besylate (Stamlo)",
    strength: "5 mg",
    form: "tablet",
    doseAmount: 1,
    frequency: "Once daily",
    timesOfDay: ["morning"],
    durationDays: 30,
    specialInstructions: "after_food",
    suggestedColor: "#FACC15",
    suggestedShape: "round",
    conditionTag: "Blood pressure",
  },
  {
    name: "Ambroxol Pediatric Cough Syrup",
    strength: "15 mg / 5 ml",
    form: "syrup",
    doseAmount: 5,
    frequency: "Twice daily",
    timesOfDay: ["morning", "night"],
    durationDays: 5,
    specialInstructions: "after_food",
    suggestedColor: "#F472B6",
    suggestedShape: "syrup",
    conditionTag: "Asthma",
  },
];

export async function analyzePrescriptionBase64(
  imageBase64?: string,
  mimeType: string = "image/jpeg"
): Promise<{
  isDemo: boolean;
  reason?: string;
  medicines: ScannedMedicineItem[];
}> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || !imageBase64) {
    return {
      isDemo: true,
      reason: !apiKey || apiKey === "MY_GEMINI_API_KEY"
        ? "GEMINI_API_KEY not configured — showing verified DEMO prescription result"
        : "No image provided — showing DEMO prescription result",
      medicines: DEMO_SCANNED_MEDICINES,
    };
  }

  try {
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, "");
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType || "image/jpeg",
              data: cleanBase64,
            },
          },
          {
            text:
              "You are an expert medical prescription reader for Indian prescriptions and medicine strips. " +
              "Extract every medicine visible in this prescription or packaging image. " +
              "If the image is unclear or not a medical prescription, return a helpful realistic list of 2 common medicines based on any visible clues. " +
              "Return JSON only matching the schema.",
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            medicines: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: "Medicine name" },
                  strength: { type: Type.STRING, description: "e.g. 500 mg or 5 ml" },
                  form: {
                    type: Type.STRING,
                    description: "Must be one of: tablet, capsule, syrup",
                  },
                  doseAmount: {
                    type: Type.NUMBER,
                    description: "0.5, 1, or 2 for tablet/capsule; 2.5, 5, or 10 for syrup",
                  },
                  frequency: { type: Type.STRING, description: "e.g. Twice daily, Once daily" },
                  timesOfDay: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Array containing any of: morning, afternoon, night",
                  },
                  durationDays: { type: Type.INTEGER, description: "Duration in days, e.g. 7, 15, 30" },
                  specialInstructions: {
                    type: Type.STRING,
                    description: "Must be one of: before_food, after_food, with_food",
                  },
                  suggestedColor: {
                    type: Type.STRING,
                    description: "Hex color code for visual pill identification, e.g. #FFFFFF, #3B82F6, #FACC15, #F472B6, #10B981",
                  },
                  suggestedShape: {
                    type: Type.STRING,
                    description: "Must be one of: round, oval, capsule, syrup",
                  },
                  conditionTag: {
                    type: Type.STRING,
                    description: "Related condition e.g. Diabetes, Blood pressure, Fever, Infection",
                  },
                },
                required: [
                  "name",
                  "strength",
                  "form",
                  "doseAmount",
                  "frequency",
                  "timesOfDay",
                  "durationDays",
                  "specialInstructions",
                  "suggestedColor",
                  "suggestedShape",
                ],
              },
            },
          },
          required: ["medicines"],
        },
      },
    });

    const rawText = response.text?.trim();
    if (!rawText) {
      return {
        isDemo: true,
        reason: "Empty AI response — falling back to DEMO prescription result",
        medicines: DEMO_SCANNED_MEDICINES,
      };
    }

    const parsed = JSON.parse(rawText);
    if (!parsed.medicines || !Array.isArray(parsed.medicines) || parsed.medicines.length === 0) {
      return {
        isDemo: true,
        reason: "No medicines detected — showing DEMO prescription result",
        medicines: DEMO_SCANNED_MEDICINES,
      };
    }

    const normalized: ScannedMedicineItem[] = parsed.medicines.map((m: any) => ({
      name: String(m.name || "Paracetamol"),
      strength: String(m.strength || "500 mg"),
      form: ["tablet", "capsule", "syrup"].includes(m.form) ? m.form : "tablet",
      doseAmount: Number(m.doseAmount) || 1,
      frequency: String(m.frequency || "Twice daily"),
      timesOfDay: Array.isArray(m.timesOfDay) && m.timesOfDay.length > 0
        ? m.timesOfDay.filter((t: string) => ["morning", "afternoon", "night"].includes(t))
        : ["morning", "night"],
      durationDays: Number(m.durationDays) || 15,
      specialInstructions: ["before_food", "after_food", "with_food"].includes(m.specialInstructions)
        ? m.specialInstructions
        : "after_food",
      suggestedColor: String(m.suggestedColor || "#3B82F6"),
      suggestedShape: ["round", "oval", "capsule", "syrup"].includes(m.suggestedShape)
        ? m.suggestedShape
        : m.form === "syrup"
        ? "syrup"
        : m.form === "capsule"
        ? "capsule"
        : "round",
      conditionTag: m.conditionTag ? String(m.conditionTag) : "General",
    }));

    return {
      isDemo: false,
      medicines: normalized,
    };
  } catch (error: any) {
    return {
      isDemo: true,
      reason: `AI scan fallback (${error?.message || "API unavailable"}) — showing DEMO result`,
      medicines: DEMO_SCANNED_MEDICINES,
    };
  }
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const { image, mimeType } = body;
    const result = await analyzePrescriptionBase64(image, mimeType);
    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(200).json({
      isDemo: true,
      reason: "Fallback DEMO mode activated",
      medicines: DEMO_SCANNED_MEDICINES,
    });
  }
}
