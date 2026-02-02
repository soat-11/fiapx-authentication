export const config = {
  tableName: process.env.TABLE_NAME || 'tabela-default',
  isLocal: !!process.env.LOCALSTACK_HOSTNAME,
  hostname: process.env.LOCALSTACK_HOSTNAME || 'localhost',
  region: process.env.AWS_REGION || 'us-east-1'
};