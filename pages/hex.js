// 创建一个尖顶六边形
function drawPointedHexagon(ctx, centerX, centerY, size, color = '#3498db', text = '') {
    // 开始一个新的绘制路径
    ctx.beginPath();
    
    // 计算六边形的六个顶点
    // 我们将从顶部顶点开始，顺时针绘制
    for (let i = 0; i < 6; i++) {
        // 计算每个顶点的角度 (从顶部开始，每60度一个点)
        const angle = (i * Math.PI / 3) - Math.PI / 2;
        
        // 计算顶点坐标
        const x = centerX + size * Math.cos(angle);
        const y = centerY + size * Math.sin(angle);
        
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    
    // 闭合路径
    ctx.closePath();
    
    // 设置填充颜色
    ctx.fillStyle = color;
    ctx.fill();
    
    // 设置边框
    ctx.strokeStyle = '#2980b9';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 添加文本
    if (text) {
        ctx.fillStyle = '#000000';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, centerX, centerY);
    }
}

let OffsetList = []
let IdByOffset = {}

// 绘制蜂巢状的六边形网格
function drawHexGrid(ctx, startX, startY, hexSize) {
	ctx.save()
	//ctx.translate(startX, startY);
    // 计算六边形之间的间距
    const horizontalSpacing = hexSize * Math.sqrt(3); // 水平间距
    const verticalSpacing = hexSize * 1.5; // 垂直间距
    const rows = 12;
    
	let row = 1, col = 5
	if (OffsetList.length == 0) {
		for (row = 1; row <= rows; row++) {
			for (let j = 1; j <= col; j++) {
				OffsetList.push([j, row])
			}
			if (col == 5) {
				col = 6
			} else {
				col = 5;
			}
		}
		for (let idx = 0; idx < OffsetList.length; idx++) {
			const key = `${OffsetList[idx][0]}_${OffsetList[idx][1]}`
			IdByOffset[key] = idx + 1
		}
	}

	
	//console.log(OffsetList, IdByOffset)
	for (let i = 1; i <= OffsetList.length; i++) {
		const row = OffsetList[i-1][1]
		const col = OffsetList[i-1][0]
			// 奇数行需要向右偏移半个六边形的宽度
			const rowOffset = row % 2 === 0 ? 0 : horizontalSpacing / 2;
			const centerX = startX + col * horizontalSpacing + rowOffset;
			const centerY = startY + row * verticalSpacing;
			
			// 使用随机颜色
			const hue = 180;
			const color = `hsl(${hue}, 70%, 60%)`;
			
			// 创建坐标文本
			const text = ""//`${col},${row}\n${IdByOffset[`${col}_${row}`]}`;
			
			drawPointedHexagon(ctx, centerX, centerY, hexSize, color, text);
			wx.globalData.hexList.push({
				id: IdByOffset[`${col}_${row}`],
				centerX: centerX,
				centerY: centerY,
				hexSize: hexSize,
				color: color,
			})
	}

	 
	let path = FindShortestPath(3, 63)
	//加入开始节点
	path.unshift(3)
	//加入结束节点
	path.push(63)
	//console.log("path", path)
	for (let i = 0; i < path.length; i++) {
		const offset = cubeToOffset(idToCube(path[i]))
		const row = offset.col
		const col = offset.row
		// 奇数行需要向右偏移半个六边形的宽度
		const rowOffset = row % 2 === 0 ? 0 : horizontalSpacing / 2;
		const centerX = startX + col * horizontalSpacing + rowOffset;
		const centerY = startY + row * verticalSpacing;
		
		// 使用随机颜色
		let hue = 1;
		if (i == 0 || i == path.length - 1) {
			hue = 60;
		} else {
			hue = 1;
		}
		const color = `hsl(${hue}, 70%, 60%)`;
		
		// 创建坐标文本
		const text = "";//`${col},${row}\n${IdByOffset[`${col}_${row}`]}`;
		
		drawPointedHexagon(ctx, centerX, centerY, hexSize, color, text);
	}
	ctx.restore()
}

