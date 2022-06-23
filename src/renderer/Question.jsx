/* eslint-disable react/prop-types */
function getInputFromType(type) {
  return <input type={type} />;
}

const questionTypeInput = {
  text: {
    element: <input type="text" />,
  },
  textarea: {
    element: <textarea />,
  },
  number: {
    element: getInputFromType("number"),
  },
  radio: {
    element: (options) =>
      options.map((o) => (
        <div>
          <input type="radio" value={o} name="current_question" /> {o}
        </div>
      )),
  },
  select: {
    element: (options) => {
      return (
        <select>
          {options.map((o) => (
            <option label={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      );
    },
  },
  checkbox: {
    element: (options) =>
      options.map((o) => (
        <div>
          <input type="checkbox" value={o} name="current_question" /> {o}
        </div>
      )),
  },
};

function constructInput(type, options) {
  if (options === "None") {
    return questionTypeInput[type].element;
  }
  return questionTypeInput[type].element(options);
}

export default ({ question }) => {
  const { text, type, options } = question;

  const questionText = <label htmlFor="question">{text}</label>;
  const input = constructInput(type, options);

  return (
    <div>
      {questionText}
      {input}
    </div>
  );
};
