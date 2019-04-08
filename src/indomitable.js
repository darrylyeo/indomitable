// 2018-12-17 to 18

const TREE_WALKER = document.createTreeWalker(document)

const h = function(statics, ...interpolations){
	// Stores references to named nodes or attributes
	const refs = {}
	
	const html = String.raw(statics, ...interpolations.map((a, i) => {
		if(a instanceof Node){
			refs[i] = a
			return `@${i}`
		}
		return a
	}))
	// console.log(html)

	// Make template
	const TEMPLATE = document.createElement('template')
	TEMPLATE.innerHTML = html.trim().replace(/>\s+</g, '><')
	
	// Extract HTML tree from template
	const {content} = TEMPLATE
	const root = content.childNodes.length === 1 ? content.firstChild : content
	
	// Iterate all nodes in the tree and find @references
	if(html.includes('@')) for(let node = TREE_WALKER.currentNode = root; node; node = TREE_WALKER.nextNode()){
		// Replace @references in the text with slot references
		if(node.nodeType === Node.TEXT_NODE){
			const {nodeValue} = node

			// When an @reference is found
			nodeValue.replace(/@(\w+)/, ({length}, ref, i) => {
				// Split off the text node
				if(i > 0) node = node.splitText(i)
				if(i + length < nodeValue.length) node.splitText(length)
				node.nodeValue = ''
				
				// Save the reference
				refs[ref] = node
			})
		}
		
		// Iterate element attributes
		else for(const {name, value} of [...node.attributes || []]){
			// Attributes starting with "@" denote an element reference
			if(name[0] === '@'){
				node.removeAttribute(name)
				const ref = name.slice(1)
				refs[ref] = node
			}
			
			// Attributes with ":@" denote an attribute reference
			else if(name.includes(':@')){
				node.removeAttribute(name)
				
				// Parse attribute name and reference name
				const [attrName, _ref] = name.split(':@')
				const ref = _ref || attrName
				node.setAttribute(attrName, value)
				
				// Keep reference to the attribute node
				refs[ref] = node.attributes[attrName]
			}
		}
	}
	
	
	// Create a "state" object with getters and setters to update the references
	// The state object can be called as a function to assign argument properties to itself
	// const state = new Proxy({}, {
	// 	apply(state, _this, args) {
	// 		Object.assign(state, ...args)
	// 		return state
	// 	}
	// })
	
	// Create a "state" object with getters and setters to update the references
	const state = {}
	
	for(const ref in refs){
		const node = refs[ref]
		
		// Slots - Allow contents of slot to be accessed and modified via "state" object
		// Slot positions are tied to the parent node
		if(node.nodeType === Node.TEXT_NODE){
			// The nodes occupying the slot. The first node defines the position of the slot within its parent.
			// An empty slot has an empty text node as its first node
			let nodes = [node]
			
			// Keep a range reference to the nodes as well
			const range = new Range() // document.createRange()
			range.selectNode(node)

			// When a slot reference is updated, replace the nodes
			// Note: assumes the existing nodes haven't changed position in the DOM
			Object.defineProperty(state, ref, {
				get: _ => node.nodeValue,
				
				// Intent: ambiguous
				// Accepts text, node, document fragment, array of any of those
				set: (arg = []) => {
					// Collapse and filter arguments
					const newNodes = [arg].flat().flatMap(v => v instanceof DocumentFragment ? [...v.childNodes] : v)
						.filter(v => v !== undefined && v !== null)
					
					// If empty, create empty text node to hold position
					if(!newNodes.length)
						newNodes.push(new Text)
					
					// console.log('Setting', ref, newNodes, 'existing:', nodes)

					//*
					
					// Using regular DOM methods
					
					// Determine parent element
					const parent = nodes[0].parentElement
					// console.log('first', nodes[0], 'parent', parent)

					let i = 0, node
					for(node of newNodes){
						const currentNode = nodes[i]
						
						// If primitive, convert to text node or replace value of existing text node
						if(!(node instanceof Node)){
							if(currentNode && currentNode.nodeType === Node.TEXT_NODE){
								currentNode.nodeValue = node
								continue
							}
							node = new Text(node) // document.createTextNode
						}
						
						// Append or insert the node
						if(!currentNode){
							nodes.push(node)
							parent.appendChild(node)
						}else if(currentNode !== node){
							nodes.splice(i, 0, node)
							parent.insertBefore(node, currentNode)
						}
						i++
					}
					
					// Remove nodes that don't belong
					// for(let i = nodes.length - newNodes.length; i > 0; i--){
					// 	// console.log('removing', node, node.nextSibling)
					// 	node.nextSibling.remove()
					// }
					const set = new Set(newNodes)
					for(let i = nodes.length - newNodes.length; i > 0; i--){
						const oldNode = nodes.pop()
						if(!set.has(oldNode)) oldNode.remove() // make this more efficient
					}
					
					nodes.length = newNodes.length
					
					/*/
					
					// Using Range
					
					range.setStartBefore(nodes[0])
					range.setEndAfter(nodes[nodes.length - 1])
					// console.log('range', range, range.cloneContents())
					
					let i = 0
					for(let node of newNodes){
						const existingNode = nodes[i]
						
						// If primitive, convert to text node or replace value of existing text node
						if(!(node instanceof Node)){
							if(existingNode && existingNode.nodeType === Node.TEXT_NODE){
								//console.log('Replacing text', existingNode, node)
								existingNode.nodeValue = node
								range.setStartAfter(existingNode)
								continue
							}
							node = new Text(node) // document.createTextNode
						}
						
						// Insert the node
						if(node !== existingNode){
							if(existingNode){
								//console.assert(!range.collapsed)
								nodes.splice(i, 0, node)
							}else{
								//console.assert(range.collapsed)
								nodes.push(node)
							}
							//console.log('Inserting', existingNode, node)
							range.insertNode(node)
						}//else console.log('No action', existingNode, node)
						range.setStartAfter(node)
						i++
					}
					
					if(!range.collapsed){
						//console.log('Removing', ...range.cloneContents().childNodes)
						range.deleteContents()
						
						nodes.length = newNodes.length
						// nodes = newNodes
					}
					
					//*/
					
					
					//console.log('nodes:', nodes)
					
					
					// Random tests
					/*
					// const parent = range.startContainer
					// const firstNode = range.startContainer.childNodes[range.startOffset]
					// const lastNode = range.endContainer.childNodes[range.endOffset]
					// console.assert(range.startContainer === range.endContainer, 'Slot parent inconsistent')
					// console.assert(range.endOffset - range.startOffset === nodes.length, 'Slot contents shifted', range.startOffset, range.endOffset, nodes.length)
					
					if(nodes.length > newNodes.length){
						console.log('Before delete:', nodes, newNodes)
						const range = new Range() // document.createRange()
						range.setStartAfter(node)
						range.setEnd(node, nodes.length - newNodes.length)
						console.log('removing', range.cloneContents())
						range.deleteContents()
					
						nodes.length = newNodes.length
					}*/
				}
			})
		}
	}
	
	if(interpolations) interpolations.forEach((a, i) =>
		state[i] = a
	)
	
	root.refs = refs
	root.state = new Proxy(function(){
		Object.assign(state, ...arguments)
		return state
	}, {
		get: (target, ref) => Reflect.get(state, ref),
		set: (target, ref, value) => Reflect.set(state, ref, value),
		has: (target, ref) => Reflect.has(state, ref)
	})
	
	return root
}
