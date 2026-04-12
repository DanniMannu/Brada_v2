type Role = "client" | "restaurant" | "courier";

export const mockUsers: {
  email: string;
  password: string;
  roles: Role[];
}[] = [
  {
    email: "client@test.com",
    password: "123456",
    roles: ["client"],
  },
  {
    email: "multi@test.com",
    password: "123456",
    roles: ["restaurant", "courier"],
  },
  {
    email: "rest@test.com",
    password: "123456",
    roles: ["restaurant"],
  },
];
