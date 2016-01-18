/*!
 * fd-router v1.0.0
 *
 * https://github.com/jnoodle/fd-router
 */

(function (global, factory) {

    if (typeof define === 'function' && (define.amd || define.cmd)) {
        //AMD/CMD
        define(function (global) {
            return factory(global);
        });
    } else if (typeof module === 'object' && typeof module.exports === 'object') {
        //CommonJS
        module.exports = factory(global);
    } else {
        //Browser
        global.Router = factory(global);
    }

}(typeof window !== 'undefined' ? window : this, function (window) {

    /**
     * Singleton
     * Router 采用单例模式
     *
     * https://addyosmani.com/resources/essentialjsdesignpatterns/book/#singletonpatternjavascript
     */
    var Router = {

        /**
         * All registered routes
         * 注册的所有路由对象数组
         */
        routes: [],

        /**
         * Router mode
         * 'history': HTML5 History API via pushState
         * 'hash': hashtag("#") for all modern browsers
         *
         * 路由模式
         * 'history': 使用 HTML5 History API pushState 方式, 适合大部分现代浏览器, 路由更人性化
         * 'hash': 针对老的浏览器使用 #hash 的方式
         */
        mode: 'history',

        /**
         * The root URL path of the application, only needed in 'history' mode
         * 应用根目录, 如果使用 'hash' 模式, 这个字段没啥用
         */
        root: '/',

        /**
         * Empty function
         * 空函数
         */
        noop: function () {
        },

        /**
         * Trim path begin and end slash
         * 去掉路径前后的斜杠 '/'
         * @param path
         * @returns {XML|string}
         */
        trimSlash: function (path) {
            return path.toString().replace(/\/$/, '').replace(/^\//, '');
        },

        /**
         * Initialize router
         * 初始化路由
         * @param options
         * @returns {Router}
         */
        init: function (options) {
            if (options) {
                this.mode = options.mode && options.mode === 'history' && !!(window.history.pushState) ? 'history' : 'hash';
                this.root = options.root ? '/' + this.trimSlash(options.root) + '/' : '/';
            }
            return this;
        },

        /**
         * Getting the current URL route fragment
         * 获取当前路径的路由部分标识
         * @returns {*}
         */
        getCurrentFragment: function () {
            var fragment = '';
            if (this.mode === 'history') {
                fragment = this.trimSlash(decodeURI(window.location.pathname + window.location.search));
                fragment = fragment.replace(/\?(.*)$/, '');
                fragment = this.root != '/' ? fragment.replace(this.root, '') : fragment;
            } else {
                var match = window.location.href.match(/#(.*)$/);
                fragment = match ? match[1] : '';
            }
            return this.trimSlash(fragment);
        },

        /**
         * Add router
         * 注册路由对象
         *
         * <pre>
         * Router.add({
         *     path: /about\/(.*)/,
         *     params: [1, 2],
         *     enterHandler: function () {
         *         console.log('enter about');
         *     },
         *     handler: function () {
         *         console.log('do about');
         *     },
         *     exitHandler: function () {
         *         console.log('exit about');
         *     }
         * })
         * </pre>
         *
         * @param {object} param router object
         * @returns {Router}
         */
        add: function (param) {
            if (typeof param === 'object') {
                this.routes.push({
                    path: param.path || '',
                    enterHandler: param.enterHandler || this.noop,
                    handler: param.handler || this.noop,
                    exitHandler: param.exitHandler || this.noop,
                    params: param.params || [],
                    _routeParams: [],
                    scope: param.scope || Object.create(null)
                });
            }
            return this;
        },

        /**
         * Remove router by path or handler
         * 根据path或者handler移除路由对象
         *
         * @param routerArray router object array
         * @returns {Router}
         */
        remove: function (routerArray) {
            for (var i = 0; i < routerArray.length; i++) {
                for (var j = 0, r; j < this.routes.length, r = this.routes[j]; j++) {
                    if (r.path === routerArray.path || r.handler === routerArray.handler) {
                        this.routes.splice(j, 1);
                        return this;
                    }
                }
            }
            return this;
        },

        /**
         * Reset router to origin default state
         * 重置Router
         *
         * @returns {Router}
         */
        reset: function () {
            this.routes = [];
            this.mode = 'history';
            this.root = '/';
            return this;
        },

        /**
         * Match path fragment
         * 获取匹配标识的路由对象
         *
         * @param f
         * @returns {Array} matched route object array
         */
        match: function (f) {
            var fragment = f || this.getCurrentFragment();
            var matchRoutes = [];
            for (var i = 0, r; i < this.routes.length, r = this.routes[i]; i++) {
                var match = fragment.match(r.path);
                if (match) {
                    match.shift();
                    r._routeParams = match;
                    matchRoutes.push(r);
                }
            }
            return matchRoutes;
        },

        /**
         * Run routes events
         * 针对一系列路由对象执行注册的方法
         *
         * @param {Array} routeArray route array
         * @returns {Router}
         */
        run: function (routeArray) {
            for (var i = 0; i < routeArray.length; i++) {
                var route = routeArray[i], isContinue;
                isContinue = route.enterHandler.apply({}, route.params.concat(route._routeParams));
                if (isContinue !== false) {
                    route.handler.apply(route.scope, route.params.concat(route._routeParams));
                }
            }

            return this;
        },

        /**
         * Listen route change
         * 监听路由改变并执行相关方法
         *
         * @returns {Router}
         */
        listen: function () {
            var self = this;
            var current = self.getCurrentFragment(), previous, matchRoutes, previousMatchRoutes;
            var fn = function () {
                if (current !== self.getCurrentFragment()) {
                    previous = current;
                    current = self.getCurrentFragment();
                    matchRoutes = self.match(current);

                    //Excute previous routes exitHandler function
                    //执行之前路由对象的退出方法 exitHandler
                    if (previous) {
                        previousMatchRoutes = self.match(current);
                        for (var i = 0; i < previousMatchRoutes.length; i++) {
                            var route = previousMatchRoutes[i];
                            route.exitHandler.apply(route.scope, route.params.concat(route._routeParams));
                        }
                    }

                    self.run(matchRoutes);
                }
            };
            clearInterval(this.interval);
            this.interval = setInterval(fn, 50);
            return this;
        },

        /**
         * Navigate to path
         * 导航到路径
         *
         * @param path
         * @returns {Router}
         */
        go: function (path) {
            path = path ? path : '';
            if (this.mode === 'history') {
                window.history.pushState(null, '', this.root + this.trimSlash(path));
            } else {
                window.location.href = window.location.href.replace(/#(.*)$/, '') + '#' + path;
            }
            return this;
        }
    };

    return Router;
}));