/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// link-preview.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { getLinkPreview } from 'link-preview-js';
import { LinkPreviewResponseDto } from './dto/responses/link-preview-response';

@Injectable()
export class LinkPreviewService {
  private readonly logger = new Logger(LinkPreviewService.name);

  async fetchPreview(url: string): Promise<LinkPreviewResponseDto | null> {
    try {
      // Add timeout and custom headers
      const data = await getLinkPreview(url, {
        timeout: 5000, // 5 second timeout
        headers: {
          'User-Agent':
            'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
        },
        followRedirects: 'follow', // Follow redirects
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

  // Fallback method using simple fetch for stubborn sites
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

      // Basic metadata extraction
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

    // Fallback to domain name
    try {
      const { hostname } = new URL(url);
      return hostname.replace('www.', '').split('.')[0];
    } catch {
      return undefined;
    }
  }
}
