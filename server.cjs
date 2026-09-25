const { createServer } = require("node:http");
const { parse } = require("node:url");
const next = require("next");

const port = Number(process.env.PORT) || 3000;
const hostname = "0.0.0.0";
const app = next({ dev: false, hostname, port });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    createServer((request, response) => {
      handle(request, response, parse(request.url || "/", true));
    }).listen(port, hostname, () => {
      console.log(`Ready on http://${hostname}:${port}`);
    });
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
