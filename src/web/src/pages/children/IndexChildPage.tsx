import { Button } from "antd";
import React, { useCallback, useState } from "react";
import { ChildCreateDrawer } from "../../features/children/ChildCreateDrawer";
import { TableHeader } from "../../components/TableHeader";
import ChildTable from "../../features/children/ChildTable";

export const IndexChildPage = () => {
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
      <TableHeader>
        <Button type="primary" onClick={onAddChildClickHandler}>
          Add child
        </Button>
        <Button type="primary" onClick={onAddChildClickHandler}>
          sdff child
        </Button>
      </TableHeader>

      <ChildTable />
      <ChildCreateDrawer
        visible={addUserDrawerVisible}
        changeVisibility={setAddUserDrawerVisible}
      />
    </>
  );
};
