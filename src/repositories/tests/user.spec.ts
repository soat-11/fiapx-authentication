import { UserRepository } from '../../repositories/user';
import { ddbDocClient } from '../../infra/db';
import { GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';

// Mock do cliente do DynamoDB
jest.mock('../../infra/db', () => ({
  ddbDocClient: {
    send: jest.fn(),
  },
}));

describe('UserRepository', () => {
  let repository: UserRepository;
  const mockTableName = 'auth-service-users-local';

  beforeEach(() => {
    process.env.TABLE_NAME = mockTableName;
    repository = new UserRepository();
    jest.clearAllMocks();
  });

  describe('findByUsername', () => {
    it('deve retornar o item quando o usuário for encontrado', async () => {
      const mockUser = { username: 'thiago_dev', email: 'teste@teste.com' };
      (ddbDocClient.send as jest.Mock).mockResolvedValue({ Item: mockUser });

      const result = await repository.findByUsername('thiago_dev');

      expect(result).toEqual(mockUser);
      expect(ddbDocClient.send).toHaveBeenCalledWith(expect.any(GetCommand));
    });

    it('deve retornar undefined quando o usuário não existir', async () => {
      (ddbDocClient.send as jest.Mock).mockResolvedValue({ Item: undefined });

      const result = await repository.findByUsername('inexistente');

      expect(result).toBeUndefined();
    });

    it('deve relançar erros inesperados do DynamoDB no findByUsername', async () => {
      (ddbDocClient.send as jest.Mock).mockRejectedValue(new Error('Internal Server Error'));

      await expect(repository.findByUsername('thiago_dev')).rejects.toThrow('Internal Server Error');
    });
  });

  describe('save', () => {
    it('deve salvar o usuário com sucesso', async () => {
      const mockUser = { username: 'thiago_dev', email: 'teste@teste.com' };
      (ddbDocClient.send as jest.Mock).mockResolvedValue({});

      await repository.save(mockUser);

      expect(ddbDocClient.send).toHaveBeenCalledWith(expect.any(PutCommand));
      const putCall = (ddbDocClient.send as jest.Mock).mock.calls[0][0];
      expect(putCall.input.Item).toEqual(mockUser);
      expect(putCall.input.ConditionExpression).toBe('attribute_not_exists(username)');
    });

    it('deve relançar erro de duplicidade (ConditionalCheckFailedException)', async () => {
      const ddbError = new Error('The conditional request failed');
      ddbError.name = 'ConditionalCheckFailedException';
      (ddbDocClient.send as jest.Mock).mockRejectedValue(ddbError);

      await expect(repository.save({ username: 'duplicado' })).rejects.toThrow();
    });
  });
});