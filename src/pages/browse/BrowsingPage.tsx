import {usePagination} from "./pagination";

import {useEffect, useLayoutEffect, useRef, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {useQuery} from "react-query";

import {PokemonClient, NamedAPIResource as Pokemon} from "pokenode-ts";

import "../../styles/browsing.sass"

interface FilterSettings {
  type: "ids" | "names",
  sortAscending: boolean | "none"
  pageSize: number
}

export default function BrowsingPage() {
  const navigate = useNavigate()

  const {page: pageParam} = useParams()

  const [browseSettings, setBrowseSettings] = useState<FilterSettings>({
    type: "names",
    sortAscending: true,
    pageSize: 25
  })

  useEffect(() => {
    if (!pageParam || Number(pageParam) <= 0) navigate("/browse/1");
    if (browseSettings.type === "ids") refetch()
  }, [pageParam, browseSettings])

  const numPokemon = useRef<number>(0)

  const [pokemon, loading, refetch] = (function usePokemonFetch() {
    const {data: pokemon, isLoading, refetch, isRefetching} = useQuery<Pokemon[]>('pokemon', async () => {
      switch (browseSettings.type) {
        case "names": {
          const {results} = await new PokemonClient().listPokemons(0, 9999)
          numPokemon.current = results.length

          return results.sort(({name}: Pokemon, {name: otherName}: Pokemon) =>
            name.localeCompare(otherName) * (browseSettings.sortAscending ? 1: -1))
        }

        case "ids": {
          const response = await new PokemonClient().listPokemons((Number(pageParam) - 1) * browseSettings.pageSize, browseSettings.pageSize)
          numPokemon.current = response.count

          return response.results
        }
      }
    }, {
      refetchOnWindowFocus: false
    })

    return [pokemon, isLoading || isRefetching, () => {
      (async function() {
        await refetch()
      })()
    }]
  })()

  const items = usePagination(numPokemon.current, browseSettings.pageSize, Number(pageParam!))

  async function applyFilter() {
    await refetch()
  }

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
    { !loading && <>
      <div className="pokemon-list">
        <ul>
          { (() => {
            switch (browseSettings.type) {
              case "names":
                return pokemon?.slice(browseSettings.pageSize * (Number(pageParam) - 1), Math.min(browseSettings.pageSize * Number(pageParam), numPokemon.current - 1))
                  .map((p: Pokemon) => <li key={p.url}>
                    <PokemonListItem pokemon={p}/>
                  </li>)
              case "ids":
                return pokemon?.map((p: Pokemon) => <li key={p.url}>
                  <PokemonListItem pokemon={p}/>
                </li>)
            }
          })()}
        </ul>
      </div>
      <div className="page-counter">
        <ul>
          {Array.from(items, (it, i) => ({ ...it, key: i})) /* prevent console from complaining about unique keys */ }
        </ul>
      </div>
    </>}
  </div>
}

const PokemonListItem = ({pokemon: {name, url}}: {pokemon: Pokemon}) => <div className="pokemon-list-item">
  <p title={url.substring(url.lastIndexOf("/", url.length - 2) + 1, url.length - 1)}>
    {name}
  </p>
</div>