/* eslint-disable react/no-array-index-key */
/* eslint-disable react/prop-types */

import { Checkbox, Input, Radio, Sheet } from "@mui/joy";

const questionTypeInput = {
  text: {
    element: (handleChange, value = "") => (
      <Input
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Your answer..."
        type="text"
        value={value}
      />
    ),
  },
  textarea: {
    element: (handleChange, value = "") => (
      <Input
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Your answer..."
        value={value}
      />
    ),
  },
  number: {
    element: (handleChange, value = "") => (
      <Input
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Your answer..."
        type="number"
        value={value}
      />
    ),
  },
  date: {
    element: (handleChange, value = "") => (
      <Input
        onChange={(e) => handleChange(e.target.value)}
        placeholder="yyyy-MM-dd"
        type="date"
        value={value}
      />
    ),
  },
  radio: {
    element: (options, handleChange, value) => (
      <div>
        {options.map((o, index) => (
          <div key={index}>
            <Radio
              checked={parseInt(value, 10) === index}
              onChange={(e) => handleChange(e.target.value)}
              value={index}
              name="current_question"
              type="radio"
              label={o}
            />
          </div>
        ))}
      </div>
    ),
  },
  select: {
    element: (options, handleChange, value) => {
      return (
        <select onChange={(e) => handleChange(e.target.value)} value={value}>
          {options.map((o, index) => (
            <option key={index} value={index}>
              {o}
            </option>
          ))}
        </select>
      );
    },
  },
  checkbox: {
    element: (options, handleChange, checked = {}) => (
      <div>
        {options.map((o, index) => (
          <>
            <Checkbox
              type="checkbox"
              key={index}
              checked={
                typeof checked === "object" && checked !== null
                  ? checked[index.toString()]
                  : false
              }
              onChange={(v) =>
                handleChange({ ...checked, [index.toString()]: v })
              }
              label={o}
            />
          </>
        ))}
      </div>
    ),
  },
};

function constructInput(type, options, handleChange, answer, ...args) {
  if (options === "None") {
    return questionTypeInput[type].element(handleChange, answer, ...args);
  }
  return questionTypeInput[type].element(
    options,
    handleChange,
    answer,
    ...args
  );
}

export default ({ question, handleChange, answer, ...params }) => {
  const { text, type, options } = question;

  const questionText = <h3>{text}</h3>;
  const input = constructInput(type, options, handleChange, answer);

  return (
    <Sheet sx={{ marginBottom: 2, maxWidth: 400 }}>
      <Sheet>{questionText}</Sheet>
      <Sheet>{input}</Sheet>
    </Sheet>
  );
};
