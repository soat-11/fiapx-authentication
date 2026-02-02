import { User } from "../entities/User";

export interface IUserRepository {
  findByUsername(username: string): Promise<User | null>;
  save(user: User): Promise<void>;
}