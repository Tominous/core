const express = require('express');
const spec = require('./spec');

const api = new express.Router();

// API spec
api.get('/', (req, res) => {
  res.json(spec);
});

// API endpoints
Object.keys(spec.paths).forEach((path) => {
  Object.keys(spec.paths[path]).forEach((verb) => {
    const {
      route,
      func,
    } = spec.paths[path][verb];
    api[verb](route(), func);
  });
});

module.exports = api;