class Cube {
	constructor(x, y, z) {
		this.x = x;
		this.y = y;
		this.z = z;
	}
}
class Offset {
	constructor(col, row) {
		this.row = col;
		this.col = row;
	}
}

function offsetToCube(offset) {
	
	const x = offset.row + (offset.col+(offset.col&1))/2
	const z = -offset.col
	const y = -x - z
	//console.log(111,offset, z)
	return new Cube(x, y, z)
}
/*func offsetToCube(offset Offset) Cube {
	x := offset.Row + (offset.Col+(offset.Col&1))/2
	z := -offset.Col
	y := -x - z

	return Cube{x, y, z}
}*/

function cubeToOffset(cube) {
	const row = cube.x + (cube.z-(cube.z&1))/2
	const col = -cube.z

	return new Offset(row, col)
}
/**
 * func cubeToOffset(cube Cube) Offset {
	row := cube.X + (cube.Z-(cube.Z&1))/2
	col := -cube.Z

	return Offset{
		Col: col,
		Row: row,
	}
}

 */

function IdDistance(from, to) {
	const cube1 = offsetToCube(from)
	const cube2 = offsetToCube(to)

	const x = Math.abs(cube1.x - cube2.x)
	const y = Math.abs(cube1.y - cube2.y)
	const z = Math.abs(cube1.z - cube2.z)
	return (x+y+z) / 2
}

function idToOffset(id) {
	return new Offset(OffsetList[id-1][0], OffsetList[id-1][1])
}

function offsetToId(offset) {
	const key = `${offset.row}_${offset.col}`
	if (key in IdByOffset) {
		return IdByOffset[key]
	}

	return 0
}
function idToCube(id) {
	return offsetToCube(idToOffset(id))
}

function cubeToId(cube) {
	return offsetToId(cubeToOffset(cube))
}

function FindShortestPath(from, to) {
	if (wx.globalData.path.length > 0) {
		return wx.globalData.path
	}
	const fromCube = idToCube(from)
	const toCube = idToCube(to)
	//console.log("fromoffset", cubeToOffset(fromCube))
	//const from1 = cubeToId(fromCube)
	//console.log("from1", from1)


	let left = toCube.y - fromCube.y
	let right = toCube.x - fromCube.x

	let currentCube = fromCube
	const allStep = left + right
	//console.log(fromCube, idToOffset(from), allStep)
	console.log(left, right)
	for (let i = 0; i < allStep; i++) {
		if (right > 0 && left > 0) {
			if (Math.random() < 0.5) {
				// 左边
				const newCube = currentCube
				newCube.z--
				newCube.y++
				const newId = cubeToId(newCube)
				//console.log("newId", newId)
				if (newId < 1 || 66 < newId) { // 超过左边界，强制右转
					currentCube.z--
					currentCube.x++
					right--
				} else {
					currentCube = newCube
					left--
				}
			} else {
				// 右边
				const newCube = currentCube
				newCube.z--
				newCube.x++
				const newId = cubeToId(newCube)
				//console.log("newId", newId)
				if (newId < 1 || 66 < newId) { // 超过右边界，强制左转
					currentCube.z--
					currentCube.y++
					left--
				} else {
					currentCube = newCube
					right--
				}
			}
		} else if (left > 0) {
			// 左边
			left--
			currentCube.z--
			currentCube.y++
		} else if (right > 0) {
			// 右边
			right--
			currentCube.z--
			currentCube.x++
		}
		//console.log(currentCube)
		//console.log(cubeToOffset(currentCube))
		wx.globalData.path.push(cubeToId(currentCube))
	}


	//检测path 中是否包含0
	if (wx.globalData.path.includes(0)) {
		//console.log("path.length", path.length, allStep, path)
		wx.globalData.path = FindShortestPath(from, to)
	}
	
	return wx.globalData.path
}

// 导出函数供其他文件使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        drawPointedHexagon,
        drawHexGrid
    };
}
