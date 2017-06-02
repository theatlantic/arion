'use strict';

const request = require('request');
const express = require('express');
const router = express.Router();

const webhookUrl = process.env.SLACK_WEBHOOK;

if (!webhookUrl) {
  process.exit();
}

const sendStatus = (res, status) => {
  return res.status(status).end();
};

router.post('/pull-requests', (req, res) => {
  const body = req.body;
  const action = body.action;

  if (action !== 'review_requested') {
    return sendStatus(res, 204);
  }

  const reviewer = body.requested_reviewer;
  if (!reviewer) {
    return sendStatus(res, 204);
  }

  const login = reviewer.login;
  const userMap = {
    'whatisjasongoldstein': '@jason',
    'defbyte': '@cdavis',
    'jeremy-green': '@jgreen'
  };
  const username = userMap[login];

  if (!username) {
    return sendStatus(res, 204);
  }


  const pullRequest = body.pull_request;
  const prUrl = pullRequest.url;
  const prTitle = pullRequest.title;
  const prSubmitter = pullRequest.user;
  const prLogin = prSubmitter.login;


  //'{"channel": "' + body.text + '", "text": "' + message + '", "icon_emoji": ":shush:", "username": "Shush.Bot"}'
  const payload = {
    channel: username,
    text: `${prLogin} has tagged you in a Pull Request. Please review <${prUrl}|${prTitle}>`,
    icon_emoji: ':octocat:',
    username: 'Pull Request Bot'
  };

  console.log(payload);

  request.post({
    url: webhookUrl,
    form: {
      payload: JSON.stringify(payload)
    }
  }, (e, r, b) => {
    return sendStatus(res, 200);
  });
});


router.get('*', (req, res) => {
  return sendStatus(res, 404);
});

router.post('*', (req, res) => {
  return sendStatus(res, 404);
});

module.exports = router;
