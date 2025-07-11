import { connectMongo } from '@/lib/mongo';
import { supabase } from '@/lib/supabase';
import mongoose from 'mongoose';
import * as cheerio from 'cheerio';
import urduDictionary from '@/lib/UrduDictionary';

const BlogSchema = new mongoose.Schema({
  url: String,
  fullText: String,
});
const Blog = mongoose.models.Blog || mongoose.model('Blog', BlogSchema);



async function realScrape(url: string): Promise<string> {
  try {
    const res = await fetch(url);
    const html = await res.text();

    const $ = cheerio.load(html);

    // Extract all text inside <p> tags
    const text = $('p')
      .map((_, el) => $(el).text())
      .get()
      .join('\n');

    return text || 'No readable content found.';
  } catch (err) {
    console.error('Error scraping blog:', err);
    return 'Error fetching blog content.';
  }
}


function staticSummary(text: string) {
  return `Summary: ${text.slice(0, 100)}...`;
}

function UrduTranslation(text: string) : string {
  return text
  .split(/\s+/)
  .map((word)=>{
    const cleaned=word.toLowerCase().replace(/[.,!?;:]/g, '');
    return urduDictionary[cleaned] || cleaned;
  })
  .join(' ');
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
    const fullText = await realScrape(url);
    const summary = staticSummary(fullText);
    const urdu_summary = UrduTranslation(summary);
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