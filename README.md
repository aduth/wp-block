WP Block
========

A prototype infrastructure for rendering and managing blocks within the WordPress post editor.

## Background

WordPress already includes a base implementation for blocks in [`wp.mce.View`](https://github.com/WordPress/WordPress/blob/master/wp-includes/js/mce-view.js) and its corresponding [`wpview` TinyMCE plugin](https://github.com/WordPress/WordPress/blob/master/wp-includes/js/tinymce/plugins/wpview/plugin.js). These are already used in displaying, amongst other things, galleries and embeds.

Blocks seeks to extend this base, expanding upon it with conventions and conveniences specifically targeting plugin authors seeking to implement their own editable content blocks.

The blocks implementation was guided by the following set of requirements:

- Blocks may embed or be informed by non-visual data
- A block should include UIs both for its front-end visual representation and its editor form
- It should be easy to serialize back and forth between front-end and editor representations

For more background, refer also to Make WordPress Core posts on the topic:

- [_Editor Technical Overview_ by Matias Ventura](https://make.wordpress.org/core/2017/01/17/editor-technical-overview/)
- [_What Are Little Blocks Made Of?_ by Joen Asmussen](https://make.wordpress.org/design/2017/01/25/what-are-little-blocks-made-of/)

## Usage

When depending on the registered `wp-blocks` script, a new global is made available to register editor blocks: `wp.blocks.register`. When registering a new block, provide both a name and set of options defining its expected expected behavior.

```js
blocks.register( 'map-block/map', {
	title: 'Map',
	description: 'Embed a map from OpenStreetMaps',
	form: function( attributes, state ) {
		// ...
	},
	display: function( attributes ) {
		// ...
	},
	validateAttributes: function( attributes ) {
		// ...
	},
	encodeAttributes: function( attributes ) {
		// ...
	}
} );
```

For a complete example, refer to the [Map Block](https://github.com/aduth/wp-map-block) prototype plugin as the "dream code" implementation upon which these APIs were derived.

In HTML, a block may end up looking like:

```html
<!-- wp:map-block/map {"query":"Cincinnati","bbox":"-84.7123899%2C39.0520565%2C-84.3687783%2C39.2210368"} -->
<iframe class="map-block" src="https://www.openstreetmap.org/export/embed.html?bbox=-84.7123899%2C39.0520565%2C-84.3687783%2C39.2210368" width="425" height="350" frameborder="0" scrolling="no"></iframe>
<!-- /wp -->
```

## Options

`title`

Localized string to be shown in the editor when given the choice to insert a new block.

`description`

Short localized string describing the block to be inserted.

`form`

Function which, when passed a set of attributes and object of state helpers, is expected to return either an HTML markup string or instance of [wp.element](https://github.com/aduth/wp-elements).

This should represent the form to be shown in editor that a user is expected to manipulate.

State helpers includes `setAttributes` and `replaceAttributes` which respectively partially and completely update the attributes of a block.

`display`

Function which, when passed a set of attributes, is expected to return either an HTML markup string or instance of [wp.element](https://github.com/aduth/wp-elements).

This should represent the front-end display of the block to be saved in post content alongside encoded attributes of the block.

`validateAttributes`

Similar to [Backbone's `model.validate`](http://backbonejs.org/#Model-validate), this function is passed the set of block attributes prior to save and should throw an error if the current attribute state of the block should not be saveable.

`encodeAttributes`

Function which, when passed a set of attributes for the block, should return an object to be encoded in the saved data markup. This can be useful in cases where only a subset of block attributes need to be encoded.

By default this is an identity object; in other words, all attributes are encoded.
