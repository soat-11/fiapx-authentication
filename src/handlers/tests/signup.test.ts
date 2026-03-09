import { handler } from '../signup';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { UserService } from '../../services/user.service';
import { getCognitoConfig } from '../../infra/cognito';

jest.mock('../../services/user.service');
jest.mock('../../infra/cognito');

const MockedUserService = UserService as jest.MockedClass<typeof UserService>;
const mockedGetCognitoConfig = getCognitoConfig as jest.MockedFunction<typeof getCognitoConfig>;

describe('Signup Handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetCognitoConfig.mockResolvedValue({
      region: 'us-east-1',
      userPoolId: 'test-pool',
      appClientId: 'test-client'
    });
  });

  it('deve retornar 201 quando o usuário for cadastrado com sucesso', async () => {
    const mockResponse = { UserSub: '123-uuid' } as any;
    MockedUserService.prototype.signup.mockResolvedValue(mockResponse);
    
    const event = {
      body: JSON.stringify({ 
        username: 'paloma_dev', 
        password: 'Password123!', 
        email: 'paloma@example.com' 
      })
    } as APIGatewayProxyEvent;

    const result = await handler(event);

    expect(result.statusCode).toBe(201);
    expect(JSON.parse(result.body)).toEqual(mockResponse);
    expect(MockedUserService.prototype.signup).toHaveBeenCalledWith({
      username: 'paloma_dev',
      password: 'Password123!',
      email: 'paloma@example.com'
    });
  });

  it('deve retornar 400 quando o body for nulo', async () => {
    const event = { body: null } as APIGatewayProxyEvent;

    const result = await handler(event);

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body).message).toBe('Invalid body request');
  });

  it('deve retornar 400 quando o password ou username estiverem faltando', async () => {
    const event = {
      body: JSON.stringify({ email: 'paloma@example.com' })
    } as APIGatewayProxyEvent;

    const result = await handler(event);

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body).message).toBe('Invalid body request');
  });

  it('deve retornar 500 em caso de falha inesperada no service', async () => {
    MockedUserService.prototype.signup.mockRejectedValue(new Error('Erro no Cognito'));

    const event = {
      body: JSON.stringify({ username: 'paloma', password: '123' })
    } as APIGatewayProxyEvent;

    const result = await handler(event);

    expect(result.statusCode).toBe(500);
    expect(JSON.parse(result.body).error).toBe('Erro no Cognito');
  });
});