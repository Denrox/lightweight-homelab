export interface Download {
  type: 'direct' | 'pattern' | 'docker';
  url?: string;
  dest?: string;
  pattern?: string;
  latest?: boolean;
  image?: string;
  namespace?: string;
}

export interface DownloadsConfig {
  downloads: Download[];
} 