/* eslint-disable no-continue */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-undef */
/* eslint-disable no-plusplus */
/* eslint-disable guard-for-in */
/* eslint-disable @typescript-eslint/no-unused-vars */
const natural = require("natural");
const path = require("path");
const fs = require("fs");

const { appDatatDirPath } = require("./OSHelper");

const categories = {
	sponsorship: [
		"visa",
		"sponsorship",
		"future",
		"require",
		"status",
		"will",
		"employment",
		"H-1B",
		"eg",
		"work",
	],
	experience: ["many", "how", "year", "experience"],
	relocate: ["reliably", "commute", "able", "job", "will", "relocate"],
	relocateYesNo: [
		"willingness",
		"open",
		"requirement",
		"relocate",
		"united",
		"state",
		"nationwide",
	],
	workAuthorization: ["authorized", "work"],
	citizen: ["citizen"],
	clearance: ["clearance", "security"],
	salary: ["approximately", "offer", "kyr", "salary", "position", "amount"],
	gpa: ["average", "grade", "scale", "point", "university", "gpa"],
	degree: ["education", "degree", "highest", "level"],
	phone: ["phone", "number"],
	country: ["country"],
	address: ["address", "street"],
	email: ["email"],
	gender: ["gender"],
	ethnicity: ["ethnicity"],
	disability: ["disability", "status"],
};

const CATEGORIZER_PATH = path.resolve(appDatatDirPath, "./categorizer.json");

// Loaded when scrapper is started
// Updated after every application
// Saved to file when driver is closed
class Categorizer {
	load(userAnswers) {
		console.log("Loading categorizer");
		console.log("Categorizer file exists:", fs.existsSync(CATEGORIZER_PATH));
		if (fs.existsSync(CATEGORIZER_PATH)) {
			this.categorizer = JSON.parse(
				fs.readFileSync(CATEGORIZER_PATH, {
					encoding: "utf8",
					flag: "r",
				})
			);
			for (const category in userAnswers) {
				this.categorizer[category].answer = userAnswers[category].answer;
			}
			// fs.readFileSync(CATEGORIZER_PATH, null, (err, categorizer) => {
			// 	if (err) throw Error(err);
			// 	console.log("Categorizer 2:", categorizer);
			// 	this.categorizer = JSON.parse(categorizer);
			// 	for (const category in answers) {
			// 		this.categorizer[category].answer = answers[category].answer;
			// 	}
			// 	console.log("Categorizer loaded successfully", this.categorizer);
			// });
		} else {
			this.categorizer = userAnswers;
		}

		console.log("Categorizer:", this.categorizer);
	}

	save() {
		fs.writeFileSync(CATEGORIZER_PATH, JSON.stringify(this.categorizer));
		console.log("Categorizer saved successfully.");
	}

	categorize(questionTokens, type) {
		console.log("Categorizing question with tokens", questionTokens);

		let maxScore = -1;
		let questionCategory;

		for (const category in this.categorizer) {
			const { keywords, type: categoryType } = this.categorizer[category];
			if (type !== categoryType) {
				continue;
			}
			let score = 0;
			for (const keyword of keywords) {
				const matchingWords = questionTokens.filter((word) => {
					const distance = natural.JaroWinklerDistance(
						word,
						keyword,
						undefined,
						true
					);
					return distance > 0.9;
				});
				if (matchingWords.length > 0) {
					score++;
				}
			}
			if (score > maxScore) {
				questionCategory = category;
				maxScore = score;
			}
		}

		return {
			category: questionCategory,
			score: maxScore,
			answer: this.categorizer[questionCategory]?.answer,
			type: this.categorizer[questionCategory]?.type,
		};
	}

	addCategory(keywords, answer, type) {
		if (!this.categorizer) {
			throw Error("Categorizer was not instantiated", this.categorizer);
		}

		if (Object.keys(this.categorizer).length === 50) {
			console.log("Categorizer reached length limit");
			return;
		}

		if (keywords?.length > 7) {
			keywords.length = 7;
		}

		const category = keywords.join(" ");

		if (this.categorizer[category]) {
			console.error(
				`Category exists ${category} ${this.categorizer[category]}`
			);
		}

		console.log("Adding category:", keywords, answer, type);

		this.categorizer[category] = {
			keywords,
			answer,
			type,
		};
	}
}

const SingletonCategorizer = new Categorizer();

module.exports = {
	SingletonCategorizer,
	categories,
};
