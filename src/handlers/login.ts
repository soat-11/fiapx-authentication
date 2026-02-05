import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { UserService } from '../services/user';
import { getCognitoConfig } from '../infra/cognito';


export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const { username, password } = JSON.parse(event.body || '{}');
    
    const cognitoConfig = await getCognitoConfig();
    const userService = new UserService(cognitoConfig);

    const user = await userService.login(username, password);
    if (!user) {
      return { statusCode: 401, body: JSON.stringify({ message: "Credenciais inválidas" }) };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ token: user.token }),
    };
  } catch (error: any) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};