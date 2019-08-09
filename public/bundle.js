
(function(l, i, v, e) { v = l.createElement(i); v.async = 1; v.src = '//' + (location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; e = l.getElementsByTagName(i)[0]; e.parentNode.insertBefore(v, e)})(document, 'script');
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
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
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
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

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
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

    /* src/Footer.svelte generated by Svelte v3.7.1 */

    const file$1 = "src/Footer.svelte";

    function create_fragment$2(ctx) {
    	var div2, div1, div0, h3, t1, p, t3, a;

    	return {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			h3 = element("h3");
    			h3.textContent = "Contact Us";
    			t1 = space();
    			p = element("p");
    			p.textContent = "Send us a message";
    			t3 = space();
    			a = element("a");
    			a.textContent = "hello@web3australia.org";
    			add_location(h3, file$1, 30, 8, 525);
    			attr(p, "class", "text-right svelte-1qhewud");
    			add_location(p, file$1, 31, 8, 553);
    			attr(a, "href", "mailto:hello@web3australia.com");
    			add_location(a, file$1, 34, 8, 625);
    			add_location(div0, file$1, 29, 6, 511);
    			attr(div1, "class", "container svelte-1qhewud");
    			add_location(div1, file$1, 28, 4, 481);
    			attr(div2, "class", "foot-nav svelte-1qhewud");
    			add_location(div2, file$1, 27, 0, 454);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div2, anchor);
    			append(div2, div1);
    			append(div1, div0);
    			append(div0, h3);
    			append(div0, t1);
    			append(div0, p);
    			append(div0, t3);
    			append(div0, a);
    		},

    		p: noop,
    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div2);
    			}
    		}
    	};
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$2, safe_not_equal, []);
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

    function createCommonjsModule(fn, module) {
    	return module = { exports: {} }, fn(module, module.exports), module.exports;
    }

    /**
     * Helpers.
     */

    var s = 1000;
    var m = s * 60;
    var h = m * 60;
    var d = h * 24;
    var y = d * 365.25;

    /**
     * Parse or format the given `val`.
     *
     * Options:
     *
     *  - `long` verbose formatting [false]
     *
     * @param {String|Number} val
     * @param {Object} [options]
     * @throws {Error} throw an error if val is not a non-empty string or a number
     * @return {String|Number}
     * @api public
     */

    var ms = function(val, options) {
      options = options || {};
      var type = typeof val;
      if (type === 'string' && val.length > 0) {
        return parse(val);
      } else if (type === 'number' && isNaN(val) === false) {
        return options.long ? fmtLong(val) : fmtShort(val);
      }
      throw new Error(
        'val is not a non-empty string or a valid number. val=' +
          JSON.stringify(val)
      );
    };

    /**
     * Parse the given `str` and return milliseconds.
     *
     * @param {String} str
     * @return {Number}
     * @api private
     */

    function parse(str) {
      str = String(str);
      if (str.length > 100) {
        return;
      }
      var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(
        str
      );
      if (!match) {
        return;
      }
      var n = parseFloat(match[1]);
      var type = (match[2] || 'ms').toLowerCase();
      switch (type) {
        case 'years':
        case 'year':
        case 'yrs':
        case 'yr':
        case 'y':
          return n * y;
        case 'days':
        case 'day':
        case 'd':
          return n * d;
        case 'hours':
        case 'hour':
        case 'hrs':
        case 'hr':
        case 'h':
          return n * h;
        case 'minutes':
        case 'minute':
        case 'mins':
        case 'min':
        case 'm':
          return n * m;
        case 'seconds':
        case 'second':
        case 'secs':
        case 'sec':
        case 's':
          return n * s;
        case 'milliseconds':
        case 'millisecond':
        case 'msecs':
        case 'msec':
        case 'ms':
          return n;
        default:
          return undefined;
      }
    }

    /**
     * Short format for `ms`.
     *
     * @param {Number} ms
     * @return {String}
     * @api private
     */

    function fmtShort(ms) {
      if (ms >= d) {
        return Math.round(ms / d) + 'd';
      }
      if (ms >= h) {
        return Math.round(ms / h) + 'h';
      }
      if (ms >= m) {
        return Math.round(ms / m) + 'm';
      }
      if (ms >= s) {
        return Math.round(ms / s) + 's';
      }
      return ms + 'ms';
    }

    /**
     * Long format for `ms`.
     *
     * @param {Number} ms
     * @return {String}
     * @api private
     */

    function fmtLong(ms) {
      return plural(ms, d, 'day') ||
        plural(ms, h, 'hour') ||
        plural(ms, m, 'minute') ||
        plural(ms, s, 'second') ||
        ms + ' ms';
    }

    /**
     * Pluralization helper.
     */

    function plural(ms, n, name) {
      if (ms < n) {
        return;
      }
      if (ms < n * 1.5) {
        return Math.floor(ms / n) + ' ' + name;
      }
      return Math.ceil(ms / n) + ' ' + name + 's';
    }

    var debug = createCommonjsModule(function (module, exports) {
    /**
     * This is the common logic for both the Node.js and web browser
     * implementations of `debug()`.
     *
     * Expose `debug()` as the module.
     */

    exports = module.exports = createDebug.debug = createDebug['default'] = createDebug;
    exports.coerce = coerce;
    exports.disable = disable;
    exports.enable = enable;
    exports.enabled = enabled;
    exports.humanize = ms;

    /**
     * The currently active debug mode names, and names to skip.
     */

    exports.names = [];
    exports.skips = [];

    /**
     * Map of special "%n" handling functions, for the debug "format" argument.
     *
     * Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
     */

    exports.formatters = {};

    /**
     * Previous log timestamp.
     */

    var prevTime;

    /**
     * Select a color.
     * @param {String} namespace
     * @return {Number}
     * @api private
     */

    function selectColor(namespace) {
      var hash = 0, i;

      for (i in namespace) {
        hash  = ((hash << 5) - hash) + namespace.charCodeAt(i);
        hash |= 0; // Convert to 32bit integer
      }

      return exports.colors[Math.abs(hash) % exports.colors.length];
    }

    /**
     * Create a debugger with the given `namespace`.
     *
     * @param {String} namespace
     * @return {Function}
     * @api public
     */

    function createDebug(namespace) {

      function debug() {
        // disabled?
        if (!debug.enabled) return;

        var self = debug;

        // set `diff` timestamp
        var curr = +new Date();
        var ms = curr - (prevTime || curr);
        self.diff = ms;
        self.prev = prevTime;
        self.curr = curr;
        prevTime = curr;

        // turn the `arguments` into a proper Array
        var args = new Array(arguments.length);
        for (var i = 0; i < args.length; i++) {
          args[i] = arguments[i];
        }

        args[0] = exports.coerce(args[0]);

        if ('string' !== typeof args[0]) {
          // anything else let's inspect with %O
          args.unshift('%O');
        }

        // apply any `formatters` transformations
        var index = 0;
        args[0] = args[0].replace(/%([a-zA-Z%])/g, function(match, format) {
          // if we encounter an escaped % then don't increase the array index
          if (match === '%%') return match;
          index++;
          var formatter = exports.formatters[format];
          if ('function' === typeof formatter) {
            var val = args[index];
            match = formatter.call(self, val);

            // now we need to remove `args[index]` since it's inlined in the `format`
            args.splice(index, 1);
            index--;
          }
          return match;
        });

        // apply env-specific formatting (colors, etc.)
        exports.formatArgs.call(self, args);

        var logFn = debug.log || exports.log || console.log.bind(console);
        logFn.apply(self, args);
      }

      debug.namespace = namespace;
      debug.enabled = exports.enabled(namespace);
      debug.useColors = exports.useColors();
      debug.color = selectColor(namespace);

      // env-specific initialization logic for debug instances
      if ('function' === typeof exports.init) {
        exports.init(debug);
      }

      return debug;
    }

    /**
     * Enables a debug mode by namespaces. This can include modes
     * separated by a colon and wildcards.
     *
     * @param {String} namespaces
     * @api public
     */

    function enable(namespaces) {
      exports.save(namespaces);

      exports.names = [];
      exports.skips = [];

      var split = (typeof namespaces === 'string' ? namespaces : '').split(/[\s,]+/);
      var len = split.length;

      for (var i = 0; i < len; i++) {
        if (!split[i]) continue; // ignore empty strings
        namespaces = split[i].replace(/\*/g, '.*?');
        if (namespaces[0] === '-') {
          exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
        } else {
          exports.names.push(new RegExp('^' + namespaces + '$'));
        }
      }
    }

    /**
     * Disable debug output.
     *
     * @api public
     */

    function disable() {
      exports.enable('');
    }

    /**
     * Returns true if the given mode name is enabled, false otherwise.
     *
     * @param {String} name
     * @return {Boolean}
     * @api public
     */

    function enabled(name) {
      var i, len;
      for (i = 0, len = exports.skips.length; i < len; i++) {
        if (exports.skips[i].test(name)) {
          return false;
        }
      }
      for (i = 0, len = exports.names.length; i < len; i++) {
        if (exports.names[i].test(name)) {
          return true;
        }
      }
      return false;
    }

    /**
     * Coerce `val`.
     *
     * @param {Mixed} val
     * @return {Mixed}
     * @api private
     */

    function coerce(val) {
      if (val instanceof Error) return val.stack || val.message;
      return val;
    }
    });
    var debug_1 = debug.coerce;
    var debug_2 = debug.disable;
    var debug_3 = debug.enable;
    var debug_4 = debug.enabled;
    var debug_5 = debug.humanize;
    var debug_6 = debug.names;
    var debug_7 = debug.skips;
    var debug_8 = debug.formatters;

    var browser = createCommonjsModule(function (module, exports) {
    /**
     * This is the web browser implementation of `debug()`.
     *
     * Expose `debug()` as the module.
     */

    exports = module.exports = debug;
    exports.log = log;
    exports.formatArgs = formatArgs;
    exports.save = save;
    exports.load = load;
    exports.useColors = useColors;
    exports.storage = 'undefined' != typeof chrome
                   && 'undefined' != typeof chrome.storage
                      ? chrome.storage.local
                      : localstorage();

    /**
     * Colors.
     */

    exports.colors = [
      'lightseagreen',
      'forestgreen',
      'goldenrod',
      'dodgerblue',
      'darkorchid',
      'crimson'
    ];

    /**
     * Currently only WebKit-based Web Inspectors, Firefox >= v31,
     * and the Firebug extension (any Firefox version) are known
     * to support "%c" CSS customizations.
     *
     * TODO: add a `localStorage` variable to explicitly enable/disable colors
     */

    function useColors() {
      // NB: In an Electron preload script, document will be defined but not fully
      // initialized. Since we know we're in Chrome, we'll just detect this case
      // explicitly
      if (typeof window !== 'undefined' && window.process && window.process.type === 'renderer') {
        return true;
      }

      // is webkit? http://stackoverflow.com/a/16459606/376773
      // document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
      return (typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance) ||
        // is firebug? http://stackoverflow.com/a/398120/376773
        (typeof window !== 'undefined' && window.console && (window.console.firebug || (window.console.exception && window.console.table))) ||
        // is firefox >= v31?
        // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
        (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31) ||
        // double check webkit in userAgent just in case we are in a worker
        (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/));
    }

    /**
     * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
     */

    exports.formatters.j = function(v) {
      try {
        return JSON.stringify(v);
      } catch (err) {
        return '[UnexpectedJSONParseError]: ' + err.message;
      }
    };


    /**
     * Colorize log arguments if enabled.
     *
     * @api public
     */

    function formatArgs(args) {
      var useColors = this.useColors;

      args[0] = (useColors ? '%c' : '')
        + this.namespace
        + (useColors ? ' %c' : ' ')
        + args[0]
        + (useColors ? '%c ' : ' ')
        + '+' + exports.humanize(this.diff);

      if (!useColors) return;

      var c = 'color: ' + this.color;
      args.splice(1, 0, c, 'color: inherit');

      // the final "%c" is somewhat tricky, because there could be other
      // arguments passed either before or after the %c, so we need to
      // figure out the correct index to insert the CSS into
      var index = 0;
      var lastC = 0;
      args[0].replace(/%[a-zA-Z%]/g, function(match) {
        if ('%%' === match) return;
        index++;
        if ('%c' === match) {
          // we only are interested in the *last* %c
          // (the user may have provided their own)
          lastC = index;
        }
      });

      args.splice(lastC, 0, c);
    }

    /**
     * Invokes `console.log()` when available.
     * No-op when `console.log` is not a "function".
     *
     * @api public
     */

    function log() {
      // this hackery is required for IE8/9, where
      // the `console.log` function doesn't have 'apply'
      return 'object' === typeof console
        && console.log
        && Function.prototype.apply.call(console.log, console, arguments);
    }

    /**
     * Save `namespaces`.
     *
     * @param {String} namespaces
     * @api private
     */

    function save(namespaces) {
      try {
        if (null == namespaces) {
          exports.storage.removeItem('debug');
        } else {
          exports.storage.debug = namespaces;
        }
      } catch(e) {}
    }

    /**
     * Load `namespaces`.
     *
     * @return {String} returns the previously persisted debug modes
     * @api private
     */

    function load() {
      var r;
      try {
        r = exports.storage.debug;
      } catch(e) {}

      // If debug isn't set in LS, and we're in Electron, try to load $DEBUG
      if (!r && typeof process !== 'undefined' && 'env' in process) {
        r = process.env.DEBUG;
      }

      return r;
    }

    /**
     * Enable namespaces listed in `localStorage.debug` initially.
     */

    exports.enable(load());

    /**
     * Localstorage attempts to return the localstorage.
     *
     * This is necessary because safari throws
     * when a user disables cookies/localstorage
     * and you attempt to access it.
     *
     * @return {LocalStorage}
     * @api private
     */

    function localstorage() {
      try {
        return window.localStorage;
      } catch (e) {}
    }
    });
    var browser_1 = browser.log;
    var browser_2 = browser.formatArgs;
    var browser_3 = browser.save;
    var browser_4 = browser.load;
    var browser_5 = browser.useColors;
    var browser_6 = browser.storage;
    var browser_7 = browser.colors;

    /**
     * Module dependencies
     */

    var debug$1 = browser('jsonp');

    /**
     * Module exports.
     */

    var jsonp_1 = jsonp;

    /**
     * Callback index.
     */

    var count = 0;

    /**
     * Noop function.
     */

    function noop$1(){}

    /**
     * JSONP handler
     *
     * Options:
     *  - param {String} qs parameter (`callback`)
     *  - prefix {String} qs parameter (`__jp`)
     *  - name {String} qs parameter (`prefix` + incr)
     *  - timeout {Number} how long after a timeout error is emitted (`60000`)
     *
     * @param {String} url
     * @param {Object|Function} optional options / callback
     * @param {Function} optional callback
     */

    function jsonp(url, opts, fn){
      if ('function' == typeof opts) {
        fn = opts;
        opts = {};
      }
      if (!opts) opts = {};

      var prefix = opts.prefix || '__jp';

      // use the callback name that was passed if one was provided.
      // otherwise generate a unique name by incrementing our counter.
      var id = opts.name || (prefix + (count++));

      var param = opts.param || 'callback';
      var timeout = null != opts.timeout ? opts.timeout : 60000;
      var enc = encodeURIComponent;
      var target = document.getElementsByTagName('script')[0] || document.head;
      var script;
      var timer;


      if (timeout) {
        timer = setTimeout(function(){
          cleanup();
          if (fn) fn(new Error('Timeout'));
        }, timeout);
      }

      function cleanup(){
        if (script.parentNode) script.parentNode.removeChild(script);
        window[id] = noop$1;
        if (timer) clearTimeout(timer);
      }

      function cancel(){
        if (window[id]) {
          cleanup();
        }
      }

      window[id] = function(data){
        debug$1('jsonp got', data);
        cleanup();
        if (fn) fn(null, data);
      };

      // add qs component
      url += (~url.indexOf('?') ? '&' : '?') + param + '=' + enc(id);
      url = url.replace('?&', '?');

      debug$1('jsonp req "%s"', url);

      // create script
      script = document.createElement('script');
      script.src = url;
      target.parentNode.insertBefore(script, target);

      return cancel;
    }

    /* src/routes/EventCard.svelte generated by Svelte v3.7.1 */

    const file$2 = "src/routes/EventCard.svelte";

    function create_fragment$3(ctx) {
    	var div1, div0, h2, t1, p0, t3, h3, a, t4, t5, p1, t7, p2, t8, t9_value = ctx.venue.name, t9;

    	return {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			h2 = element("h2");
    			h2.textContent = "01";
    			t1 = space();
    			p0 = element("p");
    			p0.textContent = "January";
    			t3 = space();
    			h3 = element("h3");
    			a = element("a");
    			t4 = text(ctx.name);
    			t5 = space();
    			p1 = element("p");
    			p1.textContent = "18:00 - 21:00";
    			t7 = space();
    			p2 = element("p");
    			t8 = text("@ ");
    			t9 = text(t9_value);
    			attr(h2, "class", "day svelte-rh95e6");
    			add_location(h2, file$2, 28, 4, 457);
    			add_location(p0, file$2, 29, 4, 485);
    			attr(a, "href", ctx.link);
    			add_location(a, file$2, 30, 8, 509);
    			add_location(h3, file$2, 30, 4, 505);
    			add_location(p1, file$2, 31, 4, 544);
    			add_location(p2, file$2, 32, 4, 569);
    			add_location(div0, file$2, 27, 2, 447);
    			attr(div1, "class", "event-card svelte-rh95e6");
    			add_location(div1, file$2, 26, 0, 420);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div1, anchor);
    			append(div1, div0);
    			append(div0, h2);
    			append(div0, t1);
    			append(div0, p0);
    			append(div0, t3);
    			append(div0, h3);
    			append(h3, a);
    			append(a, t4);
    			append(div0, t5);
    			append(div0, p1);
    			append(div0, t7);
    			append(div0, p2);
    			append(p2, t8);
    			append(p2, t9);
    		},

    		p: function update(changed, ctx) {
    			if (changed.name) {
    				set_data(t4, ctx.name);
    			}

    			if (changed.link) {
    				attr(a, "href", ctx.link);
    			}

    			if ((changed.venue) && t9_value !== (t9_value = ctx.venue.name)) {
    				set_data(t9, t9_value);
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div1);
    			}
    		}
    	};
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { name, group, link, local_date, local_time, venue, how_to_find_us } = $$props;

    	const writable_props = ['name', 'group', 'link', 'local_date', 'local_time', 'venue', 'how_to_find_us'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<EventCard> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('name' in $$props) $$invalidate('name', name = $$props.name);
    		if ('group' in $$props) $$invalidate('group', group = $$props.group);
    		if ('link' in $$props) $$invalidate('link', link = $$props.link);
    		if ('local_date' in $$props) $$invalidate('local_date', local_date = $$props.local_date);
    		if ('local_time' in $$props) $$invalidate('local_time', local_time = $$props.local_time);
    		if ('venue' in $$props) $$invalidate('venue', venue = $$props.venue);
    		if ('how_to_find_us' in $$props) $$invalidate('how_to_find_us', how_to_find_us = $$props.how_to_find_us);
    	};

    	return {
    		name,
    		group,
    		link,
    		local_date,
    		local_time,
    		venue,
    		how_to_find_us
    	};
    }

    class EventCard extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$3, safe_not_equal, ["name", "group", "link", "local_date", "local_time", "venue", "how_to_find_us"]);

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.name === undefined && !('name' in props)) {
    			console.warn("<EventCard> was created without expected prop 'name'");
    		}
    		if (ctx.group === undefined && !('group' in props)) {
    			console.warn("<EventCard> was created without expected prop 'group'");
    		}
    		if (ctx.link === undefined && !('link' in props)) {
    			console.warn("<EventCard> was created without expected prop 'link'");
    		}
    		if (ctx.local_date === undefined && !('local_date' in props)) {
    			console.warn("<EventCard> was created without expected prop 'local_date'");
    		}
    		if (ctx.local_time === undefined && !('local_time' in props)) {
    			console.warn("<EventCard> was created without expected prop 'local_time'");
    		}
    		if (ctx.venue === undefined && !('venue' in props)) {
    			console.warn("<EventCard> was created without expected prop 'venue'");
    		}
    		if (ctx.how_to_find_us === undefined && !('how_to_find_us' in props)) {
    			console.warn("<EventCard> was created without expected prop 'how_to_find_us'");
    		}
    	}

    	get name() {
    		throw new Error("<EventCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<EventCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get group() {
    		throw new Error("<EventCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set group(value) {
    		throw new Error("<EventCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get link() {
    		throw new Error("<EventCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set link(value) {
    		throw new Error("<EventCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get local_date() {
    		throw new Error("<EventCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set local_date(value) {
    		throw new Error("<EventCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get local_time() {
    		throw new Error("<EventCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set local_time(value) {
    		throw new Error("<EventCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get venue() {
    		throw new Error("<EventCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set venue(value) {
    		throw new Error("<EventCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get how_to_find_us() {
    		throw new Error("<EventCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set how_to_find_us(value) {
    		throw new Error("<EventCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/routes/Meetups.svelte generated by Svelte v3.7.1 */

    const file$3 = "src/routes/Meetups.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.event = list[i];
    	return child_ctx;
    }

    // (90:0) {:else}
    function create_else_block(ctx) {
    	var div2, div1, h2, t_1, div0, current;

    	var each_value = ctx.events.data;

    	var each_blocks = [];

    	for (var i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	return {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			h2 = element("h2");
    			h2.textContent = "Upcoming Events";
    			t_1 = space();
    			div0 = element("div");

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}
    			add_location(h2, file$3, 92, 6, 2111);
    			attr(div0, "class", "flex-events svelte-du9ill");
    			add_location(div0, file$3, 93, 6, 2142);
    			attr(div1, "class", "flex-container svelte-du9ill");
    			add_location(div1, file$3, 91, 4, 2076);
    			attr(div2, "class", "container svelte-du9ill");
    			add_location(div2, file$3, 90, 2, 2048);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div2, anchor);
    			append(div2, div1);
    			append(div1, h2);
    			append(div1, t_1);
    			append(div1, div0);

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (changed.events) {
    				each_value = ctx.events.data;

    				for (var i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div0, null);
    					}
    				}

    				group_outros();
    				for (i = each_value.length; i < each_blocks.length; i += 1) out(i);
    				check_outros();
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			for (var i = 0; i < each_value.length; i += 1) transition_in(each_blocks[i]);

    			current = true;
    		},

    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);
    			for (let i = 0; i < each_blocks.length; i += 1) transition_out(each_blocks[i]);

    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div2);
    			}

    			destroy_each(each_blocks, detaching);
    		}
    	};
    }

    // (76:0) {#if !events.loaded}
    function create_if_block(ctx) {
    	var div3, div2, h2, t1, div0, h3, t3, div1, p0, t5, p1, t7, p2, dispose;

    	return {
    		c: function create() {
    			div3 = element("div");
    			div2 = element("div");
    			h2 = element("h2");
    			h2.textContent = "Upcoming Events";
    			t1 = space();
    			div0 = element("div");
    			h3 = element("h3");
    			h3.textContent = "Please select your City";
    			t3 = space();
    			div1 = element("div");
    			p0 = element("p");
    			p0.textContent = "Melbourne";
    			t5 = space();
    			p1 = element("p");
    			p1.textContent = "Sydney";
    			t7 = space();
    			p2 = element("p");
    			p2.textContent = "Brisbane";
    			add_location(h2, file$3, 78, 6, 1734);
    			add_location(h3, file$3, 80, 8, 1779);
    			add_location(div0, file$3, 79, 6, 1765);
    			add_location(p0, file$3, 83, 8, 1868);
    			add_location(p1, file$3, 84, 8, 1918);
    			add_location(p2, file$3, 85, 8, 1964);
    			attr(div1, "class", "selectLocation svelte-du9ill");
    			add_location(div1, file$3, 82, 6, 1831);
    			attr(div2, "class", "flex-container-location-select svelte-du9ill");
    			add_location(div2, file$3, 77, 4, 1683);
    			attr(div3, "class", "container svelte-du9ill");
    			add_location(div3, file$3, 76, 2, 1655);

    			dispose = [
    				listen(p0, "click", ctx.getMelbEvents),
    				listen(p1, "click", ctx.getSydEvents),
    				listen(p2, "click", ctx.getBrisEvents)
    			];
    		},

    		m: function mount(target, anchor) {
    			insert(target, div3, anchor);
    			append(div3, div2);
    			append(div2, h2);
    			append(div2, t1);
    			append(div2, div0);
    			append(div0, h3);
    			append(div2, t3);
    			append(div2, div1);
    			append(div1, p0);
    			append(div1, t5);
    			append(div1, p1);
    			append(div1, t7);
    			append(div1, p2);
    		},

    		p: noop,
    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div3);
    			}

    			run_all(dispose);
    		}
    	};
    }

    // (95:7) {#each events.data as event }
    function create_each_block(ctx) {
    	var current;

    	var eventcard_spread_levels = [
    		ctx.event
    	];

    	let eventcard_props = {};
    	for (var i = 0; i < eventcard_spread_levels.length; i += 1) {
    		eventcard_props = assign(eventcard_props, eventcard_spread_levels[i]);
    	}
    	var eventcard = new EventCard({ props: eventcard_props, $$inline: true });

    	return {
    		c: function create() {
    			eventcard.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(eventcard, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var eventcard_changes = changed.events ? get_spread_update(eventcard_spread_levels, [
    				ctx.event
    			]) : {};
    			eventcard.$set(eventcard_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(eventcard.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(eventcard.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(eventcard, detaching);
    		}
    	};
    }

    function create_fragment$4(ctx) {
    	var current_block_type_index, if_block, if_block_anchor, current;

    	var if_block_creators = [
    		create_if_block,
    		create_else_block
    	];

    	var if_blocks = [];

    	function select_block_type(ctx) {
    		if (!ctx.events.loaded) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	return {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);
    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(changed, ctx);
    			} else {
    				group_outros();
    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});
    				check_outros();

    				if_block = if_blocks[current_block_type_index];
    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}
    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);

    			if (detaching) {
    				detach(if_block_anchor);
    			}
    		}
    	};
    }

    function instance$2($$self, $$props, $$invalidate) {
    	

      let events = {
        loaded: false,
        data: null
      };

      const getMelbEvents = async () => {
        await jsonp_1('https://api.meetup.com/Ethereum-Melbourne/events?page=3&sig_id=225203890', null, (err, data) => {
          if (err) {
            console.error(err.message);
          } else {
            events.data = data.data; $$invalidate('events', events);
            events.loaded = true; $$invalidate('events', events);
            console.log('events.data:', events.data);
          }
        });
        
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
    		init(this, options, instance$2, create_fragment$4, safe_not_equal, []);
    	}
    }

    /* src/routes/LandingText.svelte generated by Svelte v3.7.1 */

    const file$4 = "src/routes/LandingText.svelte";

    function create_fragment$5(ctx) {
    	var div1, div0, h20, t1, p0, t3, p1, t5, p2, t7, h21, t9, p3;

    	return {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			h20 = element("h2");
    			h20.textContent = "Web3 Australia’s Goals";
    			t1 = space();
    			p0 = element("p");
    			p0.textContent = "Advance the development and safe implementation of Web3 and decentralised technologies.";
    			t3 = space();
    			p1 = element("p");
    			p1.textContent = "Provide community education on technologies that preserve data rights and data security.";
    			t5 = space();
    			p2 = element("p");
    			p2.textContent = "Promote the prevention of consumer data misuse, including mass surveillance and invasion of privacy by global technology companies and governments.";
    			t7 = space();
    			h21 = element("h2");
    			h21.textContent = "Our Events";
    			t9 = space();
    			p3 = element("p");
    			p3.textContent = "Our Meetups cover a variety of topics such as the technical details of various Web3 platforms (Ethereum/IPFS/Whisper), as well as more general topics such as \tdecentralised trust systems and the social/cultural implications of decentralised/distributed systems.";
    			attr(h20, "class", "svelte-133tvx2");
    			add_location(h20, file$4, 30, 4, 535);
    			add_location(p0, file$4, 31, 2, 569);
    			add_location(p1, file$4, 32, 2, 666);
    			add_location(p2, file$4, 33, 2, 764);
    			attr(h21, "class", "svelte-133tvx2");
    			add_location(h21, file$4, 34, 2, 921);
    			add_location(p3, file$4, 35, 2, 943);
    			attr(div0, "class", "container svelte-133tvx2");
    			add_location(div0, file$4, 29, 2, 507);
    			attr(div1, "class", "svelte-133tvx2");
    			add_location(div1, file$4, 28, 0, 499);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div1, anchor);
    			append(div1, div0);
    			append(div0, h20);
    			append(div0, t1);
    			append(div0, p0);
    			append(div0, t3);
    			append(div0, p1);
    			append(div0, t5);
    			append(div0, p2);
    			append(div0, t7);
    			append(div0, h21);
    			append(div0, t9);
    			append(div0, p3);
    		},

    		p: noop,
    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div1);
    			}
    		}
    	};
    }

    class LandingText extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$5, safe_not_equal, []);
    	}
    }

    /* src/routes/Logo.svelte generated by Svelte v3.7.1 */

    const file$5 = "src/routes/Logo.svelte";

    function create_fragment$6(ctx) {
    	var div2, div0, svg, defs, clipPath0, rect, clipPath1, path0, g27, g26, g4, g0, path1, g1, path2, g2, path3, g3, path4, g11, g5, path5, g6, path6, g7, path7, g8, path8, g9, path9, g10, path10, g25, g12, path11, g13, path12, g14, path13, g15, path14, g16, path15, g17, path16, g18, path17, g19, path18, g20, path19, g21, path20, g22, path21, g23, path22, g24, path23, t0, div1, h1, t1, br, t2;

    	return {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			svg = svg_element("svg");
    			defs = svg_element("defs");
    			clipPath0 = svg_element("clipPath");
    			rect = svg_element("rect");
    			clipPath1 = svg_element("clipPath");
    			path0 = svg_element("path");
    			g27 = svg_element("g");
    			g26 = svg_element("g");
    			g4 = svg_element("g");
    			g0 = svg_element("g");
    			path1 = svg_element("path");
    			g1 = svg_element("g");
    			path2 = svg_element("path");
    			g2 = svg_element("g");
    			path3 = svg_element("path");
    			g3 = svg_element("g");
    			path4 = svg_element("path");
    			g11 = svg_element("g");
    			g5 = svg_element("g");
    			path5 = svg_element("path");
    			g6 = svg_element("g");
    			path6 = svg_element("path");
    			g7 = svg_element("g");
    			path7 = svg_element("path");
    			g8 = svg_element("g");
    			path8 = svg_element("path");
    			g9 = svg_element("g");
    			path9 = svg_element("path");
    			g10 = svg_element("g");
    			path10 = svg_element("path");
    			g25 = svg_element("g");
    			g12 = svg_element("g");
    			path11 = svg_element("path");
    			g13 = svg_element("g");
    			path12 = svg_element("path");
    			g14 = svg_element("g");
    			path13 = svg_element("path");
    			g15 = svg_element("g");
    			path14 = svg_element("path");
    			g16 = svg_element("g");
    			path15 = svg_element("path");
    			g17 = svg_element("g");
    			path16 = svg_element("path");
    			g18 = svg_element("g");
    			path17 = svg_element("path");
    			g19 = svg_element("g");
    			path18 = svg_element("path");
    			g20 = svg_element("g");
    			path19 = svg_element("path");
    			g21 = svg_element("g");
    			path20 = svg_element("path");
    			g22 = svg_element("g");
    			path21 = svg_element("path");
    			g23 = svg_element("g");
    			path22 = svg_element("path");
    			g24 = svg_element("g");
    			path23 = svg_element("path");
    			t0 = space();
    			div1 = element("div");
    			h1 = element("h1");
    			t1 = text("WEB 3 ");
    			br = element("br");
    			t2 = text(" AUSTRALIA");
    			attr(rect, "width", "1920");
    			attr(rect, "height", "1080");
    			attr(rect, "x", "0");
    			attr(rect, "y", "0");
    			add_location(rect, file$5, 45, 251, 1038);
    			attr(clipPath0, "id", "animationMask_Obx7Q4Q9dW");
    			add_location(clipPath0, file$5, 45, 211, 998);
    			attr(path0, "d", "M0,0 L1920,0 L1920,1080 L0,1080z");
    			add_location(path0, file$5, 45, 341, 1128);
    			attr(clipPath1, "id", "cp_IjQ9np3D");
    			add_location(clipPath1, file$5, 45, 314, 1101);
    			add_location(defs, file$5, 45, 205, 992);
    			attr(path1, "stroke-linecap", "butt");
    			attr(path1, "stroke-linejoin", "miter");
    			attr(path1, "fill-opacity", "0");
    			attr(path1, "stroke-miterlimit", "10");
    			attr(path1, "stroke", "rgb(7,5,6)");
    			attr(path1, "stroke-opacity", "1");
    			attr(path1, "stroke-width", "1");
    			attr(path1, "d", " M-28.632999420166016,-278.1669921875 C-28.632999420166016,-278.1669921875 28.632999420166016,0 28.632999420166016,0 C28.632999420166016,0 -28.632999420166016,278.1669921875 -28.632999420166016,278.1669921875");
    			add_location(path1, file$5, 45, 800, 1587);
    			attr(g0, "opacity", "1");
    			attr(g0, "transform", "matrix(1,0,0,1,31.132999420166016,280.6669921875)");
    			add_location(g0, file$5, 45, 723, 1510);
    			attr(path2, "stroke-linecap", "butt");
    			attr(path2, "stroke-linejoin", "miter");
    			attr(path2, "fill-opacity", "0");
    			attr(path2, "stroke-miterlimit", "10");
    			attr(path2, "stroke", "rgb(7,5,6)");
    			attr(path2, "stroke-opacity", "1");
    			attr(path2, "stroke-width", "1");
    			attr(path2, "d", " M-20.812999725341797,-278.1669921875 C-20.812999725341797,-278.1669921875 20.812999725341797,1.0160000324249268 20.812999725341797,1.0160000324249268 C20.812999725341797,1.0160000324249268 -20.812999725341797,278.1669921875 -20.812999725341797,278.1669921875");
    			add_location(path2, file$5, 45, 1249, 2036);
    			attr(g1, "opacity", "1");
    			attr(g1, "transform", "matrix(1,0,0,1,23.312999725341797,280.6669921875)");
    			add_location(g1, file$5, 45, 1172, 1959);
    			attr(path3, "stroke-linecap", "butt");
    			attr(path3, "stroke-linejoin", "miter");
    			attr(path3, "fill-opacity", "0");
    			attr(path3, "stroke-miterlimit", "10");
    			attr(path3, "stroke", "rgb(7,5,6)");
    			attr(path3, "stroke-opacity", "1");
    			attr(path3, "stroke-width", "1");
    			attr(path3, "d", " M-12.993000030517578,-278.1669921875 C-12.993000030517578,-278.1669921875 12.993000030517578,2.0320000648498535 12.993000030517578,2.0320000648498535 C12.993000030517578,2.0320000648498535 -12.993000030517578,278.1669921875 -12.993000030517578,278.1669921875");
    			add_location(path3, file$5, 45, 1749, 2536);
    			attr(g2, "opacity", "1");
    			attr(g2, "transform", "matrix(1,0,0,1,15.493000030517578,280.6669921875)");
    			add_location(g2, file$5, 45, 1672, 2459);
    			attr(path4, "stroke-linecap", "butt");
    			attr(path4, "stroke-linejoin", "miter");
    			attr(path4, "fill-opacity", "0");
    			attr(path4, "stroke-miterlimit", "10");
    			attr(path4, "stroke", "rgb(7,5,6)");
    			attr(path4, "stroke-opacity", "1");
    			attr(path4, "stroke-width", "1");
    			attr(path4, "d", " M-5.172999858856201,-278.1669921875 C-5.172999858856201,-278.1669921875 5.172999858856201,3.0480000972747803 5.172999858856201,3.0480000972747803 C5.172999858856201,3.0480000972747803 -5.172999858856201,278.1669921875 -5.172999858856201,278.1669921875");
    			add_location(path4, file$5, 45, 2248, 3035);
    			attr(g3, "opacity", "1");
    			attr(g3, "transform", "matrix(1,0,0,1,7.672999858856201,280.6669921875)");
    			add_location(g3, file$5, 45, 2172, 2959);
    			attr(g4, "transform", "matrix(1,0,0,1,1192.762939453125,215.96099853515625)");
    			attr(g4, "opacity", "1");
    			set_style(g4, "display", "block");
    			add_location(g4, file$5, 45, 619, 1406);
    			attr(path5, "stroke-linecap", "butt");
    			attr(path5, "stroke-linejoin", "miter");
    			attr(path5, "fill-opacity", "0");
    			attr(path5, "stroke-miterlimit", "10");
    			attr(path5, "stroke", "rgb(7,5,6)");
    			attr(path5, "stroke-opacity", "1");
    			attr(path5, "stroke-width", "1");
    			attr(path5, "d", " M39.724998474121094,278.1669921875 C39.724998474121094,278.1669921875 -39.724998474121094,51.77899932861328 -39.724998474121094,51.77899932861328 C-39.724998474121094,51.77899932861328 39.349998474121094,-272.9169921875 39.349998474121094,-272.9169921875");
    			add_location(path5, file$5, 45, 2849, 3636);
    			attr(g5, "opacity", "1");
    			attr(g5, "transform", "matrix(1,0,0,1,42.224998474121094,280.6669921875)");
    			add_location(g5, file$5, 45, 2772, 3559);
    			attr(path6, "stroke-linecap", "butt");
    			attr(path6, "stroke-linejoin", "miter");
    			attr(path6, "fill-opacity", "0");
    			attr(path6, "stroke-miterlimit", "10");
    			attr(path6, "stroke", "rgb(7,5,6)");
    			attr(path6, "stroke-opacity", "1");
    			attr(path6, "stroke-width", "1");
    			attr(path6, "d", " M32.9010009765625,278.1669921875 C32.9010009765625,278.1669921875 -32.9010009765625,42.00299835205078 -32.9010009765625,42.00299835205078 C-32.9010009765625,42.00299835205078 32.6510009765625,-273.22900390625 32.6510009765625,-273.22900390625");
    			add_location(path6, file$5, 45, 3344, 4131);
    			attr(g6, "opacity", "1");
    			attr(g6, "transform", "matrix(1,0,0,1,49.04899978637695,280.6669921875)");
    			add_location(g6, file$5, 45, 3268, 4055);
    			attr(path7, "stroke-linecap", "butt");
    			attr(path7, "stroke-linejoin", "miter");
    			attr(path7, "fill-opacity", "0");
    			attr(path7, "stroke-miterlimit", "10");
    			attr(path7, "stroke", "rgb(7,5,6)");
    			attr(path7, "stroke-opacity", "1");
    			attr(path7, "stroke-width", "1");
    			attr(path7, "d", " M26.076000213623047,278.1669921875 C26.076000213623047,278.1669921875 -26.076000213623047,32.22700119018555 -26.076000213623047,32.22700119018555 C-26.076000213623047,32.22700119018555 25.888999938964844,-273.2919921875 25.888999938964844,-273.2919921875");
    			add_location(path7, file$5, 45, 3828, 4615);
    			attr(g7, "opacity", "1");
    			attr(g7, "transform", "matrix(1,0,0,1,55.874000549316406,280.6669921875)");
    			add_location(g7, file$5, 45, 3751, 4538);
    			attr(path8, "stroke-linecap", "butt");
    			attr(path8, "stroke-linejoin", "miter");
    			attr(path8, "fill-opacity", "0");
    			attr(path8, "stroke-miterlimit", "10");
    			attr(path8, "stroke", "rgb(7,5,6)");
    			attr(path8, "stroke-opacity", "1");
    			attr(path8, "stroke-width", "1");
    			attr(path8, "d", " M19.25200080871582,278.1669921875 C19.25200080871582,278.1669921875 -19.25200080871582,22.450000762939453 -19.25200080871582,22.450000762939453 C-19.25200080871582,22.450000762939453 19.00200080871582,-273.1669921875 19.00200080871582,-273.1669921875");
    			add_location(path8, file$5, 45, 4324, 5111);
    			attr(g8, "opacity", "1");
    			attr(g8, "transform", "matrix(1,0,0,1,62.698001861572266,280.6669921875)");
    			add_location(g8, file$5, 45, 4247, 5034);
    			attr(path9, "stroke-linecap", "butt");
    			attr(path9, "stroke-linejoin", "miter");
    			attr(path9, "fill-opacity", "0");
    			attr(path9, "stroke-miterlimit", "10");
    			attr(path9, "stroke", "rgb(7,5,6)");
    			attr(path9, "stroke-opacity", "1");
    			attr(path9, "stroke-width", "1");
    			attr(path9, "d", " M12.427000045776367,278.1669921875 C12.427000045776367,278.1669921875 -12.427000045776367,12.675000190734863 -12.427000045776367,12.675000190734863 C-12.427000045776367,12.675000190734863 11.802000045776367,-273.0419921875 11.802000045776367,-273.0419921875");
    			add_location(path9, file$5, 45, 4818, 5605);
    			attr(g9, "opacity", "1");
    			attr(g9, "transform", "matrix(1,0,0,1,69.75700378417969,280.7980041503906)");
    			add_location(g9, file$5, 45, 4739, 5526);
    			attr(path10, "stroke-linecap", "butt");
    			attr(path10, "stroke-linejoin", "miter");
    			attr(path10, "fill-opacity", "0");
    			attr(path10, "stroke-miterlimit", "10");
    			attr(path10, "stroke", "rgb(7,5,6)");
    			attr(path10, "stroke-opacity", "1");
    			attr(path10, "stroke-width", "1");
    			attr(path10, "d", " M5.603000164031982,278.1669921875 C5.603000164031982,278.1669921875 -5.603000164031982,2.8980000019073486 -5.603000164031982,2.8980000019073486 C-5.603000164031982,2.8980000019073486 5.103000164031982,-272.6669921875 5.103000164031982,-272.6669921875");
    			add_location(path10, file$5, 45, 5316, 6103);
    			attr(g10, "opacity", "1");
    			attr(g10, "transform", "matrix(1,0,0,1,76.34700012207031,280.6669921875)");
    			add_location(g10, file$5, 45, 5240, 6027);
    			attr(g11, "transform", "matrix(1,0,0,1,642.7630004882812,293.73699951171875)");
    			attr(g11, "opacity", "1");
    			set_style(g11, "display", "block");
    			add_location(g11, file$5, 45, 2668, 3455);
    			attr(path11, "stroke-linecap", "butt");
    			attr(path11, "stroke-linejoin", "miter");
    			attr(path11, "fill-opacity", "0");
    			attr(path11, "stroke-miterlimit", "10");
    			attr(path11, "stroke", "rgb(7,5,6)");
    			attr(path11, "stroke-opacity", "1");
    			attr(path11, "stroke-width", "1");
    			attr(path11, "d", " M-115.61499786376953,55.1150016784668 C-156.0279998779297,25.763999938964844 -191.5030059814453,0 -191.5030059814453,0 C-191.5030059814453,0 -191.5030059814453,0 -191.5030059814453,0 C-191.5030059814453,0 0,-139.08399963378906 0,-139.08399963378906 C0,-139.08399963378906 191.5030059814453,-278.1669921875 191.5030059814453,-278.1669921875 C191.5030059814453,-278.1669921875 191.5030059814453,0 191.5030059814453,0 C191.5030059814453,0 191.5030059814453,278.1669921875 191.5030059814453,278.1669921875 C191.5030059814453,278.1669921875 0,139.08299255371094 0,139.08299255371094 C0,139.08299255371094 -62.13199996948242,93.95800018310547 -115.61499786376953,55.1150016784668");
    			add_location(path11, file$5, 45, 5888, 6675);
    			attr(g12, "opacity", "1");
    			attr(g12, "transform", "matrix(1,0,0,1,282.8009948730469,280.6669921875)");
    			add_location(g12, file$5, 45, 5812, 6599);
    			attr(path12, "stroke-linecap", "butt");
    			attr(path12, "stroke-linejoin", "miter");
    			attr(path12, "fill-opacity", "0");
    			attr(path12, "stroke-miterlimit", "10");
    			attr(path12, "stroke", "rgb(7,5,6)");
    			attr(path12, "stroke-opacity", "1");
    			attr(path12, "stroke-width", "1");
    			attr(path12, "d", " M-82.0999984741211,-104.625 C-53.42599868774414,-116.56999969482422 0,-138.82699584960938 0,-138.82699584960938 C0,-138.82699584960938 0,-138.82699584960938 0,-138.82699584960938 C0,-138.82699584960938 180.0399932861328,-255.3280029296875 180.0399932861328,-255.3280029296875 C180.0399932861328,-255.3280029296875 191.5030059814453,0.25600001215934753 191.5030059814453,0.25600001215934753 C191.5030059814453,0.25600001215934753 182.02499389648438,255.32899475097656 182.02499389648438,255.32899475097656 C182.02499389648438,255.32899475097656 0,139.33900451660156 0,139.33900451660156 C0,139.33900451660156 -99.80500030517578,97.76200103759766 -99.80500030517578,97.76200103759766 C-99.80500030517578,97.76200103759766 -191.5030059814453,0.25600001215934753 -191.5030059814453,0.25600001215934753 C-191.5030059814453,0.25600001215934753 -99.80500030517578,-97.2490005493164 -99.80500030517578,-97.2490005493164 C-99.80500030517578,-97.2490005493164 -92.61799621582031,-100.24299621582031 -82.0999984741211,-104.625");
    			add_location(path12, file$5, 45, 6806, 7593);
    			attr(g13, "opacity", "1");
    			attr(g13, "transform", "matrix(1,0,0,1,272.93499755859375,289.4570007324219)");
    			add_location(g13, file$5, 45, 6726, 7513);
    			attr(path13, "stroke-linecap", "butt");
    			attr(path13, "stroke-linejoin", "miter");
    			attr(path13, "fill-opacity", "0");
    			attr(path13, "stroke-miterlimit", "10");
    			attr(path13, "stroke", "rgb(7,5,6)");
    			attr(path13, "stroke-opacity", "1");
    			attr(path13, "stroke-width", "1");
    			attr(path13, "d", " M-84.0459976196289,-123.87300109863281 C-51.10499954223633,-129.4969940185547 0.0010000000474974513,-138.2220001220703 0.0010000000474974513,-138.2220001220703 C0.0010000000474974513,-138.2220001220703 0.0010000000474974513,-138.2220001220703 0.0010000000474974513,-138.2220001220703 C0.0010000000474974513,-138.2220001220703 168.57899475097656,-232.13900756835938 168.57899475097656,-232.13900756835938 C168.57899475097656,-232.13900756835938 191.5030059814453,0.8610000014305115 191.5030059814453,0.8610000014305115 C191.5030059814453,0.8610000014305115 168.7480010986328,232.13999938964844 168.7480010986328,232.13999938964844 C168.7480010986328,232.13999938964844 0.0010000000474974513,139.94500732421875 0.0010000000474974513,139.94500732421875 C0.0010000000474974513,139.94500732421875 -111.26599884033203,120.94999694824219 -111.26599884033203,120.94999694824219 C-111.26599884033203,120.94999694824219 -191.5019989013672,0.8610000014305115 -191.5019989013672,0.8610000014305115 C-191.5019989013672,0.8610000014305115 -111.26599884033203,-119.22599792480469 -111.26599884033203,-119.22599792480469 C-111.26599884033203,-119.22599792480469 -99.70999908447266,-121.1989974975586 -84.0459976196289,-123.87300109863281");
    			add_location(path13, file$5, 45, 8065, 8852);
    			attr(g14, "opacity", "1");
    			attr(g14, "transform", "matrix(1,0,0,1,263.0679931640625,297.8970031738281)");
    			add_location(g14, file$5, 45, 7986, 8773);
    			attr(path14, "stroke-linecap", "butt");
    			attr(path14, "stroke-linejoin", "miter");
    			attr(path14, "fill-opacity", "0");
    			attr(path14, "stroke-miterlimit", "10");
    			attr(path14, "stroke", "rgb(7,5,6)");
    			attr(path14, "stroke-opacity", "1");
    			attr(path14, "stroke-width", "1");
    			attr(path14, "d", " M-83.1989974975586,-141.51499938964844 C-47.32400131225586,-140.4669952392578 -0.0010000000474974513,-139.08399963378906 -0.0010000000474974513,-139.08399963378906 C-0.0010000000474974513,-139.08399963378906 -0.0010000000474974513,-139.08399963378906 -0.0010000000474974513,-139.08399963378906 C-0.0010000000474974513,-139.08399963378906 157.11500549316406,-210.41799926757812 157.11500549316406,-210.41799926757812 C157.11500549316406,-210.41799926757812 191.5019989013672,-0.0010000000474974513 191.5019989013672,-0.0010000000474974513 C191.5019989013672,-0.0010000000474974513 157.11500549316406,210.41900634765625 157.11500549316406,210.41900634765625 C157.11500549316406,210.41900634765625 -0.0010000000474974513,139.08299255371094 -0.0010000000474974513,139.08299255371094 C-0.0010000000474974513,139.08299255371094 -122.7300033569336,142.67100524902344 -122.7300033569336,142.67100524902344 C-122.7300033569336,142.67100524902344 -191.5030059814453,-0.0010000000474974513 -191.5030059814453,-0.0010000000474974513 C-191.5030059814453,-0.0010000000474974513 -122.7300033569336,-142.6699981689453 -122.7300033569336,-142.6699981689453 C-122.7300033569336,-142.6699981689453 -105.09700012207031,-142.15499877929688 -83.1989974975586,-141.51499938964844");
    			add_location(path14, file$5, 45, 9531, 10318);
    			attr(g15, "opacity", "1");
    			attr(g15, "transform", "matrix(1,0,0,1,253.20199584960938,307.8059997558594)");
    			add_location(g15, file$5, 45, 9451, 10238);
    			attr(path15, "stroke-linecap", "butt");
    			attr(path15, "stroke-linejoin", "miter");
    			attr(path15, "fill-opacity", "0");
    			attr(path15, "stroke-miterlimit", "10");
    			attr(path15, "stroke", "rgb(7,5,6)");
    			attr(path15, "stroke-opacity", "1");
    			attr(path15, "stroke-width", "1");
    			attr(path15, "d", " M-80.6719970703125,-154.8159942626953 C-43.27299880981445,-147.5229949951172 -0.0010000000474974513,-139.08399963378906 -0.0010000000474974513,-139.08399963378906 C-0.0010000000474974513,-139.08399963378906 -0.0010000000474974513,-139.08399963378906 -0.0010000000474974513,-139.08399963378906 C-0.0010000000474974513,-139.08399963378906 145.65199279785156,-187.83700561523438 145.65199279785156,-187.83700561523438 C145.65199279785156,-187.83700561523438 191.5019989013672,-0.0010000000474974513 191.5019989013672,-0.0010000000474974513 C191.5019989013672,-0.0010000000474974513 145.65199279785156,187.83700561523438 145.65199279785156,187.83700561523438 C145.65199279785156,187.83700561523438 -0.0010000000474974513,139.08299255371094 -0.0010000000474974513,139.08299255371094 C-0.0010000000474974513,139.08299255371094 -134.19200134277344,165.25399780273438 -134.19200134277344,165.25399780273438 C-134.19200134277344,165.25399780273438 -191.5030059814453,-0.0010000000474974513 -191.5030059814453,-0.0010000000474974513 C-191.5030059814453,-0.0010000000474974513 -134.19200134277344,-165.2530059814453 -134.19200134277344,-165.2530059814453 C-134.19200134277344,-165.2530059814453 -109.13300323486328,-160.36599731445312 -80.6719970703125,-154.8159942626953");
    			add_location(path15, file$5, 45, 11033, 11820);
    			attr(g16, "opacity", "1");
    			attr(g16, "transform", "matrix(1,0,0,1,243.33599853515625,316.85198974609375)");
    			add_location(g16, file$5, 45, 10952, 11739);
    			attr(path16, "stroke-linecap", "butt");
    			attr(path16, "stroke-linejoin", "miter");
    			attr(path16, "fill-opacity", "0");
    			attr(path16, "stroke-miterlimit", "10");
    			attr(path16, "stroke", "rgb(7,5,6)");
    			attr(path16, "stroke-opacity", "1");
    			attr(path16, "stroke-width", "1");
    			attr(path16, "d", " M-77.94000244140625,-165.1719970703125 C-39.904998779296875,-152.4409942626953 0,-139.08399963378906 0,-139.08399963378906 C0,-139.08399963378906 0,-139.08399963378906 0,-139.08399963378906 C0,-139.08399963378906 134.1909942626953,-165.2530059814453 134.1909942626953,-165.2530059814453 C134.1909942626953,-165.2530059814453 191.5030059814453,-0.0010000000474974513 191.5030059814453,-0.0010000000474974513 C191.5030059814453,-0.0010000000474974513 134.1909942626953,165.25399780273438 134.1909942626953,165.25399780273438 C134.1909942626953,165.25399780273438 0,139.08299255371094 0,139.08299255371094 C0,139.08299255371094 -145.6540069580078,187.83700561523438 -145.6540069580078,187.83700561523438 C-145.6540069580078,187.83700561523438 -191.5030059814453,-0.0010000000474974513 -191.5030059814453,-0.0010000000474974513 C-191.5030059814453,-0.0010000000474974513 -145.6540069580078,-187.83700561523438 -145.6540069580078,-187.83700561523438 C-145.6540069580078,-187.83700561523438 -112.5719985961914,-176.76400756835938 -77.94000244140625,-165.1719970703125");
    			add_location(path16, file$5, 45, 12537, 13324);
    			attr(g17, "opacity", "1");
    			attr(g17, "transform", "matrix(1,0,0,1,233.468994140625,325.89898681640625)");
    			add_location(g17, file$5, 45, 12458, 13245);
    			attr(path17, "stroke-linecap", "butt");
    			attr(path17, "stroke-linejoin", "miter");
    			attr(path17, "fill-opacity", "0");
    			attr(path17, "stroke-miterlimit", "10");
    			attr(path17, "stroke", "rgb(7,5,6)");
    			attr(path17, "stroke-opacity", "1");
    			attr(path17, "stroke-width", "1");
    			attr(path17, "d", " M-75.78600311279297,-173.4929962158203 C-37.452999114990234,-156.08799743652344 0,-139.08299255371094 0,-139.08299255371094 C0,-139.08299255371094 0,-139.08299255371094 0,-139.08299255371094 C0,-139.08299255371094 122.72899627685547,-142.6699981689453 122.72899627685547,-142.6699981689453 C122.72899627685547,-142.6699981689453 191.5019989013672,0 191.5019989013672,0 C191.5019989013672,0 122.72899627685547,142.6719970703125 122.72899627685547,142.6719970703125 C122.72899627685547,142.6719970703125 0,139.08399963378906 0,139.08399963378906 C0,139.08399963378906 -157.11599731445312,210.4199981689453 -157.11599731445312,210.4199981689453 C-157.11599731445312,210.4199981689453 -191.5019989013672,0 -191.5019989013672,0 C-191.5019989013672,0 -157.11599731445312,-210.41900634765625 -157.11599731445312,-210.41900634765625 C-157.11599731445312,-210.41900634765625 -115.96700286865234,-191.73599243164062 -75.78600311279297,-173.4929962158203");
    			add_location(path17, file$5, 45, 13843, 14630);
    			attr(g18, "opacity", "1");
    			attr(g18, "transform", "matrix(1,0,0,1,223.6020050048828,334.94500732421875)");
    			add_location(g18, file$5, 45, 13763, 14550);
    			attr(path18, "stroke-linecap", "butt");
    			attr(path18, "stroke-linejoin", "miter");
    			attr(path18, "fill-opacity", "0");
    			attr(path18, "stroke-miterlimit", "10");
    			attr(path18, "stroke", "rgb(7,5,6)");
    			attr(path18, "stroke-opacity", "1");
    			attr(path18, "stroke-width", "1");
    			attr(path18, "d", " M-74.61399841308594,-180.6529998779297 C-35.92900085449219,-159.1009979248047 0.0010000000474974513,-139.08399963378906 0.0010000000474974513,-139.08399963378906 C0.0010000000474974513,-139.08399963378906 0.0010000000474974513,-139.08399963378906 0.0010000000474974513,-139.08399963378906 C0.0010000000474974513,-139.08399963378906 111.26799774169922,-120.08799743652344 111.26799774169922,-120.08799743652344 C111.26799774169922,-120.08799743652344 191.5030059814453,0 191.5030059814453,0 C191.5030059814453,0 111.26799774169922,120.08799743652344 111.26799774169922,120.08799743652344 C111.26799774169922,120.08799743652344 0.0010000000474974513,139.08399963378906 0.0010000000474974513,139.08399963378906 C0.0010000000474974513,139.08399963378906 -168.57699584960938,233.0019989013672 -168.57699584960938,233.0019989013672 C-168.57699584960938,233.0019989013672 -191.5019989013672,0 -191.5019989013672,0 C-191.5019989013672,0 -168.57699584960938,-233.0019989013672 -168.57699584960938,-233.0019989013672 C-168.57699584960938,-233.0019989013672 -119.7229995727539,-205.78399658203125 -74.61399841308594,-180.6529998779297");
    			add_location(path18, file$5, 45, 15031, 15818);
    			attr(g19, "opacity", "1");
    			attr(g19, "transform", "matrix(1,0,0,1,213.73500061035156,343.9909973144531)");
    			add_location(g19, file$5, 45, 14951, 15738);
    			attr(path19, "stroke-linecap", "butt");
    			attr(path19, "stroke-linejoin", "miter");
    			attr(path19, "fill-opacity", "0");
    			attr(path19, "stroke-miterlimit", "10");
    			attr(path19, "stroke", "rgb(7,5,6)");
    			attr(path19, "stroke-opacity", "1");
    			attr(path19, "stroke-width", "1");
    			attr(path19, "d", " M-74.62999725341797,-187.37399291992188 C-35.29499816894531,-161.9219970703125 -0.0010000000474974513,-139.08399963378906 -0.0010000000474974513,-139.08399963378906 C-0.0010000000474974513,-139.08399963378906 -0.0010000000474974513,-139.08399963378906 -0.0010000000474974513,-139.08399963378906 C-0.0010000000474974513,-139.08399963378906 99.80400085449219,-97.50599670410156 99.80400085449219,-97.50599670410156 C99.80400085449219,-97.50599670410156 191.5019989013672,-0.0010000000474974513 191.5019989013672,-0.0010000000474974513 C191.5019989013672,-0.0010000000474974513 99.80400085449219,97.50599670410156 99.80400085449219,97.50599670410156 C99.80400085449219,97.50599670410156 -0.0010000000474974513,139.08299255371094 -0.0010000000474974513,139.08299255371094 C-0.0010000000474974513,139.08299255371094 -180.04200744628906,255.5850067138672 -180.04200744628906,255.5850067138672 C-180.04200744628906,255.5850067138672 -191.5030059814453,-0.0010000000474974513 -191.5030059814453,-0.0010000000474974513 C-191.5030059814453,-0.0010000000474974513 -180.04200744628906,-255.58399963378906 -180.04200744628906,-255.58399963378906 C-180.04200744628906,-255.58399963378906 -124.13500213623047,-219.4080047607422 -74.62999725341797,-187.37399291992188");
    			add_location(path19, file$5, 45, 16398, 17185);
    			attr(g20, "opacity", "1");
    			attr(g20, "transform", "matrix(1,0,0,1,203.8699951171875,353.0369873046875)");
    			add_location(g20, file$5, 45, 16319, 17106);
    			attr(path20, "stroke-linecap", "butt");
    			attr(path20, "stroke-linejoin", "miter");
    			attr(path20, "fill-opacity", "0");
    			attr(path20, "stroke-miterlimit", "10");
    			attr(path20, "stroke", "rgb(7,5,6)");
    			attr(path20, "stroke-opacity", "1");
    			attr(path20, "stroke-width", "1");
    			attr(path20, "d", " M115.61599731445312,-55.1150016784668 C156.0279998779297,-25.763999938964844 191.5030059814453,0 191.5030059814453,0 C191.5030059814453,0 191.5030059814453,0 191.5030059814453,0 C191.5030059814453,0 0,139.08299255371094 0,139.08299255371094 C0,139.08299255371094 -191.5030059814453,278.1669921875 -191.5030059814453,278.1669921875 C-191.5030059814453,278.1669921875 -191.5030059814453,0 -191.5030059814453,0 C-191.5030059814453,0 -191.5030059814453,-278.1669921875 -191.5030059814453,-278.1669921875 C-191.5030059814453,-278.1669921875 0,-139.08399963378906 0,-139.08399963378906 C0,-139.08399963378906 62.13199996948242,-93.95899963378906 115.61599731445312,-55.1150016784668");
    			add_location(path20, file$5, 45, 17893, 18680);
    			attr(g21, "opacity", "1");
    			attr(g21, "transform", "matrix(1,0,0,1,194.0030059814453,362.0840148925781)");
    			add_location(g21, file$5, 45, 17814, 18601);
    			attr(path21, "stroke-linecap", "butt");
    			attr(path21, "stroke-linejoin", "miter");
    			attr(path21, "fill-opacity", "0");
    			attr(path21, "stroke-miterlimit", "10");
    			attr(path21, "stroke", "rgb(7,5,6)");
    			attr(path21, "stroke-opacity", "1");
    			attr(path21, "stroke-width", "1");
    			attr(path21, "d", " M-26.601999282836914,-16.85300064086914 C-30.273000717163086,-22.922000885009766 -32.81700134277344,-27.12700080871582 -32.81700134277344,-27.12700080871582 C-32.81700134277344,-27.12700080871582 -32.81700134277344,-27.12700080871582 -32.81700134277344,-27.12700080871582 C-32.81700134277344,-27.12700080871582 32.81700134277344,-27.12700080871582 32.81700134277344,-27.12700080871582 C32.81700134277344,-27.12700080871582 0,27.12700080871582 0,27.12700080871582 C0,27.12700080871582 -17.08799934387207,-1.1230000257492065 -26.601999282836914,-16.85300064086914");
    			add_location(path21, file$5, 45, 18812, 19599);
    			attr(g22, "opacity", "1");
    			attr(g22, "transform", "matrix(1,0,0,1,435.9649963378906,618.281982421875)");
    			add_location(g22, file$5, 45, 18734, 19521);
    			attr(path22, "stroke-linecap", "butt");
    			attr(path22, "stroke-linejoin", "miter");
    			attr(path22, "fill-opacity", "0");
    			attr(path22, "stroke-miterlimit", "10");
    			attr(path22, "stroke", "rgb(7,5,6)");
    			attr(path22, "stroke-opacity", "1");
    			attr(path22, "stroke-width", "1");
    			attr(path22, "d", " M-28.722000122070312,-7.460999965667725 C-31.215999603271484,-8.972000122070312 -32.81700134277344,-9.942000389099121 -32.81700134277344,-9.942000389099121 M32.81700134277344,-9.942000389099121 C32.81700134277344,-9.942000389099121 0.0010000000474974513,9.942000389099121 0.0010000000474974513,9.942000389099121 C0.0010000000474974513,9.942000389099121 -19.92099952697754,-2.128999948501587 -28.722000122070312,-7.460999965667725");
    			add_location(path22, file$5, 45, 19617, 20404);
    			attr(g23, "opacity", "1");
    			attr(g23, "transform", "matrix(1,0,0,1,435.9649963378906,601.0969848632812)");
    			add_location(g23, file$5, 45, 19538, 20325);
    			attr(path23, "stroke-linecap", "butt");
    			attr(path23, "stroke-linejoin", "miter");
    			attr(path23, "fill-opacity", "0");
    			attr(path23, "stroke-miterlimit", "10");
    			attr(path23, "stroke", "rgb(7,5,6)");
    			attr(path23, "stroke-opacity", "1");
    			attr(path23, "stroke-width", "1");
    			attr(path23, "d", " M-28.722000122070312,-15.031999588012695 C-31.215999603271484,-18.077999114990234 -32.81700134277344,-20.031999588012695 -32.81700134277344,-20.031999588012695 M32.81700134277344,-20.031999588012695 C32.81700134277344,-20.031999588012695 0.0010000000474974513,20.031999588012695 0.0010000000474974513,20.031999588012695 C0.0010000000474974513,20.031999588012695 -19.92099952697754,-4.289000034332275 -28.722000122070312,-15.031999588012695");
    			add_location(path23, file$5, 45, 20288, 21075);
    			attr(g24, "opacity", "1");
    			attr(g24, "transform", "matrix(1,0,0,1,435.9649963378906,611.18701171875)");
    			add_location(g24, file$5, 45, 20211, 20998);
    			attr(g25, "transform", "matrix(1,0,0,1,721.5,216)");
    			attr(g25, "opacity", "1");
    			set_style(g25, "display", "block");
    			add_location(g25, file$5, 45, 5735, 6522);
    			attr(g26, "clip-path", "url(#cp_IjQ9np3D)");
    			attr(g26, "transform", "matrix(1.49167001247406,0,0,1.49167001247406,-472.003173828125,-265.5018310546875)");
    			attr(g26, "opacity", "1");
    			set_style(g26, "display", "block");
    			add_location(g26, file$5, 45, 455, 1242);
    			attr(g27, "clip-path", "url(#animationMask_Obx7Q4Q9dW)");
    			add_location(g27, file$5, 45, 409, 1196);
    			attr(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr(svg, "viewBox", "0 0 1920 1080");
    			attr(svg, "width", "1920");
    			attr(svg, "height", "1080");
    			attr(svg, "preserveAspectRatio", "xMidYMid meet");
    			set_style(svg, "width", "100%");
    			set_style(svg, "height", "100%");
    			set_style(svg, "transform", "translate3d(0px, 0px, 0px)");
    			add_location(svg, file$5, 45, 4, 791);
    			attr(div0, "class", "bodymovin svelte-1tb9xn");
    			add_location(div0, file$5, 44, 2, 762);
    			add_location(br, file$5, 48, 16, 21749);
    			attr(h1, "class", "svelte-1tb9xn");
    			add_location(h1, file$5, 48, 4, 21737);
    			attr(div1, "class", "container svelte-1tb9xn");
    			add_location(div1, file$5, 47, 2, 21709);
    			attr(div2, "class", "main svelte-1tb9xn");
    			add_location(div2, file$5, 43, 0, 741);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div2, anchor);
    			append(div2, div0);
    			append(div0, svg);
    			append(svg, defs);
    			append(defs, clipPath0);
    			append(clipPath0, rect);
    			append(defs, clipPath1);
    			append(clipPath1, path0);
    			append(svg, g27);
    			append(g27, g26);
    			append(g26, g4);
    			append(g4, g0);
    			append(g0, path1);
    			append(g4, g1);
    			append(g1, path2);
    			append(g4, g2);
    			append(g2, path3);
    			append(g4, g3);
    			append(g3, path4);
    			append(g26, g11);
    			append(g11, g5);
    			append(g5, path5);
    			append(g11, g6);
    			append(g6, path6);
    			append(g11, g7);
    			append(g7, path7);
    			append(g11, g8);
    			append(g8, path8);
    			append(g11, g9);
    			append(g9, path9);
    			append(g11, g10);
    			append(g10, path10);
    			append(g26, g25);
    			append(g25, g12);
    			append(g12, path11);
    			append(g25, g13);
    			append(g13, path12);
    			append(g25, g14);
    			append(g14, path13);
    			append(g25, g15);
    			append(g15, path14);
    			append(g25, g16);
    			append(g16, path15);
    			append(g25, g17);
    			append(g17, path16);
    			append(g25, g18);
    			append(g18, path17);
    			append(g25, g19);
    			append(g19, path18);
    			append(g25, g20);
    			append(g20, path19);
    			append(g25, g21);
    			append(g21, path20);
    			append(g25, g22);
    			append(g22, path21);
    			append(g25, g23);
    			append(g23, path22);
    			append(g25, g24);
    			append(g24, path23);
    			append(div2, t0);
    			append(div2, div1);
    			append(div1, h1);
    			append(h1, t1);
    			append(h1, br);
    			append(h1, t2);
    		},

    		p: noop,
    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div2);
    			}
    		}
    	};
    }

    class Logo extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$6, safe_not_equal, []);
    	}
    }

    /* src/routes/Home.svelte generated by Svelte v3.7.1 */

    function create_fragment$7(ctx) {
    	var t0, t1, current;

    	var logo = new Logo({ $$inline: true });

    	var landingtext = new LandingText({ $$inline: true });

    	var meetups = new Meetups({ $$inline: true });

    	return {
    		c: function create() {
    			logo.$$.fragment.c();
    			t0 = space();
    			landingtext.$$.fragment.c();
    			t1 = space();
    			meetups.$$.fragment.c();
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			mount_component(logo, target, anchor);
    			insert(target, t0, anchor);
    			mount_component(landingtext, target, anchor);
    			insert(target, t1, anchor);
    			mount_component(meetups, target, anchor);
    			current = true;
    		},

    		p: noop,

    		i: function intro(local) {
    			if (current) return;
    			transition_in(logo.$$.fragment, local);

    			transition_in(landingtext.$$.fragment, local);

    			transition_in(meetups.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(logo.$$.fragment, local);
    			transition_out(landingtext.$$.fragment, local);
    			transition_out(meetups.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(logo, detaching);

    			if (detaching) {
    				detach(t0);
    			}

    			destroy_component(landingtext, detaching);

    			if (detaching) {
    				detach(t1);
    			}

    			destroy_component(meetups, detaching);
    		}
    	};
    }

    class Home extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$7, safe_not_equal, []);
    	}
    }

    /* src/routes/ProfileGrid.svelte generated by Svelte v3.7.1 */

    const file$6 = "src/routes/ProfileGrid.svelte";

    function create_fragment$8(ctx) {
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
    			add_location(h20, file$6, 26, 6, 517);
    			add_location(h40, file$6, 27, 6, 543);
    			add_location(br0, file$6, 29, 185, 786);
    			add_location(br1, file$6, 30, 119, 910);
    			add_location(p0, file$6, 28, 6, 597);
    			attr(div0, "class", "text");
    			add_location(div0, file$6, 25, 4, 492);
    			attr(div1, "class", "picture svelte-aoxikw");
    			add_location(div1, file$6, 34, 4, 1132);
    			attr(div2, "class", "profile-right");
    			set_style(div2, "grid-template-columns", "auto 36%");
    			add_location(div2, file$6, 24, 2, 421);
    			attr(div3, "class", "picture svelte-aoxikw");
    			add_location(div3, file$6, 40, 4, 1296);
    			add_location(h21, file$6, 44, 6, 1412);
    			add_location(h41, file$6, 45, 6, 1440);
    			add_location(p1, file$6, 46, 6, 1507);
    			attr(div4, "class", "text");
    			add_location(div4, file$6, 43, 4, 1387);
    			attr(div5, "class", "profile-left");
    			set_style(div5, "grid-template-columns", "36% auto");
    			add_location(div5, file$6, 39, 2, 1226);
    			add_location(h22, file$6, 54, 6, 1981);
    			add_location(h42, file$6, 55, 6, 2005);
    			add_location(p2, file$6, 56, 6, 2046);
    			attr(div6, "class", "text");
    			add_location(div6, file$6, 53, 4, 1956);
    			attr(div7, "class", "picture svelte-aoxikw");
    			add_location(div7, file$6, 60, 4, 2899);
    			attr(div8, "class", "profile-right");
    			set_style(div8, "grid-template-columns", "36% auto");
    			add_location(div8, file$6, 52, 2, 1885);
    			attr(div9, "class", "picture svelte-aoxikw");
    			add_location(div9, file$6, 66, 4, 3068);
    			add_location(h23, file$6, 70, 6, 3184);
    			add_location(h43, file$6, 71, 6, 3211);
    			add_location(p3, file$6, 72, 6, 3255);
    			attr(div10, "class", "text");
    			add_location(div10, file$6, 69, 4, 3159);
    			attr(div11, "class", "profile-left");
    			set_style(div11, "grid-template-columns", "auto 36%");
    			add_location(div11, file$6, 65, 2, 2998);
    			add_location(h24, file$6, 80, 6, 3782);
    			add_location(h44, file$6, 81, 6, 3808);
    			add_location(p4, file$6, 82, 6, 3845);
    			add_location(p5, file$6, 85, 6, 4218);
    			attr(div12, "class", "text");
    			add_location(div12, file$6, 79, 4, 3757);
    			attr(div13, "class", "picture svelte-aoxikw");
    			add_location(div13, file$6, 89, 4, 4412);
    			attr(div14, "class", "profile-right");
    			set_style(div14, "grid-template-columns", "36% auto");
    			add_location(div14, file$6, 78, 2, 3686);
    			attr(div15, "class", "picture svelte-aoxikw");
    			add_location(div15, file$6, 95, 4, 4581);
    			add_location(h25, file$6, 99, 6, 4697);
    			add_location(h45, file$6, 100, 6, 4728);
    			add_location(p6, file$6, 101, 6, 4754);
    			attr(div16, "class", "text");
    			add_location(div16, file$6, 98, 4, 4672);
    			attr(div17, "class", "profile-left");
    			set_style(div17, "grid-template-columns", "auto 36%");
    			add_location(div17, file$6, 94, 2, 4511);
    			add_location(h26, file$6, 109, 6, 5198);
    			add_location(h46, file$6, 110, 6, 5230);
    			add_location(p7, file$6, 111, 6, 5274);
    			attr(div18, "class", "text");
    			add_location(div18, file$6, 108, 4, 5173);
    			attr(div19, "class", "picture svelte-aoxikw");
    			add_location(div19, file$6, 115, 4, 5830);
    			attr(div20, "class", "profile-right");
    			set_style(div20, "grid-template-columns", "36% auto");
    			add_location(div20, file$6, 107, 2, 5102);
    			attr(div21, "class", "grid svelte-aoxikw");
    			add_location(div21, file$6, 23, 0, 400);
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
    		init(this, options, null, create_fragment$8, safe_not_equal, []);
    	}
    }

    /* src/routes/Humans.svelte generated by Svelte v3.7.1 */

    const file$7 = "src/routes/Humans.svelte";

    function create_fragment$9(ctx) {
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
    			add_location(h1, file$7, 35, 2, 591);
    			add_location(p0, file$7, 36, 2, 626);
    			add_location(p1, file$7, 36, 143, 767);
    			attr(div, "class", "container svelte-nen51u");
    			add_location(div, file$7, 34, 0, 565);
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
    		init(this, options, null, create_fragment$9, safe_not_equal, []);
    	}
    }

    /* src/App.svelte generated by Svelte v3.7.1 */

    function create_fragment$a(ctx) {
    	var t0, t1, current;

    	var navbar = new NavBar({ $$inline: true });

    	var router = new Router({
    		props: { routes: ctx.routes },
    		$$inline: true
    	});

    	var footer = new Footer({ $$inline: true });

    	return {
    		c: function create() {
    			navbar.$$.fragment.c();
    			t0 = space();
    			router.$$.fragment.c();
    			t1 = space();
    			footer.$$.fragment.c();
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			mount_component(navbar, target, anchor);
    			insert(target, t0, anchor);
    			mount_component(router, target, anchor);
    			insert(target, t1, anchor);
    			mount_component(footer, target, anchor);
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

    			transition_in(footer.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(navbar.$$.fragment, local);
    			transition_out(router.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(navbar, detaching);

    			if (detaching) {
    				detach(t0);
    			}

    			destroy_component(router, detaching);

    			if (detaching) {
    				detach(t1);
    			}

    			destroy_component(footer, detaching);
    		}
    	};
    }

    function instance$3($$self) {
    	

    	const routes = {
        '/': Home,
     
        '/board': Humans, 
    };

    	return { routes };
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$a, safe_not_equal, []);
    	}
    }

    const app = new App({
    	target: document.body,
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
