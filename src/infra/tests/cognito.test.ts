import { getCognitoConfig } from '../cognito';

describe('getCognitoConfig', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv; // Garante que o env original volte ao final
  });

  it('deve retornar as configurações quando as variáveis estiverem definidas', async () => {
    process.env.COGNITO_USER_POOL_ID = 'pool-123';
    process.env.COGNITO_APP_CLIENT_ID = 'client-456';
    process.env.AWS_REGION = 'sa-east-1';

    const config = await getCognitoConfig();

    expect(config).toEqual({
      userPoolId: 'pool-123',
      appClientId: 'client-456',
      region: 'sa-east-1'
    });
  });

  it('deve usar os valores padrão se a região não estiver definida', async () => {
    process.env.COGNITO_USER_POOL_ID = 'pool-123';
    process.env.COGNITO_APP_CLIENT_ID = 'client-456';
    delete process.env.AWS_REGION;

    const config = await getCognitoConfig();
    expect(config.region).toBe('us-east-1');
  });

  it('deve lançar erro se COGNITO_USER_POOL_ID estiver vazio', async () => {
    process.env.COGNITO_USER_POOL_ID = ""; 
    process.env.COGNITO_APP_CLIENT_ID = "algo";

    await expect(getCognitoConfig()).rejects.toThrow(
      "As variáveis de ambiente COGNITO_USER_POOL_ID ou COGNITO_APP_CLIENT_ID não foram definidas."
    );
  });
});