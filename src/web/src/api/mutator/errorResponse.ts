export type ErrorResponse = {
  status: number;
  errors: Array<Error>;
};

export type Error = {
  property: string;
  code: string;
  title: string;
}
