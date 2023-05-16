const { DynamoDBClient, GetItemCommand } = require('@aws-sdk/client-dynamodb');
const { marshall, unmarshall } = require('@aws-sdk/util-dynamodb');
const { SFNClient, SendTaskSuccessCommand } = require('@aws-sdk/client-sfn');

const ddb = new DynamoDBClient();
const sfn = new SFNClient();

exports.handler = async (event) => {
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