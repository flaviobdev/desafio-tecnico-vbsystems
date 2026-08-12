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
