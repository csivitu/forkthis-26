export const login = async () => {
  return {
    token: "mock-token-123",
    user: {
      id: 1,
      name: "rahul",
      email: "test@example.com",
    },
  };
};

export const getMe = async () => {
  return {
    id: 1,
    name: "rahul",
    email: "test@example.com",
  };
};