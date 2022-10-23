export default class Job {
	position: string;

	company: string;

	description: string;

	searchedJobTitle: string;

	constructor(
		position: string,
		company: string,
		description: string,
		searchedJobTitle: string
	) {
		this.searchedJobTitle = searchedJobTitle;
		this.position = position;
		this.company = company;
		this.description = description;
	}
}
