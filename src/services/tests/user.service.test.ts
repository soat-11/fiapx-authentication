import { mockClient } from "aws-sdk-client-mock";
import { 
  CognitoIdentityProviderClient, 
  SignUpCommand, 
  AdminConfirmSignUpCommand, 
  InitiateAuthCommand 
} from "@aws-sdk/client-cognito-identity-provider";
import { UserService } from "../user.service";

const cognitoMock = mockClient(CognitoIdentityProviderClient);

describe("UserService", () => {
  let userService: UserService;
  const config = {
    region: "us-east-1",
    userPoolId: "us-east-1_test",
    appClientId: "test-client-id"
  };
  
  beforeEach(() => {
    userService = new UserService(config);
    cognitoMock.reset();
  });
  
  describe("signup", () => {
    it("deve realizar o signup e confirmar o usuário com sucesso", async () => {
      cognitoMock.on(SignUpCommand).resolves({});
      cognitoMock.on(AdminConfirmSignUpCommand).resolves({ $metadata: { httpStatusCode: 200 } });
      
      const result = await userService.signup({
        username: "paloma_dev",
        password: "Password123!",
        email: "paloma@example.com"
      });
      
      expect(result).toBeDefined();
      expect(cognitoMock.calls()).toHaveLength(2);
    });
    
    it("deve retornar erro 400 se o usuário já existir", async () => {
      cognitoMock.on(SignUpCommand).rejects({
        name: "UsernameExistsException"
      });
      
      const result: any = await userService.signup({
        username: "paloma_dev",
        password: "Password123!",
        email: "paloma@example.com"
      });
      
      expect(result.statusCode).toBe(400);
      expect(JSON.parse(result.body).message).toBe("User already exists");
    });
    
    it("deve lançar o erro original se ocorrer uma falha desconhecida no Cognito", async () => {
      const erroGenerico = new Error("Internal Service Error");
      cognitoMock.on(SignUpCommand).rejects(erroGenerico);
      
      await expect(userService.signup({
        username: "paloma_dev",
        password: "Password123!",
        email: "paloma@example.com"
      })).rejects.toThrow("Internal Service Error");
    });
  });
  
  describe("login", () => {
    it("deve retornar tokens quando as credenciais forem válidas", async () => {
      cognitoMock.on(InitiateAuthCommand).resolves({
        AuthenticationResult: {
          IdToken: "mock-id-token",
          RefreshToken: "mock-refresh-token"
        }
      });
      
      const result = await userService.login("paloma_dev", "Password123!");
      
      expect(result.token).toBe("mock-id-token");
      expect(result.refreshToken).toBe("mock-refresh-token");
    });
    
    it("deve lançar erro de credenciais inválidas em caso de falha no Cognito", async () => {
      cognitoMock.on(InitiateAuthCommand).rejects(new Error("NotAuthorizedException"));
      
      await expect(userService.login("paloma_dev", "wrong_pass"))
      .rejects.toThrow("Invalid credentials");
    });
  });
});