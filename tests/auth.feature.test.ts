import { handler as loginHandler } from '../src/handlers/login';
import { handler as signupHandler } from '../src/handlers/signup';
import { mockClient } from "aws-sdk-client-mock";
import { 
  CognitoIdentityProviderClient, 
  SignUpCommand, 
  AdminConfirmSignUpCommand, 
  InitiateAuthCommand 
} from "@aws-sdk/client-cognito-identity-provider";
import { APIGatewayProxyEvent } from 'aws-lambda';

const cognitoMock = mockClient(CognitoIdentityProviderClient);

describe('Feature: Fluxo de Autenticação de Usuário', () => {
  
  beforeEach(() => {
    cognitoMock.reset();
    process.env.COGNITO_USER_POOL_ID = 'us-east-1_test';
    process.env.COGNITO_APP_CLIENT_ID = 'test-client-id';
  });

  it('deve permitir que um novo usuário se cadastre e depois faça login', async () => {
    cognitoMock.on(SignUpCommand).resolves({});
    cognitoMock.on(AdminConfirmSignUpCommand).resolves({ $metadata: { httpStatusCode: 200 } });

    const signupEvent = {
      body: JSON.stringify({
        username: 'paloma_dev',
        password: 'Password123!',
        email: 'paloma@example.com'
      })
    } as APIGatewayProxyEvent;

    const signupResponse = await signupHandler(signupEvent);
    expect(signupResponse.statusCode).toBe(201);

    cognitoMock.on(InitiateAuthCommand).resolves({
      AuthenticationResult: { IdToken: 'token-gerado-pelo-cognito' }
    });

    const loginEvent = {
      body: JSON.stringify({
        username: 'paloma_dev',
        password: 'Password123!'
      })
    } as APIGatewayProxyEvent;

    const loginResponse = await loginHandler(loginEvent);
    
    expect(loginResponse.statusCode).toBe(200);
    expect(JSON.parse(loginResponse.body)).toHaveProperty('token', 'token-gerado-pelo-cognito');
  });
});