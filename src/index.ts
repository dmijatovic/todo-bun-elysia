import { Elysia } from "elysia"
import getEnv from "./utils/getEnv";
import { getHome, getTodoList, getTodoLists, postTodoList, updateTodoList} from "./api"
import { logInfo } from "./utils/log"
import db,{dbConnect} from "./db/pgdb"


const PORT = getEnv("API_PORT", "8080")

// create server
const app = new Elysia()

// try to connect to database
dbConnect()

// DEFINE ROUTES
app.get("/", getHome)

// list
app.get("/list", getTodoLists)
app.get("/list/:id", getTodoList)
app.post("/list", postTodoList)
app.put("/list", updateTodoList)



// NOTE! This does not work
// app.onResponse((ctx) => {
//   // set custom header
//   ctx.set.headers['x-powered-by'] = 'bun-elysia-api'
//   // log request
//   loggerHook(ctx)
// })

// start listening
app.listen(PORT)


// listen to container/process stop
process.on("SIGINT", async() => {
  logInfo("Closing server on SIGINT")
  await db.end()
  await app.stop()
  // process.exit(0)
})

process.on("SIGTERM", async() => {
  logInfo("Closing server on SIGTERM")
  await db.end()
  await app.stop()
  // process.exit(0)
})

// LOG
logInfo(`${app.server?.hostname}:${app.server?.port}...started`)
