
export function extractVarFromJs(jsText, varName) {
	const jsonText = jsText.replace(`var ${varName}=`, '');
	return JSON.parse(jsonText)
}

export function listToTDesignTree(arr) {
	let m = new Map()
	let roots = [];
	arr.forEach((item) => {
		m.set(item.id, item);
		item.children = [];
	});
	arr.forEach((item) => {
		if (item.pId === "" || !m.has(item.pId)) {
			roots.push(item);
		} else {
			let parent = m.get(item.pId);
			parent.children.push(item);
		}
	})
	return roots;
}
