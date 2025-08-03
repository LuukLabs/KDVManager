import { useListTimeSlots } from "@api/endpoints/time-slots/time-slots";
import { type TimeSlotListVM } from "@api/models/timeSlotListVM";
import { Autocomplete, type AutocompleteProps, CircularProgress, TextField } from "@mui/material";
import React from "react";

type OmittedProps = "options" | "loading" | "getOptionLabel" | "renderInput";
type TimeSlotAutocompleteProps<
  Multiple extends boolean | undefined = false,
  DisableClearable extends boolean | undefined = false,
  FreeSolo extends boolean | undefined = false,
  ChipComponent extends React.ElementType = React.ElementType,
> = Omit<
  AutocompleteProps<TimeSlotListVM, Multiple, DisableClearable, FreeSolo, ChipComponent>,
  OmittedProps
>;

const TimeSlotAutocomplete: React.FC<TimeSlotAutocompleteProps> = (props) => {
  const { data, isLoading, isFetching } = useListTimeSlots();

  return (
    <Autocomplete
      {...props}
      options={data?.value ?? []}
      loading={isLoading || isFetching}
      getOptionLabel={(option) => option.name!}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Time slot"
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <React.Fragment>
                {isLoading || isFetching ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </React.Fragment>
            ),
          }}
        />
      )}
    />
  );
};

export default TimeSlotAutocomplete;
