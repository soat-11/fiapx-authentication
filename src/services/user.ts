import { randomUUID } from "node:crypto";
import { UserRepository } from "../repositories/user";
import { AuthManager } from "../security/auth-manager";

export class UserService {
  constructor(
    private repository = new UserRepository(),
    private auth = new AuthManager()
  ) {}

  async create(username: string, password: string, email?: string) {
    const hashedPassword = await this.auth.hashPassword(password);
    
    const user = {
      id: randomUUID(),
      username,
      email,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
    };

    try {
      await this.repository.save(user);
      return { username, email };
    } catch (error: any) {
      if (error.name === "ConditionalCheckFailedException") {
        throw new Error("Este username já está em uso.");
      }
      throw error;
    }
  }

  async login(username: string, password: string) {
    const user = await this.repository.findByUsername(username);
    
    if (!user || !(await this.auth.comparePasswords(password, user.password))) {
      throw new Error("Credenciais inválidas");
    }

    const token = this.auth.generateToken({ username: user.username, email: user.email });
    return { token };
  }
}