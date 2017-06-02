'use strict';

const express = require('express');
const router = express.Router();

router.post('/pull-requests', (req, res) => {
  const body = req.body;
  const action = body.action;

  if (action !== 'review_requested') {
    return res.status(204).end();
  }

  console.log(body);
  return res.status(200).end();
});

router.get('*', (req, res) => {
  return res.status(404).end();
});

router.post('*', (req, res) => {
  return res.status(404).end();
});

module.exports = router;
