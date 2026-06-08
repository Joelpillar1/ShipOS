import { getUserProfile } from "./postStorage";
import { supabase } from "./supabase";

// ─── Utility helpers ─────────────────────────────────────────────────────────

const cleanThinkTags = (text: string): string => {
  if (!text) return "";
  return text
    .replace(/<think>[\s\S]*?<\/think>/g, "")
    .replace(/<\/?think>/g, "")
    .trim();
};

const decodeHtmlEntities = (str: string): string => {
  if (!str) return "";
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x0027;/g, "'")
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"')
    .replace(/&lsquo;/g, "'")
    .replace(/&rsquo;/g, "'");
};

// ─── Core AI call (Supabase Edge Function only) ───────────────────────────────

const callAI = async (params: {
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>;
  temperature?: number;
  max_tokens?: number;
}) => {
  if (!supabase) {
    throw new Error("Supabase client is not initialised. Cannot call AI.");
  }

  const invokePromise = supabase.functions.invoke("openai", {
    body: {
      messages: params.messages,
      temperature: params.temperature ?? 0.7,
      max_tokens: params.max_tokens,
    },
  });

  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("AI request timed out after 30s")), 30000)
  );

  const { data, error } = (await Promise.race([
    invokePromise,
    timeoutPromise,
  ])) as any;

  if (error) {
    // For non-2xx responses (e.g. 402 out-of-credits, 403 Free plan) supabase-js wraps the
    // body in error.context (a Response). Surface the server's human-readable message.
    let serverMessage: string | undefined;
    try {
      const ctx = (error as any)?.context;
      if (ctx && typeof ctx.json === "function") {
        const body = await ctx.json();
        serverMessage = body?.error || body?.message;
      }
    } catch {
      /* fall through to generic message */
    }
    throw new Error(serverMessage || error.message || JSON.stringify(error));
  }

  return data;
};

// ─── Credit-gated wrapper ─────────────────────────────────────────────────────

const callAIWithCreditCheck = async (params: {
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>;
  temperature?: number;
  max_tokens?: number;
}) => {
  const profile = await getUserProfile();
  if (!profile) {
    throw new Error("User profile not found. Please log in or refresh.");
  }

  const plan = (profile.plan || "Free").toLowerCase();
  if (plan === "free") {
    throw new Error(
      "AI features are only available to subscribed users. Please upgrade your plan in Settings to use the AI."
    );
  }

  const isPro = plan === "pro";
  // Soft pre-check for instant UX only — the openai edge function is the authoritative
  // gate (it atomically reserves a credit and rejects when none remain).
  if (!isPro && (profile.aiCredits === undefined || profile.aiCredits <= 0)) {
    throw new Error(
      "You have run out of AI credits. Please upgrade your plan in Settings to get more credits."
    );
  }

  // The edge function checks the plan, atomically decrements the credit server-side, and
  // returns the authoritative remaining balance. We do NOT decrement on the client (that
  // write is blocked by the DB trigger anyway).
  const response = await callAI(params);

  if (!isPro && typeof response?.credits_remaining === "number") {
    // Reflect the server's balance in the UI immediately (components listen for this event).
    const updated = { ...profile, aiCredits: response.credits_remaining };
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("shipos_profile_updated", { detail: updated }));
    }
  }

  return response;
};

// ─── System prompts ───────────────────────────────────────────────────────────

