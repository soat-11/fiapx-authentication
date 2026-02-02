import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { UserService } from '../services/user';

const userService = new UserService();

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const { password, username, email } = JSON.parse(event.body || '{}');

    if (!password || !username) {
      return { statusCode: 400, body: JSON.stringify({ message: "Dados inválidos" }) };
    }

    const result = await userService.create(username, password, email);

    return {
      statusCode: 201,
      body: JSON.stringify({ message: "Usuário criado", user: result }),
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};