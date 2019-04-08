# inDOMitable.js

Create, reference, and update HTML/DOM objects with ease. Verbose native JavaScript APIs shall never subdue you!

---

The native JavaScript APIs for interfacing with the HTML Document Object Model (DOM) can be very verbose. Here is the code for generating `<div>Hello world!</div>`:

```
const div = document.createElement('div')
const content = document.createTextNode('Hello world!')
div.appendChild(content)
document.body.appendChild(div)
```


inDOMitable.js aims to make a lot of that simpler, without sacrificing performance. The framework defines a function, `h`, which you can pass "@"-annotated HTML. The result is an HTML tree that is ready to use, along with a `.state` object to access and update the annotated text nodes, elements and attributes.

```
const view = h`
	<article @article>
		<h2>Project: @title!</h2>
		<img src:@image>
		<span>Comments: @comments</span>
		<a href:@url target:@>View Project</a>
		<pre>The mouse coordinates are (@x, @y).</pre>
	</article>
`
document.body.appendChild(view)

view.state.title = 'My Project'
view.state.target = '_blank'
view.state({
	comments: 100,
	url: 'https://darryl-yeo.com',
	image: 'https://picsum.photos/600/400',
	x: 1,
	y: 2
})

console.log(view.refs.article)
// <article>

console.log(view.state.url)
// https://darryl-yeo.com

console.log(view.outerHTML)
/*
<article>
	<h2>Project: My Project!</h2>
	<img src="https://picsum.photos/600/400">
	<span>Comments: 100</span>
	<a href="https://darryl-yeo.com" target="_blank">View Project</a>
	<pre>The mouse coordinates are (1, 2).</pre>
</article>
*/

window.onmousemove = ({x, y}) =>
	view.state({x, y})
```