const SHIPOS_SYSTEM_PROMPT = `
You are a professional social media content writer for ShipOS.

Your job is to write clean, clear, publish-ready social media 
posts that sound like a real human wrote them.

STRICT RULES — NEVER BREAK THESE:

1. NO AI BUZZWORDS
Never use these words or anything like them:
- delve, dive deep, unleash, game-changer, 
- groundbreaking, revolutionize, transform,
- leverage, utilize, empower, foster,
- navigate, landscape, ecosystem,
- cutting-edge, state-of-the-art, next-level,
- robust, seamless, scalable, synergy,
- it's worth noting, it's important to note,
- in today's world, in today's fast-paced world,
- as an AI language model, certainly, absolutely,
- I hope this helps, feel free to

2. NO BIG GRAMMAR OR COMPLEX WORDS
Write the way a smart person talks to a friend.
If a simpler word exists — use it.
- Not "demonstrate" → use "show"
- Not "utilize" → use "use"
- Not "commence" → use "start"
- Not "endeavor" → use "try"
- Not "facilitate" → use "help"
- Not "consequently" → use "so"
- Not "furthermore" → use "also"
- Not "nevertheless" → use "but"
- Not "subsequently" → use "then"
- Not "paramount" → use "important"

3. NO EMOJIS
Do not use any emojis anywhere in the post.
Not at the start. Not at the end. Not in the middle.
No exceptions.

4. NO EM-DASHES
Never use — in any post.
If you need a pause, use a comma or a period instead.

5. NO HASHTAGS UNLESS ASKED
Do not add hashtags unless the user specifically 
requests them.

6. NO FILLER SENTENCES
Every sentence must earn its place.
Cut anything that does not add meaning.
No throat-clearing. No sign-offs. No "I hope you 
found this valuable." Just the content.

7. NO PASSIVE VOICE
Write in active voice always.
- Not "mistakes were made" → "I made mistakes"
- Not "results can be seen" → "you can see results"
- Not "it has been found" → "research found"

8. SHORT SENTENCES
Keep most sentences under 15 words.
Mix short and medium sentences for rhythm.
Never write a sentence that runs more than 25 words.

9. NO FLUFF OPENINGS
Never start a post with:
- "In today's..."
- "Have you ever wondered..."
- "Are you struggling with..."
- "Let me tell you about..."
- "I want to talk about..."
- "So I was thinking..."
- "This is a reminder that..."

Start with the most interesting part immediately.

10. WRITE FOR HUMANS
Read the post back as if you are the reader,
not the writer. Ask: would a real person say this?
If no, rewrite it until yes.

11. STRICT CONVERSATIONAL BREAKS
Never write a wall of text.
Every 1 to 2 sentences gets its own paragraph.
Always use double line breaks between paragraphs to create breathing room.
A paragraph should never contain more than 2 sentences.
The post must be easy to scan and read like a conversational flow of thoughts.

OUTPUT FORMAT:
- Return only the post content
- No labels like "Here is your post:" 
- No explanations before or after
- No quotation marks around the post
- Just the clean post, ready to copy and publish

PLATFORM AWARENESS:
When writing for each platform, match its natural style:

GENERAL LENGTH RULE:
By default, the generated post must be between 400 and 800 characters long. Do NOT output fewer than 400 characters and do NOT output more than 800 characters. Aim for 500 to 700 characters as the sweet spot. Keep the output rich, detailed, and high-value, but strictly follow the conversational line breaking rule (every 1-2 sentences gets its own paragraph). This rule applies to all platforms and global posts, except when specifically writing a single post for X (Twitter) under the 280 limit (in which case it must be 240-270 characters as specified below).


LinkedIn: Professional but personal. First person. 
Paragraph form or short punchy lines. 
No bullet overload. Conversational authority.

X (Twitter): Short and direct. One strong idea per post.
Every word counts. Punchy. Sometimes provocative.
Under 280 characters unless it's a thread. If it is a single post under the 280 limit, the content MUST strictly be between 240 and 270 characters. Never write less than 240 characters. Never write more than 270 characters. Keep it within this strict character count range.

Instagram: Vivid and relatable. Story-driven or 
insight-driven. Speaks to a feeling or experience.

TikTok: Hook in the first line. Casual, direct, 
energetic. Reads like someone talking, not writing.

YouTube: Can be longer. Informative. Structured.
Clear value from the first sentence.
`;

