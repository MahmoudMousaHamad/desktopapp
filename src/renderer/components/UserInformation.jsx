/* eslint-disable react/no-array-index-key */
/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
import { Box, Input, Radio, Sheet, Typography } from "@mui/joy";
import { useState } from "react";

const categoriesQuestions = {
  sponsorship: {
    question: {
      type: "radio",
      text: "Do you require sponsorship?",
      options: ["Yes", "No"],
    },
  },
  experience: {
    question: {
      type: "text",
      text: "On average, how many years of experience do you have in your field?",
    },
  },
  relocate: {
    question: {
      type: "radio",
      text: "Are you willing to relocate?",
      options: ["Yes", "No"],
    },
  },
  workAuthorization: {
    question: {
      type: "radio",
      text: "Do you have any work authorization?",
      options: ["Yes", "No"],
    },
  },
  citizen: {
    question: {
      type: "radio",
      text: "Are you a U.S. citizen?",
      options: ["Yes", "No"],
    },
  },
  clearance: {
    question: {
      type: "radio",
      text: "Do you have a security clearance?",
      options: ["Yes", "No"],
    },
  },
  salary: {
    question: {
      type: "text",
      text: "What is your salary expectation?",
    },
  },
  gpa: {
    question: {
      type: "text",
      text: "What is your GPA?",
    },
  },
  degree: {
    question: {
      type: "radio",
      text: "What is the highest level of education you have completed?",
      options: [
        "Other",
        "High school or equivalent",
        "Associate",
        "Bachelor's",
        "Master's",
        "Doctorate",
      ],
    },
  },
  phone: {
    question: {
      type: "text",
      text: "What is your phone number?",
    },
  },
  country: {
    question: {
      type: "text",
      text: "In which country do you reside?",
    },
  },
  address: {
    question: {
      type: "text",
      text: "What is your current physical address?",
    },
  },
  email: {
    question: {
      type: "text",
      text: "What is your email?",
    },
  },
  gender: {
    question: {
      type: "radio",
      text: "What is your gender?",
      options: ["Male", "Female", "Other", "Prefere not to answer"],
    },
  },
  ethnicity: {
    question: {
      type: "radio",
      text: "What is your ethnicity?",
      options: [
        "American Indian or Alaska Native",
        "Asian",
        "Black or African American",
        "Hispanic or Latino",
        "Native Hawaiian or Other Pacific Islander",
        "White",
      ],
    },
  },
  disability: {
    question: {
      type: "radio",
      text: "Disability status",
      options: [
        "Yes, I have a disability",
        "No, I don't have a disability",
        "I don't wish to answer",
      ],
    },
  },
};

export default () => {
  const [answers, setAnswers] = useState(
    JSON.parse(localStorage.getItem("userAnswers")) || {}
  );

  const questions = [];

  const handleChange = (value, category) => {
    const userAnswers = JSON.parse(localStorage.getItem("userAnswers"));
    localStorage.setItem(
      "userAnswers",
      JSON.stringify({ ...userAnswers, [category]: value })
    );
    setAnswers({ ...answers, [category]: value });
  };

  for (const category in categoriesQuestions) {
    const { question } = categoriesQuestions[category];
    const text = (
      <Typography sx={{ mb: 1 }} textColor="text.secondary" level="h5">
        {question.text}
      </Typography>
    );

    if (question.type === "text") {
      questions.push(
        <>
          {text}
          <Input
            name={category}
            type="text"
            placeholder="Your answer..."
            onChange={(e) => handleChange(e.target.value, category)}
            value={answers[category] || ""}
          />
        </>
      );
    } else {
      questions.push(
        <>
          {text}
          {question.options.map((option, index) => (
            <div key={index}>
              <Radio
                sx={{ mb: 1 }}
                checked={answers[category] === option}
                onChange={(e) => handleChange(e.target.value, category)}
                value={option}
                label={
                  <Typography textColor="text.tertiary" level="body1">
                    {option}
                  </Typography>
                }
              />
            </div>
          ))}
        </>
      );
    }
  }

  return (
    <>
      {questions.map((q, index) => (
        <Box key={index} sx={{ mb: 2 }}>
          {q}
        </Box>
      ))}
    </>
  );
};
