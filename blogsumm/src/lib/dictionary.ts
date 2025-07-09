// utils/dictionary.ts
import { Dictionary } from '@/components/types';

export const englishToUrduDictionary: Dictionary = {
  'the': 'یہ',
  'and': 'اور',
  'is': 'ہے',
  'in': 'میں',
  'to': 'کو',
  'of': 'کا',
  'a': 'ایک',
  'that': 'یہ',
  'for': 'کے لیے',
  'with': 'کے ساتھ',
  'technology': 'ٹیکنالوجی',
  'development': 'ترقی',
  'software': 'سافٹ ویئر',
  'application': 'ایپلیکیشن',
  'system': 'نظام',
  'data': 'ڈیٹا',
  'user': 'صارف',
  'project': 'منصوبہ',
  'solution': 'حل',
  'business': 'کاروبار'
};

export function translateToUrdu(text: string): string {
  const words = text.toLowerCase().split(/\s+/);
  
  const translatedWords = words.map(word => {
    const cleanWord = word.replace(/[^\w]/g, '');
    return englishToUrduDictionary[cleanWord] || word;
  });
  
  return translatedWords.join(' ');
}