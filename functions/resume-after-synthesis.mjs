import { DynamoDBClient, GetItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { SFNClient, SendTaskSuccessCommand } from '@aws-sdk/client-sfn';

const ddb = new DynamoDBClient();
const sfn = new SFNClient();

export const handler = async (event) => {
  await Promise.all(event.Records.map(async (record) => {
    const item = JSON.parse(record.body);
    const detail = JSON.parse(item.Message);
    const ddbRecord = await ddb.send(new GetItemCommand({
      TableName: process.env.TABLE_NAME,
      Key: marshall({
        pk: detail.taskId,
        sk: 'text-synthesis'
      })
    }));

    if (!ddbRecord.Item) {
      console.error({ error: 'DynamoDB Record not found', taskId: detail.taskId });
    }
    else {
      const data = unmarshall(ddbRecord.Item);
      await sfn.send(new SendTaskSuccessCommand({
        taskToken: data.taskToken,
        output: JSON.stringify(detail)
      }));
    }
  }));
};