const LINKEDIN_RULES = `
LINKEDIN SPECIFIC RULES:

LENGTH:
LinkedIn posts perform best between 150 and 500 words.
Do not write less than 100 words for LinkedIn.
Do not write more than 500 words unless the story
genuinely needs it.

STRUCTURE:
Always use white space between sections.
Every 1-2 sentences gets its own paragraph.
Never write a wall of text.
Use line breaks to create breathing room.
The post should be easy to scan before it is read.

OPENING LINE:
The first line is everything on LinkedIn.
It must stop someone mid-scroll.
It should be one sentence.
It should create tension, curiosity, or surprise.
Never start with context. Start with the point.

Good LinkedIn openers:
- A bold statement: "Most advice about X is wrong."
- A confession: "I made the same mistake three years in a row."
- A surprising fact: "We lost 40% of our users in one week."
- A short story start: "My manager called me into a room and closed the door."
- A direct challenge: "You are working hard on the wrong thing."

Bad LinkedIn openers:
- "I wanted to share something with you today."
- "In today's competitive landscape..."
- "As a professional with X years of experience..."
- "I am excited to announce..."

TONE:
First person always.
Write like you are talking to one specific person.
Authoritative but not arrogant.
Honest and direct.
Share real observations, not generic advice.

FORMATTING:
No bullet points unless the post is explicitly a list.
No bold text.
No headers.
Just clean paragraphs with white space between them.

CLOSING:
End with something of these type:
- A single takeaway line
- A question that invites genuine response
- A short challenge or call to action
Never end with "What do you think?" alone.
Make the closing question specific and interesting.

WHAT MAKES LINKEDIN POSTS PERFORM:
- Specificity beats generality every time
- Personal experience beats generic advice
- Vulnerability beats perfection
- One clear idea beats ten scattered ones
- The post should feel like something the 
  writer actually lived, not researched
`;

const EXAMPLES = `
EXAMPLES OF BAD OUTPUT (never write like this):

BAD: "In today's fast-paced world, it's paramount 
that we leverage our unique skill sets to navigate 
the ever-changing landscape of personal development. 
Let's dive deep into how you can unleash your true 
potential and foster meaningful growth in your life."

BAD: "Are you struggling to find your purpose? 
It's worth noting that many people face this 
challenge. Nevertheless, with the right mindset, 
you can commence your journey toward self-discovery 
and subsequently transform your life. 🚀✨"

BAD: "Delving into the realm of productivity, 
it becomes evident that leveraging cutting-edge 
strategies can revolutionize your workflow and 
facilitate seamless collaboration within your 
ecosystem. As an AI language model, I hope this 
helps! Feel free to reach out."

─────────────────────────────────────

GOOD OUTPUT (always write like this):

GOOD (LinkedIn):
"I spent three years chasing the wrong goals.

Not because I was lazy. Because I never stopped 
to ask if the goals were actually mine.

The day I did, everything changed.

Most people optimize for speed before they 
clarify direction. Then they wonder why they 
feel busy but stuck.

Before you plan the next quarter, ask one 
question: whose definition of success am I 
working toward?"

GOOD (X):
"Busy is not the same as productive.

One fills your day.
The other moves your life forward.

Know the difference."

GOOD (Instagram):
"Three months ago I almost quit.

Not because the work was hard.
Because I could not see if it was working.

Then I stopped checking daily and started 
checking monthly.

The progress was there all along.
I just could not see it through the noise."

GOOD (TikTok):
"Nobody tells you this about waking up early.

The first week is awful.
The second week is fine.
The third week you start protecting it.

By month two it's the part of your day 
you guard the hardest.

That's how habits actually work."
`;

export const X_BASIC_SHORTEN_RULE = `
CRITICAL X (TWITTER) SINGLE POST LIMITS:
- Your response MUST be extremely brief.
- It MUST strictly be between 35 and 45 words long.
- It MUST NOT exceed 270 characters under any circumstances.
- Write exactly 2 to 3 sentences maximum.
- You must count the words yourself. If it is longer than 45 words or 270 characters, shorten it.
- Absolutely NO introductory text, no quotes, and no formatting. Output only the plain text of the post.
`;

