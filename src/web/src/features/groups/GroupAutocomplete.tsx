import { useListGroups } from "@api/endpoints/groups/groups";
import { type GroupListVM } from "@api/models/groupListVM";
import { Autocomplete, type AutocompleteProps, CircularProgress, TextField } from "@mui/material";
import React from "react";

type OmittedProps = "options" | "loading" | "getOptionLabel" | "renderInput";
type GroupAutocompleteProps<
  Multiple extends boolean | undefined = false,
  DisableClearable extends boolean | undefined = false,
  FreeSolo extends boolean | undefined = false,
  ChipComponent extends React.ElementType = React.ElementType,
> = Omit<
  AutocompleteProps<GroupListVM, Multiple, DisableClearable, FreeSolo, ChipComponent>,
  OmittedProps
>;

const GroupAutocomplete: React.FC<GroupAutocompleteProps> = (props) => {
  const { data, isLoading, isFetching } = useListGroups();

  return (
    <Autocomplete<GroupListVM>
      {...props}
      options={data?.value ?? []}
      loading={isLoading || isFetching}
      getOptionLabel={(option) => option.name!}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Group"
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

export default GroupAutocomplete;
