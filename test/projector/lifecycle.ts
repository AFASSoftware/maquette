import {expect, sinon} from '../utilities';
import {createProjector} from '../../src/maquette';

describe('Projector', () => {

  beforeEach(function() {
    global.requestAnimationFrame = sinon.stub();
  });

  afterEach(function() {
    delete global.requestAnimationFrame;
  });

  describe('lifecycle', () => {

    it('starts and stops', () => {
      let projector = createProjector({});
      projector.stop();
      projector.resume();
    });

  });

});
