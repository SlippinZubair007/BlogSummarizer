import puppeteer from 'puppeteer';
import { connectMongo } from '@/lib/mongo';
import { supabase } from '@/lib/supabase';
import mongoose from 'mongoose';

const BlogSchema = new mongoose.Schema({
  url: String,
  fullText: String,
});
const Blog = mongoose.models.Blog || mongoose.model('Blog', BlogSchema);

export async function realScrape(url: string): Promise<{ title: string; text: string }> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.goto(url, {
    waitUntil: 'networkidle2',
    timeout: 0,
  });

  await page.waitForSelector('.crayons-article__main');

  const result = await page.evaluate(() => {
    const title = document.querySelector('h1')?.innerText || 'Untitled';

    const container = document.querySelector('.crayons-article__main');
    if (!container) return { title: 'No title', text: 'No content' };

    const paragraphs = container.querySelectorAll('p, li');
    const text = Array.from(paragraphs)
      .map(el => (el as HTMLElement).innerText.trim())
      .filter(Boolean)
      .join('\n\n');

    return { title, text };
  });

  await browser.close();
  return result;
}

function staticSummary(text: string): string {
  return `Summary: ${text.slice(0, 300)}...`;
}

function simulateUrduTranslation(text: string): string {
  return `اردو خلاصہ: ${text.slice(0, 150)}...`;
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
    if (!url) {
      return new Response(JSON.stringify({ error: 'No URL provided' }), { status: 400 });
    }

    const { title, text: fullText } = await realScrape(url);
    const summary = staticSummary(fullText);
    const urdu_summary = simulateUrduTranslation(summary);
    const words = wordCount(fullText);
    const ratio = compressionRatio(fullText, summary);

    await connectMongo();
    await Blog.create({ url, fullText });

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
      console.error('Supabase insert error:', insertError.message);
      return new Response(JSON.stringify({ error: insertError.message }), { status: 500 });
    }

    return new Response(JSON.stringify({ summary }), { status: 200 });

  } catch (err) {
    const error = err as Error;
    console.error('API error:', error.message || error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}
