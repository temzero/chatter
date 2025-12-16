// link-preview.service.ts
import { LinkPreviewResponse } from '@/shared/types/responses/message.response';
import { Injectable, Logger } from '@nestjs/common';
import { getLinkPreview } from 'link-preview-js';

@Injectable()
export class LinkPreviewService {
  private readonly logger = new Logger(LinkPreviewService.name);

  // Fetch preview for a single URL
  async fetchPreview(url: string): Promise<LinkPreviewResponse | null> {
    try {
      const data = await getLinkPreview(url);

      return {
        url: data.url,
        title: 'title' in data ? data.title : undefined,
        description: 'description' in data ? data.description : undefined,
        image: 'images' in data ? data.images?.[0] : undefined,
        mediaType: data.mediaType,
        site_name: 'siteName' in data ? data.siteName : undefined,
        favicon: data.favicons?.[0],
      };
      // return {
      //   title: data.title,
      //   description: data.description,
      //   image: data.images?.[0],
      //   url: data.url,
      //   site_name: data.siteName,
      //   favicon: data.favicons[0],
      // };
    } catch (err) {
      this.logger.warn(`Failed to fetch link preview for ${url}: ${err}`);
      return null;
    }
  }
}
