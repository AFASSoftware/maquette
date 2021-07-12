import chai = require("chai");
import chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
let expect = chai.expect;

import sinon = require("sinon");
import sinonChai = require("sinon-chai");
chai.use(sinonChai);

require("jsdom-global/register");

export { chai, expect, sinon };
