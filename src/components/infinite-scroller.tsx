import React, {
  useState,
  useEffect,
  useRef,
  ReactElement,
  ComponentType,
  ElementType,
  RefObject,
  ReactNode,
  ComponentClass,
} from "react";
import { set } from "zod";

type HasId = any & { id: string };

interface InfiniteScrollerProps {
  ChildRenderer?: ComponentType<any> | string;
  childProps?: Record<string, any>;
  fetchChildren?: () => Promise<HasId[]>;
  size?: number;
  scrollThreshold?: number;
  prependedItems?: HasId[];
  resetPrepended?: () => void;
  FinalItem: ComponentType<any> | string;
  Wrapper?: ComponentClass<any> | string;
}

const InfiniteScroller = ({
  ChildRenderer = "li" as ComponentType<HasId> | string,
  childProps = {},
  fetchChildren = async () => [],
  size = -1,
  scrollThreshold = 0.5,
  prependedItems = [],
  resetPrepended = () => {},
  FinalItem = "li" as ComponentType<any> | string,
  Wrapper = "ul" as ComponentClass<any> | string,
  ...props
}: InfiniteScrollerProps) => {
  const [items, setItems] = useState<HasId[]>([]);
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
    if (prependedItems.length) {
      setItems((prevItems) => {
        const updatedItems = [...prependedItems, ...prevItems];
        return size === -1 ? updatedItems : updatedItems.slice(-size);
      });
      resetPrepended();
    }
  }, [prependedItems]);

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

  const body = (
    <>
      {items.map((item: HasId) => {
        return <ChildRenderer key={item.id} {...childProps} {...item} />;
      })}
      <FinalItem ref={lastItemRef} disabled={loading ? null : true} />
    </>
  );

  if (Wrapper) {
    return <Wrapper {...props}>{body}</Wrapper>;
  } else {
    return body;
  }
};

export default InfiniteScroller;
