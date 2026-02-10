import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Voice preset to ElevenLabs voice ID mapping
const VOICE_PRESETS: Record<string, string> = {
  "default": "JBFqnCBsd6RMkjVDRZzb",          // George
  "calm-male": "N2lVS1w4EtoT3dr4eOWO",         // Callum
  "conversational-female": "EXAVITQu4vr4xnSDxMaL", // Sarah
  "narration": "onwK4e9ZLuTAKqWW03F9",          // Daniel
};

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

    // Map voice preset to ElevenLabs voice ID
    const voiceId = VOICE_PRESETS[voicePreset] || VOICE_PRESETS["default"];

    // Map slider values (0-100) to ElevenLabs ranges
    const stabilityValue = (stability ?? 65) / 100;       // 0-1
    const styleValue = (expressiveness ?? 50) / 100;       // 0-1 (style = expressiveness)
    const speedValue = 0.7 + ((speed ?? 50) / 100) * 0.5; // 0.7-1.2

    console.log(`TTS request: voice=${voicePreset}(${voiceId}), speed=${speedValue}, stability=${stabilityValue}, style=${styleValue}, text_length=${text.length}`);

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: stabilityValue,
            similarity_boost: 0.75,
            style: styleValue,
            use_speaker_boost: true,
            speed: speedValue,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`ElevenLabs API error [${response.status}]: ${errorBody}`);
      throw new Error(`TTS API error: ${response.status}`);
    }

    const audioBuffer = await response.arrayBuffer();

    return new Response(audioBuffer, {
      headers: {
        ...corsHeaders,
        "Content-Type": "audio/mpeg",
      },
    });
  } catch (error: unknown) {
    console.error("TTS edge function error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
