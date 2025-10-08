import { NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB || "kanban";

if (!MONGODB_URI) {
  console.error("MONGODB_URI missing - API will fail without it");
}
let cachedClient = null;
async function getClient() {
  if (cachedClient) return cachedClient;
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  cachedClient = client;
  return client;
}
async function getBoardDoc() {
  const client = await getClient();
  const db = client.db(DB_NAME);
  const boards = db.collection("boards");
  let b = await boards.findOne({});
  if (!b) {
    const defaultBoard = {
      columns: [
        { id: "todo", title: "To Do", tasks: [] },
        { id: "inprogress", title: "In Progress", tasks: [] },
        { id: "done", title: "Done", tasks: [] },
      ],
      createdAt: new Date(),
    };
    const r = await boards.insertOne(defaultBoard);
    b = await boards.findOne({ _id: r.insertedId });
  }
  return { boards, b };
}

export async function GET(request) {
  try {
    const { boards, b } = await getBoardDoc();
    return NextResponse.json(b);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const payload = await request.json();
    const { columnId, task } = payload;
    const { boards, b } = await getBoardDoc();
    const newTask = {
      id:
        task.id ||
        Date.now().toString() + Math.random().toString(36).slice(2, 8),
      title: task.title || "Untitled",
      assignedTo: task.assignedTo || null,
    };
    const columns = b.columns.map((c) => {
      if (c.id === columnId) {
        return { ...c, tasks: [newTask, ...(c.tasks || [])] };
      }
      return c;
    });
    await boards.updateOne({}, { $set: { columns, updatedAt: new Date() } });
    const updated = await boards.findOne({});
    return NextResponse.json(updated);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const payload = await request.json();
    const client = await getClient();
    const db = client.db(DB_NAME);
    const boards = db.collection("boards");
    await boards.updateOne(
      {},
      { $set: { ...payload, updatedAt: new Date() } },
      { upsert: true }
    );
    const updated = await boards.findOne({});
    return NextResponse.json(updated);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const url = new URL(request.url);
    const taskId = url.searchParams.get("taskId");
    const columnId = url.searchParams.get("columnId");
    if (!taskId || !columnId) {
      return NextResponse.json(
        { error: "taskId and columnId required" },
        { status: 400 }
      );
    }
    const { boards } = await getBoardDoc();
    const b = await boards.findOne({});
    const columns = b.columns.map((c) => {
      if (c.id === columnId) {
        return { ...c, tasks: c.tasks.filter((t) => t.id !== taskId) };
      }
      return c;
    });
    await boards.updateOne({}, { $set: { columns, updatedAt: new Date() } });
    const updated = await boards.findOne({});
    return NextResponse.json(updated);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
