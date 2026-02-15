import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Each preset maps to a DISTINCT Google Translate TTS voice identity
// using different language/locale codes to produce genuinely different speaker characteristics.
// Male presets use slow=true for a deeper, more measured baseline.
const VOICE_PRESETS: Record<string, { lang: string; slow: boolean; pitchBaseline: number }> = {
  "oliver":    { lang: "en-gb", slow: true,  pitchBaseline: -4 },  // British English — deep adult male
  "james":     { lang: "en-us", slow: true,  pitchBaseline: -2 },  // American English — calm male narration
  "amelia":    { lang: "en-au", slow: false, pitchBaseline: 2  },  // Australian English — warm female
  "charlotte": { lang: "en-in", slow: false, pitchBaseline: 3  },  // Indian English — expressive female
  "william":   { lang: "en-za", slow: true,  pitchBaseline: -3 },  // South African English — neutral male narrator
};

// Text normalization for better pronunciation
function normalizeText(text: string): string {
  let t = text;

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

  t = t.replace(/\s+/g, " ").trim();
  t = t.replace(/\s*[—–]\s*/g, ", ");
  t = t.replace(/;\s*/g, ", ");
  t = t.replace(/([a-zA-Z])\s*\n\s*([A-Z])/g, "$1. $2");

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

  return t;
}

// Split text into chunks of max ~180 chars at sentence/clause boundaries
function splitText(text: string, maxLen = 180): string[] {
  const chunks: string[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    if (remaining.length <= maxLen) {
      chunks.push(remaining.trim());
      break;
    }

    let splitAt = -1;
    for (let i = maxLen; i >= maxLen / 2; i--) {
      const ch = remaining[i];
      if (ch === '.' || ch === ',' || ch === '!' || ch === '?' || ch === ';' || ch === ':') {
        splitAt = i + 1;
        break;
      }
    }
    if (splitAt === -1) {
      for (let i = maxLen; i >= maxLen / 2; i--) {
        if (remaining[i] === ' ') {
          splitAt = i;
          break;
        }
      }
    }
    if (splitAt === -1) splitAt = maxLen;

    chunks.push(remaining.slice(0, splitAt).trim());
    remaining = remaining.slice(splitAt).trim();
  }

  return chunks.filter(c => c.length > 0);
}

async function fetchTTSChunk(text: string, lang: string, slow: boolean): Promise<ArrayBuffer> {
  const params = new URLSearchParams({
    ie: "UTF-8",
    q: text,
    tl: lang,
    client: "tw-ob",
    ttsspeed: slow ? "0.24" : "1",
  });

  const url = `https://translate.google.com/translate_tts?${params.toString()}`;

  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
      "Referer": "https://translate.google.com/",
    },
  });

  if (!response.ok) {
    throw new Error(`TTS chunk failed (${response.status})`);
  }

  return response.arrayBuffer();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, voicePreset, speed } = await req.json();

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return new Response(JSON.stringify({ error: "Text is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const preset = VOICE_PRESETS[voicePreset] || VOICE_PRESETS["william"];
    const processedText = normalizeText(text);
    const isSlow = preset.slow || (speed !== undefined && speed < 30);

    console.log(`TTS: voice=${voicePreset}, lang=${preset.lang}, slow=${isSlow}, pitchBaseline=${preset.pitchBaseline}, chars=${processedText.length}`);

    const chunks = splitText(processedText);
    console.log(`TTS: split into ${chunks.length} chunks`);

    const audioBuffers: ArrayBuffer[] = [];
    for (const chunk of chunks) {
      const buf = await fetchTTSChunk(chunk, preset.lang, isSlow);
      audioBuffers.push(buf);
    }

    // Concatenate MP3 chunks
    const totalLength = audioBuffers.reduce((sum, b) => sum + b.byteLength, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;
    for (const buf of audioBuffers) {
      result.set(new Uint8Array(buf), offset);
      offset += buf.byteLength;
    }

    console.log(`TTS: generated ${result.length} bytes`);

    return new Response(result, {
      headers: {
        ...corsHeaders,
        "Content-Type": "audio/mpeg",
        "X-Pitch-Baseline": String(preset.pitchBaseline),
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
