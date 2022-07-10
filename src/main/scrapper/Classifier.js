/* eslint-disable class-methods-use-this */
const natural = require("natural");
const path = require("path");
const pos = require("pos");
const fs = require("fs");

const { appDatatDirPath } = require("./OSHelper");

const CLASSIFIER_PATH = path.resolve(appDatatDirPath, "./classifier.json");
const CONDIFENCE_THRESHOLD = 0.33;

// Loaded when scrapper is started
// Retrained after every application
// Saved to file when driver is closed
class Classifier {
  constructor() {
    this.loadClassifier();
  }

  static ACCEPTED_TAGS = ["NN", "NNS", "NNP", "VB", "VBN"];

  loadClassifier() {
    if (fs.existsSync(CLASSIFIER_PATH)) {
      natural.BayesClassifier.load(CLASSIFIER_PATH, null, (err, c) => {
        if (err) {
          throw Error(err);
        }
        this.classifier = c;

        console.log("Classifier loaded successfully");
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
        console.log("Classifier saved successfully.");
      }
    });
  }

  retrain() {
    this.classifier.retrain();
  }
}

const SingletonClassifier = new Classifier();

const TokenizeQuestion = (question) => {
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

module.exports = {
  CLASSIFIER_PATH,
  CONDIFENCE_THRESHOLD,
  SingletonClassifier,
  TokenizeQuestion,
};
