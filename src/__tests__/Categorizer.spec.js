/*
 * @jest-environment node
 */

const { Categorizer } = require("../main/scrapper/Categorizer");

const categorizer = new Categorizer();

const sponsorship = {
	keywords: ["visa", "sponsorship", "future"],
	type: "radio",
	answer: "Yes",
};

const userAnswers = {
	sponsorship,
};

beforeEach(() => {
	userAnswers.sponsorship = sponsorship;

	categorizer.load(userAnswers);
	categorizer.save();
});

test("Categorizer load, save, and categorize functions", () => {
	userAnswers.sponsorship.answer = "No";
	categorizer.load(userAnswers);
	const category = categorizer.categorize(["visa", "sponsorship"], "radio");
	expect(category.answer).toBe("No");
});

test("Categorizer addCategory function", () => {
	const keywords = ["test", "question", "answer", "no"];
	categorizer.addCategory(keywords, "No", "text");
	const category = categorizer.categorize(["test", "question"], "text");
	expect(category.answer).toBe("No");
});
