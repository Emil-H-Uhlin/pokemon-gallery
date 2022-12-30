import {usePagination} from "./pagination";

import {useCallback, useEffect, useRef, useState} from "react";
import {Link, useNavigate, useParams} from "react-router-dom";
import {useQuery} from "react-query";

import {PokemonClient, NamedAPIResource} from "pokenode-ts";

import "../../styles/browsing.sass"

enum FilterType {
  "ids", "names"
}

interface PokemonResource extends NamedAPIResource {
  id: number
}

interface FilterSettings {
  type: FilterType,
  sortAscending: boolean | "none"
  pageSize: number
}

function getPokemonId({url}: NamedAPIResource): number {
  return Number(url.substring(url.lastIndexOf("/", url.length - 2) + 1, url.length - 1))
}

export default function BrowsingPage() {
  const navigate = useNavigate()

  const {page: pageParam} = useParams()

  const [browseSettings, setBrowseSettings] = useState<FilterSettings>({
    type: FilterType.ids,
    sortAscending: true,
    pageSize: 10
  })

  useEffect(() => {
    if (!pageParam || Number(pageParam) <= 0) navigate("/browse/1");
  }, [pageParam])

  const numPokemon = useRef<number>(0)

  const [pokemon, loading, refetch] = (function usePokemonFetch() {
    const {data: pokemon, isLoading, refetch, isRefetching} = useQuery<PokemonResource[]>('pokemon', async () => {
      switch (browseSettings.type) {
        case FilterType.names:
        {
          const {results} = await new PokemonClient().listPokemons(0, 9999)
          numPokemon.current = results.length

          return results
            .sort(({name}: NamedAPIResource, {name: otherName}: NamedAPIResource) =>
              name.localeCompare(otherName) * (browseSettings.sortAscending ? 1 : -1))
            .map(it => ({
                ...it,
                id: getPokemonId(it)
              })
            )
        }

        case FilterType.ids: {
          const response = await new PokemonClient().listPokemons((Number(pageParam) - 1) * browseSettings.pageSize, browseSettings.pageSize)
          numPokemon.current = response.count

          return response.results.map(it => ({
              ...it,
              id: getPokemonId(it)
            })
          )
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

  const updatePokemon = useCallback(refetch, [pageParam, browseSettings])
  useEffect(updatePokemon, [updatePokemon])

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
          <select onChange={e => setBrowseSettings(prev => ({...prev, type: e.target.selectedIndex}))}>
            {Array.from(Object.entries(FilterType), ([, i], k) => Number.isFinite(i) ? null : <option key={k}>{i}</option>)}
          </select>
          <button type="submit">Filter</button>
        </form>
      </div>
    </details>
    { !loading && <>
      <div className="pokemon-list">
        <ul>
          { (() => {
            switch (browseSettings.type) {
              case FilterType.names:
                return pokemon?.slice(browseSettings.pageSize * (Number(pageParam) - 1), Math.min(browseSettings.pageSize * Number(pageParam), numPokemon.current - 1))
                  .map((p: PokemonResource) => <li key={p.url}>
                    <PokemonListItem pokemon={p}/>
                  </li>)
              case FilterType.ids:
                return pokemon?.map((p: PokemonResource) => <li key={p.url}>
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

const PokemonListItem = ({pokemon: {name, id}}: {pokemon: PokemonResource}) => <div className="pokemon-list-item" title={`${id}`}>
  <h2><Link to={`/browse/pokemon/${name}`}>{name[0].toUpperCase() + name.substring(1)}</Link></h2>
  <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`} onError={({currentTarget}) => {
    currentTarget.src = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png"
  }} />
</div>