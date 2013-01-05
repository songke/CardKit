
define('moui/gesture/scroll', [
    'mo/lang',
    'moui/gesture/base'
], function(_, gesture){

    var ScrollGesture = _.construct(gesture.GestureBase);

    _.mix(ScrollGesture.prototype, {

        EVENTS: [
            'scrolldown', 
            'scrollup', 
            'scrollstart', 
            'scrollend'
        ],
        DEFAULT_CONFIG: {
            'directThreshold': 20,
            'scrollEndGap': 5
        },

        watchScroll: function(elm){
            this.scrollingNode = elm;
        },

        press: function(e){
            var self = this;
            var t = e.touches[0];
            self._startY = t.clientY;
            self._moveY = NaN;
            self._scrollY = null;
            if (self.scrollingNode) {
                var scrolling = self._scrolling;
                self._scrolling = false;
                var tm = self._tm = +new Date();
                self.once(self.MOVE, function(){
                    self.once('scroll', function(){
                        if (tm === self._tm) {
                            self._scrollY = self.scrollingNode.scrollTop;
                            if (!scrolling) {
                                self.trigger({ target: self.node }, self.event.scrollstart);
                            }
                        }
                    }, self.scrollingNode);
                });
            }
        },

        move: function(e){
            var t = e.touches[0];
            this._moveY = t.clientY;
            if (this.scrollingNode) {
                this._scrollY = this.scrollingNode.scrollTop;
            }
        },

        release: function(){
            var self = this, node = { target: self.node };
            // up/down
            var d = self._moveY - self._startY,
                threshold = self._config.directThreshold;
            if (d < 0 - threshold) {
                self.trigger(node, self.event.scrolldown);
            } else if (d > threshold) {
                self.trigger(node, self.event.scrollup);
            }
            // end
            if (self._scrollY !== null) {
                if (self._scrollY < 0 || Math.abs(self.scrollingNode.scrollTop - self._scrollY) 
                        < self._config.scrollEndGap) {
                    self.trigger(node, self.event.scrollend);
                } else {
                    var tm = self._tm;
                    self._scrolling = true;
                    self.once('scroll', function(){
                        if (tm === self._tm) {
                            self._scrolling = false;
                            self.trigger(node, self.event.scrollend);
                        }
                    }, self.scrollingNode);
                }
            }
            self._scrollY = null;
        }
    
    });

    function exports(elm, opt, cb){
        return new exports.ScrollGesture(elm, opt, cb);
    }

    exports.ScrollGesture = ScrollGesture;

    return exports;

});
