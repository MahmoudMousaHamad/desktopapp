import { SiteCreator, Status } from "../sites";

export default class Driver {
	siteCreator: SiteCreator;

	constructor(siteCreator: SiteCreator) {
		this.siteCreator = siteCreator;
	}

	public async start(): Promise<void> {
		await this.siteCreator.start();
	}

	public async stop(): Promise<void> {
		await this.siteCreator.stop();
	}

	public async pause(): Promise<void> {
		await this.siteCreator.pause();
	}

	public async resume(): Promise<void> {
		await this.siteCreator.resume();
	}

	public getStatus(): Status {
		return this.siteCreator.status;
	}
}
