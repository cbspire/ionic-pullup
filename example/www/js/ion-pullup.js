angular.module('ionic-pull-up', [])
  .directive('ionPullUpFooter', ['$timeout', function($timeout) {
      return {
          restrict: 'AE',
          transclude: true,
          template: '<ng-transclude style="width: 100%;"></ng-transclude>',
          scope: {
              onExpand: '&',
              onCollapse: '&',
              onMinimize: '&',
              minimize: '='
          },
          controller: function($scope, $element) {
              var isExpanded = false,
                expandedHeight,
                tabs = document.querySelector('.tabs'),
                hasBottomTabs = document.querySelector('.tabs-bottom'),
                header = document.querySelector('.bar-header'),
                tabsHeight = tabs ? tabs.offsetHeight : 0,
                headerHeight = header ? header.offsetHeight : 0,
                handleHeight = 0,
                posY = 0, lastPosY = 0;

              function computeHeights() {
                  $timeout(function() {
                      expandedHeight = window.innerHeight - headerHeight - handleHeight;
                      if (tabs) {
                          expandedHeight = expandedHeight - tabsHeight;
                      }
                      lastPosY = expandedHeight-headerHeight;
                      $element.css({'height': expandedHeight + 'px', 'transform': 'translate3d(0, ' + lastPosY  + 'px, 0)'});

                  }, 300);
              }

              function expand() {
                  lastPosY = 0;
                  $element.css('transform', 'translate3d(0, 0, 0)');
                  $scope.onExpand();
              }

              function collapse() {
                  lastPosY = $scope.minimize ? expandedHeight : (expandedHeight - headerHeight);
                  $element.css('transform', 'translate3d(0, ' + lastPosY  + 'px, 0)');
                  $scope.minimize ? $scope.onMinimize() : $scope.onCollapse();
              }

              //function minimize() {
              //    lastPosY = expandedHeight;
              //    $element.css('transform', 'translate3d(0, ' + lastPosY  + 'px, 0)');
              //    $scope.onMinimize();
              //}

              this.setHandleHeight = function(height) {
                  handleHeight = height;
                  computeHeights();
              };

              this.getHeight = function() {
                  return $element[0].offsetHeight;
              };

              this.getBackground = function() {
                return window.getComputedStyle($element[0]).background;
              };

              this.onTap = function(e) {
                  e.gesture.srcEvent.preventDefault();
                  e.gesture.preventDefault();

                  if (!isExpanded) {
                      expand();
                  } else {
                      collapse();
                  }

                  isExpanded = !isExpanded;
              };

              this.onDoubleTap = function(e) {
                  e.gesture.srcEvent.preventDefault();
                  e.gesture.preventDefault();
                  minimize();
              };

              this.onDrag = function(e) {
                  e.gesture.srcEvent.preventDefault();
                  e.gesture.preventDefault();

                  switch (e.type) {
                      case 'dragstart':
                          $element.css('transition', 'none');
                          break;
                      case 'drag':
                          posY = Math.round(e.gesture.deltaY) + lastPosY;
                          if (posY < 0 || posY > expandedHeight) return;
                          $element.css('transform', 'translate3d(0, ' + posY + 'px, 0)');
                          break;
                      case 'dragend':
                          $element.css({'transition': '300ms ease-in-out'});
                          lastPosY = posY;
                          break;
                  }
              };

              window.addEventListener('orientationchange', function() {
                  isExpanded && collapse();
                  computeHeights();
              });

              computeHeights();
              $element.css({'-webkit-backface-visibility': 'hidden', 'backface-visibility': 'hidden', 'transition': '300ms ease-in-out'});
              if (tabs && hasBottomTabs) {
                  $element.css('bottom', tabs.offsetHeight + 'px');
              }

          }
      }
  }])
  .directive('ionPullUpContent', [function() {
      return {
          restrict: 'AE',
          require: '^ionPullUpFooter',
          link: function (scope, element, attrs, controller) {
              var hasHandle = element.parent().find('ion-pull-up-handle').length > 0,
                footerHeight = controller.getHeight();
              element.css({'display': 'block', 'margin-top': hasHandle ? 0 : footerHeight + 'px'});
              // add scrolling if needed
              if (attrs.scroll && attrs.scroll.toUpperCase() == 'TRUE') {
                  element.css({'overflow-y': 'scroll', 'overflow-x': 'hidden'});
              }
          }
      }
  }])
  .directive('ionPullUpTrigger', ['$ionicGesture', function($ionicGesture) {
      return {
          restrict: 'AE',
          require: '^ionPullUpFooter',
          link: function (scope, element, attrs, controller) {
              // add gesture
              $ionicGesture.on('tap', controller.onTap, element);
              $ionicGesture.on('drag dragstart dragend', controller.onDrag, element);
          }
      }
  }])
  .directive('ionPullUpHandle', [function() {
      return {
          restrict: 'AE',
          scope: {
          },
          require: '^ionPullUpFooter',
          link: function (scope, element, attrs, controller) {
              var height = element.css('height'),
                background =  controller.getBackground();

              controller.setHandleHeight(parseInt(height, 10));

              element.css({
                  display: 'block',
                  background: background,
                  position: 'relative',
                  bottom: height,
                  margin: '0 auto'
                  });

          }
      }
  }])

  .directive('ionSideTabs', [function() {
      return {
          restrict: 'AE',
          scope: {
          },
          controller: function($scope, $element) {

          },
          link: function (scope, element, attrs, controller) {

          }
      }
  }])
  .directive('ionSideTab', ['$timeout', function($timeout) {
      return {
          restrict: 'AE',
          transclude: true,
          template: '<div class="padding scroll-content ionic-scroll"><ion-side-tab-handle></ion-side-tab-handle><ng-transclude></ng-transclude></div>',
          scope: {
              onExpand: '&',
              onCollapse: '&'
          },
          require: '^ionSideTabs',
          controller: function($scope, $element) {
              var tabClass = document.querySelector('.tabs') ? (document.querySelector('.tabs-bottom') ? 'has-tabs' : 'has-tabs-top') : '',
                headerClass = document.querySelector('.bar-header') ? 'has-header' : '',
                container = $element[0].querySelector('.scroll-content'),
                posX = 0, lastPosX = 0, handleWidth = 0, isExpanded = false,
                expandedWidth;

              function computeWidths() {
                  $timeout(function() {
                      expandedWidth = window.innerWidth;
                      lastPosX = expandedWidth;
                      container.style.width = expandedWidth + 'px';
                      container.style.transform = 'translate3d(' + lastPosX  + 'px, 0,  0)';

                  }, 300);
              }

              container.style.transition = '300ms ease-in-out';
              container.style.overflow = 'visible';
              container.style.background = 'white';
              container.style.border = '1px solid rgb(204, 204, 204)';
              container.style.marginTop = '0';
              container.style.marginBottom = '0';
              container.style.borderRadius = '10px';
              //container.style.boxShadow = '-1px 1px #888';
              container.classList.add(tabClass);
              container.classList.add(headerClass);


              this.setHandleWidth = function(width) {
                  handleWidth = width;
                  container.style.paddingRight = width + 10 + 'px';
              };

              this.onDrag = function(e) {
                  e.gesture.srcEvent.preventDefault();
                  e.gesture.preventDefault();

                  switch (e.type) {
                      case 'dragstart':
                          container.style.transition =  'none';
                          break;
                      case 'drag':
                          posX = Math.round(e.gesture.deltaX) + lastPosX;
                          if (posX < handleWidth || posX > expandedWidth) return;
                          container.style.transform = 'translate3d(' + posX + 'px, 0, 0)';
                          break;
                      case 'dragend':
                          container.style.transition = '300ms ease-in-out';
                          lastPosX = posX;
                          break;
                  }
              };

              this.onTap = function(e) {
                  e.gesture.srcEvent.preventDefault();
                  e.gesture.preventDefault();

                  if (!isExpanded) {
                      lastPosX = handleWidth;
                      $scope.onExpand();
                  } else {
                      lastPosX = expandedWidth;
                      $scope.onCollapse();
                  }
                  container.style.transform = 'translate3d(' + lastPosX + 'px, 0, 0)';
                  isExpanded = !isExpanded;
              };

              window.addEventListener('orientationchange', function() {
                  computeWidths();
              });

             computeWidths();
          },
          link: function (scope, element, attrs, controller, transclude) {

              //var content = '<ion-content></ion-content>';
              //var handle = '<div style="height: 50px; width: 30px; display: block"></div>';
              //var elem = $compile(content)(scope);
              //angular.element(elem.find('div')[0]). append(handle). append(transclude());
              //element.append(elem);

          }
      }
  }])
  .directive('ionSideTabHandle', ['$ionicGesture', function($ionicGesture) {
      return {
          restrict: 'AE',
          scope: {
          },
          require: '^ionSideTab',
          link: function (scope, element, attrs, controller) {
              var height = element.css('height') || '50px',
                width = element.css('width') || '40px';

              element.css({
                  height: height,
                  width: width,
                  display: 'block',
                  position: 'absolute',
                  left: '-' + width,
                  background: '#fff',
                  'z-index': '100',
                  border: 'solid 1px #ccc',
                  borderRight: 'solid 1px white',
                  'border-radius': '10px 0 0 10px',
                  boxShadow: '0 1px #888'
              });
              controller.setHandleWidth(parseInt(width,10));

              $ionicGesture.on('drag dragstart dragend', controller.onDrag, element);
              $ionicGesture.on('tap', controller.onTap, element);
          }
      }
  }]);