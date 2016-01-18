/* tslint:disable:no-require-imports no-unused-variable */
import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
let expect = chai.expect;

import sinon = require('sinon');
import sinonChai = require('sinon-chai');
chai.use(sinonChai);

let jsdom = require('mocha-jsdom');

export {chai, expect, sinon, jsdom};
