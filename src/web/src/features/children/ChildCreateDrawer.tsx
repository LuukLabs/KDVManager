import React from "react";
import { Button, Drawer, Form, Input, message, Space } from "antd";
import { CreateChildCommand } from "../../api/models";
import {
  getGetAllChildrenQueryKey,
  useCreateChild,
} from "../../api/endpoints/children/children";
import { MessageType } from "antd/lib/message";
import { useQueryClient } from "react-query";

type Props = {
  visible: boolean;
  changeVisibility: (visble: boolean) => void;
};

export const ChildCreateDrawer = ({ visible, changeVisibility }: Props) => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const { mutateAsync } = useCreateChild();

  const onCloseHandler = () => {
    changeVisibility(false);
  };

  const onSubmitHandler = () => {
    form.submit();
  };

  const onFinishHandler = (record: CreateChildCommand) => {
    const loadingMessage = message.loading("Saving record..", 0);
    console.error(record);

    mutateAsync({ data: record })
      .then(onSubmitSuccess(loadingMessage))
      .catch(onSubmitFailed(loadingMessage));

    changeVisibility(false);

    // updateRecord(record)
    //   .unwrap()
    //   .then(onSubmitSuccess(loadingMessage))
    //   .catch(onSubmitFailed(loadingMessage));
  };

  const onSubmitSuccess = (loadingMessage: MessageType) => () => {
    queryClient.invalidateQueries(getGetAllChildrenQueryKey());

    loadingMessage();
    message.success("Record saved!");
    form.resetFields();
  };

  const onSubmitFailed = (loadingMessage: MessageType) => {
    return (error: any) => {
      loadingMessage();
      // form.setFields(
      //   Object.entries(error?.data?.errors || []).map(([key, value]) => ({
      //     name: [rootKey, key],
      //     errors: value as string[],
      //   }))
      // );
      // dispatch(showModal(connectedDrawerProps.name));
    };
  };

  return (
    <Drawer
      title="Create a new account"
      width={720}
      onClose={onCloseHandler}
      visible={visible}
      bodyStyle={{ paddingBottom: 80 }}
      extra={
        <Space>
          {/* <Button onClick={this.onClose}>Cancel</Button> */}
          {/* <Button onClick={this.onClose} type="primary"> */}
          {/* Submit */}
          {/* </Button> */}
        </Space>
      }
    >
      <Form form={form} onFinish={onFinishHandler} layout="vertical">
        <Form.Item
          name="givenName"
          label="Voornaam"
          rules={[{ required: true, message: "Please enter user name" }]}
        >
          <Input placeholder="Please enter user name" />
        </Form.Item>
        <Form.Item
          name="familyName"
          label="Achternaam"
          rules={[{ required: true, message: "Please enter user name" }]}
        >
          <Input placeholder="Please enter user name" />
        </Form.Item>
        <Button onClick={onSubmitHandler} type="primary">
          Submit
        </Button>
      </Form>
    </Drawer>
  );
};
