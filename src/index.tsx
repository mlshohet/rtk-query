import React from 'react';
import ReactDOM from 'react-dom/client';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';

interface PokemonListing {
  count: number;
  results: Array<{
    name: string;
    url: string;
  }>;
}

interface PokemonDetailData {
  id: number;
  name: string;
  height: number;
  weight: number;
  types: Array<{
    slot: number;
    type: {
      name: string;
      url: string;
    };
  }>;
  sprites: {
    front_default: string;
  };
}

const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://pokeapi.co/api/v2/',
  }),
  endpoints: (build) => ({
    pokemonList: build.query<PokemonListing, void>({
      query() {
        return 'pokemon?limit=9';
      },
    }),
    pokemonDetail: build.query<PokemonDetailData, { name: string }>({
      query({ name }) {
        return `pokemon/${name}/`;
      },
    }),
  }),
});

const { usePokemonListQuery, usePokemonDetailQuery } = api;

const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);

function App() {
  const [selectedPokemon, selectPokemon] = React.useState<string | undefined>(
    undefined
  );

  return (
    <>
      <header>
        <h1>My Pokedex</h1>
      </header>
      <main>
        {selectedPokemon ? (
          <>
            <PokemonDetails pokemonName={selectedPokemon} />
            <button onClick={() => selectPokemon(undefined)}>back</button>
          </>
        ) : (
          <PokemonList onPokemonSelected={selectPokemon} />
        )}
      </main>
    </>
  );
}

function PokemonList({
  onPokemonSelected,
}: {
  onPokemonSelected: (name: string) => void;
}) {
  const { data, isLoading, isError, isUninitialized } = usePokemonListQuery();

  if (isLoading || isUninitialized) {
    return 'Loading...';
  }

  if (isError) {
    return 'Something went wrong.';
  }

  return (
    <article>
      <h2>Overview</h2>
      <ol start={1}>
        {data.results.map((pokemon) => (
          <li key={pokemon.name}>
            <button onClick={() => onPokemonSelected(pokemon.name)}>
              {pokemon.name}
            </button>
          </li>
        ))}
      </ol>
    </article>
  );
}

const listFormatter = new Intl.ListFormat('en-GB', {
  style: 'short',
  type: 'conjunction',
});

function PokemonDetails({ pokemonName }: { pokemonName: string }) {
  const { data, isLoading, isError, isUninitialized } = usePokemonDetailQuery({
    name: pokemonName,
  });

  if (isLoading || isUninitialized) {
    return 'Loading...';
  }

  if (isError) {
    return 'Something went wrong.';
  }

  return (
    <article>
      <h2>{data.name}</h2>
      <img src={data.sprites.front_default} alt={data.name} />
      <ul>
        <li>id: {data.id}</li>
        <li>height: {data.height}</li>
        <li>weight: {data.weight}</li>
        <li>
          types:
          {listFormatter.format(data.types.map((item) => item.type.name))}
        </li>
      </ul>
    </article>
  );
}
