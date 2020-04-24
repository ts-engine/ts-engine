import http from "http";
console.log("starting server");

http
  .createServer((req, res) => {
    console.log(req.url);
    res.writeHead(400, { "Content-Type": "text/plain" });
    res.end("ok");
  })
  .listen(2000);
