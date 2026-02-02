import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { config } from "./config";

const client = new DynamoDBClient({
  region: "us-east-1",
  endpoint: config.isLocal 
    ? `http://${config.hostname}:4566` 
    : undefined,
});

export const ddbDocClient = DynamoDBDocumentClient.from(client);
