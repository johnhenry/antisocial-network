"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
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
    const findMemes = async () => {
      // const { page = 0, size = DEFAULT_PAGE_SIZE, term = "" } = searchParams;
      const page = searchParams.get("page") || 0;
      const size = searchParams.get("size") || DEFAULT_PAGE_SIZE;
      const term = searchParams.get("term") || "";
      console.log({ page, size, term });
      if (term) {
        const { memes, count } = await searchMemes(
          term,
          Number(page),
          Number(size)
        );
        setMemes(memes);
        setNumpages(count);
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
      <input
        title="meme"
        name="search"
        type="search"
        placeholder="search"
        defaultValue={searchParams.get("term") || ""}
      />
      <button type="button" onClick={search}>
        🔍
      </button>
      {memes.length ? (
        <>
          <ul>
            {memes.map((meme) => (
              <li key={meme.id}>
                <a href={`/meme/${meme.id}`}>
                  {meme.dist}:{meme.content}
                </a>
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
