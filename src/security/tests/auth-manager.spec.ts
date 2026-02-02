import { AuthManager } from '../auth-manager';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

describe('AuthManager', () => {
  let authManager: AuthManager;
  const secret = 'secret_local';

  beforeEach(() => {
    authManager = new AuthManager();
    jest.clearAllMocks();
  });

  describe('hashPassword', () => {
    it('deve gerar um hash diferente da senha em texto puro', async () => {
      const password = 'minha_senha_123';
      const hash = await authManager.hashPassword(password);

      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(30); // Padrão bcrypt
    });
  });

  describe('comparePasswords', () => {
    it('deve retornar true para senhas que coincidem', async () => {
      const password = '123';
      const hash = await bcrypt.hash(password, 10);
      
      const result = await authManager.comparePasswords(password, hash);
      expect(result).toBe(true);
    });

    it('deve retornar false para senhas que não coincidem', async () => {
      const hash = await bcrypt.hash('outra_senha', 10);
      
      const result = await authManager.comparePasswords('123', hash);
      expect(result).toBe(false);
    });
  });

  describe('generateToken', () => {
    it('deve gerar um token JWT assinado', () => {
      const payload = { username: 'thiago_dev' };
      const token = authManager.generateToken(payload);

      const decoded = jwt.verify(token, secret) as any;
      expect(decoded.username).toBe(payload.username);
    });
  });

  describe('verifyToken', () => {
    it('deve retornar o payload decodificado para um token válido', () => {
      const payload = { username: 'thiago_dev' };
      const token = jwt.sign(payload, secret);

      const result = authManager.verifyToken(token);
      expect(result.username).toBe(payload.username);
    });

    it('deve lançar erro para token inválido', () => {
      const tokenInvalido = 'token.malformado.aqui';

      expect(() => authManager.verifyToken(tokenInvalido))
        .toThrow("Token inválido ou expirado");
    });

    it('deve lançar erro para token expirado', () => {
      // Gera um token que já nasceu expirado para forçar o erro
      const tokenExpirado = jwt.sign({ user: 'test' }, secret, { expiresIn: '-1s' });

      expect(() => authManager.verifyToken(tokenExpirado))
        .toThrow("Token inválido ou expirado");
    });
  });
});