import { setupServer } from "msw/node";
import { rest } from "msw";

import { PosifloraFetch } from "~/posiflora/posiflora-fetch";

const baseUrl = "https://test.posiflora.com/";
const apiPath = "/api/v1";
const endpointPath = "/errorTest";

function makePosifloraFetch() {
  return new PosifloraFetch(baseUrl);
}

test("throws error if posiflora is unreachable", async () => {
  const server = setupServer(
    rest.get(apiPath + endpointPath, (req, res) =>
      res.networkError("Failed to connect")
    )
  );
  server.listen();

  await expect(makePosifloraFetch().do(endpointPath)).rejects.toThrowError(
    "Failed to connect"
  );

  server.close();
});

test("rethrows error from posiflora if one is returned", async () => {
  const error = {
    status: 401,
    title: "Unauthorised",
    detail: "User not found",
  };

  const server = setupServer(
    rest.get(apiPath + endpointPath, (req, res, ctx) =>
      res(ctx.status(error.status), ctx.json({ errors: [error] }))
    )
  );
  server.listen();

  await expect(makePosifloraFetch().do(endpointPath)).rejects.toThrowError(
    error.title
  );

  server.close();
});

test("rethrows error from posiflora and lists all of the errors in a message if multiple errors are returned", async () => {
  const errors = [
    {
      status: 400,
      title: "Passwords are not identical",
    },
    {
      status: 400,
      title: "Password has disallowed characters",
    },
  ];

  const server = setupServer(
    rest.get(apiPath + endpointPath, (req, res, ctx) =>
      res(ctx.status(400), ctx.json({ errors }))
    )
  );
  server.listen();

  await expect(makePosifloraFetch().do(endpointPath)).rejects
    .toThrowErrorMatchingInlineSnapshot(`
        "[https://test.posiflora.com/api/v1/errorTest] Several errors were returned: 
        400: Passwords are not identical,
        400: Password has disallowed characters"
      `);

  server.close();
});
