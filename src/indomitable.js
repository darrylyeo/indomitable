// 2010-01-02

window.domdiff=(()=>{function r(r,e,n,o,f,i,c,u,l){for(var s,h=new Map,d=f,g=0,v=r.length;s=r[g],v>g;g++)switch(s){case 0:u++,d++;break;case 1:h.set(c[u],1),a(e,n,c,u++,u,i>d?e(o[d],1):l);break;case-1:d++}for(i=0,u=r.length;c=r[i],u>i;i++)switch(c){case 0:f++;break;case-1:h.has(o[f])?f++:t(e,n,o,f++,f)}}function e(r,e,n,t,o,f,i){const a=[];let c,u=0;length=n+f;r:for(;u<=length;u++){if(u>50)return null;for(var l=u-1,s=u?a[u-1]:[0,0],h=a[u]=[],d=-u;u>=d;d+=2){var g=d===-u||d!==u&&s[l+d-1]<s[l+d+1]?s[l+d+1]:s[l+d-1]+1;for(c=g-d;n>g&&f>c&&i(r[e+g],t[o+c]);)g++,c++;if(g===n&&c===f)break r;h[u+d]=g}}for(f=(n=Array(u/2+length/2)).length-1,u=a.length-1;u>=0;u--){for(;g>0&&c>0&&i(r[e+g-1],t[o+c-1]);)n[f--]=0,g--,c--;if(!u)break;l=u-1,s=u?a[u-1]:[0,0],(h=g-c)===-u||h!==u&&s[l+h-1]<s[l+h+1]?(c--,n[f--]=1):(g--,n[f--]=-1)}return n}function n(r,e,n,t,o,f,i,a){const c=t>a?a:t;let u=Array(c),l=Array(c+1).fill(n);l[0]=-1;for(var s=new Map,h=e;n>h;h++)s.set(r[h],h);for(r=f;i>r;r++)if(null!=(h=s.get(o[r]))){for(var d=1,g=c+1;g>d;){const r=(d+g)/2|0;h<l[r]?g=r:d=r+1}d>-1&&(l[d]=h,u[d]={a:r,b:h,c:u[d-1]})}for(o=c,--n;l[o]>n;)--o;for(t=t+a-o,a=Array(t),--i,u=u[o];u;u=u.c){for(l=(o=u).a,o=o.b;i>l;)a[--t]=1,--i;for(;n>o;)a[--t]=-1,--n;a[--t]=0,--i,--n}for(;i>=f;)a[--t]=1,--i;for(;n>=e;)a[--t]=-1,--n;return a}function t(r,e,n,t,o){2>o-t?e.removeChild(r(n[t],-1)):((e=e.ownerDocument.createRange()).setStartBefore(r(n[t],-1)),e.setEndAfter(r(n[o-1],-1)),e.deleteContents())}function o(r,e,n,t,o){return t>n?r(e[n],0):n>0?r(e[n-1],-0).nextSibling:o}function f(r,e,n,t,o,f){for(;n>e&&f(r[e],t[o-1]);)e++,o--;return 0===o}function i(r,e,n,t,o,f,i){const a=f-o;if(a>0)for(;n-e>=a;){for(var c=e,u=o;n>c&&f>u&&i(r[c],t[u]);)c++,u++;if(u===f)return e;e=c+1}return-1}function a(r,e,n,t,o,f){if(2>o-t)e.insertBefore(r(n[t],1),f);else{for(var i=e.ownerDocument.createDocumentFragment();o>t;)i.appendChild(r(n[t++],1));e.insertBefore(i,f)}}return(c,u,l,s)=>{let h=s=void 0===s?{}:s;const d=void 0===h.compare?(r,e)=>r==e:h.compare;h=void 0===h.node?r=>r:h.node;s=null==s.before?null:h(s.before,0);for(var g=u.length,v=0,b=g,m=0,w=l.length;b>v&&w>m&&d(u[v],l[m]);)v++,m++;for(;b>v&&w>m&&d(u[b-1],l[w-1]);)b--,w--;const p=b-v;const k=w-m;if(0==p&&0==k)return l;if(0==p&&w>m)return a(h,c,l,m,w,o(h,u,v,g,s)),l;if(0==k&&b>v)return t(h,c,u,v,b),l;if(k>p){var A=i(l,m,w,u,v,b,d);if(A>-1)return a(h,c,l,m,A,h(u[v],0)),a(h,c,l,A+p,w,o(h,u,b,g,s)),l}else if(p>k&&(A=i(u,v,b,l,m,w,d))>-1)return t(h,c,u,v,A),t(h,c,u,A+k,b),l;if(2>p||2>k)return a(h,c,l,m,w,h(u[v],0)),t(h,c,u,v,b),l;if(p===k&&f(u,v,b,l,w,d))return a(h,c,l,m,w,o(h,u,b,g,s)),l;r(e(u,v,p,l,m,k,d)||n(u,v,b,p,l,m,w,k),h,c,u,v,g,l,m,s);return l}})();


const TREE_WALKER = document.createTreeWalker(document)

const h = function(statics, ...interpolations){
	// Stores references to named nodes or attributes
	const refs = {}
	
	const html = statics.raw
		? String.raw(statics, ...interpolations.map((a, i) => {
			if(a instanceof Node){
				refs[i] = a
				return `@${i}`
			}
			return a
		}))
		: statics
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
				const ref = (_ref || attrName).replace(/-([a-z])/g, (_, $1) => $1.toUpperCase())
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
					
					
					// Implementation using domdiff (https://github.com/WebReflection/domdiff by Andrea Giammarchi)
					if(false){
						nodes = domdiff(nodes[0].parentElement, nodes, newNodes)
					}

					//*
					
					// Implementation using regular DOM methods
					else if(true){
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
					}
					
					// Using Range
					else if(true){
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
		
		// Bound attributes - Allow attribute value to be accessed and modified via "state" object
		else{
			const {ownerElement} = node
			const attr = node
			const attrName = node.name
			let value = ownerElement.getAttribute(attrName)
			
			
			// Style
			if(attrName === 'style') Object.defineProperty(state, ref, {
				get: _ => attr && attr.value,
				set: v => {
					// if(value != v){
						ownerElement[attrName] = value = v
					// }
				}
			})
			
			// Property attributes
			else if(attrName in ownerElement) Object.defineProperty(state, ref, {
				get: _ => attr && attr.value,
				set: v => {
					if(value != v){
						ownerElement[attrName] = value = v
					}
				}
			})
			
			// Regular attribute
			else Object.defineProperty(state, ref, {
				get: _ => attr && attr.value,
				set: v => {
					if(!attr){
						ownerElement.setAttribute(attrName, v)
						attr = ownerElement.attributes[attrName]
					}else if(v === undefined || v === null){
						ownerElement.removeAttribute(attrName)
						attr = null
					}else{
						attr.value = v
					}
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
