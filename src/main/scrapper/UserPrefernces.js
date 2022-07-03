class UserPrefernces {
  setPreferences({ answers, titles, locations, jobType, experienceLevel }) {
    this.answers = answers;
    this.titles = titles;
    this.locations = locations;
    this.jobType = jobType;
    this.experienceLevel = experienceLevel;
  }
}

const Preferences = new UserPrefernces();

module.exports = Preferences;
