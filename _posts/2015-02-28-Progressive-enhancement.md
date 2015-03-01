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
This plugin mechanism can be used to maintain a new virtual DOM inside the normal DOM.

#### The usecase

The tutorial pages that I am currently developing contain static text, navigation buttons and  a workbench. I do not want to use hyperscript to write static text. I also want the static text to be crawlable by search engines. The navigation buttons are dependent on the workbench, the next button will be unlocked when the workbench reports that all objectives are complete.

#### How it works

For the tutorial I created a component with only afterUpdate and afterCreate callbacks. This component is rendered by the projector at the body component which contains existing content. The callbacks make sure that the configured components are rendered at the right DOM nodes.

#### The code

The special enhancer component:

    window.createProgressiveEnhancer = function (componentsByQuerSelector) {
      var components = [];
      var projections = [];

      var afterCreate = function (domNode, projectionOptions) {
        Object.keys(componentsByQuerSelector).forEach(function (querySelector) {
          var target = domNode.querySelector(querySelector);
          if (!target) {
            throw new Error("Could not find: " + querySelector);
          }
          var component = componentsByQuerSelector[querySelector];
          components.push(component);
          projections.push(maquette.mergeDom(target, component.renderMaquette(), projectionOptions));
        });
      };

      var afterUpdate = function () {
        for (var i = 0; i < projections.length; i++) {
          projections[i].update(components[i].renderMaquette());
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


The usage of the enhancer component:

    var enhancer = window.createProgressiveEnhancer({
      "#next": {
        renderMaquette: function () {
          var locked = !workbench.allObjectivesAchieved();
          return h("a", [locked ? [h("i.mdi-action-lock.lock")] : []]);
        }
      },
      ".work": workbench
    });


The result can be viewed [here](/tutorial/01-intro.html)
