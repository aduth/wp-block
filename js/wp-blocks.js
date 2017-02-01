( function( wp, strings, vdom, _ ) {
	var RX_BLOCK;

	wp.blocks = {
		/**
		 * Map of all registered blocks.
		 *
		 * @type {Object}
		 */
		registered: {},

		/**
		 * Registers a new block.
		 *
		 * @param  {string} name    Identifier for block
		 * @param  {Object} options Block options
		 * @return {Object}         Block options, including defaults
		 */
		register: function( name, options ) {
			options = _.defaults( options, {
				title: name,
				form: options.display,
				allowsChildren: false
			} );

			// Validate display implementation exists
			if ( ! options.display ) {
				throw new TypeError( strings.noDisplayError );
			}

			// Validate that a duplicate block is not being registered
			if ( wp.blocks.registered[ name ] ) {
				throw new TypeError( strings.conflictError );
			}

			wp.blocks.registered[ name ] = options;

			return options;
		},

		/**
		 * @typedef WPBlockVTree
		 *
		 * WordPress block virtual tree
		 */

		/**
		  * Renders a block.
		  *
		  * @param  {string}       name    Name of registered block
		  * @param  {Object}       context Render context (display, form)
		  * @param  {...*}                 Arguments to pass to render
		  * @return {WPBlockVTree}         Rendered virtual tree
		  */
		render: function( name, context /*, ...args */ ) {
			var block, render, args;

			block = wp.blocks.registered[ name ];
			if ( ! block ) {
				throw new TypeError( strings.noBlockError );
			}

			// Normalize parameters
			context = context || 'display';

			args = Array.prototype.slice.call( arguments, 2 );
			render = block[ context ] || block.display;
			return render.apply( null, args );
		}
	};

	/**
	 * RegExp matching block comments
	 *
	 * @type {RegExp}
	 */
	RX_BLOCK = /(<!--\s*wp:(\S+)\s*({.*?})\s-->)(.*?)<!--\s*\/wp\s*-->/gi;

	wp.mce.views.register( 'block', {
		match: function( content ) {
			var match, attributes;

			match = RX_BLOCK.exec( content );
			if ( ! match ) {
				return;
			}

			try {
				attributes = JSON.parse( match[ 3 ] );
			} catch ( error ) {
				attributes = {};
			}

			return {
				index: match.index + match[ 1 ].length,
				content: match[ 4 ],
				options: {
					block: match[ 2 ],
					attributes: attributes
				}
			};
		},

		setAttributes: function( attributes ) {
			var mergedAttributes = _.assign( {}, this.attributes, attributes );
			this.replaceAttributes( mergedAttributes );
		},

		replaceAttributes: function( attributes ) {
			this.attributes = attributes;
			this.render();
		},

		render: function( content ) {
			var nextTree, patches, nextRootNode;

			// Use prototype behavior for markup content
			if ( 'string' === typeof content ) {
				return wp.mce.View.prototype.render.apply( this, arguments );
			}

			this.replaceMarkers();

			nextTree = wp.blocks.render( this.block, 'form', this.attributes, {
				setAttributes: _.bind( this.setAttributes, this ),
				replaceAttributes: _.bind( this.replaceAttributes, this )
			} );

			if ( this.rootNode && this.tree ) {
				patches = vdom.diff( this.tree, nextTree );
				nextRootNode = vdom.patch( this.rootNode, patches );
			} else {
				nextRootNode = vdom.create( nextTree );
			}

			this.tree = nextTree;
			this.rootNode = nextRootNode;

			this.getNodes( function( editor, node ) {
				editor.undoManager.transact( function() {
					node.innerHTML = '';
					node.appendChild( nextRootNode );
					editor.dom.add( node, 'span', { 'class': 'wpview-end' } );
				} );
			} );
		}
	} );
} )( this.wp, this._wpBlocksL10n, this.virtualDom, this._ );
