const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

const TILE_SIZE = 20;
const MAP_SIZE = canvas.width / TILE_SIZE;

start();
async function start() {
	const images = await loadImages();
	const tileMap = generateMap();

	canvas.addEventListener("mousedown", async (ev) => {
		const x = parseInt(ev.clientX / TILE_SIZE);
		const y = parseInt(ev.clientY / TILE_SIZE);

		tileMap[x][y].open = true;

		if (tileMap[x][y].bomb) {
			openAll();
			setTimeout(() => {
				alert("you lose");
			});
		} else {
			updateBorders(x, y);
		}

		await draw();
	});

	await draw();

	async function draw() {
		ctx.fillStyle = "black";
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		for (let x = 0; x < MAP_SIZE; x++) {
			for (let y = 0; y < MAP_SIZE; y++) {
				if (tileMap[x][y].open) {
					if (tileMap[x][y].bomb) {
						ctx.drawImage(
							images.bomb,
							x * TILE_SIZE,
							y * TILE_SIZE,
							TILE_SIZE,
							TILE_SIZE
						);
					} else {
						ctx.drawImage(
							images.empty,
							x * TILE_SIZE,
							y * TILE_SIZE,
							TILE_SIZE,
							TILE_SIZE
						);
						const count = getNumber(x, y);
						if (count) {
							ctx.fillStyle = "red";
							ctx.font = `${TILE_SIZE}px sans-serif`;
							ctx.textAlign = "center";
							ctx.textBaseline = "middle";
							ctx.fillText(
								count,
								x * TILE_SIZE + TILE_SIZE / 2,
								y * TILE_SIZE + TILE_SIZE / 2
							);
						}
					}
				} else {
					ctx.drawImage(images.tile, x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
				}
			}
		}
	}

	function openAll() {
		for (let x in tileMap) {
			for (let y in tileMap[x]) {
				tileMap[x][y].open = true;
			}
		}
	}

	function updateBorders(x, y) {
		updateBorder(x + 1, y);
		updateBorder(x - 1, y);
		updateBorder(x, y + 1);
		updateBorder(x, y - 1);
	}

	function updateBorder(x, y) {
		if (x == -1 || y == -1 || x == MAP_SIZE || y == MAP_SIZE) return;

		const tile = tileMap[x][y];

		if (tile.open) return;

		const count = getNumber(x, y);
		if (count <= 1 && !tile.bomb) {
			tile.open = true;
			updateBorders(x, y);
		}
	}

	function generateMap() {
		/**@type {{open:boolean,bomb:boolean}[][]} */
		const tileMap = [];

		for (let x = 0; x < MAP_SIZE; x++) {
			tileMap[x] = [];
			for (let y = 0; y < MAP_SIZE; y++) {
				let bomb = false;
				if (Math.random() < 0.1) {
					bomb = true;
				}
				tileMap[x][y] = { open: false, bomb };
			}
		}

		return tileMap;
	}

	function getNumber(x_, y_) {
		let count = 0;
		for (let x = x_ - 1; x <= x_ + 1; x++) {
			for (let y = y_ - 1; y <= y_ + 1; y++) {
				if (x == -1 || y == -1 || x == MAP_SIZE || y == MAP_SIZE) continue;

				if (tileMap[x][y].bomb) {
					count++;
				}
			}
		}
		return count;
	}

	async function loadImages() {
		const images = {};
		images.tile = await loadImage("images/tile.png");
		images.empty = await loadImage("images/empty.png");
		images.bomb = await loadImage("images/bomb.png");
		return images;
	}

	function loadImage(path) {
		return new Promise((resolve) => {
			const image = new Image();
			image.src = path;
			image.onload = (ev) => {
				resolve(image);
			};
		});
	}
}
