# Demo: Sending Socket Messages In Playwright

## Setup

* `npm install`
* `npm start` to run the server
* `npm test` to run socket tests against it

## Usage

The `test-helpers.ts` file contains examples of two things that help with mocking sockets. The `navigate` fixture works just like `page.goto` except it yields a socket connection:

```ts
test("sending socket messages", async ({page, navigate}) => {
  const socket = await navigate("http://localhost:1234")

  socket.send("Some Payload");

  await expect(page.locator(".message")).toHaveText("Some Payload")

  socket.send("Yet Another Payload");

  await expect(page.locator(".message")).toHaveText("Yet Another Payload")
})
```

Note that this accepts the web URL you want to navigate to, not a socket URL. The `page` fixture still works like normal.

The other one is a `waitForMessage` function that yields any incoming socket message:

```ts
test("receiving socket messages", async ({page, navigate}) => {
  const socket = await navigate("http://localhost:1234")

  page.click("button")

  const message = await waitForMessage(socket)
  expect(message).toBe("Aloha!")
})
```

## Dependencies

The only dependency is `ws`, which is used to programmatically create and control a socket server on your localhost. `test-helpers.ts` reads the `SOCKET_PORT` out of the environment (hard-coded to `3030` in the example). It doesn't matter what this is as long as the front-end knows what to connect to.

## What's With The Weird Promises Thing

Both utilities use a trick from Playwright's own socket tests to get things out of callbacks.

1. Lift the resolver function out of an empty promise
2. Call the resolver from a callback (eg. a socket event) with the thing you want to smuggle out of the callback
3. Return the promise

```ts
function someHelper(){
  let resolve: (payload?: unknown) => void
  const promise = new Promise((_resolve) => {
    resolve = _resolve
  })
  someEmitter.on("some event", (someCallbackValue) => {
    resolve(someCallbackValue)
  });
  return promise
}
```

Now, you can make Playwright wait for an event to emit and get its value:

```ts
const someCallbackValue = await someHelper()
```
