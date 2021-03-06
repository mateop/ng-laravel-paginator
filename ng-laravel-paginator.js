angular.module('ng-laravel-paginator', [])
    .factory('LaravelPaginator', ['$http', function ($http) {

        var Paginator = function (url, params, method, options) {

            if (angular.isUndefined(options)) {
                options = {};
            }

            this.options = {
                /**
                 * Option for caching http requests
                 */
                cache: options.cache || false,
                /**
                 * Option for adding to the beginning of the array
                 * Default: false
                 */
                reverse: options.reverse || false,
                /**
                 * Optional function to call before adding data to the scope
                 */
                callback: options.callback || function (data) {
                    return data;
                }
            };
            this.busy = false;
            this.completed = false;
            this.currentPage = 1;
            this.data = [];
            this.from = null;
            this.lastPage = 0;
            this.method = method || 'GET';
            this.nextUrl = null;
            this.params = params || {};
            this.previousUrl = null;
            this.startUrl = url;
            this.to = null;
            this.total = 0;
            this.currentResponse = null;
            this.next();
        };

        Paginator.prototype.isEmpty = function () {
            return this.data.length === 0;
        };

        Paginator.prototype.remove = function (item) {
            var index = this.data.indexOf(item);
            if (index === -1) return null;
            return this.data.splice(index, 1)[0];
        };

        Paginator.prototype.moveToFirst = function (item) {
            var value = this.remove(item);
            if (value !== null)
                this.data.unshift(value);
        };

        Paginator.prototype.moveToLast = function (item) {
            var value = this.remove(item);
            if (value !== null)
                this.data.push(value);
        };

        Paginator.prototype.next = function () {
            var that = this, data;
            if (that.busy || that.completed) return;
            that.busy = true;

            return $http({
                url: this.nextUrl || this.startUrl,
                params: (this.method.toUpperCase() === 'GET' ? this.params : undefined),
                method: this.method,
                cache: this.options.cache,
                data: (this.method.toUpperCase() !== 'GET' ? this.params : undefined)
            }).then(function (response) {

                that.currentResponse = response;

                data = response.data;

                that.busy = false;
                that.currentPage = data.current_page;

                data.data = that.options.callback(data.data);

                if (that.options.reverse === true) {
                    that.data = data.data.concat(that.data);
                } else {
                    that.data = that.data.concat(data.data);
                }

                that.from = data.from;
                that.lastPage = data.last_page;
                that.nextUrl = data.next_page_url;
                that.previousUrl = data.prev_page_url;
                that.to = data.to;
                that.total = data.total;

                if (!data.next_page_url) that.completed = true;

            });
        };

        return Paginator;
    }]);
