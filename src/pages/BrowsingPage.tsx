import {useQuery} from "react-query";
import {useState} from "react";

import "../styles/browsing.sass"

interface Pokemon {
  name: string,
  id: number
}

interface FilterSettings {
  type: string,
  pageSize: number
}

export default function BrowsingPage() {
  const [browseSettings, setBrowseSettings] = useState<FilterSettings>({
    type: "ids",
    pageSize: 20
  })

  function usePokemonFetch() {
    const {data: pokemonByName, refetch: pokemonByNameRefetch} = useQuery<Pokemon[]>("pokemonByName", async function() {
      const fetchUrl = `${import.meta.env.VITE_POKEAPI_URL}/pokemon`
      const response = await fetch(`${fetchUrl}?limit=9999`)

      return (await response.json()).results.map(({name, url}: any) => ({
        name: name[0].toUpperCase() + name.substring(1),
        id: Number(url.substring(fetchUrl.length + 1, url.length - 1))
      })).sort(({name}: Pokemon, {name: otherName}: Pokemon) => name.localeCompare(otherName))
    }, {
      enabled: browseSettings.type === "names"
    })

    const {data: pokemonById, refetch: pokemonByIdRefetch} = useQuery<Pokemon[]>("pokemonByName", async function() {
      const fetchUrl = `${import.meta.env.VITE_POKEAPI_URL}/pokemon`
      const response = await fetch(`${fetchUrl}?offset=0&limit=${browseSettings.pageSize}`)

      return (await response.json()).results.map(({name, url}: any) => ({
        name: name[0].toUpperCase() + name.substring(1),
        id: Number(url.substring(fetchUrl.length + 1, url.length - 1))
      }))
    }, {
      enabled: browseSettings.type === "ids"
    })

    return {
      pokemon: (pokemonByName ?? pokemonById) ?? [],
      refetch: async () => {
        switch (browseSettings.type) {
          case "names":
            await pokemonByNameRefetch()
            break;
          case "ids":
            await pokemonByIdRefetch()
            break;
        }
      }
    }
  }

  const {pokemon, refetch} = usePokemonFetch()

  const applyFilter = async () => await refetch()

  return <div className="browsing-page">
    <details>
      <summary>Filter</summary>
      <div className="pokemon-filter">
        <form onSubmit={async e => {
          e.preventDefault()
          await applyFilter()
        }}>
          <button type="submit">Filter</button>
        </form>
      </div>
    </details>
    <div className="pokemon-list">
      <ul>
        { pokemon && pokemon.map((p: Pokemon) => <li key={p.id}>
          <PokemonListItem pokemon={p} />
        </li>)}
      </ul>
    </div>
  </div>
}

const PokemonListItem = ({pokemon: {name, id}}: {pokemon: Pokemon}) => <div className="pokemon-list-item">
  <p title={id.toString()}>{name}</p>
</div>