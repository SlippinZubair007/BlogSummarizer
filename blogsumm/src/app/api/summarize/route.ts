import { connectMongo } from '@/lib/mongo';
import { supabase } from '@/lib/supabase';
import mongoose from 'mongoose';
import * as cheerio from 'cheerio';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { assert, error } from 'node:console';


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);


const BlogSchema = new mongoose.Schema({
  url: String,
  fullText: String,
  title: String,
  createdAt: { type: Date, default: Date.now },
});
const Blog = mongoose.models.Blog || mongoose.model('Blog', BlogSchema);


async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (err) {
      const error = err as Error;
      console.error(`Attempt ${i + 1} failed:`, error.message);
      
      if (i === maxRetries - 1) throw error;
      

      if (error.message?.includes('quota') || error.message?.includes('rate')) {
        const delay = baseDelay * Math.pow(2, i);
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      throw error;
    }
  }
  throw new Error('Max retries exceeded');
}


function extractiveSummary(text: string, maxSentences: number = 5): string {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
  
  if (sentences.length <= maxSentences) {
    return sentences.join('. ').trim() + '.';
  }
  

  const scoredSentences = sentences.map((sentence, index) => {
    const words = sentence.trim().split(/\s+/).length;
    const positionScore = index < sentences.length * 0.3 ? 1.2 : 1.0;
    const lengthScore = words > 10 && words < 30 ? 1.1 : 1.0;
    
    return {
      sentence: sentence.trim(),
      score: positionScore * lengthScore,
      index
    };
  });
  
  const topSentences = scoredSentences
    .sort((a, b) => b.score - a.score)
    .slice(0, maxSentences)
    .sort((a, b) => a.index - b.index);
  
  return topSentences.map(s => s.sentence).join('. ') + '.';
}


async function realScrape(url: string): Promise<{ text: string; title: string }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const res = await fetch(url, { 
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    
    const html = await res.text();
    const $ = cheerio.load(html);

 
    const title =
      $('h1').first().text().trim() ||
      $('title').text().trim() ||
      $('meta[property="og:title"]').attr('content') ||
      'Untitled Blog';


    const selectors = [
      'article p',
      '.post-content p',
      '.entry-content p',
      '.content p',
      'main p',
      '.post p',
      '.blog-post p',
      '.article-content p',
      '.post-body p',
      'p',
    ];

    for (const selector of selectors) {
      const paragraphs = $(selector);
      if (paragraphs.length > 0) {
        const text = paragraphs
          .map((_, el) => $(el).text().trim())
          .get()
          .filter((p) => p.length > 30 && !p.match(/^(share|follow|subscribe|click here)/i))
          .join('\n\n');
        if (text.length > 100) {
          return { text, title: title.substring(0, 200) };
        }
      }
    }

    return { text: 'No readable content found.', title };
  } catch (err) {
    const error=err as Error;
    console.error('Scraping error:', error);
    return { text: 'Error fetching blog content.', title: 'Error' };
  }
}


async function generateWithGemini(prompt: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash', 
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 1000,
      }
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    if (!text || text.trim().length === 0) {
      throw new Error('Empty response from Gemini');
    }
    
    return text.trim();
  } catch (err) {
    const error=err as Error;
    console.error('Gemini generation error:', err);
    throw err;
  }
}

async function generateSummary(text: string, title: string): Promise<string> {
  console.log('Generating summary, text length:', text.length);
  
  if (!text || text.trim().length < 100) {
    return 'Content too short for summary generation.';
  }

  const contentToSummarize = text.substring(0, 12000);
  
  const prompt = `Please create a comprehensive summary of the following blog post. 
  
Instructions:
- Write a single flowing paragraph of approximately 200 words
- Avoid bullet points or numbered lists
- Make it informative and engaging
- Focus on the main ideas and key insights

Blog Title: "${title}"

Content:
${contentToSummarize}`;

  try {
    console.log('Attempting Gemini summary generation...');
    
    const summary = await retryWithBackoff(async () => {
      return await generateWithGemini(prompt);
    });
    
    console.log('Gemini summary generated successfully, length:', summary.length);
    return summary;
    
  } catch (err) {
    const error=err as Error;
    console.error('Gemini summary generation failed:', error.message);
    console.log('Falling back to extractive summary...');
    return extractiveSummary(contentToSummarize, 5);
  }
}


