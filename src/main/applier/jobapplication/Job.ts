export default class Job {
	title: string;

	company: string;

	description: string;

	submissionDate?: number;

	constructor(title: string, company: string, description: string) {
		this.description = description;
		this.title = title;
		this.company = company;
	}
}
