(function(){

  var h = maquette.h;
  
  var currentpage = document.location.pathname;
  currentpage = currentpage.substr(currentpage.lastIndexOf('/')+1);
  
  var tableOfContent = [
    {
      id: 'intro',
      title: 'Start',
      pages: [
        '01-intro.html'
      ]
    },
    {
      id: 'hyperscript',
      title: 'Hyperscript',
      pages: [
        '02-variables-and-properties.html',
        '03-rotation.html'
      ]
    },
    {
      id: 'events',
      title: 'Events',
      pages: [
        '04-input.html',
        '05-rotation-input.html',
      ]
    },
    {
      id: 'projector',
      title: 'How it works',
      pages: [
        '06-how-it-works.html',
        '07-rotation.html'
      ]
    },
    {
      id: 'classes',
      title: 'CSS Classes',
      pages: [
        '08-classes.html',
        '09-stealth.html'
      ]
    },
    {
      id: 'rules',
      title: '3 Rules',
      pages: [
        '10-distinguishable.html',
        '11-rotation-and-stealth.html'
      ]
    },
    {
      id: 'done',
      title: 'Finish',
      pages: [
        '12-done.html'
      ]
    },
    {
      id: 'bonus',
      title: 'Bonus level',
      hidden: true,
      pages: [
        '13-finish.html',
        '14-finale.html',
        '12-done.html'
      ]
    }
  ];
  
  var pages = [];
  var pageLevelIds = [];
  tableOfContent.forEach(function(entry) {
    entry.pages.forEach(function(page) {
      pages.push(page);
      pageLevelIds.push(entry.id);
    });
  });
  
  var levelsAchieved;
  
  var isLevelAchieved = function(levelName) {
    if(!levelsAchieved) {
      levelsAchieved = [];
      try {
        levelsAchieved = JSON.parse(localStorage.levelsAchieved);
      } catch(e) {
      }
    }
    return levelsAchieved.indexOf(levelName) !== -1;
  };
  
  var setLevelAchieved = function(levelName) {
    if(!isLevelAchieved(levelName)) {
      levelsAchieved.push(levelName);
      localStorage.levelsAchieved = JSON.stringify(levelsAchieved);
    }
  };
  
  window.createTableOfContent = function() {
    return {
      render: function() {
        var levelCount = 0;
        return h('div', [
          h('div.header', ['Levels']),
          h('ul', [
            tableOfContent.map(function (level) {
              levelCount++;
              var link = level.pages[0];
              if (level.hidden && level.pages.indexOf(currentpage) === -1) {
                if (!isLevelAchieved(level.id)) {
                  return;
                }
              }
              var achieved = isLevelAchieved(level.id);
              return h('li',{
                classes: {
                  active: link === currentpage
                }
              }, [
                h('a', { 
                  href: link,
                  classes: {
                    achieved: achieved
                  }
                }, [
                  h('span.level-count', ['Level ' + levelCount + ' - ']),
                  h('span.level-title', [level.title])
                ])
              ]);
            })
          ])
        ]);
      }
    };
  };
  
  var lockPath = 'M24.875,15.334v-4.876c0-4.894-3.981-8.875-8.875-8.875s-8.875,3.981-8.875,8.875v4.876H5.042v15.083h21.916V15.334H24.875zM10.625,10.458c0-2.964,2.411-5.375,5.375-5.375s5.375,2.411,5.375,5.375v4.876h-10.75V10.458zM18.272,26.956h-4.545l1.222-3.667c-0.782-0.389-1.324-1.188-1.324-2.119c0-1.312,1.063-2.375,2.375-2.375s2.375,1.062,2.375,2.375c0,0.932-0.542,1.73-1.324,2.119L18.272,26.956z';
  
  var tocDisappearsAnimation = function(element, removeElement) {
    window.Velocity.animate(element, { translateX: [-300, 'easeInCubic', 0]}, 200, removeElement);
  };

  var tocAppearsAnimation = function(element) {
    element.style.transform = 'translateX(-300px)';
    window.Velocity.animate(element, { translateX: [0, 'easeInCubic', -300]}, 200);
  };

  window.createNavigationBar = function(projector, showMenuButton, getUnlocked) {
    
    var menu;
    var showMenu = false;
    
    var toggleMenu = function(){
      if(!menu) {
        menu = window.createTableOfContent();
      }
      showMenu = !showMenu;
    }

    var progress = createProcessBar();
    var navigation = createNavigationButtons(projector, getUnlocked);
    return {
      render: function(){
        return h('div.navigation-bar', [
          showMenu ? [
            h('div.table-of-content', {enterAnimation: tocAppearsAnimation, exitAnimation: tocDisappearsAnimation}, [ menu.render() ])
          ]: [],
          h('div.menu-button', [ 
            showMenuButton ? [
              h('input', { type: 'checkbox', id: 'hamburger' }),
              h('label.menuicon', { 
                for: 'hamburger',
                onclick: toggleMenu
              }, [ h('span') ])
            ] : []
          ]),
          h('div.progress-bar', [ progress.render() ]),
          h('div.navigation-buttons', [ navigation.render() ])
        ]);
      }
    };
  };
  
  var createProcessBar = function(projector) {
    return {
      render : function () {
        return h('div.progress-bar', [
          tableOfContent.map(function(level) {
            if (level.hidden) {
              return;
            }
            var achieved = isLevelAchieved(level.id);
            var link = achieved ? level.pages[0] : undefined;
            return h('a', {
              href: link,
              title: level.title,
              classes: {
                achieved: achieved,
                active: level.pages[0] === currentpage || level.pages[1] === currentpage
              }
            });
          })
        ])
      }
    }
  };
  
  var createNavigationButtons = function (projector, getUnlocked) {

    var pageIndex = pages.indexOf(currentpage);
    if (pageIndex === -1) {
      throw new Error('page not registered: ' + currentpage);
    }
    var unlocked = !getUnlocked || !!isLevelAchieved(pageLevelIds[pageIndex]);
  
    var removeLockAnimation = function(element, removeElement) {
      window.Velocity.animate(element, { opacity: [0, 'easeInCubic', 1], scale: [4, 'easeOutQuad', 1]}, 1000, removeElement);
    };
  
    var navigation = {
      render: function () {
        if (!unlocked) {
          unlocked = getUnlocked();
          if (unlocked) {
            setLevelAchieved(pageLevelIds[pageIndex]);
          }
          projector.scheduleRender();
        }
        var locked = !unlocked;

        return [
          pageIndex > 0 ? [
            h('a.navigate-button.secondary', { href: pages[pageIndex - 1] }, ['Previous'])
          ] : [],
          pageIndex < pages.length-1 ? [
            h('a.navigate-button', { classes: {locked: locked, unlocked: unlocked}, href: pages[pageIndex + 1]}, [
              locked ? [
                h('svg', {viewBox: '0 0 32 32', exitAnimation: removeLockAnimation}, [
                  h('path', {d: lockPath})
                ])
              ] : [],
              'Next'
            ])
          ] : []
        ];
      }
    };
  
    return navigation;
  };
  
  window.createNavigation = createNavigationButtons;

}());