export const THREADS_PLATFORM_RULE = `
CRITICAL THREADS PLATFORM CONTENT LENGTH RULE:
- Your response MUST strictly be between 70 and 80 words long.
- It MUST NOT exceed 480 characters under any circumstances.
- Write exactly 3 to 5 sentences maximum.
- You must count the words yourself. If it is longer than 80 words or 480 characters, shorten it.
- Return ONLY the post content. No introductory text, no explanations, no quotes.
`;

export const BLUESKY_PLATFORM_RULE = `
CRITICAL BLUESKY PLATFORM CONTENT LENGTH RULE:
- Your response MUST strictly be between 40 and 50 words long.
- It MUST NOT exceed 290 characters under any circumstances.
- Write exactly 2 to 3 sentences maximum.
- You must count the words yourself. If it is longer than 50 words or 290 characters, shorten it.
- Return ONLY the post content. No introductory text, no explanations, no quotes.
`;

export const GLOBAL_PLATFORM_RULE = `
CRITICAL GLOBAL CONTENT LENGTH RULE:
- Your response MUST strictly be between 70 and 120 words long.
- It MUST NOT exceed 800 characters under any circumstances.
- Every paragraph MUST have 1 to 2 sentences maximum, with double line breaks between paragraphs, to follow the conversational style rule.
- You must count the words yourself. If it is longer than 120 words or 800 characters, shorten it.
- Return ONLY the post content. No introductory text, no explanations, no quotes.
`;

// ─── Public helpers ───────────────────────────────────────────────────────────

export const getLimitSuffix = (platform: string) => {
  const lowerPlatform = platform.toLowerCase();
  if (lowerPlatform === "x (twitter)" || lowerPlatform === "x") {
    return " IMPORTANT: The final output MUST strictly be between 35 and 45 words long, and under 270 characters. Do NOT output more than 45 words or 270 characters.";
  } else if (lowerPlatform === "x premium") {
    return " IMPORTANT: The final output MUST strictly be between 70 and 120 words long, and under 800 characters. Do NOT output more than 120 words or 800 characters.";
  } else if (lowerPlatform === "bluesky") {
    return " IMPORTANT: The final output MUST strictly be between 40 and 50 words long, and under 290 characters. Do NOT output more than 50 words or 290 characters.";
  } else if (lowerPlatform === "threads") {
    return " IMPORTANT: The final output MUST strictly be between 70 and 80 words long, and under 480 characters. Do NOT output more than 80 words or 480 characters.";
  } else if (lowerPlatform === "global") {
    return " IMPORTANT: The final output MUST strictly be between 70 and 120 words long, and under 800 characters. Do NOT output more than 120 words or 800 characters.";
  }
  return "";
};

export const getSystemContent = (platform: string) => {
  let rule = "";
  const lowerPlatform = platform.toLowerCase();
  if (lowerPlatform === "x (twitter)" || lowerPlatform === "x") {
    rule = X_BASIC_SHORTEN_RULE;
  } else if (lowerPlatform === "x premium") {
    rule = GLOBAL_PLATFORM_RULE;
  } else if (lowerPlatform === "bluesky") {
    rule = BLUESKY_PLATFORM_RULE;
  } else if (lowerPlatform === "threads") {
    rule = THREADS_PLATFORM_RULE;
  } else if (lowerPlatform === "global") {
    rule = GLOBAL_PLATFORM_RULE;
  }
  return (
    SHIPOS_SYSTEM_PROMPT +
    "\n\n" +
    LINKEDIN_RULES +
    "\n\n" +
    EXAMPLES +
    (rule ? "\n\n" + rule : "")
  );
};

// ─── Exported AI functions ────────────────────────────────────────────────────

