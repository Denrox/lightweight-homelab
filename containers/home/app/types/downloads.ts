export interface Download {
  url?: string;
  dest?: string;
  type: 'direct' | 'pattern' | 'docker';
  pattern?: string;
  latest?: boolean;
  image?: string;
  namespace?: string;
}

export interface DownloadsConfig {
  downloads: Download[];
} 