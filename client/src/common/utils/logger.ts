// utils/logger.ts
interface LogOptions {
  prefix?: string;
  timestamp?: boolean;
  level?: "debug" | "info" | "warn" | "error";
}

class Logger {
  private readonly isDev: boolean;

  constructor() {
    this.isDev = import.meta.env.VITE_APP_ENV === "development";
  }

  private getTimestamp(): string {
    return new Date().toISOString();
  }

  private getLevelColor(level?: string): string {
    switch (level) {
      case "debug":
        return "#888";
      case "info":
        return "#00ae80";
      case "warn":
        return "#ff9800";
      case "error":
        return "#f44336";
      default:
        return "#00ae80";
    }
  }

  private formatLog(
    options: LogOptions,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _messages: unknown[]
  ): { style: string; label: string } {
    const parts: string[] = [];

    if (options.prefix) {
      parts.push(options.prefix);
    }

    if (options.level) {
      parts.push(options.level.toUpperCase());
    }

    let label = parts.length > 0 ? `[${parts.join(" ")}]` : "";

    if (options.timestamp) {
      const time = this.getTimestamp();
      label = label ? `${label} ${time}` : time;
    }

    const color = this.getLevelColor(options.level);
    const style = `color: ${color}; font-weight: bold;`;

    return { style, label };
  }

  log(...args: unknown[]) {
    if (this.isDev) {
      // Check if first arg is LogOptions
      if (
        args[0] &&
        typeof args[0] === "object" &&
        args[0] !== null &&
        "prefix" in args[0]
      ) {
        const [options, ...messages] = args as [LogOptions, ...unknown[]];
        const { style, label } = this.formatLog(options, messages);

        if (label) {
          console.log(`%c${label}`, style, ...messages);
        } else {
          console.log(...messages);
        }
      } else if (args.length > 1 && typeof args[0] === "string") {
        // Backward compatibility: string prefix
        const [prefix, ...messages] = args;
        console.log(
          `%c[${prefix}]`,
          "color: #00ae80; font-weight: bold;",
          ...messages
        );
      } else {
        console.log(`%c[APP]`, "color: #00ae80; font-weight: bold;", ...args);
        // Normal log without formatting
        // console.log(...args);
      }
    }
  }

  warn(...args: unknown[]) {
    if (this.isDev) {
      if (
        args[0] &&
        typeof args[0] === "object" &&
        args[0] !== null &&
        "prefix" in args[0]
      ) {
        const [options, ...messages] = args as [LogOptions, ...unknown[]];
        const { style, label } = this.formatLog(
          { ...options, level: "warn" },
          messages
        );

        if (label) {
          console.warn(`%c${label}`, style, ...messages);
        } else {
          console.warn(...messages);
        }
      } else if (args.length > 1 && typeof args[0] === "string") {
        const [prefix, ...messages] = args;
        console.warn(
          `%c[${prefix} WARNING]`,
          "color: #ff9800; font-weight: bold;",
          ...messages
        );
      } else {
        console.warn(...args);
      }
    }
  }

  error(...args: unknown[]) {
    // show even in prod
    if (
      args[0] &&
      typeof args[0] === "object" &&
      args[0] !== null &&
      "prefix" in args[0]
    ) {
      const [options, ...messages] = args as [LogOptions, ...unknown[]];
      const { style, label } = this.formatLog(
        { ...options, level: "error" },
        messages
      );

      if (label) {
        console.error(`%c${label}`, style, ...messages);
      } else {
        console.error(...messages);
      }
    } else if (args.length > 1 && typeof args[0] === "string") {
      const [prefix, ...messages] = args;
      console.error(
        `%c[${prefix} ERROR]`,
        "color: #f44336; font-weight: bold;",
        ...messages
      );
    } else {
      console.error(...args);
    }
  }
}

export default new Logger();
