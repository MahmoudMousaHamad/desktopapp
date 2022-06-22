/* eslint-disable react/prop-types */
function getInputFromType(type, value = null) {
  return <input type={type} value={value} />;
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
        <>
          {getInputFromType("radio", o)}
          <label htmlFor="question">{o}</label>
        </>
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
        <>
          <input type="checkbox" value={o} />
          <label htmlFor="question">{o}</label>
        </>
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
    <>
      {questionText}
      {input}
    </>
  );
};
