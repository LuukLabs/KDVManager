import React, { useState } from "react";
import { ColumnType } from "antd/es/table";
import { Table } from "antd";
import { ChildListVM } from "../../api/models";
import { useGetAllChildren } from "../../api/endpoints/children/children";

const columns: ColumnType<ChildListVM>[] = [
  {
    title: "Uuid",
    dataIndex: "id",
  },
  {
    title: "Firstname",
    dataIndex: "givenName",
  },
  {
    title: "Lastname",
    dataIndex: "familyName",
  },
];

const ChildTable = () => {
  const [pagination, setPagination] = useState({ pageSize: 5, page: 1 });
  const { data: children, isLoading, isPreviousData } = useGetAllChildren();

  return (
    <Table<ChildListVM>
      rowKey="id"
      loading={isLoading}
      columns={columns}
      dataSource={children}
    />
  );
};

export default ChildTable;