export const generateGroqIdeas = async (
  topic: string,
  isThread: boolean,
  platform: string = "Global",
  tone: string = "Casual"
) => {
  const prompt = isThread
    ? `Platform: ${platform}\nTone: ${tone}\nGenerate 3-5 separate posts forming a continuous thread about: ${topic}\n\nSeparate each post with exactly this divider:\n---POST---\n\nThe first post should hook the reader, and the last post should wrap up. Do NOT use the word 'Thread' or label them. Just use the divider.`
    : `Platform: ${platform}\nTone: ${tone}\nWrite a single, highly engaging social media post about: ${topic}.${
        platform === "Global"
          ? " IMPORTANT: The post MUST strictly be between 400 and 800 characters long. Do NOT make it shorter than 400 or longer than 800 characters."
          : ""
      }`;

  const systemContent =
    platform === "X (Twitter)" && !isThread
      ? SHIPOS_SYSTEM_PROMPT + "\n\n" + LINKEDIN_RULES + "\n\n" + EXAMPLES + "\n\n" + X_BASIC_SHORTEN_RULE
      : platform === "Global" && !isThread
      ? SHIPOS_SYSTEM_PROMPT + "\n\n" + LINKEDIN_RULES + "\n\n" + EXAMPLES + "\n\n" + GLOBAL_PLATFORM_RULE
      : SHIPOS_SYSTEM_PROMPT + "\n\n" + LINKEDIN_RULES + "\n\n" + EXAMPLES;

  const response = await callAIWithCreditCheck({
    messages: [
      { role: "system", content: systemContent },
      { role: "user", content: prompt },
    ],
    temperature: 0.7,
    max_tokens: 2000,
  });

  const content = decodeHtmlEntities(
    cleanThinkTags(response.choices[0]?.message?.content || "")
  );

  if (isThread) {
    const dividerRegex = /---\s*post\s*---/gi;
    if (dividerRegex.test(content)) {
      return content
        .split(dividerRegex)
        .map((post: string) => post.trim())
        .filter((post: string) => post.length > 0);
    }
    return content
      .split("|||")
      .map((post: string) => post.trim())
      .filter((post: string) => post.length > 0);
  }

  return content;
};

export const enhanceGroqContent = async (
  content: string,
  mode: string,
  platform: string = "Global"
) => {
  const modeInstructions: Record<string, string> = {
    improve: "Improve the following social media post to make it more engaging and clear.",
    shorten: "Make the following social media post significantly shorter and more concise, while retaining the core message.",
    expand: "Expand on the following social media post by adding more context, details, and depth.",
    storytelling: "Rewrite the following social media post to incorporate storytelling elements and make it narrative-driven.",
    controversy: "Rewrite the following social media post to be slightly controversial or a 'hot take' to drive engagement.",
    positivity: "Rewrite the following social media post to sound highly positive, enthusiastic, and uplifting.",
    professional: "Rewrite the following social media post to sound highly professional, suitable for a corporate audience.",
    casual: "Rewrite the following social media post to sound very casual, friendly, and conversational.",
  };

  const modeInstruction =
    modeInstructions[mode] || "Improve the following social media post.";
  const limitSuffix = getLimitSuffix(platform);
  const prompt = `${modeInstruction}\n\nHere is the original post:\n"${content}"\n\nReturn ONLY the rewritten post, applying the strict rules above. No conversational padding, quotes, or explanations.${limitSuffix}`;

  const response = await callAIWithCreditCheck({
    messages: [
      { role: "system", content: getSystemContent(platform) },
      { role: "user", content: prompt },
    ],
    temperature: 0.7,
    max_tokens: 2000,
  });

  const rawContent = response.choices[0]?.message?.content || "";
  return decodeHtmlEntities(cleanThinkTags(rawContent)) || content;
};

