export default class Job {
	title: string;

	company: string;

	description: string;

	submissionDate?: number;

	site: string;

	constructor(
		title: string,
		company: string,
		description: string,
		site: string
	) {
		this.description = description;
		this.title = title;
		this.company = company;
		this.site = site;
	}
}
