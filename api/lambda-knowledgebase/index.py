import boto3
import json
import logging
import os
import time

logger = logging.getLogger()
logger.setLevel(logging.INFO)

REGION = os.environ["AWS_REGION"]
SOURCE_TYPE = "BEDROCK_KNOWLEDGEBASE"

modelName = os.environ["BedrockModelName"]
modelArn = f"arn:aws:bedrock:{REGION}::foundation-model/{modelName}"
knowledgeBaseId = os.environ["KnowledgeBaseId"]
client = boto3.client("bedrock-agent-runtime")


def retrieve_generate_knowledgebase(event):
    eventArgs = json.loads(event["body"])
    prompt = eventArgs["prompt"]
    sessionId = eventArgs["conversationId"] if "conversationId" in eventArgs else None

    bedrock_response = {}
    if sessionId:
        input = {"text": prompt}
        bedrock_response = client.retrieve_and_generate(
            input={"text": prompt},
            sessionId=sessionId,
            retrieveAndGenerateConfiguration={
                "type": "KNOWLEDGE_BASE",
                "knowledgeBaseConfiguration": {
                    "knowledgeBaseId": knowledgeBaseId,
                    "modelArn": modelArn,
                    "retrievalConfiguration": {
                        "vectorSearchConfiguration": {
                            "overrideSearchType": "HYBRID",
                        }
                    },
                },
            },
        )
    else:
        bedrock_response = client.retrieve_and_generate(
            input={"text": prompt},
            retrieveAndGenerateConfiguration={
                "type": "KNOWLEDGE_BASE",
                "knowledgeBaseConfiguration": {
                    "knowledgeBaseId": knowledgeBaseId,
                    "modelArn": modelArn,
                    "retrievalConfiguration": {
                        "vectorSearchConfiguration": {
                            "overrideSearchType": "HYBRID",
                        }
                    },
                },
            },
        )

    timestamp = bedrock_response["ResponseMetadata"]["HTTPHeaders"]["date"]
    epochTimestampInt = int(
        time.mktime(time.strptime(timestamp, "%a, %d %b %Y %H:%M:%S %Z"))
    )
    epochTimestamp = str(epochTimestampInt)

    response = {}
    response["type"] = SOURCE_TYPE
    response["conversationId"] = bedrock_response["sessionId"]
    response["systemMessageId"] = bedrock_response["sessionId"]
    response["systemMessage"] = bedrock_response["output"]["text"]
    response["epochTimeStamp"] = epochTimestamp
    response["sourceAttributions"] = bedrock_response["citations"]

    restApiResponse = json.dumps(response)
    return restApiResponse


def handler(event, context):
    logger.info(f"received event: {event}")
    response = retrieve_generate_knowledgebase(event)
    logger.info(response)
    return {
        "statusCode": 200,
        "body": response,
        "headers": {
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
        },
    }
