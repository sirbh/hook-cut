import { NextResponse } from "next/server";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

const sqs = new SQSClient({ region: process.env.AWS_REGION });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { projectId, rawVideoKey } = body;

    console.log(projectId, rawVideoKey);

    if (!projectId || !rawVideoKey) {
      return NextResponse.json(
        { error: "projectId and rawVideoKey required" },
        { status: 400 }
      );
    }

    const queueUrl = process.env.SQS_QUEUE_URL!;
    const command = new SendMessageCommand({
      QueueUrl: queueUrl,
      MessageBody: JSON.stringify({ projectId, rawVideoKey, attempt: 1 }),
    });

    const result = await sqs.send(command);

    return NextResponse.json({ messageId: result.MessageId });
  } catch (err) {
    if (err instanceof Error) {
      console.error(err.message);
      return NextResponse.json({ error: err.message }, { status: 500 });
    }

    console.error("Unknown error", err);
    return NextResponse.json({ error: "Unknown error occurred" }, { status: 500 });
  }
}
