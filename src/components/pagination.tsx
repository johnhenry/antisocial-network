import type { FC } from "react";

type Props = {
  page: number;
  numpages: number;
  setPage: Function;
};

const Pagination: FC<Props> = ({ page, numpages, setPage }) => {
  const getPageLink = (pageNum: number) => {
    if (pageNum === page) {
      return (
        <span key={pageNum} className="active">
          {pageNum}
        </span>
      );
    } else {
      return (
        <a key={pageNum} onClick={() => setPage(pageNum)}>
          {pageNum}
        </a>
      );
    }
  };

  const getPaginationLinks = () => {
    const paginationLinks = [];
    for (let i = 0; i < numpages; i++) {
      paginationLinks.push(getPageLink(i + 1));
    }
    return paginationLinks;
  };

  return (
    <div className="pagination">
      <button disabled={page === 1} onClick={() => setPage(page - 1)}>
        Previous
      </button>
      {getPaginationLinks()}
      <button disabled={page === numpages} onClick={() => setPage(page + 1)}>
        Next
      </button>
    </div>
  );
};
export default Pagination;
