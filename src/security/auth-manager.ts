import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export class AuthManager {
  private readonly secret = process.env.JWT_SECRET || 'secret_local';

  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  async comparePasswords(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  generateToken(payload: object): string {
    return jwt.sign(payload, this.secret, { expiresIn: '1h' });
  }

  verifyToken(token: string): any {
  try {
    return jwt.verify(token, this.secret);
  } catch (error) {
    throw new Error("Token inválido ou expirado");
  }
}
}
