const TREE_WALKER = document.createTreeWalker(document)
//const TEMPLATE = document.createElement('template')

const SUPPORTS_DISPLAY_CONTENTS = CSS.supports('display: contents')

DocumentFragment.prototype[Symbol.iterator] = function*(){
	for(const child of this.childNodes){
		yield child
	}
}
DocumentFragment.prototype[Symbol.isConcatSpreadable] = true


// function h(strings) {
	// let s = strings[0]
	// for(let i = 1; i < strings.length; i++)
	// 	s += arguments[i] + strings[i]
function h(s, ...args) {
	// Stores references to named nodes or attributes
	const refs = {}
	
	// State object; also a function that assigns argument properties to itself
	const state = function(){
		Object.assign(state, ...arguments)
		return state
	}
	
	// If called as a tagged template string, make references for any passed nodes
	if(Array.isArray(s))
		s = String.raw(s, ...args.map((a, i) => {
			if(a instanceof Node){
				refs[i] = a
				return `@${i}`
			}
			return a
		}))
	console.log(s)

	// Make template
	const TEMPLATE = document.createElement('template')
	TEMPLATE.innerHTML = s.trim().replace(/>\s+</g, '><')
	
	// Extract HTML tree from template
	const {content} = TEMPLATE
	const root = content.childNodes.length === 1 ? content.firstChild : content
	
	// Iterate all nodes in the tree and find @references
	if(s.includes('@')) for(let node = TREE_WALKER.currentNode = root; node; node = TREE_WALKER.nextNode()){
		// Replace @references in the text with slot references
		if(node.nodeType === Node.TEXT_NODE){
			const {nodeValue} = node
			// console.log(/@(\w+)/.exec(nodeValue).index)
			
			// When an @reference is found
			nodeValue.replace(/@(\w+)/, ({length}, ref, i) => {
			// const match = nodeValue.match(/@(\w+)/)
			// if(match){
			// 	const [{length}, ref, i] = match
			
				// Split off the text node
				node = refs[ref] = i > 0 ? node.splitText(i) : node
				if(i + length < nodeValue.length) node.splitText(length)
				node.nodeValue = ''
				
				// Only text
				// Object.defineProperty(state, ref, {
				// 	get: _ => node.nodeValue,
				// 	set: v => newNode.nodeValue = v
				// })
				
				// Text or node
				// Object.defineProperty(state, ref, {
				// 	get: _ => node.nodeValue,
				// 	set: v => {
				// 		if(Array.isArray(v)) node = node.replaceWith(v)
				// 		else if(v instanceof Node) node = node.replaceWith(v)
				// 		else node.nodeValue = v
				// 	}
				// })
				
				// Text, node, document fragment, array of any of those
				let nodes = [node]
				// Allow contents of slot to be accessed and modified via "state" object
				Object.defineProperty(state, ref, {
					get: _ => node.nodeValue,
					
					// When a slot reference is updated
					set: (_ = [new Text]) => {
						// Collapse arguments
						// console.log(_)
						const newNodes = [].concat(...[].concat([_])) // [_].flat()
						// Array.isArray() ? [_] : [].concat(..._)
						// isFinite(_) || typeof _ === 'string' || _ instanceof Node
						
						if(!newNodes.length)
							newNodes.push(new Text)
						// console.log(newNodes)
						const parent = nodes[0].parentElement
						// console.log('nodes[0]', nodes[0], 'parent', parent)
						
						let i = 0
						for(let v of newNodes) if(v !== undefined && v !== null){
							const currentNode = nodes[i]
							
							// If primitive, convert to text node or replace value of existing text node
							if(!(v instanceof Node)){
								if(currentNode.nodeType === Node.TEXT_NODE){
									currentNode.nodeValue = v
									continue
								}
								v = new Text(v) // v = document.createTextNode(v)
							}
							
							// Append or insert the node
							if(!currentNode){
								parent.appendChild(v)
							}else if(currentNode !== v){
								nodes.splice(i, 0, v)
								parent.insertBefore(v, currentNode)
							}
							i++
						}
						
						// Remove nodes that don't belong
						while(nodes.length > newNodes.length){
							nodes.pop().remove()
						}
					}
					// set: (newNodes = ['']) => {
					// 	if(!Array.isArray(newNodes))
					// 		newNodes = [newNodes]
						
					// 	const parent = nodes[0].parentElement
					// 	console.log('nodes[0]', nodes[0], 'parent', parent)
						
					// 	let i = 0
					// 	for(let v of newNodes){
					// 		const currentNode = nodes[i]
							
					// 		// Spread arrays or document fragments
					// 		if(Array.isArray(v)){
					// 			newNodes.splice(i, 1, ...v)
					// 			v = v[0]
					// 		}else if(v instanceof DocumentFragment){
					// 			newNodes.splice(i, 1, ...v.childNodes)
					// 			v = v.childNodes[0]
					// 		}
							
					// 		if(v === undefined || v === null)
					// 			continue
							
					// 		// If primitive, convert to text
					// 		if(!(v instanceof Object)){
					// 			if(currentNode.nodeType === Node.TEXT_NODE){
					// 				currentNode.nodeValue = v
					// 				continue
					// 			}
					// 			// v = document.createTextNode(v)
					// 			v = new Text(v)
					// 		}
							
					// 		// Append or insert the node
					// 		if(!currentNode){
					// 			parent.appendChild(v)
					// 		}else if(currentNode !== v){
					// 			nodes.splice(i, 0, v)
					// 			parent.insertBefore(v, currentNode)
					// 		}
					// 		i++
					// 	}
						
					//	// Remove nodes that don't belong
					// 	while(nodes.length > newNodes.length){
					// 		nodes.pop().remove()
					// 	}
					// }
				})
			// }
			})
		}
		
		// Iterate element attributes
		else for(const {name, value} of [...node.attributes || []]){
			// Attributes starting with "@" denote an element reference
			if(name[0] === '@'){
				node.removeAttribute(name)
				const ref = name.slice(1)
				refs[ref] = node
				
				// if(node.tagName === 'slot'){
				// 	document.body.style.background = 'red'
				// 	Object.defineProperty(state, ref, {
				// 		get: _ => newNode.nodeValue,
				// 		set: v => newNode.nodeValue = v
				// 	})
				// }
			}
			
			// Attributes with ":@" denote an attribute reference
			else if(name.includes(':@')){
				node.removeAttribute(name)
				
				// Parse attribute name and reference name
				const [attrName, _ref] = name.split(':@')
				const ref = _ref || attrName
				node.setAttribute(attrName, value)
				
				// Keep a local variable for the attribute value
				let attr = refs[ref] = node.attributes[attrName]
				
				// Allow attribute to be accessed and modified via "state" object
				Object.defineProperty(state, ref, {
					get: _ => attr && attr.value,
					set: v => {
						if(!attr){
							node.setAttribute(attrName, value)
							attr = node.attributes[attrName]
						}else if(v === undefined || v === null){
							node.removeAttribute(attrName, value)
							attr = null
						}else{
							attr.value = v
						}
					}
				})
			}
		}
	}
	
	root.refs = refs
	root.state = state(state)
	
	return root
}
