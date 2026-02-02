import { UserService } from '../../services/user';
import { UserRepository } from '../../repositories/user';
import { AuthManager } from '../../security/auth-manager';

// Mocks automáticos das dependências
jest.mock('../../repositories/user');
jest.mock('../../security/auth-manager');

describe('UserService', () => {
  let userService: UserService;
  let mockRepository: jest.Mocked<UserRepository>;
  let mockAuth: jest.Mocked<AuthManager>;

  beforeEach(() => {
    // Inicializa os mocks
    mockRepository = new UserRepository() as jest.Mocked<UserRepository>;
    mockAuth = new AuthManager() as jest.Mocked<AuthManager>;
    
    // Injeta os mocks no serviço
    userService = new UserService(mockRepository, mockAuth);
  });

  describe('create', () => {
    const userData = { username: 'thiago_dev', password: '123', email: 'thiago@teste.com' };

    it('deve criar um usuário com sucesso (Caminho Feliz)', async () => {
      mockAuth.hashPassword.mockResolvedValue('hashed_password');
      mockRepository.save.mockResolvedValue(undefined as any);

      const result = await userService.create(userData.username, userData.password, userData.email);

      expect(result).toEqual({ username: userData.username, email: userData.email });
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('deve lançar erro se o username já estiver em uso', async () => {
      mockAuth.hashPassword.mockResolvedValue('hashed_password');
      
      // Simula o erro específico do DynamoDB mencionado no seu código
      const ddbError = new Error();
      ddbError.name = "ConditionalCheckFailedException";
      mockRepository.save.mockRejectedValue(ddbError);

      await expect(userService.create(userData.username, userData.password))
        .rejects.toThrow("Este username já está em uso.");
    });

    it('deve relançar erros genéricos durante a criação', async () => {
      const genericError = new Error("Erro de conexão");
      mockRepository.save.mockRejectedValue(genericError);

      await expect(userService.create(userData.username, userData.password))
        .rejects.toThrow("Erro de conexão");
    });
  });

  describe('login', () => {
    const loginData = { username: 'thiago_dev', password: '123' };

    it('deve realizar login e retornar o token (Caminho Feliz)', async () => {
      mockRepository.findByUsername.mockResolvedValue({
        username: loginData.username,
        password: 'hashed_password',
        email: 'thiago@teste.com'
      } as any);
      
      mockAuth.comparePasswords.mockResolvedValue(true);
      mockAuth.generateToken.mockReturnValue('valid_jwt_token');

      const result = await userService.login(loginData.username, loginData.password);

      expect(result).toEqual({ token: 'valid_jwt_token' });
    });

    it('deve lançar erro se o usuário não for encontrado', async () => {
      mockRepository.findByUsername.mockResolvedValue('null' as any);

      await expect(userService.login(loginData.username, loginData.password))
        .rejects.toThrow("Credenciais inválidas");
    });

    it('deve lançar erro se a senha estiver incorreta', async () => {
      mockRepository.findByUsername.mockResolvedValue({
        username: loginData.username,
        password: 'hashed_password'
      } as any);
      
      mockAuth.comparePasswords.mockResolvedValue(false);

      await expect(userService.login(loginData.username, loginData.password))
        .rejects.toThrow("Credenciais inválidas");
    });
  });
});