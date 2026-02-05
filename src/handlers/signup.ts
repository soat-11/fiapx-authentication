import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { UserService } from '../services/user';
import { getCognitoConfig } from '../infra/cognito';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const { password, username, email } = JSON.parse(event.body || '{}');

     const cognitoConfig = await getCognitoConfig();
        const userService = new UserService(cognitoConfig);

    if (!password || !username) {
      return { statusCode: 400, body: JSON.stringify({ message: "Dados inválidos" }) };
    }

    const client = await userService.signup({ username, password, email });

    return {
      statusCode: 201,
      body: JSON.stringify(client),
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};