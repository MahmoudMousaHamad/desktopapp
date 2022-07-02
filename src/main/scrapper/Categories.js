/* eslint-disable no-restricted-syntax */
/* eslint-disable no-undef */
/* eslint-disable no-plusplus */
/* eslint-disable guard-for-in */
/* eslint-disable @typescript-eslint/no-unused-vars */
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
  salary: ["approximately", "offer", "kyr", "salary", "position"],
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

const categorize = (questionText) => {
  let maxScore = -1;
  let questionCategory;

  for (const category in categories) {
    const keywords = categories[category];
    let score = 0;
    for (const word of keywords) {
      if (questionText.toLowerCase().includes(word.toLowerCase())) {
        score++;
      }
    }
    if (score > maxScore) {
      questionCategory = category;
      maxScore = score;
    }
  }

  return { category: questionCategory, score: maxScore };
};

class UserAnswers {
  setUserAnswers(userAnswers) {
    this.userAnswers = userAnswers;
  }
}

const UserAnswersSingleton = new UserAnswers();

module.exports = {
  UserAnswersSingleton,
  categories,
  categorize,
};
