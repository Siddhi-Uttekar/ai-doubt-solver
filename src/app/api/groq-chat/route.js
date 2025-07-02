import { NextResponse } from "next/server";
import Fuse from "fuse.js";
import textbook from "../../../../data/processed/structuredtb.json";

import { Groq } from "groq-sdk";


const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "your-groq-api-key",
});

function findContextFromTextbook(question) {
  const lowerQ = question.toLowerCase();
  let bestParagraph = null;

  for (const chapter of textbook.chapters) {
    const paragraphs = chapter.content
      .split(/\n+/)
      .map(p => p.trim())
      .filter(p => p.length > 20);

    for (const para of paragraphs) {
      if (para.toLowerCase().includes(lowerQ)) {
        bestParagraph = {
          title: chapter.title,
          paragraph: para,
        };
        break;
      }
    }

    if (bestParagraph) break;
  }

  if (bestParagraph) {
    return `📘 Chapter: ${bestParagraph.title}\n\n${bestParagraph.paragraph}`;
  }

  return null;
}

export async function POST(req) {
  try {
    const { question } = await req.json();

    if (!question) {
      return NextResponse.json({ error: "Missing question" }, { status: 400 });
    }

    const context = findContextFromTextbook(question);
    const useFallback = context === null;

    const systemPrompt = useFallback
      ? `You're an SSC Maharashtra Board tutor. The student asked: "${question}". Answer clearly in simple terms, even if it's not from the textbook.`
      : `You're an SSC Maharashtra Board tutor. Answer the student's question using ONLY this textbook paragraph:\n\n${context}`;

    const groqRes = await groq.chat.completions.create({
      model: "llama3-8b-8192",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: question },
      ],
      temperature: 0.4,
      max_tokens: 600,
    });

    const reply = groqRes.choices?.[0]?.message?.content || "Sorry, I couldn't answer that.";

    return NextResponse.json({ answer: reply });
  } catch (err) {
    console.error("❌ Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
