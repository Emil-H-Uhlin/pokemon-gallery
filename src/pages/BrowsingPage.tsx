import {useEffect, useMemo, useRef, useState} from "react";

import "../styles/browsing.sass"
import {useParams} from "react-router";
import {PokemonClient, NamedAPIResource as Pokemon} from "pokenode-ts";
import {useQuery} from "react-query";
import {Link, useNavigate} from "react-router-dom";

interface FilterSettings {
  type: "ids" | "names",
  pageSize: number
}

const usePagination = (totalPokemon: number, pokemonPerPage: number,
                       currentPage: number, siblingCount = 2, ) =>
  useMemo(() => {
    const numPages = Math.ceil(totalPokemon / pokemonPerPage)

    if (numPages <= 1) {
      return []
    }

    if (numPages <= 5) {
      return Array.from({length: numPages}, (_, v) => v + 1 === currentPage
        ? <li>{v + 1}</li>
        : <li><Link to={`/browse/${v + 1}`}>{v + 1}</Link></li>)
    }

    const result: JSX.Element[] = []

    let rightPad = Math.max((currentPage - siblingCount - 1) * -1, 0)
    let leftPad = Math.max((currentPage + siblingCount - numPages), 0)

    if (currentPage - siblingCount > 1)
      result.push(<li><Link to={"/browse/1"}>1</Link></li>, <li>...</li>)

    for (let i = Math.max(currentPage - siblingCount, 1) - leftPad; i < currentPage; i++) {
      result.push(<li><Link to={`/browse/${i}`}>{i}</Link></li>)
    }

    result.push(<li>{currentPage}</li>)

    for (let i = currentPage + 1; i <= Math.min(currentPage + siblingCount, numPages) + rightPad; i++) {
      result.push(<li><Link to={`/browse/${i}`}>{i}</Link></li>)
    }

    if (currentPage + siblingCount < numPages)
      result.push(<li>...</li>, <li><Link to={`/browse/${numPages}`}>{numPages}</Link></li>)

    return result
  }, [totalPokemon, pokemonPerPage, currentPage, siblingCount])

export default function BrowsingPage() {
  const navigate = useNavigate()

  const {page: pageParam} = useParams()

  useEffect(() => {
    if (!pageParam || Number(pageParam) <= 0) navigate("/browse/1");
    refetch()
  }, [pageParam])

  const numPokemon = useRef<number>(0)

  const [browseSettings, setBrowseSettings] = useState<FilterSettings>({
    type: "ids",
    pageSize: 25
  })

  const [pokemon, loading, refetch] = (function usePokemonFetch() {
    const {data: pokemon, isLoading, refetch, isRefetching} = useQuery<Pokemon[]>('', async () => {
      const api = new PokemonClient()
      const response = await api.listPokemons((Number(pageParam) - 1) * browseSettings.pageSize, browseSettings.pageSize)

      numPokemon.current = response.count
      return response.results
    })

    return [pokemon, isLoading || isRefetching, () => {
      (async function() {
        await refetch()
      })()
    }]
  })()

  const items = usePagination(numPokemon.current, browseSettings.pageSize, Number(pageParam!))

  async function applyFilter() {

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
          {pokemon?.map((p: Pokemon) => <li key={p.url}>
            <PokemonListItem pokemon={p}/>
          </li>)}
        </ul>
      </div>
      <div className="page-counter">
        <ul>
          {items}
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