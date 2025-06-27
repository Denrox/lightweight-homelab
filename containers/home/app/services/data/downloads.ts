import fs from 'fs/promises';
import appConfig from '~/config/config.json';

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

export class DownloadsService {
  private async readConfig(): Promise<DownloadsConfig> {
    try {
      const content = await fs.readFile((appConfig as any).downloadsConfigPath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      console.error('Error reading downloads config:', error);
      return { downloads: [] };
    }
  }

  private async writeConfig(config: DownloadsConfig): Promise<void> {
    try {
      await fs.writeFile((appConfig as any).downloadsConfigPath, JSON.stringify(config, null, 2), 'utf-8');
    } catch (error) {
      console.error('Error writing downloads config:', error);
      throw new Error('Failed to save downloads configuration');
    }
  }

  async getAllDownloads(): Promise<Download[]> {
    const config = await this.readConfig();
    return config.downloads;
  }

  async getDownloadsByType(type: Download['type']): Promise<Download[]> {
    const downloads = await this.getAllDownloads();
    return downloads.filter(download => download.type === type);
  }

  async addDownload(download: Download): Promise<void> {
    const config = await this.readConfig();
    config.downloads.push(download);
    await this.writeConfig(config);
  }

  async updateDownload(index: number, download: Download): Promise<void> {
    const config = await this.readConfig();
    if (index >= 0 && index < config.downloads.length) {
      config.downloads[index] = download;
      await this.writeConfig(config);
    } else {
      throw new Error('Download not found');
    }
  }

  async deleteDownload(index: number): Promise<void> {
    const config = await this.readConfig();
    if (index >= 0 && index < config.downloads.length) {
      config.downloads.splice(index, 1);
      await this.writeConfig(config);
    } else {
      throw new Error('Download not found');
    }
  }

  async moveDownload(fromIndex: number, toIndex: number): Promise<void> {
    const config = await this.readConfig();
    if (fromIndex >= 0 && fromIndex < config.downloads.length && 
        toIndex >= 0 && toIndex < config.downloads.length) {
      const [movedDownload] = config.downloads.splice(fromIndex, 1);
      config.downloads.splice(toIndex, 0, movedDownload);
      await this.writeConfig(config);
    } else {
      throw new Error('Invalid index');
    }
  }
}

export const downloadsService = new DownloadsService(); 