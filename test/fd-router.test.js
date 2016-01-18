describe('fd-router test suite', function () {
    Router.init({
        mode: 'history',
        root: '/test/'
    }).listen();

    describe('Router add and go', function () {
        beforeEach(function (done) {
            Router.add({
                path: '/about',
                handler: function () {
                    done();
                }
            });
            Router.go('/about');
        });

        it('Router add and go', function () {
            expect(Router.getCurrentFragment()).toBe('test/about');
        });
    });

    describe('Router regex match and param', function () {
        var params = '';
        beforeEach(function (done) {
            Router.add({
                path: /products\/(.*)\/edit\/(.*)/,
                handler: function () {
                    params = Array.prototype.slice.call(arguments);
                    console.log(params);
                    done();
                }
            });
            Router.go('/products/11/edit/16');
        });

        it('Router regex match and param', function (done) {
            expect(params).toEqual(['11', '16']);
            done();
        });
    });

    describe('Router regex match and param', function () {
        var params2 = '';
        beforeEach(function (done) {
            Router.add({
                path: /details\/(.*)/,
                params: [1, 2],
                handler: function () {
                    params2 = Array.prototype.slice.call(arguments);
                    console.log(params2);
                    done();
                }
            });
            Router.go('/details/25');
        });

        it('Router default params', function (done) {
            expect(params2).toEqual([1, 2, '25']);
            done();
        });
    });

    describe('Router history back', function () {

        beforeEach(function (done) {
            history.back();
            history.back();
            setTimeout(function () {
                done();
            }, 100);
        });

        it('Router history back', function (done) {
            console.log(Router.getCurrentFragment());
            expect(Router.getCurrentFragment()).toBe('test/about');
            done();
        });
    });

    describe('Router enterHandler break', function () {
        var params3 = 1;
        beforeEach(function (done) {
            Router.add({
                path: /info/,
                enterHandler: function () {
                    params3 = 2;
                    return false;
                },
                handler: function () {
                    params3 = 3;
                }
            });
            Router.go('/info');
            setTimeout(function () {
                done();
            }, 100);
        });

        it('Router enterHandler break', function (done) {
            expect(params3).toBe(2);
            done();
        });
    });

});