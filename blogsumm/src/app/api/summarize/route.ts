import { connectMongo } from '@/lib/mongo';
import { supabase } from '@/lib/supabase';
import mongoose from 'mongoose';

const BlogSchema = new mongoose.Schema({
  url: String,
  fullText: String,
});
const Blog = mongoose.models.Blog || mongoose.model('Blog', BlogSchema);

function fakeScrape(url: string) {
  return `This is the full content from ${url}. It has multiple sentences. Let's assume this is 2000 words long for testing.`;
}

function staticSummary(text: string) {
  return `Summary: ${text.slice(0, 100)}...`;
}

function simulateUrduTranslation(text: string) {
  return `اردو خلاصہ: ${text.slice(0, 50)}...`;
}

function wordCount(text: string): number {
  return text.trim().split(/\s+/).length;
}

function compressionRatio(original: string, summary: string): number {
  return summary.length / original.length;
}

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    const fullText = fakeScrape(url);
    const summary = staticSummary(fullText);
    const urdu_summary = simulateUrduTranslation(summary);
    const title = `Summary of ${url.split('/').at(-1) || 'Blog'}`;
    const words = wordCount(fullText);
    const ratio = compressionRatio(fullText, summary);

    // Save full blog content to MongoDB
    await connectMongo();
    await Blog.create({ url, fullText });

    // Save metadata + summary to Supabase
    const { error: insertError } = await supabase.from('summaries').insert([
      {
        url,
        title,
        summary,
        urdu_summary,
        word_count: words,
        compression_ratio: ratio,
      },
    ]);

    if (insertError) {
      console.error(' Supabase insert error:', insertError.message);
      return new Response(
        JSON.stringify({ error: insertError.message }),
        { status: 500 }
      );
    }

    return Response.json({ summary });
  } catch (err: any) {
    console.error(' API error:', err.message);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500 }
    );
  }
}
