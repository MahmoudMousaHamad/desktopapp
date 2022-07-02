/* eslint-disable react/no-array-index-key */
import React, { useEffect, useState } from "react";
import AddCircleOutlineSharpIcon from "@mui/icons-material/AddCircleOutlineSharp";
import RemoveCircleOutlineSharpIcon from "@mui/icons-material/RemoveCircleOutlineSharp";
import {
  Box,
  Checkbox,
  Input,
  List,
  ListItem,
  Sheet,
  Typography,
} from "@mui/joy";
import IconButton from "@mui/joy/IconButton";
// import { MultiSelect } from "react-multi-select-component";

import locationOptions from "../../main/scrapper/locations";

const options = locationOptions.locations.map((l) => ({ label: l, value: l }));

export default () => {
  const [locations, setLocations] = useState(
    JSON.parse(localStorage.getItem("default-locations")) || []
  );
  const [addedLocations, setAddedLocations] = useState(
    JSON.parse(localStorage.getItem("user-added-locations")) || []
  );
  const [currentLocation, setCurrentLocation] = useState();

  useEffect(() => {
    localStorage.setItem("default-locations", JSON.stringify(locations));
    localStorage.setItem(
      "user-added-locations",
      JSON.stringify(addedLocations)
    );
    localStorage.setItem(
      "locations",
      JSON.stringify([...new Set([...locations, ...addedLocations])])
    );
    console.log("Locations from storage:", localStorage.getItem("locations"));
  }, [locations, addedLocations]);

  return (
    <>
      <Sheet sx={{ p: 5, borderRadius: 15 }} color="primary" variant="outlined">
        <Typography sx={{ mb: 2 }} textColor="text.secondary" level="h4">
          Locations
        </Typography>
        <Box sx={{ mb: 1 }}>
          {/* <MultiSelect
            options={options}
            value={locations.map((l) => ({ label: l, value: l }))}
            onChange={(selected) => setLocations(selected.map((s) => s.value))}
            labelledBy="Select"
          /> */}
          <Box role="group" aria-labelledby="topping">
            <List
              row
              sx={{
                "--List-gap": "0px",
                "--List-item-radius": "20px",
                flexWrap: "wrap",
                gap: 1,
              }}
            >
              {options
                .map((o) => o.value)
                .map((location, index) => (
                  <ListItem key={index}>
                    <Checkbox
                      overlay
                      disableIcon
                      variant="soft"
                      label={location}
                      checked={locations.includes(location)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setLocations([...locations, location]);
                        } else {
                          console.log(
                            "Index of: ",
                            locations.indexOf(location)
                          );
                          locations.splice(locations.indexOf(location), 1);
                          setLocations([...locations]);
                        }
                      }}
                    />
                  </ListItem>
                ))}
            </List>
          </Box>
        </Box>
        <Box sx={{ mb: 1 }}>
          <Input
            value={currentLocation}
            onChange={(e) => setCurrentLocation(e.target.value)}
            endDecorator={
              <IconButton
                variant="soft"
                size="sm"
                color="primary"
                sx={{ borderRadius: "50%" }}
                onClick={() => {
                  if (currentLocation) {
                    setAddedLocations([currentLocation, ...addedLocations]);
                    setCurrentLocation("");
                  }
                }}
              >
                <AddCircleOutlineSharpIcon />
              </IconButton>
            }
          />
        </Box>
        <>
          {addedLocations.map((title, index) => (
            <Box sx={{ mb: 1, ml: 2 }} key={index}>
              <Input
                value={addedLocations[index]}
                onChange={(e) => {
                  addedLocations[index] = e.target.value;
                  setAddedLocations([...addedLocations]);
                }}
                endDecorator={
                  <IconButton
                    variant="soft"
                    size="sm"
                    color="danger"
                    sx={{ borderRadius: "50%" }}
                    onClick={() => {
                      addedLocations.splice(index, 1);
                      setAddedLocations([...locations]);
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
