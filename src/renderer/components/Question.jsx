/* eslint-disable react/no-array-index-key */
/* eslint-disable react/prop-types */

import { Box, Checkbox, Input, Radio, Sheet, Typography } from "@mui/joy";
import { MenuItem, Select } from "@mui/material";

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
          <Box sx={{ mb: 1 }} key={index}>
            <Radio
              onChange={(e) => handleChange(Number(e.target.value))}
              checked={index === value}
              value={index}
              label={option}
              sx={{ fontSize: 20, p: 1 }}
            />
          </Box>
        ))}
      </div>
    ),
  },
  select: {
    element: (options, handleChange, value) => {
      return (
        <Select
          label="Select an option"
          onChange={(e) => handleChange(Number(e.target.value))}
          value={value || 0}
        >
          {options.map((option, index) => (
            <MenuItem key={index} value={index}>
              {option}
            </MenuItem>
          ))}
        </Select>
      );
    },
  },
  checkbox: {
    element: (options, handleChange, checked = []) => (
      <div>
        {options.map((option, index) => (
          <Box sx={{ mb: 1 }} key={index}>
            <Checkbox
              checked={checked.includes(index)}
              onChange={() => {
                if (checked.includes(index)) {
                  checked.splice(checked.indexOf(index));
                } else {
                  checked.push(index);
                }
                // checked[index] = !checked[index];
                handleChange([...checked]);
              }}
              label={option}
            />
          </Box>
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

  const input = constructInput(type, options, handleChange, answer);

  return (
    <Box
      sx={{
        p: 2,
        mb: 1,
      }}
    >
      <Typography level="h3">{text}</Typography>
      <Box sx={{ mt: 5 }}>{input}</Box>
    </Box>
  );
};
