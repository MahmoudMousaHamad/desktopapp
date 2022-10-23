import { Status } from "../main/driver";

declare global {
	interface Window {
		electron: {
			NODE_ENV: string;
			DriverStatus: Status;
			ipcRenderer: {
				invoke(channel: unknown, args: unknown[]): void;
				send(channel: unknown, args: unknown[]): void;
				on(
					channel: string,
					func: (...args: unknown[]) => void
				): (() => void) | undefined;
				once(channel: string, func: (...args: unknown[]) => void): void;
				eventNames(): void;
			};
		};
	}
}

export {};
