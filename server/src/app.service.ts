import { Injectable } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join } from 'path';

@Injectable()
export class AppService {
  private svgContent: string;

  constructor() {
    // Read the SVG file at startup
    this.svgContent = readFileSync(
      join(__dirname, '..', 'public', 'chatter-logo.svg'),
      'utf8',
    );
  }

  getHome(): string {
    return `
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link rel="icon" type="image/svg+xml" href="/chatter-logo.svg">
          <title>Chatter Server</title>
          <style>
            body {
              background-color: black;
              margin: 0;
              padding: 0;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              font-family: "Jost", "Segoe UI", -apple-system, sans-serif;
            }
            h1 {
              color: #00cf98d2;
              font-size: 2.4rem;
              font-weight: 500;
              margin: 6px;
            }
            span {
              color: white;
              font-weight: 500;
            }
            .logo svg {
              width: 52px;
              height: 52px;
            }
          </style>
        </head>
        <body>
          <div class="logo">
            ${this.svgContent}
          </div>
          <h1>Chatter <span>Server</span></h1>
        </body>
      </html>
    `;
  }
}
