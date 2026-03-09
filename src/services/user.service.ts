import { 
  CognitoIdentityProviderClient, 
  SignUpCommand, 
  AdminConfirmSignUpCommand,
  InitiateAuthCommand,
  AuthFlowType
} from "@aws-sdk/client-cognito-identity-provider";

export class UserService {
  private client: CognitoIdentityProviderClient;
  private userPoolId: string;
  private clientId: string;
  
  constructor(config: { region: string; userPoolId: string; appClientId: string }) {
    this.client = new CognitoIdentityProviderClient({ region: config.region });
    this.userPoolId = config.userPoolId;
    this.clientId = config.appClientId;
  }
  
  async signup({ username, password, email }: any) {
    try {
      await this.client.send(
        new SignUpCommand({
          ClientId: this.clientId,
          Username: username,
          Password: password,
          UserAttributes: [
            { Name: "email", Value: email },
          ],
        })
      );
      
      const client = await this.client.send(
        new AdminConfirmSignUpCommand({
          Username: username,
          UserPoolId: this.userPoolId,
        })
      );
      
      return client;
    } catch (error: any) {
      if (error.name === "UsernameExistsException") {
        return { statusCode: 400, body: JSON.stringify({ message: "User already exists" }) };
      }
      throw error;
    }
  }
  
  async login(username: string, password: string) {
    try {
      const command = new InitiateAuthCommand({
        AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
        ClientId: this.clientId,
        AuthParameters: {
          USERNAME: username,
          PASSWORD: password,
        },
      });
      
      const response = await this.client.send(command);
      
      return {
        token: response.AuthenticationResult?.IdToken,
        refreshToken: response.AuthenticationResult?.RefreshToken
      };
    } catch (error: any) {
      throw new Error("Invalid credentials");
    }
  }
}