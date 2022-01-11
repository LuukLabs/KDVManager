import React from "react";
import { useParams } from "react-router-dom";

export const SingleChildPage = () => {
  const { childId } = useParams();
  const { mutate } = useDelete

  return <p>{childId}</p>;
};
