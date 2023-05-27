const form = document.querySelector('#add-pokemon');
const addField = document.querySelector('#add-field');
const addName = document.querySelector('#add-name');
const pokemonOutput = document.querySelector('#pokemon-output');
const randomButton = document.querySelector('#randomize');

const pokemonList = loadLocalStorage();

const cache = loadCache();

if (pokemonList.length > 1) {
	renderPokemonList();
}

// function fillDex() {
// 	for (let i = 1; i <= 420; i++) {
// 		pokemonList.push(new Pokemon(i, i));
// 	}
// 	renderPokemonList();
// 	saveLocalStorage();
// }

function randomPokemonFusion() {
	let randomPokemon1 = Math.floor(Math.random() * 420);
	let randomPokemon2 = Math.floor(Math.random() * 420);
	pokemonList.push(new Pokemon(randomPokemon1, randomPokemon1));
	pokemonList.push(new Pokemon(randomPokemon2, randomPokemon2));
	pokemonOutput.innerHTML = '';
}

randomButton.addEventListener('click', () => {
	randomPokemonFusion();
	renderPokemonList();
});

class Pokemon {
	constructor(name, id) {
		this.name = name;
		this.id = id;
	}

	remove = () => {
		const regexPattern = new RegExp(`^${this.id}-`);
		const keysToDelete = Object.keys(cache).filter((key) =>
			regexPattern.test(key)
		);
		keysToDelete.forEach((key) => {
			delete cache[key];
			console.log(`Removed '${key}' from cache.`);
		});
		pokemonList.splice(pokemonList.indexOf(this), 1);
		saveLocalStorage();
		renderPokemonList();
	};
}

async function findFusion(pokemon1, pokemon2) {
	const cacheKey = `${pokemon1}-${pokemon2}`;

	if (cache[cacheKey]) {
		console.log('Cache hit');
		return cache[cacheKey];
	}

	const imgList = [];
	const urlBase = `./CustomBattlers/indexed/${pokemon1}`;
	const extensions = [
		`/${pokemon1}.${pokemon2}.png`,
		`/${pokemon1}.${pokemon2}a.png`,
		`/${pokemon1}.${pokemon2}b.png`,
		`/${pokemon1}.${pokemon2}c.png`,
		`/${pokemon1}.${pokemon2}d.png`,
		`/${pokemon1}.${pokemon2}e.png`,
		`/${pokemon1}.${pokemon2}f.png`,
		`/${pokemon1}.${pokemon2}g.png`,
		`/${pokemon1}.${pokemon2}h.png`,
		`/${pokemon1}.${pokemon2}i.png`,
		`/${pokemon1}.${pokemon2}j.png`,
		`/${pokemon1}.${pokemon2}k.png`,
		`/${pokemon1}.${pokemon2}l.png`,
		`/${pokemon1}.${pokemon2}m.png`,
		`/${pokemon1}.${pokemon2}n.png`,
		`/${pokemon1}.${pokemon2}o.png`,
		`/${pokemon1}.${pokemon2}p.png`,
		`/${pokemon1}.${pokemon2}q.png`,
		`/${pokemon1}.${pokemon2}r.png`,
		`/${pokemon1}.${pokemon2}s.png`,
		`/${pokemon1}.${pokemon2}t.png`,
		`/${pokemon1}.${pokemon2}u.png`,
		`/${pokemon1}.${pokemon2}v.png`,
		`/${pokemon1}.${pokemon2}w.png`,
		`/${pokemon1}.${pokemon2}x.png`,
		`/${pokemon1}.${pokemon2}y.png`,
		`/${pokemon1}.${pokemon2}z.png`,
	];

	for (const extension of extensions) {
		const img = urlBase + extension;
		try {
			const response = await fetch(img);
			if (response.ok) {
				console.log(img);
				imgList.push(img);
			} else if (
				extension !== `/${pokemon1}.${pokemon2}.png` ||
				extension !== `/${pokemon1}.${pokemon2}a.png` ||
				extension !== `/${pokemon1}.${pokemon2}b.png`
			) {
				break;
			}
		} catch (err) {
			console.log('No match found');
		}
	}

	cache[cacheKey] = imgList;

	return imgList;
}

