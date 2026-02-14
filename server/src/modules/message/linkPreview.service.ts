/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// link-preview.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { getLinkPreview } from 'link-preview-js';
import { LinkPreviewResponseDto } from './dto/responses/link-preview-response';
import { EnvConfig } from '@/common/config/env.config';

@Injectable()
export class LinkPreviewService {
  private readonly logger = new Logger(LinkPreviewService.name);

  async fetchPreview(url: string): Promise<LinkPreviewResponseDto | null> {
    try {
      // Check if it's a YouTube URL
      if (this.isYouTubeUrl(url)) {
        this.logger.debug(`Detected YouTube URL: ${url}`);
        const youtubePreview = await this.fetchYouTubePreview(url);
        if (youtubePreview) {
          return youtubePreview;
        }
      }

      // Regular link preview for non-YouTube URLs or if YouTube failed
      const data = await getLinkPreview(url, {
        timeout: 5000,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
        },
        followRedirects: 'follow',
      });

      this.logger.debug(`Successfully fetched preview for ${url}`);

      return {
        url: data.url,
        title: 'title' in data ? data.title : undefined,
        description: 'description' in data ? data.description : undefined,
        image:
          'images' in data && data.images?.length > 0
            ? data.images[0]
            : undefined,
        mediaType: data.mediaType,
        site_name: 'siteName' in data ? data.siteName : undefined,
        favicon: data.favicons?.[0],
      };
    } catch (err) {
      this.logger.warn(
        `Failed to fetch link preview for ${url}: ${err.message}`,
      );

      return await this.fetchPreviewAlternative(url);
    }
  }

  private isYouTubeUrl(url: string): boolean {
    const youtubeDomains = ['youtube.com', 'youtu.be', 'youtube.com/shorts'];
    return youtubeDomains.some((domain) => url.includes(domain));
  }

  private extractYouTubeVideoId(url: string): string | null {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([^&\n?#]+)/,
      /youtube\.com\/embed\/([^&\n?#]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  }

  private async fetchYouTubePreview(
    url: string,
  ): Promise<LinkPreviewResponseDto | null> {
    const videoId = this.extractYouTubeVideoId(url);
    if (!videoId) return null;

    const apiKey = EnvConfig.youTubeApiKey;
    if (!apiKey) return null;

    try {
      const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const response = await fetch(apiUrl, {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      });

      clearTimeout(timeoutId);
      if (!response.ok) return null;

      // Simple type assertion for the API response
      const data: any = await response.json();

      if (!data.items || !data.items.length) return null;

      const snippet = data.items[0].snippet;
      const thumbnail = snippet.thumbnails?.high || snippet.thumbnails?.default;

      return {
        url,
        title: snippet.title || '',
        description: snippet.description || '',
        image: thumbnail?.url,
        mediaType: 'video',
        site_name: 'YouTube',
        favicon: 'https://www.youtube.com/favicon.ico',
      };
    } catch (err) {
      this.logger.debug(`YouTube fetch failed: ${err.message}`);
      return null;
    }
  }

  private async fetchPreviewAlternative(
    url: string,
  ): Promise<LinkPreviewResponseDto | null> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });

      clearTimeout(timeoutId);
      if (!response.ok) return null;

      const html = await response.text();

      return {
        url,
        title: this.extractTitle(html),
        description: this.extractDescription(html),
        image: this.extractImage(html),
        mediaType: 'website',
        site_name: this.extractSiteName(html, url),
      };
    } catch (err) {
      this.logger.debug(`Alternative fetch also failed: ${err.message}`);
      return null;
    }
  }

  private extractTitle(html: string): string | undefined {
    const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    return match ? match[1].trim() : undefined;
  }

  private extractDescription(html: string): string | undefined {
    const patterns = [
      /<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i,
      /<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']*)["']/i,
    ];
    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match) return match[1];
    }
    return undefined;
  }

  private extractImage(html: string): string | undefined {
    const match = html.match(
      /<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']*)["']/i,
    );
    return match ? match[1] : undefined;
  }

  private extractSiteName(html: string, url: string): string | undefined {
    const match = html.match(
      /<meta[^>]*property=["']og:site_name["'][^>]*content=["']([^"']*)["']/i,
    );
    if (match) return match[1];
    try {
      const { hostname } = new URL(url);
      return hostname.replace('www.', '').split('.')[0];
    } catch {
      return undefined;
    }
  }
}
