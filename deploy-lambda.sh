#!/bin/bash
export AWS_PROFILE=""
export AWS_ACCESS_KEY_ID=""
export AWS_SECRET_ACCESS_KEY=""

# --- CONFIGURAÇÕES (Altere conforme seu projeto) ---
BUCKET_NAME="fiapx-lambda-artifacts" # Nome do bucket criado no Terraform
ZIP_NAME="auth-service.zip"                # Nome do arquivo final
SOURCE_DIR="./dist"                        # Onde fica seu código compilado (ex: dist ou build)
PROFILE="fiapx"                            # O seu perfil da AWS
S3_KEY="$ZIP_NAME"                    # Caminho dentro do bucket

echo "🚀 Iniciando processo de deploy para S3..."

echo "⬆️ Fazendo upload do novo artefato..."
aws s3 cp $ZIP_NAME s3://$BUCKET_NAME/$S3_KEY --profile $PROFILE


echo "⚡ Atualizando código da função na AWS..."
functions=("signup" "login")

for func in "${functions[@]}"
do
    aws lambda update-function-code \
        --function-name $func \
        --s3-bucket $BUCKET_NAME \
        --s3-key $S3_KEY \
        --profile $PROFILE
done

echo "✅ Deploy finalizado com sucesso!"