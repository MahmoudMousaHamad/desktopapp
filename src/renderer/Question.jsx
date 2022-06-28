/* eslint-disable react/no-array-index-key */
/* eslint-disable react/prop-types */

const questionTypeInput = {
  text: {
    element: (handleChange, value = "") => (
      <input
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Your answer..."
        type="text"
        value={value}
      />
    ),
  },
  textarea: {
    element: (handleChange, value = "") => (
      <textarea
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Your answer..."
        value={value}
      />
    ),
  },
  number: {
    element: (handleChange, value = "") => (
      <input
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Your answer..."
        type="number"
        value={value}
      />
    ),
  },
  date: {
    element: (handleChange, value = "") => (
      <input
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
          <div>
            <input
              key={index}
              onChange={(e) => handleChange(e.target.value)}
              value={index}
              name="current_question"
              type="radio"
            />
            <span> {o}</span>
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
            <input
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
            />
            {o}
          </>
        ))}
      </div>
    ),
  },
};

function constructInput(type, options, handleChange, answer) {
  if (options === "None") {
    return questionTypeInput[type].element(handleChange, answer);
  }
  return questionTypeInput[type].element(options, handleChange, answer);
}

export default ({ question, handleChange, answer }) => {
  const { text, type, options } = question;

  const questionText = <label htmlFor="question">{text}</label>;
  const input = constructInput(type, options, handleChange, answer);

  return (
    <div>
      {questionText}
      {input}
    </div>
  );
};