export const processInlineAIPrompt = async (
  prompt: string,
  currentContent?: string,
  platform: string = "Global",
  tone: string = "Casual",
  isThread: boolean = false
) => {
  const limitSuffix = isThread ? "" : getLimitSuffix(platform);

  let userPrompt = "";
  if (isThread) {
    userPrompt =
      currentContent && currentContent.trim()
        ? `Original content:\n"${currentContent}"\n\nInstruction:\n"${prompt}"\n\nRestructure, rewrite, and expand the original content into an optimized, highly engaging narrative thread of 3 to 5 separate posts according to the instruction. Do NOT just split or slice the original text into parts. Instead, rewrite and rephrase the core message, ensuring the first post hooks the reader, the middle posts expand on key arguments/insights with smooth narrative transitions, and the final post provides a strong closing thought or call to action. Separate each post with exactly this divider:\n---POST---\n\nFollow the strict rules: no buzzwords, no emojis, active voice, short sentences. Return ONLY the posts separated by the divider. No other text.`
        : `Platform: ${platform}\nTone: ${tone}\nInstruction: ${prompt}\n\nWrite a highly engaging continuous thread of 3 to 5 separate posts based on the instruction. Separate each post with exactly this divider:\n---POST---\n\nFollow the strict rules: no buzzwords, no emojis, active voice, short sentences. Return ONLY the posts separated by the divider. No other text.`;
  } else {
    userPrompt =
      currentContent && currentContent.trim()
        ? `Original content:\n"${currentContent}"\n\nInstruction:\n"${prompt}"\n\nRewrite or edit the original content according to the instruction. Follow the strict rules: no buzzwords, no emojis, active voice, short sentences. Return ONLY the new content. No conversational padding or explanations.${limitSuffix}`
        : `Platform: ${platform}\nTone: ${tone}\nInstruction: ${prompt}\n\nWrite a highly engaging social media post based on the instruction. Follow the strict rules: no buzzwords, no emojis, active voice, short sentences. Return ONLY the content. No conversational padding or explanations.${limitSuffix}`;
  }

  const response = await callAIWithCreditCheck({
    messages: [
      { role: "system", content: getSystemContent(platform) },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.7,
    max_tokens: 2000,
  });

  const content = decodeHtmlEntities(
    cleanThinkTags(response.choices[0]?.message?.content || "")
  );

  if (isThread) {
    let posts: string[] = [];
    const dividerRegex = /---\s*post\s*---/gi;
    if (dividerRegex.test(content)) {
      posts = content
        .split(dividerRegex)
        .map((post: string) => post.trim())
        .filter((post: string) => post.length > 0);
    } else if (content.includes("|||")) {
      posts = content
        .split("|||")
        .map((post: string) => post.trim())
        .filter((post: string) => post.length > 0);
    } else {
      posts = content
        .split("\n\n")
        .map((post: string) => post.trim())
        .filter((post: string) => post.length > 0);
      if (posts.length <= 1) {
        const matches = [
          ...content.matchAll(/^(?:\d+\.\s+|\[\d+\]\s+|\d+\)\s+)(.+)$/gm),
        ];
        if (matches.length > 1) {
          posts = matches.map((match) => match[1].trim());
        }
      }
    }
    return posts.length > 0 ? posts : [content];
  }

  return content;
};

export const getFriendlyAIErrorMessage = (error: any): string => {
  if (!error) return "Failed to process request. Please try again.";

  const status = error.status || error.statusCode || error.status_code;
  const message = error.message || "";

  if (
    status === 429 ||
    message.includes("429") ||
    message.includes("rate_limit") ||
    message.includes("rate_limit_exceeded") ||
    message.includes("Rate limit reached")
  ) {
    return "Rate limit reached. The AI service is temporarily busy. Please try again shortly.";
  }

  if (
    status === 401 ||
    message.includes("401") ||
    message.includes("unauthorized") ||
    message.includes("API key") ||
    message.includes("api_key") ||
    message.includes("invalid api key")
  ) {
    return "Authentication failed. Please contact support if this persists.";
  }

  if (
    message.includes("NetworkError") ||
    message.includes("fetch") ||
    message.includes("timeout") ||
    message.includes("Failed to fetch") ||
    message.includes("timed out")
  ) {
    return "Network connection issue. We couldn't connect to the AI service. Please check your internet connection and try again.";
  }

  if (
    status === 503 ||
    status === 502 ||
    status === 504 ||
    message.includes("overloaded") ||
    message.includes("service_unavailable")
  ) {
    return "The AI service is currently overloaded or temporarily down. Please try again in a few moments.";
  }

  if (
    message &&
    message.length < 150 &&
    !message.includes("{") &&
    !message.includes("Error:")
  ) {
    return message;
  }

  return "Failed to process your request with the AI assistant. Please try again shortly.";
};

