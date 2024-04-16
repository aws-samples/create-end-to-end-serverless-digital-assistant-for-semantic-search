email_input="$1"
userpool_id=$(aws cloudformation describe-stacks --stack-name "webapp-userpool-stack" --output 'text' --query 'Stacks[0].Outputs[?OutputKey==`UserPoolId`].OutputValue')
aws cognito-idp admin-create-user --user-pool-id "$userpool_id" --username "$email_input" --user-attributes Name="email",Value="$email_input" Name="email_verified",Value="True"