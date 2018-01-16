const express = require('express');
const http = require('https');
const bodyParser = require('body-parser');

const app = express();

const BOT_TOKEN = process.env.BOT_TOKEN;

app.set('port', (process.env.PORT || 5000))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

function sendToTelegram(id, body) {
  const message = {text: body, chat_id: id};
  console.log(message);
  const options = {
    host: 'api.telegram.org',
    port: '443',
    path: `/bot${BOT_TOKEN}/sendMessage`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  };
  const req = http.request(options, (res) => {
    res.setEncoding('utf8');
    let chunk = '';
    res.on('data', (c) => {
      chunk += c;
    });
    res.on('end', () => {
      console.log(chunk);
    });
  });
  req.write(JSON.stringify(message));
  req.end();
}

app.post('/test/:id', (req, res) => {
  const id = req.params.id;
  const body = req.body;
  sendToTelegram(id, JSON.stringify(body));
  res.send("OK");
});

app.post('/hook/:id', (req, res) => {
  const id = req.params.id;
  const body = req.body;
  let pre = '';
  if (body.level=='error' || body.level=='fatal') {
    pre = "👺 ";
  } else if (body.level == 'info') {
    pre = "⭐ ";
  } else if (body.level == 'warning' || body.level == 'debug') {
    pre = "👻 ";
  } else {
    pre = "👻 ";
  }
  pre += `[${body.level}] (${body.project})`;
  const msg = body.message;
  sendToTelegram(id, `${pre} ${msg}\n ${body.url}`);
  res.send("OK");
});

app.listen(app.get('port'), () => {
  console.log("Node app is running at localhost:" + app.get('port'))
});
