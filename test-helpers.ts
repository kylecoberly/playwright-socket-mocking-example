import {test as baseTest} from "@playwright/test"
import {WebSocket, WebSocketServer} from "ws";

process.env.SOCKET_PORT = "3030"

export const test = baseTest.extend({
  navigate: async ({page}, use) => {
    const socketServer = new WebSocketServer({port: Number(process.env.SOCKET_PORT)})
    let resolve: (payload?: unknown) => void
    const promise = new Promise((_resolve) => {
      resolve = _resolve
    })
    socketServer.on("connection", async (socket: WebSocket) => {
      resolve(socket)
    });

    await use(async (path: string) => {
      await page.goto(path)
      return promise
    })

    socketServer.close()
  }
})

export function waitForMessage(socket: WebSocket) {
  let resolve: (payload: unknown) => void
  const promise = new Promise(_resolve => {
    resolve = _resolve
  })
  socket.on("message", async (payload: string) => {
    resolve(payload.toString())
  })
  return promise
}
