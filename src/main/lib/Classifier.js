/* eslint-disable class-methods-use-this */
import natural from "natural";
import path from "path";
import pos from "pos";
import fs from "fs";

import Logger from "./Logger";
import OS from "./OS";

export const CLASSIFIER_PATH = path.resolve(
	OS.appDatatDirPath,
	"./classifier.json"
);
export const CONDIFENCE_THRESHOLD = 0.33;

// Loaded when scrapper is started
// Retrained after every application
// Saved to file when driver is closed
export class Classifier {
	constructor() {
		this.loadClassifier();
	}

	static ACCEPTED_TAGS = [
		"NN",
		"NNS",
		"NNP",
		"VB",
		"VBN",
		"VBD",
		"VBG",
		"VBP",
		"VBZ",
		"RB",
		"JJ",
	];

	loadClassifier() {
		if (fs.existsSync(CLASSIFIER_PATH)) {
			natural.BayesClassifier.load(CLASSIFIER_PATH, null, (err, c) => {
				if (err) {
					throw Error(err);
				}
				this.classifier = c;
				Logger.info("Classifier loaded successfully");
			});
		} else {
			this.classifier = new natural.BayesClassifier();
		}
	}

	addDocument(questionTokens, answer) {
		this.classifier.addDocument(questionTokens, answer);
	}

	getClassifications(questionTokens) {
		return this.classifier.getClassifications(questionTokens);
	}

	save() {
		this.classifier.save(CLASSIFIER_PATH, (err) => {
			if (err) {
				throw Error(err);
			} else {
				Logger.info("Classifier saved successfully.");
			}
		});
	}

	retrain() {
		this.classifier.retrain();
	}
}

export const SingletonClassifier = new Classifier();

export const TokenizeQuestion = (question) => {
	const words = new pos.Lexer().lex(question);
	const tagger = new pos.Tagger();
	const taggedWords = tagger.tag(words);
	const importantWords = [];
	taggedWords.forEach((taggedWord) => {
		const [word, tag] = taggedWord;
		if (Classifier.ACCEPTED_TAGS.includes(tag) && word.length > 2) {
			importantWords.push(word);
		}
	});

	return [...new Set(importantWords)];
};
