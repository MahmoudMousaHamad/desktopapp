const natural = require("natural");
const path = require("path");
const pos = require("pos");
const fs = require("fs");

// Loaded when scrapper is started
// Retrained after every application
// Saved to file when driver is closed

class Classifier {
  constructor() {
    this.loadClassifier();
  }

  static CLASSIFIER_PATH = path.resolve(__dirname, "./classifier.json");

  static ACCEPTED_TAGS = ["NN", "NNS", "NNP", "VB", "VBN"];

  static CONDIFENCE_THRESHHOLD = 0.2;

  static TokenizeQuestion(question) {
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
  }

  getClassifications(questionTokens) {
    return this.classifier.getClassifications(questionTokens);
  }

  retrain() {
    this.classifier.retrain();
  }

  loadClassifier() {
    if (fs.existsSync(Classifier.CLASSIFIER_PATH)) {
      natural.BayesClassifier.load(
        Classifier.CLASSIFIER_PATH,
        null,
        (err, classifier) => {
          if (err) {
            throw Error(err);
          }
          this.classifier = classifier;
        }
      );
    } else {
      this.classifier = new natural.BayesClassifier();
    }
  }
}

module.exports = Classifier;
