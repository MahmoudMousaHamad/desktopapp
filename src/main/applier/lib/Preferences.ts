export class Preferences {
	answers: any;

	titles: any;

	locations: any;

	jobType: any;

	experienceLevel: any;

	coverLetter: any;

	setPreferences({
		answers,
		titles,
		locations,
		jobType,
		experienceLevel,
		coverLetter,
	}: any) {
		this.experienceLevel = experienceLevel;
		this.coverLetter = coverLetter;
		this.locations = locations;
		this.answers = answers;
		this.jobType = jobType;
		this.titles = titles;
	}
}

export default new Preferences();