export const generateBulkStudioPosts = async (
  topicOrSource: string,
  platform: string,
  tone: string,
  count: number,
  isRepurpose: boolean = false,
  repurposeGoal?: string,
  postType?: string,
  customAngle?: string,
  isPremium: boolean = false
): Promise<string[]> => {
  const platformNameMap: Record<string, string> = {
    x: "X (Twitter)",
    linkedin: "LinkedIn",
    instagram: "Instagram",
    tiktok: "TikTok",
    youtube: "YouTube",
    facebook: "Facebook",
    pinterest: "Pinterest",
    threads: "Threads",
    bluesky: "Bluesky",
  };

  const friendlyPlatform =
    isPremium && platform.toLowerCase() === "x"
      ? "X Premium"
      : platformNameMap[platform.toLowerCase()] || platform;

  const isShortX = platform.toLowerCase() === "x" && !isPremium;
  const isShortThreads = platform.toLowerCase() === "threads";
  const isShortBluesky = platform.toLowerCase() === "bluesky";

  const angleInstructions: Record<string, string> = {
    hottake: "Each post must be written as a Hot Take: a bold, opinionated stance on the news or topic.",
    contrarian: "Each post must be written as a Contrarian take: challenge the mainstream narrative and status quo on this topic.",
    insight: "Each post must be written as an Insight: share a non-obvious observation, deep lesson, or unexpected truth.",
    story: "Each post must be written as a Personal Story: connect the topic/news to a personal or professional lived experience.",
    builder: "Each post must be written from a Builder Angle: explain what this means for founders, developers, creators, and people who build.",
    meme: "Each post must be written as a Meme / Shitpost: a funny, irreverent, meme-worthy, or sarcastic take.",
  };

  let angleInstruction = "";
  if (postType && postType !== "none") {
    if (postType === "custom" && customAngle?.trim()) {
      angleInstruction = `Each post must follow this custom writing angle: "${customAngle.trim()}".`;
    } else {
      angleInstruction = angleInstructions[postType] || "";
    }
  }

  let prompt = "";
  if (isRepurpose) {
    const goalMap: Record<string, string> = {
      insights: "Extract key stand-alone insights",
      thread: "Create a connected narrative thread of posts",
      series: "Form a platform-native series of posts",
      takeaways: "Extract step-by-step actionable takeaways and guides",
      faq: "Format as a Q&A / FAQ style interaction",
      quotes: "Pull hooky quotes and key punchy snippets",
      hottake: "Generate a Hot Take: a bold, opinionated stance on the news",
      contrarian: "Challenge the mainstream narrative (Contrarian take)",
      insight: "Extract non-obvious observations or lessons (Insight)",
      story: "Connect the news/content to personal experience (Personal Story)",
      builder: "Write what this means for people who build (Builder Angle)",
      meme: "Create funny, irreverent, meme-worthy takes (Meme / Shitpost)",
      summary: "Write a high-level summary of key highlights",
    };
    const goal =
      repurposeGoal === "custom" && customAngle
        ? `Define your own angle: ${customAngle}`
        : goalMap[repurposeGoal || ""] || "Extract insights";
    prompt = `Repurpose the following source content into exactly ${count} distinct, high-value posts for the platform ${friendlyPlatform.toUpperCase()}:\n--- SOURCE CONTENT ---\n${topicOrSource}\n--- END SOURCE CONTENT ---\n\nGoal/Style: ${goal}.`;
  } else {
    prompt = `Write exactly ${count} distinct, high-value social media posts for the platform ${friendlyPlatform.toUpperCase()} about the topic/concept: "${topicOrSource}".`;
  }

  if (angleInstruction) {
    prompt += `\nWRITING ANGLE RULE:\n${angleInstruction}\n`;
  }

  let platformRule = "";
  if (isShortX) {
    platformRule = `6. Each post MUST strictly be between 35 and 45 words long. Do NOT write more than 45 words or 270 characters per post.`;
  } else if (isShortThreads) {
    platformRule = `6. Each post MUST strictly be between 70 and 80 words long. Do NOT write more than 80 words or 480 characters per post.`;
  } else if (isShortBluesky) {
    platformRule = `6. Each post MUST strictly be between 40 and 50 words long. Do NOT write more than 50 words or 290 characters per post.`;
  } else {
    platformRule = `6. Each post MUST strictly be between 70 and 120 words long. Do NOT write more than 120 words or 800 characters per post.\n7. For LinkedIn and Facebook, write an engaging opening hook line.`;
  }

  prompt += `
The tone of all posts must be: ${tone}.

Follow these strict platform rules:
1. No AI buzzwords (delve, unleash, game-changer, revolutionary, landscape, etc.)
2. Use active voice and write conversational, easy-to-read sentences.
3. Every 1 to 2 sentences must be its own paragraph with double line breaks for readability.
4. Do NOT use emojis.
5. Do NOT add hashtags unless requested.
${platformRule}

CRITICAL MULTI-POST FORMATTING RULE (WHEN count > 1):
- You MUST write exactly ${count} separate posts.
- You MUST separate each post with exactly this delimiter on a new line:
---POST---
- Do NOT use any other delimiter.
- Do NOT number the posts or write headers (like "Post 1:").
- Do NOT write any introduction or conclusion. Output only the post texts and delimiters.`;

  const systemContent = isShortX
    ? SHIPOS_SYSTEM_PROMPT + "\n\n" + LINKEDIN_RULES + "\n\n" + EXAMPLES + "\n\n" + X_BASIC_SHORTEN_RULE
    : isShortThreads
    ? SHIPOS_SYSTEM_PROMPT + "\n\n" + LINKEDIN_RULES + "\n\n" + EXAMPLES + "\n\n" + THREADS_PLATFORM_RULE
    : isShortBluesky
    ? SHIPOS_SYSTEM_PROMPT + "\n\n" + LINKEDIN_RULES + "\n\n" + EXAMPLES + "\n\n" + BLUESKY_PLATFORM_RULE
    : SHIPOS_SYSTEM_PROMPT + "\n\n" + LINKEDIN_RULES + "\n\n" + EXAMPLES + "\n\n" + GLOBAL_PLATFORM_RULE;

  const response = await callAIWithCreditCheck({
    messages: [
      { role: "system", content: systemContent },
      { role: "user", content: prompt },
    ],
    temperature: 0.7,
    max_tokens: 2500,
  });

  const content = decodeHtmlEntities(
    cleanThinkTags(response.choices[0]?.message?.content || "")
  );

  let posts = content
    .split(/---\s*post\s*---/gi)
    .map((p: string) => p.trim())
    .filter((p: string) => p.length > 0);

  if (posts.length <= 1 && count > 1) {
    if (content.includes("|||")) {
      posts = content
        .split("|||")
        .map((p: string) => p.trim())
        .filter((p: string) => p.length > 0);
    } else {
      const postMarkerRegex = /(?:^|\n)(?:Post|POST|post)\s*\d+\s*[:\-]\s*/gi;
      if (postMarkerRegex.test(content)) {
        posts = content
          .split(postMarkerRegex)
          .map((p: string) => p.trim())
          .filter((p: string) => p.length > 0);
      } else {
        const numberMarkerRegex = /(?:^|\n)\d+\.\s+/g;
        if (numberMarkerRegex.test(content)) {
          posts = content
            .split(numberMarkerRegex)
            .map((p: string) => p.trim())
            .filter((p: string) => p.length > 0);
        } else {
          const paragraphs = content
            .split("\n\n")
            .map((p: string) => p.trim())
            .filter((p: string) => p.length > 0);
          if (paragraphs.length >= count) {
            posts = paragraphs;
          }
        }
      }
    }
  }

  return posts.slice(0, count);
};
