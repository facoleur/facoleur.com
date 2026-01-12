export interface HeadingInfo {
  level: number;
  text: string;
}

export interface HeadingNode extends HeadingInfo {
  children: HeadingNode[];
}

export interface SectionAnalysis {
  heading: HeadingInfo;
  text: string;
  wordCount: number;
  paragraphWordCounts: number[];
  keywordFrequency: Record<string, number>;
}

export interface KeywordStat {
  term: string;
  count: number;
  density: number;
}

export interface SectionKeywordDistribution {
  heading: HeadingInfo;
  totalWords: number;
  topKeywords: KeywordStat[];
}

export interface KeywordAnalysis {
  totalWords: number;
  frequencies: Record<string, number>;
  topUnigrams: KeywordStat[];
  topBigrams: KeywordStat[];
  topTrigrams: KeywordStat[];
  density: KeywordStat[];
  distribution: SectionKeywordDistribution[];
}

export interface ReadabilityStats {
  sentences: number;
  averageSentenceLength: number;
  paragraphLengthDistribution: number[];
  repeatedPhrases: Array<{ phrase: string; count: number }>;
  passiveVoice: {
    count: number;
    ratio: number;
    examples: string[];
  };
}

export interface StructureIssues {
  missingH1: boolean;
  multipleH1: boolean;
  skippedLevels: Array<{ from: number; to: number; text: string }>;
  notes: string[];
}

export interface ContentStructure {
  headings: HeadingInfo[];
  headingTree: HeadingNode[];
  sections: SectionAnalysis[];
  totalWordCount: number;
  h1Count: number;
  issues: StructureIssues;
}

export interface ContentAuditResult {
  metadata: {
    url: string;
    title: string;
    language: string | null;
    fetchedAt: string;
    totalWordCount: number;
  };
  structure: ContentStructure;
  keywords: KeywordAnalysis;
  readability: ReadabilityStats;
}
