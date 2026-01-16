export const EmailStyles = {
  COMMON: `
    body {
      font-family: 'Arial', sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #00ae80 0%, #008c66 100%);
      color: white;
      padding: 30px;
      text-align: center;
      border-radius: 10px 10px 0 0;
    }
    .content {
      background: #f9f9f9;
      padding: 30px;
      border-radius: 0 0 10px 10px;
    }
    .welcome-text {
      font-size: 18px;
      margin-bottom: 20px;
    }
    .features {
      background: white;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .feature-item {
      margin: 10px 0;
      padding-left: 20px;
    }
    .cta-button {
      display: inline-block;
      background: #00ae80;
      color: white !important;
      padding: 12px 30px;
      text-decoration: none;
      border-radius: 5px;
      margin: 20px 0;
      font-weight: bold;  
      cursor: pointer;
    }
    .reset-button {
      display: inline-block;
      background: #dc3545;
      color: white;
      padding: 12px 30px;
      text-decoration: none;
      border-radius: 5px;
      margin: 20px 0;
      font-weight: bold;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      font-size: 14px;
      color: #666;
    }
    .verification-code {
      font-size: 32px;
      font-weight: bold;
      text-align: center;
      letter-spacing: 5px;
      margin: 20px 0;
      color: #00ae80;
    }
    .expiration-notice {
      background: #fff3cd;
      border: 1px solid #ffeaa7;
      padding: 15px;
      border-radius: 5px;
      margin: 20px 0;
      color: #856404;
    }
    .security-notice {
      background: #d4edda;
      border: 1px solid #c3e6cb;
      padding: 15px;
      border-radius: 5px;
      margin: 20px 0;
      color: #155724;
    }
  `,
  FEEDBACK: `
body {
  font-family: Arial, sans-serif;
  background: #f5f5f5;
}

h1 {
  margin: 0;
  padding: 0;
}

.container {
  max-width: 600px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  border: 2px solid rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.content {
  padding: 20px;
}

.feedback-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  padding-bottom: 0;
  color: white;
  background: linear-gradient(135deg, #00ae80 0%, #008c66 100%);
  overflow: hidden;
}

.background-symbol {
  font-size: 60px;
  margin-left: auto;
  opacity: 0.8;
  z-index: 0;
}

.star {
  color: #facc15;
  font-size: 40px;
}

.meta {
  background: #f9f9f9;
  padding: 0 16px;
  border-radius: 8px;
  margin: 16px 0;
  font-size: 14px;
  border: 2px solid rgb(134, 239, 172);
}

.label {
  font-weight: bold;
  color: #00ae80;
}

.message {
  padding: 0;
  font-size: 20px;
  margin-top: 12px;
  margin-bottom: 40px;
}

.cta-button {
  display: inline-block;
  background: #00ae80;
  color: white;
  padding: 8px 16px;
  text-decoration: none;
  border-radius: 5px;
  margin-top: 10px;
}

.divider {
  height: 1px;
  background: #ddd;
  margin: 12px 0;
}

.footer-info {
  font-size: 16px;
  font-style: italic;
  font-weight: 300;
  width: 100%;
  text-align: right;
  color: rgba(0, 0, 0, 0.6);
}
`,
} as const;
