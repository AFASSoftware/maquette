import { expect } from './test-utilities';
import { h, VNode } from '../src/index';

/* tslint:disable:no-undefined-argument */
describe('h', () => {
  let toTextVNode = (text: string): VNode => {
    return {
      vnodeSelector: '',
      properties: undefined,
      children: undefined,
      text: text,
      domNode: null
    };
  };

  it('should flatten nested arrays', () => {
    let vnode = h('div', [
      'text',
      null,
      [ /* empty nested array */] as string[],
      [null],
      ['nested text'],
      [h('span')],
      [h('button', ['click me'])],
      [[[['deep'], null], 'here']]
    ]);

    expect(vnode.children).to.deep.equal([
      toTextVNode('text'),
      toTextVNode('nested text'),
      h('span'),
      h('button', ['click me']),
      toTextVNode('deep'),
      toTextVNode('here')
    ]);
  });

  it('Should be very flexible when accepting arguments', () => {
    let vnode = h(
      'div', [
      'text',
      h('span', [
        [
          'in array'
        ]
      ]),
      h('img', { src: 'x.png' }),
      'text2',
      undefined,
      null,
      [
        undefined,
        h('button', ['click me']),
        h('button', undefined, ['click me']),
        h('p', undefined),
        h('p', undefined, undefined),
        h('p', [undefined, undefined]),
        h('p', [null, null]),
        h('p', [null]),
        h('p', null),
        h('p', {}, null)
      ]
    ]
    );

    expect(vnode.children).to.deep.equal([
      toTextVNode('text'),
      h('span', ['in array', undefined]),
      h('img', { src: 'x.png' }),
      toTextVNode('text2'),
      h('button', ['click me']),
      h('button', ['click me'], undefined),
      h('p'),
      h('p'),
      h('p'),
      h('p'),
      h('p'),
      h('p', null),
      h('p', {})
    ]);
  });

  it('Should render a string as text', () => {
    expect(h('div', [['1']])).to.deep.equal({ vnodeSelector: 'div', properties: undefined, text: undefined, children: [toTextVNode('1')], domNode: null });
  });

  it('Should throw a new error when passing a h function as vnodeproperties into a h function', () => {
    expect(() => h('div', h('div'))).to.throw('h called with invalid arguments');
  });

  it('Should throw a new error when passing a h function instead of a VNodeChild array', () => {
    expect(() => h('div', {}, h('div') as any)).to.throw('h called with invalid arguments');
  });

  it('Should throw a new error when cal the h function with a string as second or third argument', () => {
    expect(() => h('div', 'div' as any)).to.throw('h called with invalid arguments');
    expect(() => h('div', {} as any, 'div' as any)).to.throw('h called with invalid arguments');
  });
});
