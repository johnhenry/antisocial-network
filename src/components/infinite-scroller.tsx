import React, {
  useState,
  useEffect,
  useRef,
  ReactElement,
  ComponentType,
  ElementType,
  RefObject,
  ReactNode,
} from "react";

type HasId = any & { id: string };

interface InfiniteScrollerProps {
  ChildRenderer?: ComponentType<any> | string;
  fetchChildren?: () => Promise<HasId[]>;
  size?: number;
  scrollThreshold?: number;
  initialItems?: HasId[];
  FinalItem: ComponentType<any> | string;
}

const InfiniteScroller = ({
  ChildRenderer = "li" as ComponentType<HasId> | string,
  fetchChildren = async () => [],
  size = -1,
  scrollThreshold = 0.5,
  initialItems = [],
  FinalItem = "li" as ComponentType<any> | string,
}: InfiniteScrollerProps) => {
  const [items, setItems] = useState<HasId[]>(initialItems);
  const [loading, setLoading] = useState(false);
  const lastItemRef = useRef<HTMLDivElement | null>(null);

  const loadMoreItems = async () => {
    if (loading) {
      return;
    }
    setLoading(true);
    try {
      const newItems = await fetchChildren();

      if (newItems.length === 0) {
      } else {
        setItems((prevItems) => {
          const updatedItems = [...prevItems, ...newItems];
          return size === -1 ? updatedItems : updatedItems.slice(-size);
        });
      }
    } catch (error) {
      console.error("Error fetching more items:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (lastItemRef) {
      const options = {
        // root: rootRef.current,
        rootMargin: "0px",
        threshold: scrollThreshold,
      };
      const observer = new IntersectionObserver(loadMoreItems, options);
      observer.observe(lastItemRef.current as Element);
      return () => observer.disconnect();
    }
  }, [lastItemRef]);

  return (
    <>
      {items.map((item: HasId, index) => {
        const { id, ...props } = item;
        return <ChildRenderer key={index} {...props} />;
      })}
      <FinalItem ref={lastItemRef} disabled={loading ? null : true} />
    </>
  );
};

export default InfiniteScroller;
