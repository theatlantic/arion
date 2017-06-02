'use strict';

const express = require('express');
const router = express.Router();

router.post('/pull-requests', (req, res) => {
  console.log(req.headers);
});

router.get('*', (req, res) => {
  return res.status(404).end();
});

router.post('*', (req, res) => {
  return res.status(404).end();
});

module.exports = router;
