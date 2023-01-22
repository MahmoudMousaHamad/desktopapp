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

	getValue(site: "INDEED" | "LINKEDIN", key: "experienceLevel" | "jobType") {
		const value = this[key] as string;
		return value
			.split(",")
			.filter((v) => v.split(":")[0] === site)[0]
			.split(":")[1];
	}
}

export default new Preferences();
