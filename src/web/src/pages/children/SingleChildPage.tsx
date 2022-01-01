import React from "react";
import { useParams } from "react-router-dom";

export const SingleChildPage = () => {
  const { childId } = useParams();

  return <p>{childId}</p>;
};
