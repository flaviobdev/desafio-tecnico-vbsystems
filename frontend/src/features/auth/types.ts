export type LoginPayload = {
  document: string;
  password: string;
};

export type LoginResponse = {
  accessToken: string;
  user: {
    name: string;
    document: string;
  };
};

export type ResetPasswordPayload = {
  document: string;
  email: string;
};

export type ResetPasswordResponse = {
  success: boolean;
  statusCode: number;
};
