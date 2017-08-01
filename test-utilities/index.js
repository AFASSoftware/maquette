"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* tslint:disable:no-require-imports no-unused-variable */
var chai = require("chai");
exports.chai = chai;
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
var expect = chai.expect;
exports.expect = expect;
var sinon = require("sinon");
exports.sinon = sinon;
var sinonChai = require("sinon-chai");
chai.use(sinonChai);
require('jsdom-global/register');
