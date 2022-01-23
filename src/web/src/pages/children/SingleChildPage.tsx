import { Button } from "antd";
import React, { useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDeleteChild } from "../../api/endpoints/children/children";

export const SingleChildPage = () => {
  const { childId } = useParams();
  const { mutateAsync } = useDeleteChild();
  const navigate = useNavigate();

  const onDeleteClickHandler = useCallback(() => {
    mutateAsync({ id: childId! }).then(() => navigate("/children"));
  }, [childId]);

  return (
    <>
      <p>{childId}</p>
      <Button onClick={onDeleteClickHandler}>Delete</Button>
    </>
  );
};
