'use strict';

const express = require('express');
const router = express.Router();

router.post('/pull-requests', (req, res) => {
  const body = req.body;
  console.log(body);

  const action = body.action;
  console.log(action);
  //if (action !== 'review_requested') {
  //
  //}
});

router.get('*', (req, res) => {
  return res.status(404).end();
});

router.post('*', (req, res) => {
  return res.status(404).end();
});

module.exports = router;
