---
layout: default
title: Progressive enhancement
---

Progressive enhancement and virtual DOM usually do not mix.
The DOM is either virtual or real.
Maquette has two unique features that make progressive enhancement possible however.

First, maquette is very unobtrusive.
Any DOM nodes that are not part of the virtual DOM are left alone.
Second, maquette has a powerful plugin-mechanism (using the afterCreate and afterUpdate callbacks).
This plugin mechanism can be used to maintain other virtual DOM trees inside the normal DOM.

#### The usecase

The tutorial pages that I am currently developing contain static text, navigation buttons and a workbench. 
I do not want to use hyperscript to write static text. 
I also want the static text to be crawlable by search engines. 
The navigation buttons are on the top of the static text, the workbench is below it. 
The next navigation button is will be unlocked when the workbench reports that all objectives are complete.
This means that the next button and the workbench have to be in the virtual DOM using the same projector.

#### How it works

For the tutorial I created a component with only afterUpdate and afterCreate callbacks. 
This component is rendered by the projector at the document body which contains existing content. 
The callbacks make sure that the configured render functions are used to provide the virtual DOM to render at specific elements.

#### The code

Usage of the progressive enhancer component is simply:

    var enhancer = window.createProgressiveEnhancer({
      "#next": nextButton.renderMaquette,
      ".work": workbench.renderMaquette
    });

The source code for the progressive enhancer is not that complex either:

    window.createProgressiveEnhancer = function (renderFunctionsByQuerSelector) {
      var renderFunctions = [];
      var projections = [];

      var afterCreate = function (domNode, projectionOptions) {
        Object.keys(renderFunctionsByQuerSelector).forEach(function (querySelector) {
          var target = domNode.querySelector(querySelector);
          if (!target) {
            throw new Error("Could not find: " + querySelector);
          }
          var renderFunction = renderFunctionsByQuerSelector[querySelector];
          renderFunctions.push(renderFunction);
          projections.push(maquette.mergeDom(target, renderFunction(), projectionOptions));
        });
      };

      var afterUpdate = function () {
        for (var i = 0; i < renderFunctions.length; i++) {
          projections[i].update(renderFunctions[i]());
        }
      };

      return {
        renderMaquette: function () {
          return maquette.h("body", {
            afterCreate: afterCreate,
            afterUpdate: afterUpdate
          });
        }
      };
    };


The result can be viewed [here](/tutorial/01-intro.html)
