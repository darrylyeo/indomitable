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
function h(s) {
	if(Array.isArray(s))
		s = String.raw(...arguments)

	const TEMPLATE = document.createElement('template')
	TEMPLATE.innerHTML = s.trim().replace(/>\s+</g, '><')
	
	const {content} = TEMPLATE
	const root = content.childNodes.length === 1 ? content.firstChild : content
	
	const refs = {}
	const state = function(){
		Object.assign(state, ...arguments)
		return state
	}
	for(let node = TREE_WALKER.currentNode = root; node; node = TREE_WALKER.nextNode()){
		if(node.nodeType === Node.TEXT_NODE){
			const {nodeValue} = node
			// console.log(/@(\w+)/.exec(nodeValue).index)
			nodeValue.replace(/@(\w+)/, ({length}, ref, i) => {
			// const match = nodeValue.match(/@(\w+)/)
			// if(match){
			// 	const [{length}, ref, i] = match
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
				Object.defineProperty(state, ref, {
					get: _ => node.nodeValue,
					set: (_ = [new Text]) => {
						console.log(_)
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
						
					// 	while(nodes.length > newNodes.length){
					// 		nodes.pop().remove()
					// 	}
					// }
				})
			// }
			})
		}else for(const {name, value} of [...node.attributes || []]){
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
			}else if(name.includes(':@')){
				node.removeAttribute(name)
				
				const [attrName, ref = attrName] = name.split(':@')
				node.setAttribute(attrName, value)
				
				let attr = refs[ref] = node.attributes[attrName]
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
	root.state = state
	
	return root
}
