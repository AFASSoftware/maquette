import {expect, sinon} from './utilities';
import {createCache} from '../src/maquette';

describe('Cache', function() {

  it('should execute calculate() on the first invocation', function() {
    let cache = createCache();
    let calculate = sinon.stub().returns('calculation result');
    let result = cache.result([1], calculate);
    expect(calculate).to.be.calledOnce;
    expect(result).to.equal('calculation result');
  });

  it('should only execute calculate() on next invocations when the inputs are different', function() {
    let cache = createCache();
    let calculate = sinon.stub().returns('calculation result');
    cache.result([1], calculate);
    expect(calculate).to.have.callCount(1);
    cache.result([1], calculate);
    expect(calculate).to.have.callCount(1);
    cache.result([2], calculate);
    expect(calculate).to.have.callCount(2);
  });

  it('can be invalidated manually', () => {
    let cache = createCache();
    let calculate = sinon.stub().returns('calculation result');
    cache.result([1], calculate);
    cache.invalidate();
    cache.result([1], calculate);
    expect(calculate).to.have.callCount(2);
  });

});
