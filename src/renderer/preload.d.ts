declare global {
  interface Window {
    electron: {
      ipcRenderer: {
        invoke(channel: unknown, args: unknown[]): void;
        send(channel: unknown, args: unknown[]): void;
        on(
          channel: string,
          func: (...args: unknown[]) => void
        ): (() => void) | undefined;
        once(channel: string, func: (...args: unknown[]) => void): void;
      };
    };
  }
}

export { };
