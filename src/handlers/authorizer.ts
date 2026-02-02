import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda';
import { AuthManager } from '../security/auth-manager';

const authManager = new AuthManager();

export const handler = async (event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> => {
  // O API Gateway envia o token no campo authorizationToken
  const token = event.authorizationToken?.replace('Bearer ', '');

  if (!token) {
    console.error("Token não fornecido");
    throw new Error('Unauthorized'); 
  }

  try {
    const decoded = authManager.verifyToken(token);

    // Se o token é válido, geramos uma política de "Allow"
    return {
      principalId: decoded.username, // Identificador do usuário para logs
      policyDocument: {
        Version: '2012-10-17',
        Statement: [{
          Action: 'execute-api:Invoke',
          Effect: 'Allow',
          Resource: event.methodArn, // Protege o ARN específico da rota chamada
        }],
      },
      // O contexto permite passar dados para os próximos microserviços (como o de Vídeo)
      context: {
        username: decoded.username,
        email: decoded.email
      }
    };
  } catch (error) {
    console.error("Falha na autorização:", error);
    // Retornar 401 Unauthorized para o cliente
    throw new Error('Unauthorized'); 
  }
};