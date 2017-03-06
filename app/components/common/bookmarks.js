"use strict";
var application = require("application");
var applicationSettings = require("application-settings");
var observable_array_1 = require("data/observable-array");
var observable_1 = require("data/observable");
var BookmarkItem = (function (_super) {
    __extends(BookmarkItem, _super);
    function BookmarkItem(item) {
        var _this = _super.call(this, item) || this;
        _this.builtin = false;
        return _this;
    }
    BookmarkItem.prototype.toJSON = function () {
        return {
            title: this.title,
            uri: this.uri
        };
    };
    return BookmarkItem;
}(observable_1.Observable));
exports.BookmarkItem = BookmarkItem;
var RealityBookmarkItem = (function (_super) {
    __extends(RealityBookmarkItem, _super);
    function RealityBookmarkItem(reality) {
        var _this = _super.call(this, reality) || this;
        _this.reality = reality;
        return _this;
    }
    return RealityBookmarkItem;
}(BookmarkItem));
exports.RealityBookmarkItem = RealityBookmarkItem;
var favoriteList = new observable_array_1.ObservableArray();
exports.favoriteList = favoriteList;
var historyList = new observable_array_1.ObservableArray();
exports.historyList = historyList;
var realityList = new observable_array_1.ObservableArray();
exports.realityList = realityList;
var favoriteMap = new Map();
exports.favoriteMap = favoriteMap;
var historyMap = new Map();
exports.historyMap = historyMap;
var realityMap = new Map();
exports.realityMap = realityMap;
function updateMap(data, map) {
    var list = data.object;
    for (var i = 0; i < data.addedCount; i++) {
        var item = list.getItem(data.index + i);
        map.set(item.uri, item);
    }
    data.removed && data.removed.forEach(function (item) {
        map.delete(item.uri);
    });
}
favoriteList.on('change', function (data) { return updateMap(data, favoriteMap); });
historyList.on('change', function (data) { return updateMap(data, historyMap); });
realityList.on('change', function (data) { return updateMap(data, realityMap); });
var builtinFavorites = [
    new BookmarkItem({
        title: 'Argon Help',
        uri: 'http://argonjs.io/argon-app/'
    }),
    new BookmarkItem({
        title: 'Argon Samples',
        uri: 'http://argonjs.io/samples/'
    }),
    new BookmarkItem({
        title: 'Argon-AFrame Samples',
        uri: 'http://argonjs.io/argon-aframe/'
    })
];
builtinFavorites.forEach(function (item) {
    item.builtin = true;
    favoriteList.push(item);
});
var LIVE_VIDEO_REALITY = {
    title: 'Live Video',
    uri: 'reality:live-video'
};
exports.LIVE_VIDEO_REALITY = LIVE_VIDEO_REALITY;
var builtinRealities = [
    new RealityBookmarkItem(LIVE_VIDEO_REALITY)
];
builtinRealities.forEach(function (item) {
    item.builtin = true;
    realityList.push(item);
});
var FAVORITE_LIST_KEY = 'favorite_list';
var HISTORY_LIST_KEY = 'history_list';
if (applicationSettings.hasKey(FAVORITE_LIST_KEY)) {
    console.log(applicationSettings.getString(FAVORITE_LIST_KEY));
    var savedFavorites = JSON.parse(applicationSettings.getString(FAVORITE_LIST_KEY));
    savedFavorites.forEach(function (item) {
        favoriteList.push(new BookmarkItem(item));
    });
}
if (applicationSettings.hasKey(HISTORY_LIST_KEY)) {
    console.log(applicationSettings.getString(HISTORY_LIST_KEY));
    var savedHistory = JSON.parse(applicationSettings.getString(HISTORY_LIST_KEY));
    savedHistory.forEach(function (item) {
        historyList.push(new BookmarkItem(item));
    });
}
function saveFavorites() {
    var userFavorites = favoriteList.filter(function (item) { return !item.builtin; });
    applicationSettings.setString(FAVORITE_LIST_KEY, JSON.stringify(userFavorites));
}
function saveHistory() {
    var history = historyList.map(function (item) { return item; }); // convert to standard array
    applicationSettings.setString(HISTORY_LIST_KEY, JSON.stringify(history));
}
function saveBookmarks() {
    saveFavorites();
    saveHistory();
}
application.on(application.suspendEvent, saveBookmarks);
favoriteList.on('change', saveFavorites);
historyList.on('change', saveHistory);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYm9va21hcmtzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYm9va21hcmtzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSx5Q0FBNEM7QUFDNUMsMERBQTZEO0FBQzdELDBEQUFtRTtBQUNuRSw4Q0FBK0Q7QUFJL0Q7SUFBMkIsZ0NBQVU7SUFLakMsc0JBQVksSUFHWDtRQUhELFlBSUksa0JBQU0sSUFBSSxDQUFDLFNBQ2Q7UUFQRCxhQUFPLEdBQUcsS0FBSyxDQUFDOztJQU9oQixDQUFDO0lBRUQsNkJBQU0sR0FBTjtRQUNJLE1BQU0sQ0FBQztZQUNILEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSztZQUNqQixHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUc7U0FDaEIsQ0FBQTtJQUNMLENBQUM7SUFDTCxtQkFBQztBQUFELENBQUMsQUFsQkQsQ0FBMkIsdUJBQVUsR0FrQnBDO0FBMEdHLG9DQUFZO0FBeEdoQjtJQUFrQyx1Q0FBWTtJQUMxQyw2QkFDVyxPQUF5QjtRQURwQyxZQUdJLGtCQUFNLE9BQU8sQ0FBQyxTQUNqQjtRQUhVLGFBQU8sR0FBUCxPQUFPLENBQWtCOztJQUdwQyxDQUFDO0lBQ0wsMEJBQUM7QUFBRCxDQUFDLEFBTkQsQ0FBa0MsWUFBWSxHQU03QztBQW1HRyxrREFBbUI7QUFqR3ZCLElBQU0sWUFBWSxHQUFHLElBQUksa0NBQWUsRUFBZ0IsQ0FBQztBQWtHckQsb0NBQVk7QUFqR2hCLElBQU0sV0FBVyxHQUFHLElBQUksa0NBQWUsRUFBZ0IsQ0FBQztBQWtHcEQsa0NBQVc7QUFqR2YsSUFBTSxXQUFXLEdBQUcsSUFBSSxrQ0FBZSxFQUF1QixDQUFDO0FBa0czRCxrQ0FBVztBQWhHZixJQUFNLFdBQVcsR0FBRyxJQUFJLEdBQUcsRUFBd0IsQ0FBQztBQWlHaEQsa0NBQVc7QUFoR2YsSUFBTSxVQUFVLEdBQUcsSUFBSSxHQUFHLEVBQXdCLENBQUM7QUFpRy9DLGdDQUFVO0FBaEdkLElBQU0sVUFBVSxHQUFHLElBQUksR0FB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QUFFLENBQUM7QUFDbEIsQ0FBQztBQUVELFdBQVcsQ0FBQyxFQUFFLENBQUMsV0FBVyxDQUFDLFlBQVksRUFBQyxhQUFhLENBQUMsQ0FBQztBQUN2RCxZQUFZLENBQUMsRUFBRSxDQUFDLFFBQVEsRUFBRSxhQUFhLENBQUMsQ0FBQztBQUN6QyxXQUFXLENBQUMsRUFBRSxDQUFDLFFBQVEsRUFBRSxXQUFXLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBhcHBsaWNhdGlvbiA9IHJlcXVpcmUoJ2FwcGxpY2F0aW9uJyk7XG5pbXBvcnQgYXBwbGljYXRpb25TZXR0aW5ncyA9IHJlcXVpcmUoJ2FwcGxpY2F0aW9uLXNldHRpbmdzJyk7XG5pbXBvcnQge09ic2VydmFibGVBcnJheSwgQ2hhbmdlZERhdGF9IGZyb20gJ2RhdGEvb2JzZXJ2YWJsZS1hcnJheSc7XG5pbXBvcnQge09ic2VydmFibGUsIFByb3BlcnR5Q2hhbmdlRGF0YX0gZnJvbSAnZGF0YS9vYnNlcnZhYmxlJztcblxuaW1wb3J0ICogYXMgQXJnb24gZnJvbSAnQGFyZ29uanMvYXJnb24nXG5cbmNsYXNzIEJvb2ttYXJrSXRlbSBleHRlbmRzIE9ic2VydmFibGUge1xuICAgIHRpdGxlPzpzdHJpbmc7XG4gICAgdXJpOnN0cmluZztcbiAgICBidWlsdGluID0gZmFsc2U7XG4gICAgXG4gICAgY29uc3RydWN0b3IoaXRlbTp7XG4gICAgICAgIHRpdGxlPzpzdHJpbmcsXG4gICAgICAgIHVyaTpzdHJpbmdcbiAgICB9KSB7XG4gICAgICAgIHN1cGVyKGl0ZW0pXG4gICAgfVxuICAgIFxuICAgIHRvSlNPTigpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHRpdGxlOiB0aGlzLnRpdGxlLFxuICAgICAgICAgICAgdXJpOiB0aGlzLnVyaVxuICAgICAgICB9XG4gICAgfVxufVxuXG5jbGFzcyBSZWFsaXR5Qm9va21hcmtJdGVtIGV4dGVuZHMgQm9va21hcmtJdGVtIHtcbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgcHVibGljIHJlYWxpdHk6QXJnb24uUmVhbGl0eVZpZXdcbiAgICApIHtcbiAgICAgICAgc3VwZXIocmVhbGl0eSlcbiAgICB9XG59XG5cbmNvbnN0IGZhdm9yaXRlTGlzdCA9IG5ldyBPYnNlcnZhYmxlQXJyYXk8Qm9va21hcmtJdGVtPigpO1xuY29uc3QgaGlzdG9yeUxpc3QgPSBuZXcgT2JzZXJ2YWJsZUFycmF5PEJvb2ttYXJrSXRlbT4oKTtcbmNvbnN0IHJlYWxpdHlMaXN0ID0gbmV3IE9ic2VydmFibGVBcnJheTxSZWFsaXR5Qm9va21hcmtJdGVtPigpO1xuXG5jb25zdCBmYXZvcml0ZU1hcCA9IG5ldyBNYXA8c3RyaW5nLCBCb29rbWFya0l0ZW0+KCk7XG5jb25zdCBoaXN0b3J5TWFwID0gbmV3IE1hcDxzdHJpbmcsIEJvb2ttYXJrSXRlbT4oKTtcbmNvbnN0IHJlYWxpdHlNYXAgPSBuZXcgTWFwPHN0cmluZywgUmVhbGl0eUJvb2ttYXJrSXRlbT4oKTtcblxuZnVuY3Rpb24gdXBkYXRlTWFwKGRhdGE6Q2hhbmdlZERhdGE8Qm9va21hcmtJdGVtPiwgbWFwOk1hcDxzdHJpbmcsIEJvb2ttYXJrSXRlbT4pIHtcbiAgICBjb25zdCBsaXN0ID0gPE9ic2VydmFibGVBcnJheTxCb29rbWFya0l0ZW0+PmRhdGEub2JqZWN0XG4gICAgZm9yIChsZXQgaT0wOyBpIDwgZGF0YS5hZGRlZENvdW50OyBpKyspIHtcbiAgICAgICAgdmFyIGl0ZW0gPSBsaXN0LmdldEl0ZW0oZGF0YS5pbmRleCArIGkpO1xuICAgICAgICBtYXAuc2V0KGl0ZW0udXJpLCBpdGVtKTtcbiAgICB9XG4gICAgZGF0YS5yZW1vdmVkICYmIGRhdGEucmVtb3ZlZC5mb3JFYWNoKChpdGVtKT0+e1xuICAgICAgICBtYXAuZGVsZXRlKGl0ZW0udXJpKTtcbiAgICB9KVxufVxuXG5mYXZvcml0ZUxpc3Qub24oJ2NoYW5nZScsIChkYXRhKSA9PiB1cGRhdGVNYXAoZGF0YSwgZmF2b3JpdGVNYXApKTtcbmhpc3RvcnlMaXN0Lm9uKCdjaGFuZ2UnLCAoZGF0YSkgPT4gdXBkYXRlTWFwKGRhdGEsIGhpc3RvcnlNYXApKTtcbnJlYWxpdHlMaXN0Lm9uKCdjaGFuZ2UnLCAoZGF0YSkgPT4gdXBkYXRlTWFwKGRhdGEsIHJlYWxpdHlNYXApKTtcblxuY29uc3QgYnVpbHRpbkZhdm9yaXRlczpBcnJheTxCb29rbWFya0l0ZW0+ID0gW1xuICAgIG5ldyBCb29rbWFya0l0ZW0oe1xuICAgICAgICB0aXRsZTogJ0FyZ29uIEhlbHAnLFxuICAgICAgICB1cmk6ICdodHRwOi8vYXJnb25qcy5pby9hcmdvbi1hcHAvJ1xuICAgIH0pLFxuICAgIG5ldyBCb29rbWFya0l0ZW0oe1xuICAgICAgICB0aXRsZTogJ0FyZ29uIFNhbXBsZXMnLFxuICAgICAgICB1cmk6ICdodHRwOi8vYXJnb25qcy5pby9zYW1wbGVzLydcbiAgICB9KSxcbiAgICBuZXcgQm9va21hcmtJdGVtKHtcbiAgICAgICAgdGl0bGU6ICdBcmdvbi1BRnJhbWUgU2FtcGxlcycsXG4gICAgICAgIHVyaTogJ2h0dHA6Ly9hcmdvbmpzLmlvL2FyZ29uLWFmcmFtZS8nXG4gICAgfSlcbl1cblxuYnVpbHRpbkZhdm9yaXRlcy5mb3JFYWNoKChpdGVtKT0+IHsgXG4gICAgaXRlbS5idWlsdGluID0gdHJ1ZTtcbiAgICBmYXZvcml0ZUxpc3QucHVzaChpdGVtKTtcbn0pO1xuXG5jb25zdCBMSVZFX1ZJREVPX1JFQUxJVFkgPSB7XG4gICAgdGl0bGU6ICdMaXZlIFZpZGVvJyxcbiAgICB1cmk6ICdyZWFsaXR5OmxpdmUtdmlkZW8nXG59XG5cbmNvbnN0IGJ1aWx0aW5SZWFsaXRpZXM6QXJyYXk8UmVhbGl0eUJvb2ttYXJrSXRlbT4gPSBbXG4gICAgbmV3IFJlYWxpdHlCb29rbWFya0l0ZW0oTElWRV9WSURFT19SRUFMSVRZKVxuXVxuXG5idWlsdGluUmVhbGl0aWVzLmZvckVhY2goKGl0ZW0pPT4geyBcbiAgICBpdGVtLmJ1aWx0aW4gPSB0cnVlO1xuICAgIHJlYWxpdHlMaXN0LnB1c2goaXRlbSk7XG59KTtcblxuY29uc3QgRkFWT1JJVEVfTElTVF9LRVkgPSAnZmF2b3JpdGVfbGlzdCc7XG5jb25zdCBISVNUT1JZX0xJU1RfS0VZID0gJ2hpc3RvcnlfbGlzdCc7XG5cbmlmIChhcHBsaWNhdGlvblNldHRpbmdzLmhhc0tleShGQVZPUklURV9MSVNUX0tFWSkpIHtcbiAgICBjb25zb2xlLmxvZyhhcHBsaWNhdGlvblNldHRpbmdzLmdldFN0cmluZyhGQVZPUklURV9MSVNUX0tFWSkpXG4gICAgY29uc3Qgc2F2ZWRGYXZvcml0ZXM6QXJyYXk8Qm9va21hcmtJdGVtPiA9IEpTT04ucGFyc2UoYXBwbGljYXRpb25TZXR0aW5ncy5nZXRTdHJpbmcoRkFWT1JJVEVfTElTVF9LRVkpKTtcbiAgICBzYXZlZEZhdm9yaXRlcy5mb3JFYWNoKChpdGVtKT0+e1xuICAgICAgICBmYXZvcml0ZUxpc3QucHVzaChuZXcgQm9va21hcmtJdGVtKGl0ZW0pKTtcbiAgICB9KTtcbn1cblxuaWYgKGFwcGxpY2F0aW9uU2V0dGluZ3MuaGFzS2V5KEhJU1RPUllfTElTVF9LRVkpKSB7XG4gICAgY29uc29sZS5sb2coYXBwbGljYXRpb25TZXR0aW5ncy5nZXRTdHJpbmcoSElTVE9SWV9MSVNUX0tFWSkpXG4gICAgY29uc3Qgc2F2ZWRIaXN0b3J5OkFycmF5PEJvb2ttYXJrSXRlbT4gPSBKU09OLnBhcnNlKGFwcGxpY2F0aW9uU2V0dGluZ3MuZ2V0U3RyaW5nKEhJU1RPUllfTElTVF9LRVkpKTtcbiAgICBzYXZlZEhpc3RvcnkuZm9yRWFjaCgoaXRlbSk9PntcbiAgICAgICAgaGlzdG9yeUxpc3QucHVzaChuZXcgQm9va21hcmtJdGVtKGl0ZW0pKTtcbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gc2F2ZUZhdm9yaXRlcygpIHtcbiAgICBjb25zdCB1c2VyRmF2b3JpdGVzID0gZmF2b3JpdGVMaXN0LmZpbHRlcigoaXRlbSk9PiFpdGVtLmJ1aWx0aW4pO1xuICAgIGFwcGxpY2F0aW9uU2V0dGluZ3Muc2V0U3RyaW5nKEZBVk9SSVRFX0xJU1RfS0VZLCBKU09OLnN0cmluZ2lmeSh1c2VyRmF2b3JpdGVzKSk7XG59XG5cbmZ1bmN0aW9uIHNhdmVIaXN0b3J5KCkge1xuICAgIGNvbnN0IGhpc3RvcnkgPSBoaXN0b3J5TGlzdC5tYXAoKGl0ZW0pPT5pdGVtKTsgLy8gY29udmVydCB0byBzdGFuZGFyZCBhcnJheVxuICAgIGFwcGxpY2F0aW9uU2V0dGluZ3Muc2V0U3RyaW5nKEhJU1RPUllfTElTVF9LRVksIEpTT04uc3RyaW5naWZ5KGhpc3RvcnkpKTtcbn1cblxuZnVuY3Rpb24gc2F2ZUJvb2ttYXJrcygpIHtcbiAgICBzYXZlRmF2b3JpdGVzKCk7XG4gICAgc2F2ZUhpc3RvcnkoKTtcbn1cblxuYXBwbGljYXRpb24ub24oYXBwbGljYXRpb24uc3VzcGVuZEV2ZW50LHNhdmVCb29rbWFya3MpO1xuZmF2b3JpdGVMaXN0Lm9uKCdjaGFuZ2UnLCBzYXZlRmF2b3JpdGVzKTtcbmhpc3RvcnlMaXN0Lm9uKCdjaGFuZ2UnLCBzYXZlSGlzdG9yeSk7XG5cbmV4cG9ydCB7XG4gICAgQm9va21hcmtJdGVtLFxuICAgIFJlYWxpdHlCb29rbWFya0l0ZW0sXG4gICAgZmF2b3JpdGVMaXN0LFxuICAgIGhpc3RvcnlMaXN0LFxuICAgIHJlYWxpdHlMaXN0LFxuICAgIGZhdm9yaXRlTWFwLFxuICAgIGhpc3RvcnlNYXAsXG4gICAgcmVhbGl0eU1hcCxcbiAgICBMSVZFX1ZJREVPX1JFQUxJVFlcbn0iXX0=