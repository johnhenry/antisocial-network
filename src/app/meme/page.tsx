import { useEffect, useState } from "react";
import {
  useRouter,
  usePathname,
  useSearchParams,
  useCallback,
} from "next/navigation";
import { searchMemes } from "@/lib/actions.meme";

const Pagination = ({
  page,
  numpages,
  setPage,
}: {
  page: number;
  numpages: number;
  setPage: Function;
}) => {
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

const DEFAULT_PAGE_SIZE = 10;
const Page = () => {
  const [memes, setMemes] = useState([]);
  const [numpages, setNumpages] = useState(1);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);

      return params.toString();
    },
    [searchParams]
  );
  const setPage = (page) => {
    router.push(`${pathname}?${createQueryString("page", page)}`);
  };
  // const setSize = (size) => {
  //   router.push(`${pathname}?${createQueryString("size", size)}`);
  // };
  const search = () => {
    const term = document.querySelector("input[name=search]").value;
    router.push(`${pathname}?${createQueryString("term", term)}`);
  };
  useEffect(() => {
    const findMemes = () => {
      const { page = 0, size = DEFAULT_PAGE_SIZE, term = "" } = searchParams;
      if (term) {
        const { memes, numpages } = searchMemes(
          term,
          Number(page),
          Number(size)
        );
        setMemes(memes);
        setNumpages(numpages);
      }
    };
    findMemes();
    return () => {
      // cleanup
    };
  }, [searchParams]);

  return (
    <section>
      <h2>Memes</h2>
      <input title="meme" name="search" type="search" placeholder="search" />
      <button type="button" onClick={search}>
        🔍
      </button>
      {memes.length ? (
        <>
          <ul>
            {memes.map((meme) => (
              <li key={meme.id}>
                <a href={`/meme/${meme.id}`}>{meme.title}</a>
              </li>
            ))}
          </ul>
          <Pagination
            page={Number(searchParams.page) || 0}
            numpages={numpages}
            setPage={setPage}
          />
        </>
      ) : null}
    </section>
  );
};
export default Page;
