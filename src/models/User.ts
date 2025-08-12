export type User = {
  id: number;
  name: string;
  email: string;
  password_hash: string; // Armazenar hash da senha
};