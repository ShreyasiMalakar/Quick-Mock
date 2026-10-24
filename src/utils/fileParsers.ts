import * as pdfjsLib from 'pdfjs-dist';
// Use Vite's ?url import to bundle and serve worker locally without CDN failure
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import JSZip from 'jszip';

// Configure pdfjs worker with bundled asset
try {
  if (typeof window !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;
  }
} catch (e) {
  console.warn('PDF.js worker initialization warning:', e);
}

export interface ExtractedMaterial {
  title: string;
  text: string;
  pageOrSlideCount: number;
  wordCount: number;
  format: 'pdf' | 'pptx' | 'text' | 'sample';
  fileBase64?: string;
  fileMimeType?: string;
  isMultimodalVisual?: boolean;
}

/**
 * Convert a File to base64 string (without the data URL prefix)
 */
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const res = reader.result as string;
      const base64 = res.split(',')[1] || '';
      resolve(base64);
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Extract text from PDF documents with graceful fallback to multimodal direct ingestion
 */
export async function extractTextFromPdf(file: File, maxPages: number = 30): Promise<ExtractedMaterial> {
  let fullText = '';
  let pageCount = 1;
  let base64Data = '';

  try {
    base64Data = await fileToBase64(file);
  } catch (err) {
    console.warn('Could not read file base64:', err);
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(arrayBuffer),
      useSystemFonts: true,
    });

    const pdf = await loadingTask.promise;
    pageCount = pdf.numPages;
    const numPagesToProcess = Math.min(pageCount, maxPages);

    for (let i = 1; i <= numPagesToProcess; i++) {
      try {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageStrings = textContent.items
          .map((item: any) => ('str' in item ? item.str : ''))
          .filter((s: string) => s && s.trim().length > 0);

        const pageText = pageStrings.join(' ');
        if (pageText.trim()) {
          fullText += `\n--- Page ${i} ---\n` + pageText + '\n';
        }
      } catch (pageErr) {
        console.warn(`Error reading PDF page ${i}:`, pageErr);
      }
    }
  } catch (pdfErr) {
    console.warn('PDF.js text extraction error, switching to direct multimodal upload:', pdfErr);
  }

  const cleaned = cleanExtractedText(fullText);
  const wordCount = cleaned.split(/\s+/).filter(Boolean).length;

  // If text is minimal or 0 (scanned doc, diagrams, slide deck), flag as multimodal visual
  const isMultimodal = wordCount < 30 && !!base64Data;

  return {
    title: file.name.replace(/\.[^/.]+$/, ''),
    text: cleaned || (isMultimodal ? '[Visual/Scanned Document: AI Multimodal Processing will analyze full page content]' : ''),
    pageOrSlideCount: pageCount,
    wordCount,
    format: 'pdf',
    fileBase64: base64Data,
    fileMimeType: file.type || 'application/pdf',
    isMultimodalVisual: isMultimodal,
  };
}

/**
 * Extract clean text and slide notes from PowerPoint presentations (.pptx)
 */
export async function extractTextFromPptx(file: File): Promise<ExtractedMaterial> {
  const arrayBuffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(arrayBuffer);

  // Find all slide XML files
  const slideFileNames = Object.keys(zip.files).filter((path) =>
    path.match(/^ppt\/slides\/slide[0-9]+\.xml$/i)
  );

  // Sort slides numerically by slide index
  slideFileNames.sort((a, b) => {
    const numA = parseInt(a.replace(/\D/g, ''), 10) || 0;
    const numB = parseInt(b.replace(/\D/g, ''), 10) || 0;
    return numA - numB;
  });

  let fullText = '';
  let slideCount = 0;

  for (const slidePath of slideFileNames) {
    slideCount++;
    const slideXml = await zip.files[slidePath].async('string');
    // Extract text inside <a:t>...</a:t> tags
    const textMatches = slideXml.match(/<a:t[^>]*>(.*?)<\/a:t>/gi) || [];
    const slideTexts = textMatches
      .map((tag) => tag.replace(/<\/?a:t[^>]*>/gi, '').trim())
      .filter((t) => t.length > 0);

    if (slideTexts.length > 0) {
      fullText += `\n--- Slide ${slideCount} ---\n` + slideTexts.join('\n') + '\n';
    }
  }

  // Also check for slide notes in ppt/notesSlides/
  const noteFileNames = Object.keys(zip.files).filter((path) =>
    path.match(/^ppt\/notesSlides\/notesSlide[0-9]+\.xml$/i)
  );

  for (const notePath of noteFileNames) {
    const noteXml = await zip.files[notePath].async('string');
    const noteMatches = noteXml.match(/<a:t[^>]*>(.*?)<\/a:t>/gi) || [];
    const noteTexts = noteMatches
      .map((tag) => tag.replace(/<\/?a:t[^>]*>/gi, '').trim())
      .filter((t) => t.length > 3 && !t.includes('Slide'));

    if (noteTexts.length > 0) {
      fullText += `[Slide Note: ${noteTexts.join(' ')}]\n`;
    }
  }

  const cleaned = cleanExtractedText(fullText);
  const wordCount = cleaned.split(/\s+/).filter(Boolean).length;

  return {
    title: file.name.replace(/\.[^/.]+$/, ''),
    text: cleaned,
    pageOrSlideCount: Math.max(slideCount, 1),
    wordCount,
    format: 'pptx',
  };
}

/**
 * Extract text from plain text formats (.txt, .md, .doc, .csv)
 */
export async function extractTextFromPlainFile(file: File): Promise<ExtractedMaterial> {
  const rawText = await file.text();
  const cleaned = cleanExtractedText(rawText);
  const wordCount = cleaned.split(/\s+/).filter(Boolean).length;

  return {
    title: file.name.replace(/\.[^/.]+$/, ''),
    text: cleaned,
    pageOrSlideCount: 1,
    wordCount,
    format: 'text',
  };
}

/**
 * Universal file processor detecting extension
 */
export async function parseUploadedFile(file: File): Promise<ExtractedMaterial> {
  const ext = file.name.split('.').pop()?.toLowerCase() || '';

  if (ext === 'pdf') {
    return extractTextFromPdf(file);
  } else if (ext === 'pptx' || ext === 'ppt') {
    return extractTextFromPptx(file);
  } else {
    return extractTextFromPlainFile(file);
  }
}

/**
 * Space and time optimizer: strips repetitive whitespace, empty lines, and excessive non-text symbols
 */
export function cleanExtractedText(raw: string): string {
  return raw
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
