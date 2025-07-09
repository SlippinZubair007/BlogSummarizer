// lib/summarizer.ts
import { SummaryData } from '@/components/types';

export function generateSummary(content: string): SummaryData {
  // Static logic to simulate AI summary
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  // Simple extractive summarization
  const summary = sentences
    .slice(0, Math.min(5, Math.floor(sentences.length * 0.3)))
    .join('. ') + '.';
  
  const wordCount = content.split(' ').length;
  const summaryLength = summary.split(' ').length;
  
  return {
    summary,
    wordCount,
    summaryLength,
    compressionRatio: (summaryLength / wordCount * 100).toFixed(2)
  };
}