import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { UserService } from '../services/user';
import bcrypt from 'bcryptjs';

const userService = new UserService();

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const { username, password } = JSON.parse(event.body || '{}');

    // 1. Busca o usuário
    const user = await userService.login(username, password);
    if (!user) {
      return { statusCode: 401, body: JSON.stringify({ message: "Credenciais inválidas" }) };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Login realizado com sucesso", token: user.token }),
    };
  } catch (error: any) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};