export type ValidationError = {
  field: string;
  message: string;
};

export type ResponseBody =
  | {
      data: Record<string, any>;
    }
  | {
      errors: Array<ValidationError>;
      message: string;
    };
