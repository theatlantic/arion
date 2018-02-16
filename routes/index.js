'use strict';

const request = require('request');
const express = require('express');
const router = express.Router();

const webhookUrl = process.env.SLACK_WEBHOOK;

const userMap = {
  'whatisjasongoldstein': '@jason',
  'defbyte': '@cdavis',
  'jeremy-green': '@jgreen',
  'kjmahoney': '@kmahoney',
  'djbrinkerhoff': '@djbrinkerhoff',
  'joshmaker': '@joshwest',
  'atlanticashley': '@ashley',
  'samsjchi': '@schi',
  'joeyquarters': '@jnichols',
  'madisonmcveigh': '@madisonmcveigh',
  'obswork': '@obizuwork',
  'rekhers': '@rtenjarla',
  'colinxfleming': '@cfleming'
};

const teamMap = {
  'front-end': [
    'jeremy-green',
    'joeyquarters',
    'kjmahoney',
    'rekhers'
  ],
  'platform': [
    'defbyte',
    'obswork',
    'joshmaker',
    'colinxfleming'
  ],
  'revenue': [
    'whatisjasongoldstein',
  ]
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
  let messageBody = body;

  // search the message body for markdown image syntax
  // remove them from the body
  // dedupe them using a [Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set)
  const dedupe = new Set((body.match(/!\[(.*?)\]\((.*?)\)/g) || []).map((res) => {
    messageBody = messageBody.replace(res, '');
    return res.match(/\(([^)]+)\)/)[1];
  }));

  const attachments = [{
    title: title,
    title_link: title_link,
    author_icon: avatar_url,
    author_name: author,
    fallback: text,
    text: messageBody,
    color: color,
    mrkdwn_in: ['pretext', 'text', 'fields']
  }];

  // if deduped images has a length, attach the first image, send the rest
  if (dedupe.size) {
    const dedupedImages = [...dedupe];
    attachments[0].image_url = dedupedImages.shift();
    dedupedImages.map((imageUrl) => {
      attachments.push({
        image_url: imageUrl,
        color: color
      });
    });
  }

  return {
    channel: channel,
    icon_emoji: ':arion:',
    username: 'Arion',
    text: text,
    mrkdwn: true,
    attachments: attachments
  };
};


function handleTeamRequest(team, pullRequest) {
  const members = teamMap[team.slug];
  const prSubmitter = pullRequest.user;
  const prLogin = prSubmitter.login;

  members
    .filter(member => member !== prLogin)
    .map(member => callSlack(userMap[member], pullRequest));
}

function callSlack(username, pullRequest) {
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
}


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

  if (!actionsList.includes(action)) {
    return sendStatus(res, 204);
  }

  const review = body.review;
  const state = review.state;
  const reviewer = review.user;
  const reviewerLogin = reviewer.login;
  const avatarUrl = reviewer.avatar_url;

  const pull_request = body.pull_request;
  const login = pull_request.user.login;

  const channel = userMap[login];

  if (state === 'commented' && review.body === null) {
    return sendStatus(res, 200);
  }

  if (!channel) {
    return sendStatus(res, 204);
  }

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

  const pullRequest = body.pull_request;
  const team = body.requested_team;
  if (team) {
    handleTeamRequest(team, pullRequest);
  }

  const reviewer = body.requested_reviewer;
  let login;
  let username;

  if (reviewer) {
    login = reviewer.login;
  }

  if (login) {
    username = userMap[login];
  }

  if (!username) {
    return sendStatus(res, 204);
  }

  callSlack(username, pullRequest);

  return sendStatus(res, 200);
});


router.get('*', (req, res) => {
  return sendStatus(res, 404);
});

router.post('*', (req, res) => {
  return sendStatus(res, 404);
});

module.exports = router;
