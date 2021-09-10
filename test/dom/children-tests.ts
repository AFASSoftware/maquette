import { dom, h } from "../../src/index";
import { expect } from "../test-utilities";

describe("dom", () => {
  describe("children", () => {
    it("can remove childnodes", () => {
      let projection = dom.create(
        h("div", [h("span", { key: 1 }), h("span", { key: 2 }), h("span", { key: 3 })])
      );

      let div = projection.domNode as HTMLDivElement;
      expect(div.children.length).to.equal(3);
      let firstSpan = div.children[0];
      let lastSpan = div.children[2];

      // Remove middle div
      projection.update(h("div", [h("span", { key: 1 }), h("span", { key: 3 })]));

      expect(div.children.length).to.equal(2);
      expect(div.children[0]).to.equal(firstSpan);
      expect(div.children[1]).to.equal(lastSpan);

      // Remove first div
      projection.update(h("div", [h("span", { key: 3 })]));

      expect(div.children.length).to.equal(1);
      expect(div.children[0]).to.equal(lastSpan);

      // Remove last div
      projection.update(h("div", []));

      expect(div.children.length).to.equal(0);
    });

    it("can add childnodes", () => {
      let projection = dom.create(h("div", [h("span", { key: 2 }), h("span", { key: 4 })]));

      let div = projection.domNode as HTMLDivElement;
      expect(div.children.length).to.equal(2);
      let firstSpan = div.children[0];
      let lastSpan = div.children[1];

      projection.update(
        h("div", [
          h("span", { key: 1 }),
          h("span", { key: 2 }),
          h("span", { key: 3 }),
          h("span", { key: 4 }),
          h("span", { key: 5 }),
        ])
      );

      expect(div.children.length).to.equal(5);
      expect(div.children[1]).to.equal(firstSpan);
      expect(div.children[3]).to.equal(lastSpan);
    });

    it('uses "bind" instead of "key" when no "key" is present', () => {
      let projection = dom.create(h("div", [h("span", { bind: {} })]));

      let div = projection.domNode as HTMLDivElement;
      expect(div.children.length).to.equal(1);

      projection.update(h("div", [h("span", { bind: {} }), h("span", { bind: {} })]));

      expect(div.children.length).to.equal(2);
    });

    it("can distinguish between string keys when adding", () => {
      let projection = dom.create(
        h("div", [h("span", { key: "one" }), h("span", { key: "three" })])
      );

      let div = projection.domNode as HTMLDivElement;
      expect(div.children.length).to.equal(2);
      let firstSpan = div.children[0];
      let secondSpan = div.children[1];

      projection.update(
        h("div", [
          h("span", { key: "one" }),
          h("span", { key: "two" }),
          h("span", { key: "three" }),
        ])
      );

      expect(div.childNodes.length).to.equal(3);
      expect(div.childNodes[0]).to.equal(firstSpan);
      expect(div.childNodes[2]).to.equal(secondSpan);
    });

    it("can distinguish between falsy keys when replacing", () => {
      let projection = dom.create(
        h("div", [
          h("span", { key: false }),
          h("span", <any>{ key: null }),
          h("span", { key: "" }),
          h("span", {}),
        ])
      );

      let div = projection.domNode as HTMLDivElement;
      expect(div.children.length).to.equal(4);
      let firstSpan = div.children[0];
      let secondSpan = div.children[1];
      let thirdSpan = div.children[2];
      let fourthSpan = div.children[3];

      projection.update(h("div", [h("span", { key: 0 })]));

      expect(div.children.length).to.equal(1);
      let newSpan = div.childNodes[0];

      expect(newSpan).not.to.equal(firstSpan);
      expect(newSpan).not.to.equal(secondSpan);
      expect(newSpan).not.to.equal(thirdSpan);
      expect(newSpan).not.to.equal(fourthSpan);
    });

    it("hides _false_ values to allow using && in render functions", () => {
      let showMore = false;
      let render = () => h("div", [h("div.summary"), showMore && h("div.rest")]);
      expect(render().children).to.have.length(1);
    });

    it("can distinguish between string keys when deleting", () => {
      let projection = dom.create(
        h("div", [
          h("span", { key: "one" }),
          h("span", { key: "two" }),
          h("span", { key: "three" }),
        ])
      );

      let div = projection.domNode as HTMLDivElement;
      expect(div.children.length).to.equal(3);
      let firstSpan = div.children[0];
      let thirdSpan = div.children[2];

      projection.update(h("div", [h("span", { key: "one" }), h("span", { key: "three" })]));

      expect(div.childNodes.length).to.equal(2);
      expect(div.childNodes[0]).to.equal(firstSpan);
      expect(div.childNodes[1]).to.equal(thirdSpan);
    });

    it("can distinguish between falsy keys when deleting", () => {
      let projection = dom.create(
        h("div", [h("span", { key: 0 }), h("span", { key: false }), h("span", <any>{ key: null })])
      );

      let div = projection.domNode as HTMLDivElement;
      expect(div.children.length).to.equal(3);
      let firstSpan = div.children[0];
      let thirdSpan = div.children[2];

      projection.update(h("div", [h("span", { key: 0 }), h("span", <any>{ key: null })]));

      expect(div.childNodes.length).to.equal(2);
      expect(div.childNodes[0]).to.equal(firstSpan);
      expect(div.childNodes[1]).to.equal(thirdSpan);
    });

    it("does not reorder nodes based on keys", () => {
      let projection = dom.create(h("div", [h("span", { key: "a" }), h("span", { key: "b" })]));

      let div = projection.domNode as HTMLDivElement;
      expect(div.children.length).to.equal(2);
      let firstSpan = div.children[0];
      let lastSpan = div.children[1];

      projection.update(h("div", [h("span", { key: "b" }), h("span", { key: "a" })]));

      expect(div.childNodes.length).to.equal(2);
      expect(div.childNodes[1]).to.not.equal(firstSpan);
      expect(div.childNodes[0]).to.equal(lastSpan);
    });

    it("can insert textnodes", () => {
      let projection = dom.create(h("div", [h("span", { key: 2 }), h("span", { key: 4 })]));

      let div = projection.domNode as HTMLDivElement;
      expect(div.children.length).to.equal(2);
      let firstSpan = div.children[0];
      let lastSpan = div.children[1];

      projection.update(h("div", [h("span", { key: 2 }), "Text between", h("span", { key: 4 })]));

      expect(div.childNodes.length).to.equal(3);
      expect(div.childNodes[0]).to.equal(firstSpan);
      expect(div.childNodes[2]).to.equal(lastSpan);
    });

    it("can update single textnodes", () => {
      let projection = dom.create(h("span", [""]));
      let span = projection.domNode as HTMLSpanElement;
      expect(span.childNodes.length).to.equal(0);

      projection.update(h("span", [undefined]));
      expect(span.childNodes.length).to.equal(0);

      projection.update(h("span", ["f"]));
      expect(span.childNodes.length).to.equal(1);

      projection.update(h("span", [undefined]));
      expect(span.childNodes.length).to.equal(0);

      projection.update(h("span", [""]));
      expect(span.childNodes.length).to.equal(0);

      projection.update(h("span", [" "]));
      expect(span.childNodes.length).to.equal(1);
    });

    it("will throw an error when maquette is not sure which node is added", () => {
      let projection = dom.create(h("div", [h("span", ["a"]), h("span", ["c"])]));
      expect(() => {
        projection.update(h("div", [h("span", ["a"]), h("span", ["b"]), h("span", ["c"])]));
      }).to.throw();
    });

    it("will throw an error when maquette is not sure which node is removed", () => {
      let projection = dom.create(h("div", [h("span", ["a"]), h("span", ["b"]), h("span", ["c"])]));
      expect(() => {
        projection.update(h("div", [h("span", ["a"]), h("span", ["c"])]));
      }).to.throw();
    });

    it("allows a contentEditable tag to be altered", () => {
      let text = "initial value";
      let handleInput = (evt: Event) => {
        text = (evt.currentTarget as HTMLElement).innerHTML;
      };
      let render = () =>
        h("div", {
          contentEditable: true,
          oninput: handleInput,
          innerHTML: text,
        });
      let projection = dom.create(render());

      // The user clears the value
      projection.domNode.removeChild(projection.domNode.firstChild);
      handleInput(<any>{ currentTarget: projection.domNode });
      projection.update(render());

      // The user enters a new value
      projection.domNode.innerHTML = "changed <i>value</i>";
      handleInput(<any>{ currentTarget: projection.domNode });
      projection.update(render());

      expect(projection.domNode.innerHTML).to.equal("changed <i>value</i>");
    });

    describe("svg", () => {
      it("creates and updates svg dom nodes with the right namespace", () => {
        let projection = dom.create(
          h("div", [
            h("svg", [
              h("circle", { cx: "2cm", cy: "2cm", r: "1cm", fill: "red" }),
              h("image", { href: "/image.jpeg" }),
            ]),
            h("span"),
          ])
        );
        let svg = projection.domNode.firstChild as SVGElement;
        expect(svg.namespaceURI).to.equal("http://www.w3.org/2000/svg");
        let circle = svg.firstChild as SVGElement;
        expect(circle.namespaceURI).to.equal("http://www.w3.org/2000/svg");
        let image = svg.lastChild as SVGElement;
        expect(image.attributes[0].namespaceURI).to.equal("http://www.w3.org/1999/xlink");
        let span = projection.domNode.lastChild as SVGElement;
        expect(span.namespaceURI).to.equal("http://www.w3.org/1999/xhtml");

        projection.update(
          h("div", [
            h("svg", [
              h("circle", {
                key: "blue",
                cx: "2cm",
                cy: "2cm",
                r: "1cm",
                fill: "blue",
              }),
              h("image", { href: "/image2.jpeg" }),
            ]),
            h("span"),
          ])
        );

        let blueCircle = svg.firstChild as SVGElement;
        expect(blueCircle.namespaceURI).to.equal("http://www.w3.org/2000/svg");
      });

      it("updates svg dom properties with numbers", () => {
        let projection = dom.create(
          h("div", [
            h("svg", [
              h("circle", { cx: 20, cy: 30, r: 40, fill: "yellow" }),
              h("rect", { width: 50, height: 60, x: 70, y: 80, fill: "black" }),
            ]),
          ])
        );
        let svg = projection.domNode.firstChild;
        let circle = svg.firstChild as SVGCircleElement;
        expect(circle.getAttribute("cx")).to.equal("20");
        expect(circle.getAttribute("fill")).to.equal("yellow");
        let rect = svg.lastChild as SVGRectElement;
        expect(rect.getAttribute("height")).to.equal("60");
        expect(rect.getAttribute("y")).to.equal("80");

        projection.update(
          h("div", [
            h("svg", [
              h("circle", { cx: 20, cy: 120, r: 40, fill: "yellow" }),
              h("rect", { width: 50, height: 60, x: 70, y: 80, fill: "black" }),
            ]),
          ])
        );
        expect(circle.getAttribute("cy")).to.equal("120");
      });
    });
  });
});
