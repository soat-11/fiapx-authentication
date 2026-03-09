import { handler } from '../login';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { UserService } from '../../services/user.service';
import { getCognitoConfig } from '../../infra/cognito';

// 1. Mock das dependências externas
jest.mock('../../services/user.service');
jest.mock('../../infra/cognito');

const MockedUserService = UserService as jest.MockedClass<typeof UserService>;
const mockedGetCognitoConfig = getCognitoConfig as jest.MockedFunction<typeof getCognitoConfig>;

describe('Login Handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetCognitoConfig.mockResolvedValue({
      region: 'us-east-1',
      userPoolId: 'test-pool',
      appClientId: 'test-client'
    });
  });

  it('deve retornar 200 e o token quando o login for bem-sucedido', async () => {
    const mockToken = 'jwt-token-valido';
    MockedUserService.prototype.login.mockResolvedValue({
      token: mockToken,
      refreshToken: 'refresh-token'
    });

    const event = {
      body: JSON.stringify({ username: 'paloma_dev', password: 'Password123!' })
    } as APIGatewayProxyEvent;

    const result = await handler(event);

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual({ token: mockToken });
  });

  it('deve retornar 400 quando o body do evento for null', async () => {
  const event = {
    body: null
  } as unknown as APIGatewayProxyEvent;

  const result = await handler(event);

  expect(result.statusCode).toBe(400);
  expect(JSON.parse(result.body)).toEqual({ message: "Invalid body request" });
  
  // Garante que o UserService sequer foi instanciado ou chamado
  expect(MockedUserService).not.toHaveBeenCalled();
});

  it('deve retornar 401 quando o service não retornar um usuário', async () => {
    MockedUserService.prototype.login.mockResolvedValue(null as any);

    const event = {
      body: JSON.stringify({ username: 'paloma_dev', password: 'wrong_password' })
    } as APIGatewayProxyEvent;

    const result = await handler(event);

    expect(result.statusCode).toBe(401);
    expect(JSON.parse(result.body).message).toBe('Invalid credentials');
  });

  it('deve retornar 500 quando ocorrer uma exceção inesperada', async () => {
    MockedUserService.prototype.login.mockRejectedValue(new Error('Falha no Cognito'));

    const event = {
      body: JSON.stringify({ username: 'paloma_dev', password: 'any' })
    } as APIGatewayProxyEvent;

    const result = await handler(event);

    expect(result.statusCode).toBe(500);
    expect(JSON.parse(result.body).error).toBe('Falha no Cognito');
  });
});