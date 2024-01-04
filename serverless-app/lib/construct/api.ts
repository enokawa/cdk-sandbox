import { aws_apigateway as apigateway, aws_lambda as lambda } from 'aws-cdk-lib';
import { Construct } from 'constructs';

export interface ApiProps {
  lambda: lambda.IFunction;
  stageName: string;
}

export class Api extends Construct {
  public readonly restApi: apigateway.RestApi;
  constructor(scope: Construct, id: string, props: ApiProps) {
    super(scope, id);

    const restApi = new apigateway.RestApi(this, 'Api', {
      restApiName: 'movie-api',
      deployOptions: {
        stageName: props.stageName,
      },
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: apigateway.Cors.DEFAULT_HEADERS,
      },
    });

    const anyResource = restApi.root.addResource('{proxy+}');
    anyResource.addMethod('ANY', new apigateway.LambdaIntegration(props.lambda));

    this.restApi = restApi;
  }
}
