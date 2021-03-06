webpackJsonp([5],{0:function(module,exports,__webpack_require__){"use strict";__webpack_require__(1),__webpack_require__(1726),__webpack_require__(1527),__webpack_require__(1537),__webpack_require__(1538),__webpack_require__(1539),__webpack_require__(1543),__webpack_require__(1550),__webpack_require__(1551),__webpack_require__(1604),__webpack_require__(1606),__webpack_require__(1607),__webpack_require__(1394),__webpack_require__(1395),__webpack_require__(1299),__webpack_require__(1396),__webpack_require__(1).bootstrap()},773:function(module,exports,__webpack_require__){"use strict";__webpack_require__(1454);var context=__webpack_require__(1455);context.keys().forEach(function(key){return context(key)})},1454:function(module,exports){},1455:function(module,exports,__webpack_require__){function webpackContext(req){return __webpack_require__(webpackContextResolve(req))}function webpackContextResolve(req){return map[req]||function(){throw new Error("Cannot find module '"+req+"'.")}()}var map={"./base.less":1456,"./callout.less":1457,"./config.less":1458,"./control_group.less":1459,"./dark-theme.less":1460,"./dark-variables.less":1461,"./hintbox.less":1462,"./input.less":1463,"./list-group-menu.less":1464,"./navbar.less":1465,"./pagination.less":1466,"./sidebar.less":1467,"./spinner.less":1468,"./table.less":1469,"./theme.less":1470,"./truncate.less":1471};webpackContext.keys=function(){return Object.keys(map)},webpackContext.resolve=webpackContextResolve,module.exports=webpackContext,webpackContext.id=1455},1456:function(module,exports){},1457:function(module,exports){},1458:function(module,exports){},1459:function(module,exports){},1460:function(module,exports){},1461:function(module,exports){},1462:function(module,exports){},1463:function(module,exports){},1464:function(module,exports){},1465:function(module,exports){},1466:function(module,exports){},1467:function(module,exports){},1468:function(module,exports){},1469:function(module,exports){},1470:function(module,exports){},1471:function(module,exports){},1726:function(module,exports,__webpack_require__){"use strict";var _interopRequireDefault=__webpack_require__(1488)["default"],_url=__webpack_require__(380),_lodash=__webpack_require__(1498);__webpack_require__(773),__webpack_require__(1727);var _uiChrome=__webpack_require__(1),_uiChrome2=_interopRequireDefault(_uiChrome),_pluginsSecurityLibParse_next=__webpack_require__(1728),_pluginsSecurityLibParse_next2=_interopRequireDefault(_pluginsSecurityLibParse_next),_pluginsSecurityViewsLoginLoginHtml=__webpack_require__(1729),_pluginsSecurityViewsLoginLoginHtml2=_interopRequireDefault(_pluginsSecurityViewsLoginLoginHtml),messageMap={SESSION_EXPIRED:"Your session has expired. Please log in again."};_uiChrome2["default"].setVisible(!1).setRootTemplate(_pluginsSecurityViewsLoginLoginHtml2["default"]).setRootController("login",function($http,$window,secureCookies,loginState){function setupScope(){var defaultLoginMessage="Login is currently disabled because the license could not be determined. Please check that Elasticsearch is running, then refresh this page.";self.allowLogin=loginState.allowLogin,self.loginMessage=loginState.loginMessage||defaultLoginMessage,self.infoMessage=(0,_lodash.get)(messageMap,(0,_url.parse)($window.location.href,!0).query.msg),self.isDisabled=!isSecure&&secureCookies,self.isLoading=!1,self.submit=function(username,password){self.isLoading=!0,self.error=!1,$http.post("./api/security/v1/login",{username:username,password:password}).then(function(){return $window.location.href="."+next},function(){setupScope(),self.error=!0,self.isLoading=!1})}}var next=(0,_pluginsSecurityLibParse_next2["default"])($window.location),isSecure=!!$window.location.protocol.match(/^https/),self=this;setupScope()})},1727:function(module,exports){},1728:function(module,exports,__webpack_require__){"use strict";Object.defineProperty(exports,"__esModule",{value:!0});var _url=__webpack_require__(380);exports["default"]=function(location){var _parse=(0,_url.parse)(location.href,!0),query=_parse.query,hash=_parse.hash;return query.next?query.next+(hash||""):"/"},module.exports=exports["default"]},1729:function(module,exports){module.exports='<div class="container" ng-class="{error: !!login.error}">\n  <div class="logo-container">\n    <div class="kibanaWelcomeLogo"></div>\n  </div>\n\n  <div class="form-container">\n    <form class="login-form" ng-submit="login.submit(username, password)">\n      <div ng-show="login.error" class="form-group error-message">\n        <label class="control-label">Oops! Error. Try again.</label>\n      </div>\n\n      <div class="form-group inner-addon left-addon">\n        <i class="fa fa-user fa-lg fa-fw"></i>\n        <input type="text" ng-disabled="login.isDisabled || !login.allowLogin" ng-model="username" class="form-control" id="username" name="username" placeholder="Username" autofocus />\n      </div>\n\n      <div class="form-group  inner-addon left-addon">\n        <i class="fa fa-lock fa-lg fa-fw"></i>\n        <input type="password" ng-disabled="login.isDisabled|| !login.allowLogin" ng-model="password" class="form-control" id="password" name="password" placeholder="Password" />\n      </div>\n\n      <div class="form-group">\n        <button type="submit" ng-disabled="login.isDisabled || !login.allowLogin || !username || !password || login.isLoading" class="btn btn-block btn-default login">LOG IN</button>\n      </div>\n    </form>\n  </div>\n\n  <div ng-if="login.infoMessage" class="info-container">\n    {{login.infoMessage}}\n  </div>\n\n  <div ng-if="!login.allowLogin" class="warning-container">\n    {{login.loginMessage}}\n  </div>\n\n  <div ng-if="login.isDisabled" class="warning-container">\n    Logging in requires a secure connection. Please contact your administrator.\n  </div>\n</div>\n'}});