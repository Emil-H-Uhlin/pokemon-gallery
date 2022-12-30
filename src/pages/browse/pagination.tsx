import {useMemo} from "react";
import {Link} from "react-router-dom";

export const usePagination = (totalItems: number, itemsPerPage: number, currentPage: number, siblingCount = 2, ) =>
  useMemo(() => {
    const numPages = Math.ceil(totalItems / itemsPerPage)

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
  }, [totalItems, itemsPerPage, currentPage, siblingCount])
