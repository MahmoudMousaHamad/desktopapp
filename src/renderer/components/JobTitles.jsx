/* eslint-disable react/no-array-index-key */
import React, { useEffect, useState } from "react";
import AddCircleOutlineSharpIcon from "@mui/icons-material/AddCircleOutlineSharp";
import RemoveCircleOutlineSharpIcon from "@mui/icons-material/RemoveCircleOutlineSharp";
import { Box, Input, Sheet, Typography } from "@mui/joy";
import IconButton from "@mui/joy/IconButton";

export default () => {
  const [titles, setTitles] = useState(
    JSON.parse(localStorage.getItem("titles")) || []
  );
  const [currentTitle, setCurrentTitle] = useState();

  useEffect(() => {
    localStorage.setItem("titles", JSON.stringify(titles));
  }, [titles]);

  return (
    <>
      <Sheet
        sx={{ p: 5, borderRadius: 15, mb: 5 }}
        color="primary"
        variant="outlined"
      >
        <Typography sx={{ mb: 2 }} textColor="text.secondary" level="h4">
          Titles
        </Typography>
        <Box sx={{ mb: 1 }}>
          <Input
            value={currentTitle}
            onChange={(e) => setCurrentTitle(e.target.value)}
            endDecorator={
              <IconButton
                variant="soft"
                size="sm"
                color="primary"
                sx={{ borderRadius: "50%" }}
                onClick={() => {
                  if (currentTitle) {
                    setTitles([currentTitle, ...titles]);
                    setCurrentTitle("");
                  }
                }}
              >
                <AddCircleOutlineSharpIcon />
              </IconButton>
            }
          />
        </Box>
        <>
          {titles.map((title, index) => (
            <Box sx={{ mb: 1, ml: 2 }} key={index}>
              <Input
                value={titles[index]}
                onChange={(e) => {
                  titles[index] = e.target.value;
                  setTitles([...titles]);
                }}
                endDecorator={
                  <IconButton
                    variant="soft"
                    size="sm"
                    color="danger"
                    sx={{ borderRadius: "50%" }}
                    onClick={() => {
                      titles.splice(index, 1);
                      setTitles([...titles]);
                    }}
                  >
                    <RemoveCircleOutlineSharpIcon />
                  </IconButton>
                }
              />
            </Box>
          ))}
        </>
      </Sheet>
    </>
  );
};
