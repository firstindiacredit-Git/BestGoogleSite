// Mock API for RemoteApp authentication
// This is for testing purposes only

const mockUsers = [
  {
    id: 1,
    username: "demo",
    email: "demo@example.com",
    password: "demo123",
  },
  {
    id: 2,
    username: "admin",
    email: "admin@example.com",
    password: "admin123",
  },
  {
    id: 3,
    username: "user",
    email: "user@example.com",
    password: "user123",
  },
  {
    id: 4,
    username: "test",
    email: "test@example.com",
    password: "test123",
  },
];

// Simulate API delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockLogin = async (credentials) => {
  await delay(1000); // Simulate network delay

  const user = mockUsers.find(
    (u) => u.email === credentials.email && u.password === credentials.password
  );

  if (user) {
    const { password, ...userWithoutPassword } = user;
    return {
      success: true,
      message: "Login successful",
      token: `mock-token-${user.id}-${Date.now()}`,
      user: userWithoutPassword,
    };
  } else {
    throw new Error("Invalid email or password");
  }
};

export const mockSignup = async (userData) => {
  await delay(1000); // Simulate network delay

  // Check if user already exists
  const existingUser = mockUsers.find((u) => u.email === userData.email);
  if (existingUser) {
    throw new Error("User with this email already exists");
  }

  // Create new user
  const newUser = {
    id: mockUsers.length + 1,
    username: userData.username,
    email: userData.email,
    password: userData.password,
  };

  mockUsers.push(newUser);

  const { password, ...userWithoutPassword } = newUser;
  return {
    success: true,
    message: "Account created successfully",
    user: userWithoutPassword,
  };
};
