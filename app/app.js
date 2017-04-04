"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var application = require("application");
application.mainModule = "main-page";
application.cssFile = "./app.css";
/***
 * Creates a performance.now() function
 */
if (!global.performance) {
    global.performance = {};
}
if (!global.performance.now) {
    if (application.android) {
        global.performance.now = function () {
            return java.lang.System.nanoTime() / 1000000;
        };
    }
    else if (application.ios) {
        global.performance.now = function () {
            return CACurrentMediaTime() * 1000;
        };
    }
}
var AppViewModel_1 = require("./components/common/AppViewModel");
var nativescript_urlhandler_1 = require("nativescript-urlhandler");
nativescript_urlhandler_1.handleOpenURL(function (appURL) {
    console.log('Received url request: ', appURL);
    AppViewModel_1.appViewModel.ready.then(function () {
        var urlParam = appURL.params.get('url');
        if (urlParam) {
            AppViewModel_1.appViewModel.openUrl(urlParam);
        }
        else {
            var url = 'https://' + appURL.path;
            AppViewModel_1.appViewModel.openUrl(url);
        }
    });
});
application.start();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYXBwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEseUNBQTRDO0FBRTVDLFdBQVcsQ0FBQyxVQUFVLEdBQUcsV0FBVyxDQUFBO0FBQ3BDLFdBQVcsQ0FBQyxPQUFPLEdBQUcsV0FBVyxDQUFDO0FBRWxDOztHQUVHO0FBQ0gsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztJQUN0QixNQUFNLENBQUMsV0FBVyxHQUFHLEVBQUUsQ0FBQztBQUM1QixDQUFDO0FBQ0QsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDMUIsRUFBRSxDQUFDLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7UUFDdEIsTUFBTSxDQUFDLFdBQVcsQ0FBQyxHQUFHLEdBQUc7WUFDckIsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxHQUFHLE9BQU8sQ0FBQztRQUNqRCxDQUFDLENBQUM7SUFDTixDQUFDO0lBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ3pCLE1BQU0sQ0FBQyxXQUFXLENBQUMsR0FBRyxHQUFHO1lBQ3JCLE1BQU0sQ0FBQyxrQkFBa0IsRUFBRSxHQUFHLElBQUksQ0FBQztRQUN2QyxDQUFDLENBQUM7SUFDTixDQUFDO0FBQ0wsQ0FBQztBQUVELGlFQUFnRTtBQUNoRSxtRUFBZ0U7QUFFaEUsdUNBQWEsQ0FBQyxVQUFDLE1BQWM7SUFDekIsT0FBTyxDQUFDLEdBQUcsQ0FBQyx3QkFBd0IsRUFBRSxNQUFNLENBQUMsQ0FBQztJQUM5QywyQkFBWSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUM7UUFDcEIsSUFBTSxRQUFRLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDMUMsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztZQUNYLDJCQUFZLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ25DLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNKLElBQU0sR0FBRyxHQUFHLFVBQVUsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDO1lBQ3JDLDJCQUFZLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzlCLENBQUM7SUFDTCxDQUFDLENBQUMsQ0FBQztBQUNQLENBQUMsQ0FBQyxDQUFDO0FBRUgsV0FBVyxDQUFDLEtBQUssRUFBRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGFwcGxpY2F0aW9uID0gcmVxdWlyZShcImFwcGxpY2F0aW9uXCIpO1xuXG5hcHBsaWNhdGlvbi5tYWluTW9kdWxlID0gXCJtYWluLXBhZ2VcIlxuYXBwbGljYXRpb24uY3NzRmlsZSA9IFwiLi9hcHAuY3NzXCI7XG5cbi8qKipcbiAqIENyZWF0ZXMgYSBwZXJmb3JtYW5jZS5ub3coKSBmdW5jdGlvblxuICovXG5pZiAoIWdsb2JhbC5wZXJmb3JtYW5jZSkge1xuICAgIGdsb2JhbC5wZXJmb3JtYW5jZSA9IHt9O1xufVxuaWYgKCFnbG9iYWwucGVyZm9ybWFuY2Uubm93KSB7XG4gICAgaWYgKGFwcGxpY2F0aW9uLmFuZHJvaWQpIHtcbiAgICAgICAgZ2xvYmFsLnBlcmZvcm1hbmNlLm5vdyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBqYXZhLmxhbmcuU3lzdGVtLm5hbm9UaW1lKCkgLyAxMDAwMDAwO1xuICAgICAgICB9O1xuICAgIH0gZWxzZSBpZiAoYXBwbGljYXRpb24uaW9zKSB7XG4gICAgICAgIGdsb2JhbC5wZXJmb3JtYW5jZS5ub3cgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBDQUN1cnJlbnRNZWRpYVRpbWUoKSAqIDEwMDA7XG4gICAgICAgIH07XG4gICAgfVxufVxuXG5pbXBvcnQgeyBhcHBWaWV3TW9kZWwgfSBmcm9tICcuL2NvbXBvbmVudHMvY29tbW9uL0FwcFZpZXdNb2RlbCc7XG5pbXBvcnQgeyBoYW5kbGVPcGVuVVJMLCBBcHBVUkwgfSBmcm9tICduYXRpdmVzY3JpcHQtdXJsaGFuZGxlcic7XG5cbmhhbmRsZU9wZW5VUkwoKGFwcFVSTDogQXBwVVJMKSA9PiB7XG4gICAgY29uc29sZS5sb2coJ1JlY2VpdmVkIHVybCByZXF1ZXN0OiAnLCBhcHBVUkwpO1xuICAgIGFwcFZpZXdNb2RlbC5yZWFkeS50aGVuKCgpPT57XG4gICAgICAgIGNvbnN0IHVybFBhcmFtID0gYXBwVVJMLnBhcmFtcy5nZXQoJ3VybCcpO1xuICAgICAgICBpZiAodXJsUGFyYW0pIHtcbiAgICAgICAgICAgIGFwcFZpZXdNb2RlbC5vcGVuVXJsKHVybFBhcmFtKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IHVybCA9ICdodHRwczovLycgKyBhcHBVUkwucGF0aDtcbiAgICAgICAgICAgIGFwcFZpZXdNb2RlbC5vcGVuVXJsKHVybCk7XG4gICAgICAgIH1cbiAgICB9KTtcbn0pO1xuXG5hcHBsaWNhdGlvbi5zdGFydCgpO1xuIl19