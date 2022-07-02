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
        {options.map((option, index) => (
          <div key={index}>
            <Radio
              onChange={(e) => handleChange(e.target.value)}
              checked={option === value}
              value={option}
              label={option}
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
          {options.map((option, index) => (
            <option key={index} value={option}>
              {option}
            </option>
          ))}
        </select>
      );
    },
  },
  checkbox: {
    element: (options, handleChange, checked = {}) => (
      <div>
        {options.map((option, index) => (
          <>
            <Checkbox
              type="checkbox"
              key={index}
              checked={
                typeof checked === "object" && checked !== null
                  ? checked[option]
                  : false
              }
              onChange={(v) => handleChange({ ...checked, [option]: v })}
              label={option}
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
