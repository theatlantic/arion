'use strict';

const request = require('request');
const express = require('express');
const router = express.Router();

const webhookUrl = process.env.SLACK_WEBHOOK;

const userMap = {
  'whatisjasongoldstein': '@jason',
  'defbyte': '@cdavis',
  'jeremy-green': '@jgreen',
  'pkafei': '@pburton',
  'kjmahoney': '@kmahoney',
  'djbrinkerhoff': '@djbrinkerhoff',
  'benharrisonD59': '@bharrison',
  'joshmaker': '@joshwest',
  'atlanticashley': '@ashley',
  'samsjchi': '@schi',
  'joeyquarters': '@jnichols',
};

const statusColors = {
  'approved': '#006600',
  'commented': '#666666',
  'changes_requested': '#ff0000',
  'submitted': '#cc0099'
};


/**
 * Make a request to the passed URL
 * @param  {String}   u       The URL of the request
 * @param  {Object}   payload The params for the build
 * @param  {Function} cb      The callback
 */
const makeRequest = (u, payload, cb) => {
  request.post({
    url: u,
    form: {
      payload: JSON.stringify(payload)
    }
  }, cb);
};


/**
 * Send a status
 * @param  {Objet} res     The response object
 * @param  {Number} status The response code
 * @return {Null}          No clue
 */
const sendStatus = (res, status) => {
  return res.status(status).end();
};


/**
 * Get a formatted Slack response object
 * @param  {String} options.channel    The user to notify
 * @param  {String} options.author     The reviewers username
 * @param  {String} options.text       The title of the notification (Slack calls this text)
 * @param  {String} options.color      The attachment color
 * @param  {String} options.title      The attachment title
 * @param  {String} options.title_link The link to the PR comment
 * @param  {String} options.body       The PR comment body
 * @return {Object}                    The formatted Slack response
 */
const getSlackResponse = ({channel, author, text, color, title, title_link, body, avatar_url}) => {
  return {
    channel: channel,
    icon_emoji: ':arion:',
    username: 'Arion',
    text: text,
    attachments: [{
      title: title,
      title_link: title_link,
      author_icon: avatar_url,
      author_name: author,
      fallback: text,
      text: body,
      color: color,
      mrkdwn_in: ['text']
    }]
  };
};


if (!webhookUrl) {
  process.exit();
}


router.post('/pull-review', (req, res) => {
  const body = req.body;
  const action = body.action;

  if (!action) {
    return sendStatus(res, 204);
  }

  const actionsList = ['submitted'];

  if (!action.includes(actionsList)) {
    return sendStatus(res, 204);
  }

  const review = body.review;
  const state = review.state;
  const reviewer = review.user;
  const reviewerLogin = reviewer.login;
  const avatarUrl = reviewer.avatar_url;

  const pull_request = body.pull_request;
  const login = pull_request.login;
  const channel = userMap[login];

  const payload = getSlackResponse({
    title: pull_request.title,
    title_link: review.html_url,
    channel: channel,
    author: reviewerLogin,
    avatar_url: avatarUrl,
    body: review.body,
    text: `*${reviewerLogin}* has ${state.split('_').join(' ')} on your Pull Request`,
    color: statusColors[review.state]
  });

  // call Slack
  makeRequest(webhookUrl, payload);
  return sendStatus(res, 200);
});


router.post('/pull-requests', (req, res) => {
  const body = req.body;
  const action = body.action;

  if (action !== 'review_requested') {
    return sendStatus(res, 204);
  }

  const reviewer = body.requested_reviewer;

  const login = reviewer.login;
  const username = userMap[login];

  const pullRequest = body.pull_request;
  const prUrl = pullRequest.html_url;
  const prTitle = pullRequest.title;
  const prSubmitter = pullRequest.user;
  const prLogin = prSubmitter.login;
  const prBody = pullRequest.body;
  const avatarUrl = prSubmitter.avatar_url;

  const payload = getSlackResponse({
    title: prTitle,
    title_link: prUrl,
    channel: username,
    author: prLogin,
    avatar_url: avatarUrl,
    body: prBody,
    text: `*${prLogin}* has requested your review`,
    color: statusColors.submitted
  });

  // call Slack
  makeRequest(webhookUrl, payload);

  return sendStatus(res, 200);
});


router.get('*', (req, res) => {
  return sendStatus(res, 404);
});

router.post('*', (req, res) => {
  return sendStatus(res, 404);
});

module.exports = router;
