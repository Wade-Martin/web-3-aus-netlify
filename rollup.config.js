import svelte from 'rollup-plugin-svelte';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import globals from 'rollup-plugin-node-globals';
import livereload from 'rollup-plugin-livereload';
import { terser } from 'rollup-plugin-terser';
import json from 'rollup-plugin-json';

const production = !process.env.ROLLUP_WATCH;

export default {
	input: 'src/main.js',
	output: {
		sourcemap: true,
		format: 'iife',
		name: 'app',
		file: 'public/bundle.js'
	},
	plugins: [ß
		json({
      // All JSON files will be parsed by default,
      // but you can also specifically include/exclude files
      include: 'node_modules/**',
      exclude: [ 'node_modules/foo/**', 'node_modules/bar/**' ],
 
      // for tree-shaking, properties will be declared as
      // variables, using either `var` or `const`
      preferConst: true, // Default: false
 
      // specify indentation for the generated default export —
      // defaults to '\t'
      indent: '  ',
 
      // ignores indent and generates the smallest code
      compact: true, // Default: false
 
      // generate a named export for every property of the JSON object
      namedExports: true // Default: true
    }),
		svelte({
			// enable run-time checks when not in production
			dev: !production,
			// we'll extract any component CSS out into
			// a separate file — better for performance
			css: css => {
				css.write('public/bundle.css');
			}
		}),

		// If you have external dependencies installed from
		// npm, you'll most likely need these plugins. In
		// some cases you'll need additional configuration —
		// consult the documentation for details:
		// https://github.com/rollup/rollup-plugin-commonjs
		resolve({
			browser: true,
			dedupe: importee => importee === 'svelte' || importee.startsWith('svelte/')
		}),
		commonjs({
			// non-CommonJS modules will be ignored, but you can also
			// specifically include/exclude files
			include: 'node_modules/**',  // Default: undefined
			browser: true,
			preferBuiltins: false,
			// if true then uses of `global` won't be dealt with by this plugin
			ignoreGlobal: false,  // Default: false

			// if false then skip sourceMap generation for CommonJS modules
			sourceMap: false  // Default: true

			// explicitly specify unresolvable named exports
			// (see below for more details)
			// namedExports: { './module.js': ['foo', 'bar' ] }  // Default: undefined
		}),
		globals(),


		// Watch the `public` directory and refresh the
		// browser on changes when not in production
		!production && livereload('public'),

		// If we're building for production (npm run build
		// instead of npm run dev), minify
		production && terser()
	],
	watch: {
		clearScreen: false
	}
};
