import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// 6 high-quality voice presets
const VOICE_PRESETS: Record<string, string> = {
  "calm-male": "N2lVS1w4EtoT3dr4eOWO",           // Callum
  "conversational-male": "cjVigY5qzO86Huf0OWal",  // Eric
  "calm-female": "FGY2WhTYpPnrIDTdsKH5",          // Laura
  "conversational-female": "EXAVITQu4vr4xnSDxMaL", // Sarah
  "narration": "onwK4e9ZLuTAKqWW03F9",             // Daniel
  "neutral-studio": "Xb7hH8MSUJpSbSDYk0k2",       // Alice
};

// Text normalization for better pronunciation
function normalizeText(text: string): string {
  let t = text;

  // Expand common abbreviations
  const abbreviations: Record<string, string> = {
    "Dr.": "Doctor", "Mr.": "Mister", "Mrs.": "Missus", "Ms.": "Miss",
    "Prof.": "Professor", "Jr.": "Junior", "Sr.": "Senior",
    "St.": "Saint", "Ave.": "Avenue", "Blvd.": "Boulevard",
    "vs.": "versus", "etc.": "et cetera", "approx.": "approximately",
    "dept.": "department", "govt.": "government", "e.g.": "for example",
    "i.e.": "that is", "Fig.": "Figure", "No.": "Number",
  };
  for (const [abbr, full] of Object.entries(abbreviations)) {
    t = t.replaceAll(abbr, full);
  }

  // Normalize whitespace
  t = t.replace(/\s+/g, " ").trim();

  // Add natural pauses: em-dash, semicolons → comma for prosody
  t = t.replace(/\s*[—–]\s*/g, ", ");
  t = t.replace(/;\s*/g, ", ");

  // Ensure sentences end with proper punctuation for prosody boundaries
  t = t.replace(/([a-zA-Z])\s*\n\s*([A-Z])/g, "$1. $2");

  // Convert standalone numbers to spoken form for short numbers
  t = t.replace(/\b(\d+)\b/g, (match) => {
    const n = parseInt(match, 10);
    if (n >= 0 && n <= 20) {
      const words = [
        "zero","one","two","three","four","five","six","seven","eight","nine",
        "ten","eleven","twelve","thirteen","fourteen","fifteen","sixteen",
        "seventeen","eighteen","nineteen","twenty"
      ];
      return words[n];
    }
    return match;
  });

  // Add breathing pauses at long sentences (insert ellipsis before commas in long clauses)
  // This helps the model produce more natural-sounding speech
  t = t.replace(/,/g, ",...");

  return t;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
    if (!ELEVENLABS_API_KEY) {
      throw new Error("ELEVENLABS_API_KEY is not configured");
    }

    const { text, voicePreset, speed, stability, expressiveness } = await req.json();

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return new Response(JSON.stringify({ error: "Text is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const voiceId = VOICE_PRESETS[voicePreset] || VOICE_PRESETS["neutral-studio"];

    // Normalize text for better pronunciation
    const processedText = normalizeText(text);

    // Map slider values (0-100) to model parameter ranges
    const stabilityValue = (stability ?? 70) / 100;
    const styleValue = (expressiveness ?? 40) / 100;
    const speedValue = 0.7 + ((speed ?? 50) / 100) * 0.5; // 0.7 - 1.2

    console.log(`TTS: voice=${voicePreset}, speed=${speedValue.toFixed(2)}, stability=${stabilityValue.toFixed(2)}, style=${styleValue.toFixed(2)}, chars=${processedText.length}`);

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: processedText,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: stabilityValue,
            similarity_boost: 0.8,
            style: styleValue,
            use_speaker_boost: true,
            speed: speedValue,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`TTS API error [${response.status}]: ${errorBody}`);
      throw new Error(`Voice synthesis failed (${response.status})`);
    }

    const audioBuffer = await response.arrayBuffer();

    return new Response(audioBuffer, {
      headers: {
        ...corsHeaders,
        "Content-Type": "audio/mpeg",
      },
    });
  } catch (error: unknown) {
    console.error("TTS error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
