class UserPrefernces {
	setPreferences({
		answers,
		titles,
		locations,
		jobType,
		experienceLevel,
		coverLetter,
	}) {
		this.answers = answers;
		this.titles = titles;
		this.locations = locations;
		this.jobType = jobType;
		this.experienceLevel = experienceLevel;
		this.coverLetter = coverLetter;
	}
}

const Preferences = new UserPrefernces();

module.exports = Preferences;