form.addEventListener('submit', (e) => {
	e.preventDefault();

	pokemonList.push(new Pokemon(addName.value, addField.value));
	addField.value = '';
	addName.value = '';
	console.log(pokemonList);
	if (pokemonList.length > 1) {
		renderPokemonList();
	}
	saveLocalStorage();
});

function saveLocalStorage() {
	let storedList = [];
	pokemonList.forEach((pokemon) => {
		storedList.push({
			name: pokemon.name,
			id: pokemon.id,
			remove: pokemon.remove.toString(),
		});
	});
	localStorage.setItem('pokemonList', JSON.stringify(storedList));
	localStorage.setItem('cache', JSON.stringify(cache));
}

function loadLocalStorage() {
	const pokemonList = JSON.parse(localStorage.getItem('pokemonList'));
	console.log(pokemonList);
	if (pokemonList !== null) {
		pokemonList.forEach((pokemon) => {
			let remove = new Function(`return ${pokemon.remove}`)();
			pokemon.remove = remove;
		});
		return pokemonList;
	} else {
		return [];
	}
}

function loadCache() {
	const cache = JSON.parse(localStorage.getItem('cache'));
	if (cache !== null) {
		return cache;
	} else {
		return {};
	}
}

// Render pokemon list
async function renderPokemonList() {
	// Clear pokemon output
	pokemonOutput.innerHTML = '';
	for (let i = 0; i < pokemonList.length; i++) {
		// Create container
		const container = createHeader(pokemonList[i]);
		for (let j = 0; j < pokemonList.length; j++) {
			if (pokemonList[i].id === pokemonList[j].id) continue;
			let fusion = await findFusion(pokemonList[i].id, pokemonList[j].id).catch(
				(err) => {
					console.log(err);
				}
			);
			if (fusion.length > 0) {
				fusion.forEach((fusion) => {
					const card = createPokemonCard(
						fusion,
						pokemonList[i].name,
						pokemonList[j].name
					);

					container.appendChild(card);
					pokemonOutput.appendChild(container);
				});
			}
		}
	}
}

// Create header
function createHeader(pokemon) {
	// Create header container
	const container = document.createElement('div');
	container.classList.add('container');
	// Create header title
	const h1 = document.createElement('h1');
	h1.textContent = `${pokemon.name}`;
	h1.classList.add('pokemon-title');
	// Create remove button
	const removeButton = createRemoveButton(pokemon);
	// Create dropdown button
	const dropdownButton = createDropdownButton(container);
	// Append elements
	h1.appendChild(removeButton);
	h1.appendChild(dropdownButton);
	pokemonOutput.appendChild(h1);
	return container;
}

// Create remove button
function createRemoveButton(pokemon) {
	const removeButton = document.createElement('button');
	removeButton.textContent = 'X';
	removeButton.classList.add('remove-button');
	removeButton.addEventListener('click', () => {
		pokemon.remove();
		saveLocalStorage();
	});
	return removeButton;
}

// Create dropdown button
function createDropdownButton(container) {
	const dropdownButton = document.createElement('button');
	dropdownButton.textContent = 'V';
	dropdownButton.classList.add('dropdown-button');
	dropdownButton.addEventListener('click', () => {
		container.classList.toggle('active');
		if (dropdownButton.textContent === '^') {
			dropdownButton.textContent = 'V';
		} else {
			dropdownButton.textContent = '^';
		}
	});
	return dropdownButton;
}

function createPokemonCard(fusion, pokemon1, pokemon2) {
	const card = document.createElement('div');
	card.classList.add('card');

	const img = document.createElement('img');
	img.src = fusion;

	const h2 = document.createElement('h2');
	h2.textContent = `${pokemon1} / ${pokemon2}`;

	card.appendChild(h2);
	card.appendChild(img);
	return card;
}

// fillDex();

//history functionality store previous 10 searches