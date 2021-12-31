import { Button } from "antd";
import React, { useCallback, useState } from "react";
import { ChildCreateDrawer } from "../../features/children/ChildCreateDrawer";
import ChildTable from "../../features/children/ChildTable";

export const IndexChildrenPage = () => {
  const [addUserDrawerVisible, setAddUserDrawerVisible] =
    useState<boolean>(false);
  const onAddChildClickHandler = useCallback(() => {
    setAddUserDrawerVisible(true);
  }, []);
  const onCloseHandler = useCallback(() => {
    setAddUserDrawerVisible(true);
  }, []);

  return (
    <>
      <Button type="primary" onClick={onAddChildClickHandler}>
        Add child
      </Button>
      <ChildTable />
      <ChildCreateDrawer
        visible={addUserDrawerVisible}
        changeVisibility={setAddUserDrawerVisible}
      />
    </>
  );
};
