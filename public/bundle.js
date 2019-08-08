
(function(l, i, v, e) { v = l.createElement(i); v.async = 1; v.src = '//' + (location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; e = l.getElementsByTagName(i)[0]; e.parentNode.insertBefore(v, e)})(document, 'script');
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function validate_store(store, name) {
        if (!store || typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, callback) {
        const unsub = store.subscribe(callback);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_data(text, data) {
        data = '' + data;
        if (text.data !== data)
            text.data = data;
    }
    function set_style(node, key, value) {
        node.style.setProperty(key, value);
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function flush() {
        const seen_callbacks = new Set();
        do {
            // first, call beforeUpdate functions
            // and update components
            while (dirty_components.length) {
                const component = dirty_components.shift();
                set_current_component(component);
                update(component.$$);
            }
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    callback();
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
    }
    function update($$) {
        if ($$.fragment) {
            $$.update($$.dirty);
            run_all($$.before_update);
            $$.fragment.p($$.dirty, $$.ctx);
            $$.dirty = null;
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined' ? window : global);
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        if (component.$$.fragment) {
            run_all(component.$$.on_destroy);
            component.$$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            component.$$.on_destroy = component.$$.fragment = null;
            component.$$.ctx = {};
        }
    }
    function make_dirty(component, key) {
        if (!component.$$.dirty) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty = blank_object();
        }
        component.$$.dirty[key] = true;
    }
    function init(component, options, instance, create_fragment, not_equal, prop_names) {
        const parent_component = current_component;
        set_current_component(component);
        const props = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props: prop_names,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty: null
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, props, (key, value) => {
                if ($$.ctx && not_equal($$.ctx[key], $$.ctx[key] = value)) {
                    if ($$.bound[key])
                        $$.bound[key](value);
                    if (ready)
                        make_dirty(component, key);
                }
            })
            : props;
        $$.update();
        ready = true;
        run_all($$.before_update);
        $$.fragment = create_fragment($$.ctx);
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe,
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    /**
     * Derived value store by synchronizing one or more readable stores and
     * applying an aggregation function over its input values.
     * @param {Stores} stores input stores
     * @param {function(Stores=, function(*)=):*}fn function callback that aggregates the values
     * @param {*=}initial_value when used asynchronously
     */
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => store.subscribe((value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    function regexparam (str, loose) {
    	if (str instanceof RegExp) return { keys:false, pattern:str };
    	var c, o, tmp, ext, keys=[], pattern='', arr = str.split('/');
    	arr[0] || arr.shift();

    	while (tmp = arr.shift()) {
    		c = tmp[0];
    		if (c === '*') {
    			keys.push('wild');
    			pattern += '/(.*)';
    		} else if (c === ':') {
    			o = tmp.indexOf('?', 1);
    			ext = tmp.indexOf('.', 1);
    			keys.push( tmp.substring(1, !!~o ? o : !!~ext ? ext : tmp.length) );
    			pattern += !!~o && !~ext ? '(?:/([^/]+?))?' : '/([^/]+?)';
    			if (!!~ext) pattern += (!!~o ? '?' : '') + '\\' + tmp.substring(ext);
    		} else {
    			pattern += '/' + tmp;
    		}
    	}

    	return {
    		keys: keys,
    		pattern: new RegExp('^' + pattern + (loose ? '(?=$|\/)' : '\/?$'), 'i')
    	};
    }

    /* node_modules/svelte-spa-router/Router.svelte generated by Svelte v3.7.1 */
    const { Error: Error_1, Object: Object_1 } = globals;

    function create_fragment(ctx) {
    	var switch_instance_anchor, current;

    	var switch_value = ctx.component;

    	function switch_props(ctx) {
    		return {
    			props: { params: ctx.componentParams },
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		var switch_instance = new switch_value(switch_props(ctx));
    	}

    	return {
    		c: function create() {
    			if (switch_instance) switch_instance.$$.fragment.c();
    			switch_instance_anchor = empty();
    		},

    		l: function claim(nodes) {
    			throw new Error_1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert(target, switch_instance_anchor, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var switch_instance_changes = {};
    			if (changed.componentParams) switch_instance_changes.params = ctx.componentParams;

    			if (switch_value !== (switch_value = ctx.component)) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;
    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});
    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));

    					switch_instance.$$.fragment.c();
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			}

    			else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(switch_instance_anchor);
    			}

    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};
    }

    /**
     * @typedef {Object} Location
     * @property {string} location - Location (page/view), for example `/book`
     * @property {string} [querystring] - Querystring from the hash, as a string not parsed
     */
    /**
     * Returns the current location from the hash.
     *
     * @returns {Location} Location object
     * @private
     */
    function getLocation() {
    const hashPosition = window.location.href.indexOf('#/');
    let location = (hashPosition > -1) ? window.location.href.substr(hashPosition + 1) : '/';

    // Check if there's a querystring
    const qsPosition = location.indexOf('?');
    let querystring = '';
    if (qsPosition > -1) {
        querystring = location.substr(qsPosition + 1);
        location = location.substr(0, qsPosition);
    }

    return {location, querystring}
    }

    /**
     * Readable store that returns the current full location (incl. querystring)
     */
    const loc = readable(
    getLocation(),
    // eslint-disable-next-line prefer-arrow-callback
    function start(set) {
        const update = () => {
            set(getLocation());
        };
        window.addEventListener('hashchange', update, false);

        return function stop() {
            window.removeEventListener('hashchange', update, false);
        }
    }
    );

    /**
     * Readable store that returns the current location
     */
    const location = derived(
    loc,
    ($loc) => $loc.location
    );

    /**
     * Readable store that returns the current querystring
     */
    const querystring = derived(
    loc,
    ($loc) => $loc.querystring
    );

    /**
     * Navigates to a new page programmatically.
     *
     * @param {string} location - Path to navigate to (must start with `/`)
     */
    function push(location) {
    if (!location || location.length < 1 || location.charAt(0) != '/') {
        throw Error('Invalid parameter location')
    }

    // Execute this code when the current call stack is complete
    setTimeout(() => {
        window.location.hash = '#' + location;
    }, 0);
    }

    /**
     * Svelte Action that enables a link element (`<a>`) to use our history management.
     *
     * For example:
     *
     * ````html
     * <a href="/books" use:link>View books</a>
     * ````
     *
     * @param {HTMLElement} node - The target node (automatically set by Svelte). Must be an anchor tag (`<a>`) with a href attribute starting in `/`
     */
    function link(node) {
    // Only apply to <a> tags
    if (!node || !node.tagName || node.tagName.toLowerCase() != 'a') {
        throw Error('Action "link" can only be used with <a> tags')
    }

    // Destination must start with '/'
    const href = node.getAttribute('href');
    if (!href || href.length < 1 || href.charAt(0) != '/') {
        throw Error('Invalid value for "href" attribute')
    }

    // onclick event handler
    node.addEventListener('click', (event) => {
        // Disable normal click event
        event.preventDefault();

        // Push link or link children click
        let href;
        let target = event.target;
        while ((href = target.getAttribute('href')) === null) {
            target = target.parentElement;
            if (target === null) {
                throw Error('Could not find corresponding href value')
            }
        }
        push(href);

        return false
    });
    }

    function instance($$self, $$props, $$invalidate) {
    	let $loc;

    	validate_store(loc, 'loc');
    	component_subscribe($$self, loc, $$value => { $loc = $$value; $$invalidate('$loc', $loc); });

    	/**
     * Dictionary of all routes, in the format `'/path': component`.
     *
     * For example:
     * ````js
     * import HomeRoute from './routes/HomeRoute.svelte'
     * import BooksRoute from './routes/BooksRoute.svelte'
     * import NotFoundRoute from './routes/NotFoundRoute.svelte'
     * routes = {
     *     '/': HomeRoute,
     *     '/books': BooksRoute,
     *     '*': NotFoundRoute
     * }
     * ````
     */
    let { routes = {} } = $$props;

    /**
     * Container for a route: path, component
     */
    class RouteItem {
        /**
         * Initializes the object and creates a regular expression from the path, using regexparam.
         *
         * @param {string} path - Path to the route (must start with '/' or '*')
         * @param {SvelteComponent} component - Svelte component for the route
         */
        constructor(path, component) {
            // Path must be a regular or expression, or a string starting with '/' or '*'
            if (!path || 
                (typeof path == 'string' && (path.length < 1 || (path.charAt(0) != '/' && path.charAt(0) != '*'))) ||
                (typeof path == 'object' && !(path instanceof RegExp))
            ) {
                throw Error('Invalid value for "path" argument')
            }

            const {pattern, keys} = regexparam(path);

            this.path = path;
            this.component = component;

            this._pattern = pattern;
            this._keys = keys;
        }

        /**
         * Checks if `path` matches the current route.
         * If there's a match, will return the list of parameters from the URL (if any).
         * In case of no match, the method will return `null`.
         *
         * @param {string} path - Path to test
         * @returns {null|Object.<string, string>} List of paramters from the URL if there's a match, or `null` otherwise.
         */
        match(path) {
            const matches = this._pattern.exec(path);
            if (matches === null) {
                return null
            }

            // If the input was a regular expression, this._keys would be false, so return matches as is
            if (this._keys === false) {
                return matches
            }

            const out = {};
            let i = 0;
            while (i < this._keys.length) {
                out[this._keys[i]] = matches[++i] || null;
            }
            return out
        }
    }

    // We need an iterable: if it's not a Map, use Object.entries
    const routesIterable = (routes instanceof Map) ? routes : Object.entries(routes);

    // Set up all routes
    const routesList = [];
    for (const [path, route] of routesIterable) {
        routesList.push(new RouteItem(path, route));
    }

    // Props for the component to render
    let component = null;
    let componentParams = {};

    	const writable_props = ['routes'];
    	Object_1.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Router> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('routes' in $$props) $$invalidate('routes', routes = $$props.routes);
    	};

    	$$self.$$.update = ($$dirty = { component: 1, $loc: 1 }) => {
    		if ($$dirty.component || $$dirty.$loc) { {
                // Find a route matching the location
                $$invalidate('component', component = null);
                let i = 0;
                while (!component && i < routesList.length) {
                    const match = routesList[i].match($loc.location);
                    if (match) {
                        $$invalidate('component', component = routesList[i].component);
                        $$invalidate('componentParams', componentParams = match);
                    }
                    i++;
                }
            } }
    	};

    	return { routes, component, componentParams };
    }

    class Router extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, ["routes"]);
    	}

    	get routes() {
    		throw new Error_1("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set routes(value) {
    		throw new Error_1("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/NavBar.svelte generated by Svelte v3.7.1 */

    const file = "src/NavBar.svelte";

    function create_fragment$1(ctx) {
    	var div1, nav, a0, link_action, t_1, div0, a1, link_action_1;

    	return {
    		c: function create() {
    			div1 = element("div");
    			nav = element("nav");
    			a0 = element("a");
    			a0.textContent = "Web3 Australia";
    			t_1 = space();
    			div0 = element("div");
    			a1 = element("a");
    			a1.textContent = "Humans";
    			attr(a0, "href", "/");
    			attr(a0, "class", "navbar-brand svelte-x99ug2");
    			add_location(a0, file, 36, 4, 639);
    			attr(a1, "href", "/board");
    			attr(a1, "class", "svelte-x99ug2");
    			add_location(a1, file, 38, 6, 733);
    			attr(div0, "class", "main-nav");
    			add_location(div0, file, 37, 4, 704);
    			attr(nav, "class", "svelte-x99ug2");
    			add_location(nav, file, 35, 2, 629);
    			attr(div1, "class", "navbar svelte-x99ug2");
    			add_location(div1, file, 34, 0, 606);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div1, anchor);
    			append(div1, nav);
    			append(nav, a0);
    			link_action = link.call(null, a0) || {};
    			append(nav, t_1);
    			append(nav, div0);
    			append(div0, a1);
    			link_action_1 = link.call(null, a1) || {};
    		},

    		p: noop,
    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div1);
    			}

    			if (link_action && typeof link_action.destroy === 'function') link_action.destroy();
    			if (link_action_1 && typeof link_action_1.destroy === 'function') link_action_1.destroy();
    		}
    	};
    }

    class NavBar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$1, safe_not_equal, []);
    	}
    }

    var bind = function bind(fn, thisArg) {
      return function wrap() {
        var args = new Array(arguments.length);
        for (var i = 0; i < args.length; i++) {
          args[i] = arguments[i];
        }
        return fn.apply(thisArg, args);
      };
    };

    /*!
     * Determine if an object is a Buffer
     *
     * @author   Feross Aboukhadijeh <https://feross.org>
     * @license  MIT
     */

    var isBuffer = function isBuffer (obj) {
      return obj != null && obj.constructor != null &&
        typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
    };

    /*global toString:true*/

    // utils is a library of generic helper functions non-specific to axios

    var toString = Object.prototype.toString;

    /**
     * Determine if a value is an Array
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an Array, otherwise false
     */
    function isArray(val) {
      return toString.call(val) === '[object Array]';
    }

    /**
     * Determine if a value is an ArrayBuffer
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an ArrayBuffer, otherwise false
     */
    function isArrayBuffer(val) {
      return toString.call(val) === '[object ArrayBuffer]';
    }

    /**
     * Determine if a value is a FormData
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an FormData, otherwise false
     */
    function isFormData(val) {
      return (typeof FormData !== 'undefined') && (val instanceof FormData);
    }

    /**
     * Determine if a value is a view on an ArrayBuffer
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
     */
    function isArrayBufferView(val) {
      var result;
      if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
        result = ArrayBuffer.isView(val);
      } else {
        result = (val) && (val.buffer) && (val.buffer instanceof ArrayBuffer);
      }
      return result;
    }

    /**
     * Determine if a value is a String
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a String, otherwise false
     */
    function isString(val) {
      return typeof val === 'string';
    }

    /**
     * Determine if a value is a Number
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Number, otherwise false
     */
    function isNumber(val) {
      return typeof val === 'number';
    }

    /**
     * Determine if a value is undefined
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if the value is undefined, otherwise false
     */
    function isUndefined(val) {
      return typeof val === 'undefined';
    }

    /**
     * Determine if a value is an Object
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an Object, otherwise false
     */
    function isObject(val) {
      return val !== null && typeof val === 'object';
    }

    /**
     * Determine if a value is a Date
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Date, otherwise false
     */
    function isDate(val) {
      return toString.call(val) === '[object Date]';
    }

    /**
     * Determine if a value is a File
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a File, otherwise false
     */
    function isFile(val) {
      return toString.call(val) === '[object File]';
    }

    /**
     * Determine if a value is a Blob
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Blob, otherwise false
     */
    function isBlob(val) {
      return toString.call(val) === '[object Blob]';
    }

    /**
     * Determine if a value is a Function
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Function, otherwise false
     */
    function isFunction(val) {
      return toString.call(val) === '[object Function]';
    }

    /**
     * Determine if a value is a Stream
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Stream, otherwise false
     */
    function isStream(val) {
      return isObject(val) && isFunction(val.pipe);
    }

    /**
     * Determine if a value is a URLSearchParams object
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a URLSearchParams object, otherwise false
     */
    function isURLSearchParams(val) {
      return typeof URLSearchParams !== 'undefined' && val instanceof URLSearchParams;
    }

    /**
     * Trim excess whitespace off the beginning and end of a string
     *
     * @param {String} str The String to trim
     * @returns {String} The String freed of excess whitespace
     */
    function trim(str) {
      return str.replace(/^\s*/, '').replace(/\s*$/, '');
    }

    /**
     * Determine if we're running in a standard browser environment
     *
     * This allows axios to run in a web worker, and react-native.
     * Both environments support XMLHttpRequest, but not fully standard globals.
     *
     * web workers:
     *  typeof window -> undefined
     *  typeof document -> undefined
     *
     * react-native:
     *  navigator.product -> 'ReactNative'
     * nativescript
     *  navigator.product -> 'NativeScript' or 'NS'
     */
    function isStandardBrowserEnv() {
      if (typeof navigator !== 'undefined' && (navigator.product === 'ReactNative' ||
                                               navigator.product === 'NativeScript' ||
                                               navigator.product === 'NS')) {
        return false;
      }
      return (
        typeof window !== 'undefined' &&
        typeof document !== 'undefined'
      );
    }

    /**
     * Iterate over an Array or an Object invoking a function for each item.
     *
     * If `obj` is an Array callback will be called passing
     * the value, index, and complete array for each item.
     *
     * If 'obj' is an Object callback will be called passing
     * the value, key, and complete object for each property.
     *
     * @param {Object|Array} obj The object to iterate
     * @param {Function} fn The callback to invoke for each item
     */
    function forEach(obj, fn) {
      // Don't bother if no value provided
      if (obj === null || typeof obj === 'undefined') {
        return;
      }

      // Force an array if not already something iterable
      if (typeof obj !== 'object') {
        /*eslint no-param-reassign:0*/
        obj = [obj];
      }

      if (isArray(obj)) {
        // Iterate over array values
        for (var i = 0, l = obj.length; i < l; i++) {
          fn.call(null, obj[i], i, obj);
        }
      } else {
        // Iterate over object keys
        for (var key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            fn.call(null, obj[key], key, obj);
          }
        }
      }
    }

    /**
     * Accepts varargs expecting each argument to be an object, then
     * immutably merges the properties of each object and returns result.
     *
     * When multiple objects contain the same key the later object in
     * the arguments list will take precedence.
     *
     * Example:
     *
     * ```js
     * var result = merge({foo: 123}, {foo: 456});
     * console.log(result.foo); // outputs 456
     * ```
     *
     * @param {Object} obj1 Object to merge
     * @returns {Object} Result of all merge properties
     */
    function merge(/* obj1, obj2, obj3, ... */) {
      var result = {};
      function assignValue(val, key) {
        if (typeof result[key] === 'object' && typeof val === 'object') {
          result[key] = merge(result[key], val);
        } else {
          result[key] = val;
        }
      }

      for (var i = 0, l = arguments.length; i < l; i++) {
        forEach(arguments[i], assignValue);
      }
      return result;
    }

    /**
     * Function equal to merge with the difference being that no reference
     * to original objects is kept.
     *
     * @see merge
     * @param {Object} obj1 Object to merge
     * @returns {Object} Result of all merge properties
     */
    function deepMerge(/* obj1, obj2, obj3, ... */) {
      var result = {};
      function assignValue(val, key) {
        if (typeof result[key] === 'object' && typeof val === 'object') {
          result[key] = deepMerge(result[key], val);
        } else if (typeof val === 'object') {
          result[key] = deepMerge({}, val);
        } else {
          result[key] = val;
        }
      }

      for (var i = 0, l = arguments.length; i < l; i++) {
        forEach(arguments[i], assignValue);
      }
      return result;
    }

    /**
     * Extends object a by mutably adding to it the properties of object b.
     *
     * @param {Object} a The object to be extended
     * @param {Object} b The object to copy properties from
     * @param {Object} thisArg The object to bind function to
     * @return {Object} The resulting value of object a
     */
    function extend(a, b, thisArg) {
      forEach(b, function assignValue(val, key) {
        if (thisArg && typeof val === 'function') {
          a[key] = bind(val, thisArg);
        } else {
          a[key] = val;
        }
      });
      return a;
    }

    var utils = {
      isArray: isArray,
      isArrayBuffer: isArrayBuffer,
      isBuffer: isBuffer,
      isFormData: isFormData,
      isArrayBufferView: isArrayBufferView,
      isString: isString,
      isNumber: isNumber,
      isObject: isObject,
      isUndefined: isUndefined,
      isDate: isDate,
      isFile: isFile,
      isBlob: isBlob,
      isFunction: isFunction,
      isStream: isStream,
      isURLSearchParams: isURLSearchParams,
      isStandardBrowserEnv: isStandardBrowserEnv,
      forEach: forEach,
      merge: merge,
      deepMerge: deepMerge,
      extend: extend,
      trim: trim
    };

    function encode(val) {
      return encodeURIComponent(val).
        replace(/%40/gi, '@').
        replace(/%3A/gi, ':').
        replace(/%24/g, '$').
        replace(/%2C/gi, ',').
        replace(/%20/g, '+').
        replace(/%5B/gi, '[').
        replace(/%5D/gi, ']');
    }

    /**
     * Build a URL by appending params to the end
     *
     * @param {string} url The base of the url (e.g., http://www.google.com)
     * @param {object} [params] The params to be appended
     * @returns {string} The formatted url
     */
    var buildURL = function buildURL(url, params, paramsSerializer) {
      /*eslint no-param-reassign:0*/
      if (!params) {
        return url;
      }

      var serializedParams;
      if (paramsSerializer) {
        serializedParams = paramsSerializer(params);
      } else if (utils.isURLSearchParams(params)) {
        serializedParams = params.toString();
      } else {
        var parts = [];

        utils.forEach(params, function serialize(val, key) {
          if (val === null || typeof val === 'undefined') {
            return;
          }

          if (utils.isArray(val)) {
            key = key + '[]';
          } else {
            val = [val];
          }

          utils.forEach(val, function parseValue(v) {
            if (utils.isDate(v)) {
              v = v.toISOString();
            } else if (utils.isObject(v)) {
              v = JSON.stringify(v);
            }
            parts.push(encode(key) + '=' + encode(v));
          });
        });

        serializedParams = parts.join('&');
      }

      if (serializedParams) {
        var hashmarkIndex = url.indexOf('#');
        if (hashmarkIndex !== -1) {
          url = url.slice(0, hashmarkIndex);
        }

        url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
      }

      return url;
    };

    function InterceptorManager() {
      this.handlers = [];
    }

    /**
     * Add a new interceptor to the stack
     *
     * @param {Function} fulfilled The function to handle `then` for a `Promise`
     * @param {Function} rejected The function to handle `reject` for a `Promise`
     *
     * @return {Number} An ID used to remove interceptor later
     */
    InterceptorManager.prototype.use = function use(fulfilled, rejected) {
      this.handlers.push({
        fulfilled: fulfilled,
        rejected: rejected
      });
      return this.handlers.length - 1;
    };

    /**
     * Remove an interceptor from the stack
     *
     * @param {Number} id The ID that was returned by `use`
     */
    InterceptorManager.prototype.eject = function eject(id) {
      if (this.handlers[id]) {
        this.handlers[id] = null;
      }
    };

    /**
     * Iterate over all the registered interceptors
     *
     * This method is particularly useful for skipping over any
     * interceptors that may have become `null` calling `eject`.
     *
     * @param {Function} fn The function to call for each interceptor
     */
    InterceptorManager.prototype.forEach = function forEach(fn) {
      utils.forEach(this.handlers, function forEachHandler(h) {
        if (h !== null) {
          fn(h);
        }
      });
    };

    var InterceptorManager_1 = InterceptorManager;

    /**
     * Transform the data for a request or a response
     *
     * @param {Object|String} data The data to be transformed
     * @param {Array} headers The headers for the request or response
     * @param {Array|Function} fns A single function or Array of functions
     * @returns {*} The resulting transformed data
     */
    var transformData = function transformData(data, headers, fns) {
      /*eslint no-param-reassign:0*/
      utils.forEach(fns, function transform(fn) {
        data = fn(data, headers);
      });

      return data;
    };

    var isCancel = function isCancel(value) {
      return !!(value && value.__CANCEL__);
    };

    var global$1 = (typeof global !== "undefined" ? global :
                typeof self !== "undefined" ? self :
                typeof window !== "undefined" ? window : {});

    // shim for using process in browser
    // based off https://github.com/defunctzombie/node-process/blob/master/browser.js

    function defaultSetTimout() {
        throw new Error('setTimeout has not been defined');
    }
    function defaultClearTimeout () {
        throw new Error('clearTimeout has not been defined');
    }
    var cachedSetTimeout = defaultSetTimout;
    var cachedClearTimeout = defaultClearTimeout;
    if (typeof global$1.setTimeout === 'function') {
        cachedSetTimeout = setTimeout;
    }
    if (typeof global$1.clearTimeout === 'function') {
        cachedClearTimeout = clearTimeout;
    }

    function runTimeout(fun) {
        if (cachedSetTimeout === setTimeout) {
            //normal enviroments in sane situations
            return setTimeout(fun, 0);
        }
        // if setTimeout wasn't available but was latter defined
        if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
            cachedSetTimeout = setTimeout;
            return setTimeout(fun, 0);
        }
        try {
            // when when somebody has screwed with setTimeout but no I.E. maddness
            return cachedSetTimeout(fun, 0);
        } catch(e){
            try {
                // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
                return cachedSetTimeout.call(null, fun, 0);
            } catch(e){
                // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
                return cachedSetTimeout.call(this, fun, 0);
            }
        }


    }
    function runClearTimeout(marker) {
        if (cachedClearTimeout === clearTimeout) {
            //normal enviroments in sane situations
            return clearTimeout(marker);
        }
        // if clearTimeout wasn't available but was latter defined
        if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
            cachedClearTimeout = clearTimeout;
            return clearTimeout(marker);
        }
        try {
            // when when somebody has screwed with setTimeout but no I.E. maddness
            return cachedClearTimeout(marker);
        } catch (e){
            try {
                // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
                return cachedClearTimeout.call(null, marker);
            } catch (e){
                // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
                // Some versions of I.E. have different rules for clearTimeout vs setTimeout
                return cachedClearTimeout.call(this, marker);
            }
        }



    }
    var queue = [];
    var draining = false;
    var currentQueue;
    var queueIndex = -1;

    function cleanUpNextTick() {
        if (!draining || !currentQueue) {
            return;
        }
        draining = false;
        if (currentQueue.length) {
            queue = currentQueue.concat(queue);
        } else {
            queueIndex = -1;
        }
        if (queue.length) {
            drainQueue();
        }
    }

    function drainQueue() {
        if (draining) {
            return;
        }
        var timeout = runTimeout(cleanUpNextTick);
        draining = true;

        var len = queue.length;
        while(len) {
            currentQueue = queue;
            queue = [];
            while (++queueIndex < len) {
                if (currentQueue) {
                    currentQueue[queueIndex].run();
                }
            }
            queueIndex = -1;
            len = queue.length;
        }
        currentQueue = null;
        draining = false;
        runClearTimeout(timeout);
    }
    function nextTick(fun) {
        var args = new Array(arguments.length - 1);
        if (arguments.length > 1) {
            for (var i = 1; i < arguments.length; i++) {
                args[i - 1] = arguments[i];
            }
        }
        queue.push(new Item(fun, args));
        if (queue.length === 1 && !draining) {
            runTimeout(drainQueue);
        }
    }
    // v8 likes predictible objects
    function Item(fun, array) {
        this.fun = fun;
        this.array = array;
    }
    Item.prototype.run = function () {
        this.fun.apply(null, this.array);
    };
    var title = 'browser';
    var platform = 'browser';
    var browser = true;
    var env = {};
    var argv = [];
    var version = ''; // empty string to avoid regexp issues
    var versions = {};
    var release = {};
    var config = {};

    function noop$1() {}

    var on = noop$1;
    var addListener = noop$1;
    var once = noop$1;
    var off = noop$1;
    var removeListener = noop$1;
    var removeAllListeners = noop$1;
    var emit = noop$1;

    function binding(name) {
        throw new Error('process.binding is not supported');
    }

    function cwd () { return '/' }
    function chdir (dir) {
        throw new Error('process.chdir is not supported');
    }function umask() { return 0; }

    // from https://github.com/kumavis/browser-process-hrtime/blob/master/index.js
    var performance = global$1.performance || {};
    var performanceNow =
      performance.now        ||
      performance.mozNow     ||
      performance.msNow      ||
      performance.oNow       ||
      performance.webkitNow  ||
      function(){ return (new Date()).getTime() };

    // generate timestamp or delta
    // see http://nodejs.org/api/process.html#process_process_hrtime
    function hrtime(previousTimestamp){
      var clocktime = performanceNow.call(performance)*1e-3;
      var seconds = Math.floor(clocktime);
      var nanoseconds = Math.floor((clocktime%1)*1e9);
      if (previousTimestamp) {
        seconds = seconds - previousTimestamp[0];
        nanoseconds = nanoseconds - previousTimestamp[1];
        if (nanoseconds<0) {
          seconds--;
          nanoseconds += 1e9;
        }
      }
      return [seconds,nanoseconds]
    }

    var startTime = new Date();
    function uptime() {
      var currentTime = new Date();
      var dif = currentTime - startTime;
      return dif / 1000;
    }

    var process = {
      nextTick: nextTick,
      title: title,
      browser: browser,
      env: env,
      argv: argv,
      version: version,
      versions: versions,
      on: on,
      addListener: addListener,
      once: once,
      off: off,
      removeListener: removeListener,
      removeAllListeners: removeAllListeners,
      emit: emit,
      binding: binding,
      cwd: cwd,
      chdir: chdir,
      umask: umask,
      hrtime: hrtime,
      platform: platform,
      release: release,
      config: config,
      uptime: uptime
    };

    var normalizeHeaderName = function normalizeHeaderName(headers, normalizedName) {
      utils.forEach(headers, function processHeader(value, name) {
        if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
          headers[normalizedName] = value;
          delete headers[name];
        }
      });
    };

    /**
     * Update an Error with the specified config, error code, and response.
     *
     * @param {Error} error The error to update.
     * @param {Object} config The config.
     * @param {string} [code] The error code (for example, 'ECONNABORTED').
     * @param {Object} [request] The request.
     * @param {Object} [response] The response.
     * @returns {Error} The error.
     */
    var enhanceError = function enhanceError(error, config, code, request, response) {
      error.config = config;
      if (code) {
        error.code = code;
      }

      error.request = request;
      error.response = response;
      error.isAxiosError = true;

      error.toJSON = function() {
        return {
          // Standard
          message: this.message,
          name: this.name,
          // Microsoft
          description: this.description,
          number: this.number,
          // Mozilla
          fileName: this.fileName,
          lineNumber: this.lineNumber,
          columnNumber: this.columnNumber,
          stack: this.stack,
          // Axios
          config: this.config,
          code: this.code
        };
      };
      return error;
    };

    /**
     * Create an Error with the specified message, config, error code, request and response.
     *
     * @param {string} message The error message.
     * @param {Object} config The config.
     * @param {string} [code] The error code (for example, 'ECONNABORTED').
     * @param {Object} [request] The request.
     * @param {Object} [response] The response.
     * @returns {Error} The created error.
     */
    var createError = function createError(message, config, code, request, response) {
      var error = new Error(message);
      return enhanceError(error, config, code, request, response);
    };

    /**
     * Resolve or reject a Promise based on response status.
     *
     * @param {Function} resolve A function that resolves the promise.
     * @param {Function} reject A function that rejects the promise.
     * @param {object} response The response.
     */
    var settle = function settle(resolve, reject, response) {
      var validateStatus = response.config.validateStatus;
      if (!validateStatus || validateStatus(response.status)) {
        resolve(response);
      } else {
        reject(createError(
          'Request failed with status code ' + response.status,
          response.config,
          null,
          response.request,
          response
        ));
      }
    };

    // Headers whose duplicates are ignored by node
    // c.f. https://nodejs.org/api/http.html#http_message_headers
    var ignoreDuplicateOf = [
      'age', 'authorization', 'content-length', 'content-type', 'etag',
      'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
      'last-modified', 'location', 'max-forwards', 'proxy-authorization',
      'referer', 'retry-after', 'user-agent'
    ];

    /**
     * Parse headers into an object
     *
     * ```
     * Date: Wed, 27 Aug 2014 08:58:49 GMT
     * Content-Type: application/json
     * Connection: keep-alive
     * Transfer-Encoding: chunked
     * ```
     *
     * @param {String} headers Headers needing to be parsed
     * @returns {Object} Headers parsed into an object
     */
    var parseHeaders = function parseHeaders(headers) {
      var parsed = {};
      var key;
      var val;
      var i;

      if (!headers) { return parsed; }

      utils.forEach(headers.split('\n'), function parser(line) {
        i = line.indexOf(':');
        key = utils.trim(line.substr(0, i)).toLowerCase();
        val = utils.trim(line.substr(i + 1));

        if (key) {
          if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
            return;
          }
          if (key === 'set-cookie') {
            parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
          } else {
            parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
          }
        }
      });

      return parsed;
    };

    var isURLSameOrigin = (
      utils.isStandardBrowserEnv() ?

      // Standard browser envs have full support of the APIs needed to test
      // whether the request URL is of the same origin as current location.
        (function standardBrowserEnv() {
          var msie = /(msie|trident)/i.test(navigator.userAgent);
          var urlParsingNode = document.createElement('a');
          var originURL;

          /**
        * Parse a URL to discover it's components
        *
        * @param {String} url The URL to be parsed
        * @returns {Object}
        */
          function resolveURL(url) {
            var href = url;

            if (msie) {
            // IE needs attribute set twice to normalize properties
              urlParsingNode.setAttribute('href', href);
              href = urlParsingNode.href;
            }

            urlParsingNode.setAttribute('href', href);

            // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
            return {
              href: urlParsingNode.href,
              protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
              host: urlParsingNode.host,
              search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
              hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
              hostname: urlParsingNode.hostname,
              port: urlParsingNode.port,
              pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
                urlParsingNode.pathname :
                '/' + urlParsingNode.pathname
            };
          }

          originURL = resolveURL(window.location.href);

          /**
        * Determine if a URL shares the same origin as the current location
        *
        * @param {String} requestURL The URL to test
        * @returns {boolean} True if URL shares the same origin, otherwise false
        */
          return function isURLSameOrigin(requestURL) {
            var parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
            return (parsed.protocol === originURL.protocol &&
                parsed.host === originURL.host);
          };
        })() :

      // Non standard browser envs (web workers, react-native) lack needed support.
        (function nonStandardBrowserEnv() {
          return function isURLSameOrigin() {
            return true;
          };
        })()
    );

    var cookies = (
      utils.isStandardBrowserEnv() ?

      // Standard browser envs support document.cookie
        (function standardBrowserEnv() {
          return {
            write: function write(name, value, expires, path, domain, secure) {
              var cookie = [];
              cookie.push(name + '=' + encodeURIComponent(value));

              if (utils.isNumber(expires)) {
                cookie.push('expires=' + new Date(expires).toGMTString());
              }

              if (utils.isString(path)) {
                cookie.push('path=' + path);
              }

              if (utils.isString(domain)) {
                cookie.push('domain=' + domain);
              }

              if (secure === true) {
                cookie.push('secure');
              }

              document.cookie = cookie.join('; ');
            },

            read: function read(name) {
              var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
              return (match ? decodeURIComponent(match[3]) : null);
            },

            remove: function remove(name) {
              this.write(name, '', Date.now() - 86400000);
            }
          };
        })() :

      // Non standard browser env (web workers, react-native) lack needed support.
        (function nonStandardBrowserEnv() {
          return {
            write: function write() {},
            read: function read() { return null; },
            remove: function remove() {}
          };
        })()
    );

    var xhr = function xhrAdapter(config) {
      return new Promise(function dispatchXhrRequest(resolve, reject) {
        var requestData = config.data;
        var requestHeaders = config.headers;

        if (utils.isFormData(requestData)) {
          delete requestHeaders['Content-Type']; // Let the browser set it
        }

        var request = new XMLHttpRequest();

        // HTTP basic authentication
        if (config.auth) {
          var username = config.auth.username || '';
          var password = config.auth.password || '';
          requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
        }

        request.open(config.method.toUpperCase(), buildURL(config.url, config.params, config.paramsSerializer), true);

        // Set the request timeout in MS
        request.timeout = config.timeout;

        // Listen for ready state
        request.onreadystatechange = function handleLoad() {
          if (!request || request.readyState !== 4) {
            return;
          }

          // The request errored out and we didn't get a response, this will be
          // handled by onerror instead
          // With one exception: request that using file: protocol, most browsers
          // will return status as 0 even though it's a successful request
          if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
            return;
          }

          // Prepare the response
          var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
          var responseData = !config.responseType || config.responseType === 'text' ? request.responseText : request.response;
          var response = {
            data: responseData,
            status: request.status,
            statusText: request.statusText,
            headers: responseHeaders,
            config: config,
            request: request
          };

          settle(resolve, reject, response);

          // Clean up request
          request = null;
        };

        // Handle browser request cancellation (as opposed to a manual cancellation)
        request.onabort = function handleAbort() {
          if (!request) {
            return;
          }

          reject(createError('Request aborted', config, 'ECONNABORTED', request));

          // Clean up request
          request = null;
        };

        // Handle low level network errors
        request.onerror = function handleError() {
          // Real errors are hidden from us by the browser
          // onerror should only fire if it's a network error
          reject(createError('Network Error', config, null, request));

          // Clean up request
          request = null;
        };

        // Handle timeout
        request.ontimeout = function handleTimeout() {
          reject(createError('timeout of ' + config.timeout + 'ms exceeded', config, 'ECONNABORTED',
            request));

          // Clean up request
          request = null;
        };

        // Add xsrf header
        // This is only done if running in a standard browser environment.
        // Specifically not if we're in a web worker, or react-native.
        if (utils.isStandardBrowserEnv()) {
          var cookies$1 = cookies;

          // Add xsrf header
          var xsrfValue = (config.withCredentials || isURLSameOrigin(config.url)) && config.xsrfCookieName ?
            cookies$1.read(config.xsrfCookieName) :
            undefined;

          if (xsrfValue) {
            requestHeaders[config.xsrfHeaderName] = xsrfValue;
          }
        }

        // Add headers to the request
        if ('setRequestHeader' in request) {
          utils.forEach(requestHeaders, function setRequestHeader(val, key) {
            if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
              // Remove Content-Type if data is undefined
              delete requestHeaders[key];
            } else {
              // Otherwise add header to the request
              request.setRequestHeader(key, val);
            }
          });
        }

        // Add withCredentials to request if needed
        if (config.withCredentials) {
          request.withCredentials = true;
        }

        // Add responseType to request if needed
        if (config.responseType) {
          try {
            request.responseType = config.responseType;
          } catch (e) {
            // Expected DOMException thrown by browsers not compatible XMLHttpRequest Level 2.
            // But, this can be suppressed for 'json' type as it can be parsed by default 'transformResponse' function.
            if (config.responseType !== 'json') {
              throw e;
            }
          }
        }

        // Handle progress if needed
        if (typeof config.onDownloadProgress === 'function') {
          request.addEventListener('progress', config.onDownloadProgress);
        }

        // Not all browsers support upload events
        if (typeof config.onUploadProgress === 'function' && request.upload) {
          request.upload.addEventListener('progress', config.onUploadProgress);
        }

        if (config.cancelToken) {
          // Handle cancellation
          config.cancelToken.promise.then(function onCanceled(cancel) {
            if (!request) {
              return;
            }

            request.abort();
            reject(cancel);
            // Clean up request
            request = null;
          });
        }

        if (requestData === undefined) {
          requestData = null;
        }

        // Send the request
        request.send(requestData);
      });
    };

    var DEFAULT_CONTENT_TYPE = {
      'Content-Type': 'application/x-www-form-urlencoded'
    };

    function setContentTypeIfUnset(headers, value) {
      if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
        headers['Content-Type'] = value;
      }
    }

    function getDefaultAdapter() {
      var adapter;
      // Only Node.JS has a process variable that is of [[Class]] process
      if (typeof process !== 'undefined' && Object.prototype.toString.call(process) === '[object process]') {
        // For node use HTTP adapter
        adapter = xhr;
      } else if (typeof XMLHttpRequest !== 'undefined') {
        // For browsers use XHR adapter
        adapter = xhr;
      }
      return adapter;
    }

    var defaults = {
      adapter: getDefaultAdapter(),

      transformRequest: [function transformRequest(data, headers) {
        normalizeHeaderName(headers, 'Accept');
        normalizeHeaderName(headers, 'Content-Type');
        if (utils.isFormData(data) ||
          utils.isArrayBuffer(data) ||
          utils.isBuffer(data) ||
          utils.isStream(data) ||
          utils.isFile(data) ||
          utils.isBlob(data)
        ) {
          return data;
        }
        if (utils.isArrayBufferView(data)) {
          return data.buffer;
        }
        if (utils.isURLSearchParams(data)) {
          setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
          return data.toString();
        }
        if (utils.isObject(data)) {
          setContentTypeIfUnset(headers, 'application/json;charset=utf-8');
          return JSON.stringify(data);
        }
        return data;
      }],

      transformResponse: [function transformResponse(data) {
        /*eslint no-param-reassign:0*/
        if (typeof data === 'string') {
          try {
            data = JSON.parse(data);
          } catch (e) { /* Ignore */ }
        }
        return data;
      }],

      /**
       * A timeout in milliseconds to abort a request. If set to 0 (default) a
       * timeout is not created.
       */
      timeout: 0,

      xsrfCookieName: 'XSRF-TOKEN',
      xsrfHeaderName: 'X-XSRF-TOKEN',

      maxContentLength: -1,

      validateStatus: function validateStatus(status) {
        return status >= 200 && status < 300;
      }
    };

    defaults.headers = {
      common: {
        'Accept': 'application/json, text/plain, */*'
      }
    };

    utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
      defaults.headers[method] = {};
    });

    utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
      defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
    });

    var defaults_1 = defaults;

    /**
     * Determines whether the specified URL is absolute
     *
     * @param {string} url The URL to test
     * @returns {boolean} True if the specified URL is absolute, otherwise false
     */
    var isAbsoluteURL = function isAbsoluteURL(url) {
      // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
      // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
      // by any combination of letters, digits, plus, period, or hyphen.
      return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url);
    };

    /**
     * Creates a new URL by combining the specified URLs
     *
     * @param {string} baseURL The base URL
     * @param {string} relativeURL The relative URL
     * @returns {string} The combined URL
     */
    var combineURLs = function combineURLs(baseURL, relativeURL) {
      return relativeURL
        ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
        : baseURL;
    };

    /**
     * Throws a `Cancel` if cancellation has been requested.
     */
    function throwIfCancellationRequested(config) {
      if (config.cancelToken) {
        config.cancelToken.throwIfRequested();
      }
    }

    /**
     * Dispatch a request to the server using the configured adapter.
     *
     * @param {object} config The config that is to be used for the request
     * @returns {Promise} The Promise to be fulfilled
     */
    var dispatchRequest = function dispatchRequest(config) {
      throwIfCancellationRequested(config);

      // Support baseURL config
      if (config.baseURL && !isAbsoluteURL(config.url)) {
        config.url = combineURLs(config.baseURL, config.url);
      }

      // Ensure headers exist
      config.headers = config.headers || {};

      // Transform request data
      config.data = transformData(
        config.data,
        config.headers,
        config.transformRequest
      );

      // Flatten headers
      config.headers = utils.merge(
        config.headers.common || {},
        config.headers[config.method] || {},
        config.headers || {}
      );

      utils.forEach(
        ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
        function cleanHeaderConfig(method) {
          delete config.headers[method];
        }
      );

      var adapter = config.adapter || defaults_1.adapter;

      return adapter(config).then(function onAdapterResolution(response) {
        throwIfCancellationRequested(config);

        // Transform response data
        response.data = transformData(
          response.data,
          response.headers,
          config.transformResponse
        );

        return response;
      }, function onAdapterRejection(reason) {
        if (!isCancel(reason)) {
          throwIfCancellationRequested(config);

          // Transform response data
          if (reason && reason.response) {
            reason.response.data = transformData(
              reason.response.data,
              reason.response.headers,
              config.transformResponse
            );
          }
        }

        return Promise.reject(reason);
      });
    };

    /**
     * Config-specific merge-function which creates a new config-object
     * by merging two configuration objects together.
     *
     * @param {Object} config1
     * @param {Object} config2
     * @returns {Object} New object resulting from merging config2 to config1
     */
    var mergeConfig = function mergeConfig(config1, config2) {
      // eslint-disable-next-line no-param-reassign
      config2 = config2 || {};
      var config = {};

      utils.forEach(['url', 'method', 'params', 'data'], function valueFromConfig2(prop) {
        if (typeof config2[prop] !== 'undefined') {
          config[prop] = config2[prop];
        }
      });

      utils.forEach(['headers', 'auth', 'proxy'], function mergeDeepProperties(prop) {
        if (utils.isObject(config2[prop])) {
          config[prop] = utils.deepMerge(config1[prop], config2[prop]);
        } else if (typeof config2[prop] !== 'undefined') {
          config[prop] = config2[prop];
        } else if (utils.isObject(config1[prop])) {
          config[prop] = utils.deepMerge(config1[prop]);
        } else if (typeof config1[prop] !== 'undefined') {
          config[prop] = config1[prop];
        }
      });

      utils.forEach([
        'baseURL', 'transformRequest', 'transformResponse', 'paramsSerializer',
        'timeout', 'withCredentials', 'adapter', 'responseType', 'xsrfCookieName',
        'xsrfHeaderName', 'onUploadProgress', 'onDownloadProgress', 'maxContentLength',
        'validateStatus', 'maxRedirects', 'httpAgent', 'httpsAgent', 'cancelToken',
        'socketPath'
      ], function defaultToConfig2(prop) {
        if (typeof config2[prop] !== 'undefined') {
          config[prop] = config2[prop];
        } else if (typeof config1[prop] !== 'undefined') {
          config[prop] = config1[prop];
        }
      });

      return config;
    };

    /**
     * Create a new instance of Axios
     *
     * @param {Object} instanceConfig The default config for the instance
     */
    function Axios(instanceConfig) {
      this.defaults = instanceConfig;
      this.interceptors = {
        request: new InterceptorManager_1(),
        response: new InterceptorManager_1()
      };
    }

    /**
     * Dispatch a request
     *
     * @param {Object} config The config specific for this request (merged with this.defaults)
     */
    Axios.prototype.request = function request(config) {
      /*eslint no-param-reassign:0*/
      // Allow for axios('example/url'[, config]) a la fetch API
      if (typeof config === 'string') {
        config = arguments[1] || {};
        config.url = arguments[0];
      } else {
        config = config || {};
      }

      config = mergeConfig(this.defaults, config);
      config.method = config.method ? config.method.toLowerCase() : 'get';

      // Hook up interceptors middleware
      var chain = [dispatchRequest, undefined];
      var promise = Promise.resolve(config);

      this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
        chain.unshift(interceptor.fulfilled, interceptor.rejected);
      });

      this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
        chain.push(interceptor.fulfilled, interceptor.rejected);
      });

      while (chain.length) {
        promise = promise.then(chain.shift(), chain.shift());
      }

      return promise;
    };

    Axios.prototype.getUri = function getUri(config) {
      config = mergeConfig(this.defaults, config);
      return buildURL(config.url, config.params, config.paramsSerializer).replace(/^\?/, '');
    };

    // Provide aliases for supported request methods
    utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
      /*eslint func-names:0*/
      Axios.prototype[method] = function(url, config) {
        return this.request(utils.merge(config || {}, {
          method: method,
          url: url
        }));
      };
    });

    utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
      /*eslint func-names:0*/
      Axios.prototype[method] = function(url, data, config) {
        return this.request(utils.merge(config || {}, {
          method: method,
          url: url,
          data: data
        }));
      };
    });

    var Axios_1 = Axios;

    /**
     * A `Cancel` is an object that is thrown when an operation is canceled.
     *
     * @class
     * @param {string=} message The message.
     */
    function Cancel(message) {
      this.message = message;
    }

    Cancel.prototype.toString = function toString() {
      return 'Cancel' + (this.message ? ': ' + this.message : '');
    };

    Cancel.prototype.__CANCEL__ = true;

    var Cancel_1 = Cancel;

    /**
     * A `CancelToken` is an object that can be used to request cancellation of an operation.
     *
     * @class
     * @param {Function} executor The executor function.
     */
    function CancelToken(executor) {
      if (typeof executor !== 'function') {
        throw new TypeError('executor must be a function.');
      }

      var resolvePromise;
      this.promise = new Promise(function promiseExecutor(resolve) {
        resolvePromise = resolve;
      });

      var token = this;
      executor(function cancel(message) {
        if (token.reason) {
          // Cancellation has already been requested
          return;
        }

        token.reason = new Cancel_1(message);
        resolvePromise(token.reason);
      });
    }

    /**
     * Throws a `Cancel` if cancellation has been requested.
     */
    CancelToken.prototype.throwIfRequested = function throwIfRequested() {
      if (this.reason) {
        throw this.reason;
      }
    };

    /**
     * Returns an object that contains a new `CancelToken` and a function that, when called,
     * cancels the `CancelToken`.
     */
    CancelToken.source = function source() {
      var cancel;
      var token = new CancelToken(function executor(c) {
        cancel = c;
      });
      return {
        token: token,
        cancel: cancel
      };
    };

    var CancelToken_1 = CancelToken;

    /**
     * Syntactic sugar for invoking a function and expanding an array for arguments.
     *
     * Common use case would be to use `Function.prototype.apply`.
     *
     *  ```js
     *  function f(x, y, z) {}
     *  var args = [1, 2, 3];
     *  f.apply(null, args);
     *  ```
     *
     * With `spread` this example can be re-written.
     *
     *  ```js
     *  spread(function(x, y, z) {})([1, 2, 3]);
     *  ```
     *
     * @param {Function} callback
     * @returns {Function}
     */
    var spread = function spread(callback) {
      return function wrap(arr) {
        return callback.apply(null, arr);
      };
    };

    /**
     * Create an instance of Axios
     *
     * @param {Object} defaultConfig The default config for the instance
     * @return {Axios} A new instance of Axios
     */
    function createInstance(defaultConfig) {
      var context = new Axios_1(defaultConfig);
      var instance = bind(Axios_1.prototype.request, context);

      // Copy axios.prototype to instance
      utils.extend(instance, Axios_1.prototype, context);

      // Copy context to instance
      utils.extend(instance, context);

      return instance;
    }

    // Create the default instance to be exported
    var axios = createInstance(defaults_1);

    // Expose Axios class to allow class inheritance
    axios.Axios = Axios_1;

    // Factory for creating new instances
    axios.create = function create(instanceConfig) {
      return createInstance(mergeConfig(axios.defaults, instanceConfig));
    };

    // Expose Cancel & CancelToken
    axios.Cancel = Cancel_1;
    axios.CancelToken = CancelToken_1;
    axios.isCancel = isCancel;

    // Expose all/spread
    axios.all = function all(promises) {
      return Promise.all(promises);
    };
    axios.spread = spread;

    var axios_1 = axios;

    // Allow use of default import syntax in TypeScript
    var default_1 = axios;
    axios_1.default = default_1;

    var axios$1 = axios_1;

    /* src/routes/Meetups.svelte generated by Svelte v3.7.1 */

    const file$1 = "src/routes/Meetups.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.name = list[i].name;
    	child_ctx.group = list[i].group;
    	child_ctx.link = list[i].link;
    	child_ctx.description = list[i].description;
    	child_ctx.local_date = list[i].local_date;
    	child_ctx.local_time = list[i].local_time;
    	child_ctx.venue = list[i].venue;
    	child_ctx.how_to_find_us = list[i].how_to_find_us;
    	return child_ctx;
    }

    // (80:0) {:else}
    function create_else_block(ctx) {
    	var div2, div1, div0;

    	var each_value = ctx.events;

    	var each_blocks = [];

    	for (var i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	return {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}
    			attr(div0, "class", "grid svelte-m44ux6");
    			add_location(div0, file$1, 82, 6, 1769);
    			attr(div1, "class", "grid-container svelte-m44ux6");
    			add_location(div1, file$1, 81, 4, 1734);
    			attr(div2, "class", "container svelte-m44ux6");
    			add_location(div2, file$1, 80, 2, 1706);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div2, anchor);
    			append(div2, div1);
    			append(div1, div0);

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}
    		},

    		p: function update(changed, ctx) {
    			if (changed.events) {
    				each_value = ctx.events;

    				for (var i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}
    				each_blocks.length = each_value.length;
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div2);
    			}

    			destroy_each(each_blocks, detaching);
    		}
    	};
    }

    // (76:0) {#if !events}
    function create_if_block(ctx) {
    	var div;

    	return {
    		c: function create() {
    			div = element("div");
    			add_location(div, file$1, 76, 2, 1680);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    		},

    		p: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}
    		}
    	};
    }

    // (84:7) {#each events as { name, group, link, description, local_date, local_time, venue, how_to_find_us }
    function create_each_block(ctx) {
    	var div, h3, t0_value = ctx.group.name, t0, t1, p, t2, t3_value = ctx.name, t3, t4, br, t5, t6_value = ctx.venue.name, t6, t7, t8_value = ctx.local_date, t8, t9, t10_value = ctx.local_time, t10, t11, a, t12_value = ctx.link, t12, a_href_value, t13;

    	return {
    		c: function create() {
    			div = element("div");
    			h3 = element("h3");
    			t0 = text(t0_value);
    			t1 = space();
    			p = element("p");
    			t2 = text("Meetup: ");
    			t3 = text(t3_value);
    			t4 = space();
    			br = element("br");
    			t5 = text("@ ");
    			t6 = text(t6_value);
    			t7 = text(" on ");
    			t8 = text(t8_value);
    			t9 = text(" at ");
    			t10 = text(t10_value);
    			t11 = space();
    			a = element("a");
    			t12 = text(t12_value);
    			t13 = space();
    			add_location(h3, file$1, 85, 12, 1935);
    			add_location(br, file$1, 86, 30, 1987);
    			add_location(p, file$1, 86, 12, 1969);
    			attr(a, "target", "_blank");
    			attr(a, "href", a_href_value = ctx.link);
    			add_location(a, file$1, 87, 12, 2056);
    			attr(div, "class", "card svelte-m44ux6");
    			add_location(div, file$1, 84, 8, 1904);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			append(div, h3);
    			append(h3, t0);
    			append(div, t1);
    			append(div, p);
    			append(p, t2);
    			append(p, t3);
    			append(p, t4);
    			append(p, br);
    			append(p, t5);
    			append(p, t6);
    			append(p, t7);
    			append(p, t8);
    			append(p, t9);
    			append(p, t10);
    			append(div, t11);
    			append(div, a);
    			append(a, t12);
    			append(div, t13);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.events) && t0_value !== (t0_value = ctx.group.name)) {
    				set_data(t0, t0_value);
    			}

    			if ((changed.events) && t3_value !== (t3_value = ctx.name)) {
    				set_data(t3, t3_value);
    			}

    			if ((changed.events) && t6_value !== (t6_value = ctx.venue.name)) {
    				set_data(t6, t6_value);
    			}

    			if ((changed.events) && t8_value !== (t8_value = ctx.local_date)) {
    				set_data(t8, t8_value);
    			}

    			if ((changed.events) && t10_value !== (t10_value = ctx.local_time)) {
    				set_data(t10, t10_value);
    			}

    			if ((changed.events) && t12_value !== (t12_value = ctx.link)) {
    				set_data(t12, t12_value);
    			}

    			if ((changed.events) && a_href_value !== (a_href_value = ctx.link)) {
    				attr(a, "href", a_href_value);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}
    		}
    	};
    }

    function create_fragment$2(ctx) {
    	var h2, t1, div, p0, t3, p1, t5, p2, t7, if_block_anchor, dispose;

    	function select_block_type(ctx) {
    		if (!ctx.events) return create_if_block;
    		return create_else_block;
    	}

    	var current_block_type = select_block_type(ctx);
    	var if_block = current_block_type(ctx);

    	return {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "Upcoming Events";
    			t1 = space();
    			div = element("div");
    			p0 = element("p");
    			p0.textContent = "Melbourne Events";
    			t3 = space();
    			p1 = element("p");
    			p1.textContent = "Sydney Events";
    			t5 = space();
    			p2 = element("p");
    			p2.textContent = "Brisbane Events";
    			t7 = space();
    			if_block.c();
    			if_block_anchor = empty();
    			add_location(h2, file$1, 68, 0, 1450);
    			add_location(p0, file$1, 70, 2, 1506);
    			add_location(p1, file$1, 71, 2, 1557);
    			add_location(p2, file$1, 72, 2, 1604);
    			attr(div, "class", "selectLocation svelte-m44ux6");
    			add_location(div, file$1, 69, 0, 1475);

    			dispose = [
    				listen(p0, "click", ctx.getMelbEvents),
    				listen(p1, "click", ctx.getSydEvents),
    				listen(p2, "click", ctx.getBrisEvents)
    			];
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, h2, anchor);
    			insert(target, t1, anchor);
    			insert(target, div, anchor);
    			append(div, p0);
    			append(div, t3);
    			append(div, p1);
    			append(div, t5);
    			append(div, p2);
    			insert(target, t7, anchor);
    			if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    		},

    		p: function update(changed, ctx) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(changed, ctx);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);
    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(h2);
    				detach(t1);
    				detach(div);
    				detach(t7);
    			}

    			if_block.d(detaching);

    			if (detaching) {
    				detach(if_block_anchor);
    			}

    			run_all(dispose);
    		}
    	};
    }

    function instance$1($$self, $$props, $$invalidate) {
    	
      let events = false;
      
      axios$1.defaults.crossDomain = true;


      const getMelbEvents = async () => {
        try{
          $$invalidate('events', events = await axios$1.get("https://api.meetup.com/Ethereum-Melbourne/events?page=3&sig_id=225203890&callback=noop&fields=event_hosts&sig=9a0f25530150caf171cd1ebd6b2f5227fd1bcd48"));
        } catch (error) {
          console.log(error);
        }
        
      };

       const getSydEvents = async () => {
        // events = await axios.get('https://api.meetup.com/Web3-Melbourne/events?key=' + process.env.MEETUP_API_KEY + '&sign=true&page=6');
      };
      
       const getBrisEvents = async () => {
        // events = await axios.get('https://api.meetup.com/Web3-Melbourne/events?key=' + process.env.MEETUP_API_KEY + '&sign=true&page=6');
      };

    	return {
    		events,
    		getMelbEvents,
    		getSydEvents,
    		getBrisEvents
    	};
    }

    class Meetups extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$2, safe_not_equal, []);
    	}
    }

    /* src/routes/Home.svelte generated by Svelte v3.7.1 */

    function create_fragment$3(ctx) {
    	var current;

    	var meetups = new Meetups({ $$inline: true });

    	return {
    		c: function create() {
    			meetups.$$.fragment.c();
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			mount_component(meetups, target, anchor);
    			current = true;
    		},

    		p: noop,

    		i: function intro(local) {
    			if (current) return;
    			transition_in(meetups.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(meetups.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(meetups, detaching);
    		}
    	};
    }

    class Home extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$3, safe_not_equal, []);
    	}
    }

    /* src/routes/ProfileGrid.svelte generated by Svelte v3.7.1 */

    const file$2 = "src/routes/ProfileGrid.svelte";

    function create_fragment$4(ctx) {
    	var div21, div2, div0, h20, t1, h40, t3, p0, t4, br0, t5, br1, t6, t7, div1, t8, div5, div3, t9, div4, h21, t11, h41, t13, p1, t15, div8, div6, h22, t17, h42, t19, p2, t21, div7, t22, div11, div9, t23, div10, h23, t25, h43, t27, p3, t29, div14, div12, h24, t31, h44, t33, p4, t35, p5, t37, div13, t38, div17, div15, t39, div16, h25, t41, h45, t43, p6, t45, div20, div18, h26, t47, h46, t49, p7, t51, div19;

    	return {
    		c: function create() {
    			div21 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			h20 = element("h2");
    			h20.textContent = "James Zaki";
    			t1 = space();
    			h40 = element("h4");
    			h40.textContent = "Blockchain/IoT Engineer and Consultant";
    			t3 = space();
    			p0 = element("p");
    			t4 = text("With 15 years experience in engineering and software development, James has worked in a variety of domains from industrial/home automation to local tech companies and start-ups.");
    			br0 = element("br");
    			t5 = text("\n        The last 7 years have covered development, product management, and tech advisor roles, both locally and abroad.");
    			br1 = element("br");
    			t6 = text("\n        As organiser of the OzBerry IoT MeetUp and smart-contract developer/auditor, James is exploring applications using IoT and Blockchain technologies that can positively impact society.");
    			t7 = space();
    			div1 = element("div");
    			t8 = space();
    			div5 = element("div");
    			div3 = element("div");
    			t9 = space();
    			div4 = element("div");
    			h21 = element("h2");
    			h21.textContent = "Ellie Rennie";
    			t11 = space();
    			h41 = element("h4");
    			h41.textContent = "Associate Professor, RMIT Blockchain Innovation Hub";
    			t13 = space();
    			p1 = element("p");
    			p1.textContent = "Ellie Rennie’s research spans internet studies, public policy, and political theory. In recent years she has been conducting qualitative   research to better understand how social norms influence internet adoption and use. She has an ongoing interest in civil society,         distributed governance systems, and social innovation.";
    			t15 = space();
    			div8 = element("div");
    			div6 = element("div");
    			h22 = element("h2");
    			h22.textContent = "Bok Khoo";
    			t17 = space();
    			h42 = element("h4");
    			h42.textContent = "Decentralised Future Fund";
    			t19 = space();
    			p2 = element("p");
    			p2.textContent = "Bok Khoo, or BokkyPooBah, is an actuary and software developer working in the Ethereum ecosystem. He is one of the early and top contributors to Ethereum.StackExchange.com. He assisted in the reconciliation of refunds to the original token holders in the pioneer decentralised autonomous organisation, The DAO. He has conducted 39 public Ethereum smart contract audits, and built the early and primitive decentralised exchange CryptoDerivatives.Market in Nov 2016. He helped establish the Decentralised Future Fund DAO that funded the representation of 10 Australian Ethereum community members at conferences worldwide in 2018. He has also released some very nice open source Ethereum smart contract libraries like the Gas-Efficient Solidity DateTime Library and BokkyPooBah’s Red-Black Binary Search Tree Library.";
    			t21 = space();
    			div7 = element("div");
    			t22 = space();
    			div11 = element("div");
    			div9 = element("div");
    			t23 = space();
    			div10 = element("div");
    			h23 = element("h2");
    			h23.textContent = "Thomas Nash";
    			t25 = space();
    			h43 = element("h4");
    			h43.textContent = "CTO & Co-Founder, Flex Dapps";
    			t27 = space();
    			p3 = element("p");
    			p3.textContent = "A Software Engineer for 5 years and Co-founder of Flex Dapps, Tom has been working with the Ethereum blockchain since 2016. He has a deep interest in everything decentralised and has run countless beginner and intermediate level workshops over the last 18 months. If you ask around for technical blockchain experts in Australia, Tom’s name is one that will pop up time and time again.";
    			t29 = space();
    			div14 = element("div");
    			div12 = element("div");
    			h24 = element("h2");
    			h24.textContent = "Bonnie Yiu";
    			t31 = space();
    			h44 = element("h4");
    			h44.textContent = "Co-Founder, Consulere";
    			t33 = space();
    			p4 = element("p");
    			p4.textContent = "Bonnie Yiu is co-founder of Consulere.io, a blockchain, IoT and AI consulting company. Bonnie regularly publishes and presents on blockchain-related matters, and recently appeared as a speaker at the World Economic Forum (WEF) in Davos, Switzerland in January 2019. Bonnie is also a Founding Governing Member of the Decentralised Future Fund.";
    			t35 = space();
    			p5 = element("p");
    			p5.textContent = "Prior to that Bonnie was an Associate at international law firms in Sydney and Silicon Valley, specialising in Financial Services and Venture Capital laws.";
    			t37 = space();
    			div13 = element("div");
    			t38 = space();
    			div17 = element("div");
    			div15 = element("div");
    			t39 = space();
    			div16 = element("div");
    			h25 = element("h2");
    			h25.textContent = "James Eddington";
    			t41 = space();
    			h45 = element("h4");
    			h45.textContent = "Classified";
    			t43 = space();
    			p6 = element("p");
    			p6.textContent = "James is a web3 technology and privacy enthusiast, with specific expertise in cryptocurrency custodianship and the decentralised finance industry. Having worked in traditional financial services and with Melbourne based blockchain venture studio Typehuman, James now pursues his own interests in Web3.";
    			t45 = space();
    			div20 = element("div");
    			div18 = element("div");
    			h26 = element("h2");
    			h26.textContent = "Alexander Ramsey";
    			t47 = space();
    			h46 = element("h4");
    			h46.textContent = "CEO & Co-Founder, Flex Dapps";
    			t49 = space();
    			p7 = element("p");
    			p7.textContent = "Alexander is a serial company founder and community builder who has worked in emerging industries including game development, esports, 3D systems and immersive media, with experience that encompasses commercial operations, programming, design and community engagement. Alex is currently the CEO and Co-founder of Flex Dapps, an Australian software development company specialising in decentralised applications. He is also a community organiser of Web3 Melbourne, a grassroots technology-agnostic developer community.";
    			t51 = space();
    			div19 = element("div");
    			add_location(h20, file$2, 26, 6, 517);
    			add_location(h40, file$2, 27, 6, 543);
    			add_location(br0, file$2, 29, 185, 786);
    			add_location(br1, file$2, 30, 119, 910);
    			add_location(p0, file$2, 28, 6, 597);
    			attr(div0, "class", "text");
    			add_location(div0, file$2, 25, 4, 492);
    			attr(div1, "class", "picture svelte-aoxikw");
    			add_location(div1, file$2, 34, 4, 1132);
    			attr(div2, "class", "profile-right");
    			set_style(div2, "grid-template-columns", "auto 36%");
    			add_location(div2, file$2, 24, 2, 421);
    			attr(div3, "class", "picture svelte-aoxikw");
    			add_location(div3, file$2, 40, 4, 1296);
    			add_location(h21, file$2, 44, 6, 1412);
    			add_location(h41, file$2, 45, 6, 1440);
    			add_location(p1, file$2, 46, 6, 1507);
    			attr(div4, "class", "text");
    			add_location(div4, file$2, 43, 4, 1387);
    			attr(div5, "class", "profile-left");
    			set_style(div5, "grid-template-columns", "36% auto");
    			add_location(div5, file$2, 39, 2, 1226);
    			add_location(h22, file$2, 54, 6, 1981);
    			add_location(h42, file$2, 55, 6, 2005);
    			add_location(p2, file$2, 56, 6, 2046);
    			attr(div6, "class", "text");
    			add_location(div6, file$2, 53, 4, 1956);
    			attr(div7, "class", "picture svelte-aoxikw");
    			add_location(div7, file$2, 60, 4, 2899);
    			attr(div8, "class", "profile-right");
    			set_style(div8, "grid-template-columns", "36% auto");
    			add_location(div8, file$2, 52, 2, 1885);
    			attr(div9, "class", "picture svelte-aoxikw");
    			add_location(div9, file$2, 66, 4, 3068);
    			add_location(h23, file$2, 70, 6, 3184);
    			add_location(h43, file$2, 71, 6, 3211);
    			add_location(p3, file$2, 72, 6, 3255);
    			attr(div10, "class", "text");
    			add_location(div10, file$2, 69, 4, 3159);
    			attr(div11, "class", "profile-left");
    			set_style(div11, "grid-template-columns", "auto 36%");
    			add_location(div11, file$2, 65, 2, 2998);
    			add_location(h24, file$2, 80, 6, 3782);
    			add_location(h44, file$2, 81, 6, 3808);
    			add_location(p4, file$2, 82, 6, 3845);
    			add_location(p5, file$2, 85, 6, 4218);
    			attr(div12, "class", "text");
    			add_location(div12, file$2, 79, 4, 3757);
    			attr(div13, "class", "picture svelte-aoxikw");
    			add_location(div13, file$2, 89, 4, 4412);
    			attr(div14, "class", "profile-right");
    			set_style(div14, "grid-template-columns", "36% auto");
    			add_location(div14, file$2, 78, 2, 3686);
    			attr(div15, "class", "picture svelte-aoxikw");
    			add_location(div15, file$2, 95, 4, 4581);
    			add_location(h25, file$2, 99, 6, 4697);
    			add_location(h45, file$2, 100, 6, 4728);
    			add_location(p6, file$2, 101, 6, 4754);
    			attr(div16, "class", "text");
    			add_location(div16, file$2, 98, 4, 4672);
    			attr(div17, "class", "profile-left");
    			set_style(div17, "grid-template-columns", "auto 36%");
    			add_location(div17, file$2, 94, 2, 4511);
    			add_location(h26, file$2, 109, 6, 5198);
    			add_location(h46, file$2, 110, 6, 5230);
    			add_location(p7, file$2, 111, 6, 5274);
    			attr(div18, "class", "text");
    			add_location(div18, file$2, 108, 4, 5173);
    			attr(div19, "class", "picture svelte-aoxikw");
    			add_location(div19, file$2, 115, 4, 5830);
    			attr(div20, "class", "profile-right");
    			set_style(div20, "grid-template-columns", "36% auto");
    			add_location(div20, file$2, 107, 2, 5102);
    			attr(div21, "class", "grid svelte-aoxikw");
    			add_location(div21, file$2, 23, 0, 400);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div21, anchor);
    			append(div21, div2);
    			append(div2, div0);
    			append(div0, h20);
    			append(div0, t1);
    			append(div0, h40);
    			append(div0, t3);
    			append(div0, p0);
    			append(p0, t4);
    			append(p0, br0);
    			append(p0, t5);
    			append(p0, br1);
    			append(p0, t6);
    			append(div2, t7);
    			append(div2, div1);
    			append(div21, t8);
    			append(div21, div5);
    			append(div5, div3);
    			append(div5, t9);
    			append(div5, div4);
    			append(div4, h21);
    			append(div4, t11);
    			append(div4, h41);
    			append(div4, t13);
    			append(div4, p1);
    			append(div21, t15);
    			append(div21, div8);
    			append(div8, div6);
    			append(div6, h22);
    			append(div6, t17);
    			append(div6, h42);
    			append(div6, t19);
    			append(div6, p2);
    			append(div8, t21);
    			append(div8, div7);
    			append(div21, t22);
    			append(div21, div11);
    			append(div11, div9);
    			append(div11, t23);
    			append(div11, div10);
    			append(div10, h23);
    			append(div10, t25);
    			append(div10, h43);
    			append(div10, t27);
    			append(div10, p3);
    			append(div21, t29);
    			append(div21, div14);
    			append(div14, div12);
    			append(div12, h24);
    			append(div12, t31);
    			append(div12, h44);
    			append(div12, t33);
    			append(div12, p4);
    			append(div12, t35);
    			append(div12, p5);
    			append(div14, t37);
    			append(div14, div13);
    			append(div21, t38);
    			append(div21, div17);
    			append(div17, div15);
    			append(div17, t39);
    			append(div17, div16);
    			append(div16, h25);
    			append(div16, t41);
    			append(div16, h45);
    			append(div16, t43);
    			append(div16, p6);
    			append(div21, t45);
    			append(div21, div20);
    			append(div20, div18);
    			append(div18, h26);
    			append(div18, t47);
    			append(div18, h46);
    			append(div18, t49);
    			append(div18, p7);
    			append(div20, t51);
    			append(div20, div19);
    		},

    		p: noop,
    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div21);
    			}
    		}
    	};
    }

    class ProfileGrid extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$4, safe_not_equal, []);
    	}
    }

    /* src/routes/Humans.svelte generated by Svelte v3.7.1 */

    const file$3 = "src/routes/Humans.svelte";

    function create_fragment$5(ctx) {
    	var div, h1, t_1, p0, p1, current;

    	var profilegrid = new ProfileGrid({ $$inline: true });

    	return {
    		c: function create() {
    			div = element("div");
    			h1 = element("h1");
    			h1.textContent = "Committee of Management";
    			t_1 = space();
    			p0 = element("p");
    			p0.textContent = "The Web3 Australia’s committee of management totals 7 humans and includes academics, entrepreneurs, technologists and software developers.";
    			p1 = element("p");
    			profilegrid.$$.fragment.c();
    			attr(h1, "class", "svelte-nen51u");
    			add_location(h1, file$3, 35, 2, 591);
    			add_location(p0, file$3, 36, 2, 626);
    			add_location(p1, file$3, 36, 143, 767);
    			attr(div, "class", "container svelte-nen51u");
    			add_location(div, file$3, 34, 0, 565);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			append(div, h1);
    			append(div, t_1);
    			append(div, p0);
    			append(div, p1);
    			mount_component(profilegrid, p1, null);
    			current = true;
    		},

    		p: noop,

    		i: function intro(local) {
    			if (current) return;
    			transition_in(profilegrid.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(profilegrid.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			destroy_component(profilegrid);
    		}
    	};
    }

    class Humans extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$5, safe_not_equal, []);
    	}
    }

    /* src/App.svelte generated by Svelte v3.7.1 */

    function create_fragment$6(ctx) {
    	var t, current;

    	var navbar = new NavBar({ $$inline: true });

    	var router = new Router({
    		props: { routes: ctx.routes },
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			navbar.$$.fragment.c();
    			t = space();
    			router.$$.fragment.c();
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			mount_component(navbar, target, anchor);
    			insert(target, t, anchor);
    			mount_component(router, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var router_changes = {};
    			if (changed.routes) router_changes.routes = ctx.routes;
    			router.$set(router_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(navbar.$$.fragment, local);

    			transition_in(router.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(navbar.$$.fragment, local);
    			transition_out(router.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(navbar, detaching);

    			if (detaching) {
    				detach(t);
    			}

    			destroy_component(router, detaching);
    		}
    	};
    }

    function instance$2($$self) {
    	

    	const routes = {
        '/': Home,
     
        '/board': Humans, 
    };

    	return { routes };
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$6, safe_not_equal, []);
    	}
    }

    const app = new App({
    	target: document.body,
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