async function translateToUrdu(text: string): Promise<string> {
  console.log('Translating to Urdu, text length:', text.length);
  
  if (!text || text.trim().length === 0) {
    return 'اردو ترجمہ دستیاب نہیں - خالی متن';
  }

  const prompt = `Translate the following English blog summary into natural, fluent Urdu. 
  
Instructions:
- Use proper Urdu grammar and vocabulary
- Make it sound natural and readable
- Maintain the meaning and tone of the original

English Summary:
${text}`;

  try {
    console.log('Attempting Gemini Urdu translation...');
    
    const urduTranslation = await retryWithBackoff(async () => {
      return await generateWithGemini(prompt);
    });
    
    console.log('Gemini Urdu translation completed successfully');
    return urduTranslation;
    
  } catch (err) {
    const error=err as Error;
    console.error('Gemini Urdu translation failed:', error.message);
    

    if (error.message?.includes('quota')) {
      return 'اردو ترجمہ فی الوقت دستیاب نہیں - کوٹا ختم ہو گیا ہے';
    } else if (error.message?.includes('rate')) {
      return 'اردو ترجمہ فی الوقت دستیاب نہیں - حد سے زیادہ درخواستیں';
    }
    
    return 'اردو ترجمہ دستیاب نہیں - تکنیکی خرابی';
  }
}


function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

function compressionRatio(original: string, summary: string): number {
  return Math.round((summary.length / original.length) * 100) / 100;
}

function estimateReadingTime(text: string): number {
  return Math.ceil(wordCount(text) / 200);
}


export async function POST(req: Request) {
  try {

    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not configured');
      return new Response(JSON.stringify({ error: 'AI service not configured' }), { status: 500 });
    }

    const { url } = await req.json();
    if (!url || !/^https?:\/\/.+\..+/.test(url)) {
      return new Response(JSON.stringify({ error: 'Invalid or missing URL' }), { status: 400 });
    }

    console.log('Processing URL:', url);

    const { text: fullText, title } = await realScrape(url);
    if (fullText === 'No readable content found.' || fullText === 'Error fetching blog content.') {
      return new Response(JSON.stringify({ error: 'Could not extract blog content from the provided URL' }), { status: 400 });
    }

    console.log('Scraped content successfully, length:', fullText.length);


    const summary = await generateSummary(fullText, title);
    const urdu_summary = await translateToUrdu(summary);


    const word_count = wordCount(fullText);
    const summary_word_count = wordCount(summary);
    const ratio = compressionRatio(fullText, summary);
    const reading_time = estimateReadingTime(fullText);

    console.log('Generated summary and translation successfully');


    try {
      await connectMongo();
      await Blog.create({ 
        url, 
        fullText, 
        title, 
        createdAt: new Date() 
      });
      console.log('Saved to MongoDB successfully');
    } catch (mongoError: any) {
      console.error('MongoDB save error:', mongoError.message);

    }


    const { error } = await supabase.from('summaries').insert([{
      url,
      title,
      summary,
      urdu_summary,
      key_points: fullText,
      word_count,
      summary_word_count,
      compression_ratio: ratio,
      reading_time,
      created_at: new Date().toISOString(),
    }]);

    if (error) {
      console.error('Supabase insert error:', error.message);
      return new Response(JSON.stringify({ error: 'Database insert failed' }), { status: 500 });
    }

    console.log('Process completed successfully');

    return Response.json({
      success: true,
      title,
      summary,
      urdu_summary,
      key_points: fullText,
      word_count,
      summary_word_count,
      compression_ratio: ratio,
      reading_time,
      url
    });

} catch (err) {
  const error = err as Error;
  console.error('Server Error:', error.message);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' && err instanceof Error ? err.message : 'Please try again later'
    }), { status: 500 });
  }
}