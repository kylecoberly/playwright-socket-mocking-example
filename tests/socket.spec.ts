import {expect} from "@playwright/test"
import {test, waitForMessage} from "../test-helpers"

test("sending socket messages", async ({page, navigate}) => {
  const socket = await navigate("http://localhost:1234")

  socket.send("Some Payload");

  await expect(page.locator(".message")).toHaveText("Some Payload")

  socket.send("Yet Another Payload");

  await expect(page.locator(".message")).toHaveText("Yet Another Payload")
})

test("receiving socket messages", async ({page, navigate}) => {
  const socket = await navigate("http://localhost:1234")

  page.click("button")

  const message = await waitForMessage(socket)
  expect(message).toBe("Aloha!")
})
