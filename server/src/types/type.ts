export type CustomResponse<T> = {
  statusCode: number;
  message?: string;
  data?: T;
  error?: string;
};
