import { GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { ddbDocClient } from "../infra/db";

export class UserRepository {
  private readonly tableName = process.env.TABLE_NAME;

  async findByUsername(username: string) {
    const response = await ddbDocClient.send(new GetCommand({
      TableName: this.tableName,
      Key: { username },
    }));
    return response.Item;
  }

  async save(user: any) {
    return await ddbDocClient.send(new PutCommand({
      TableName: this.tableName,
      Item: user,
      ConditionExpression: "attribute_not_exists(username)",
    }));
  }
}