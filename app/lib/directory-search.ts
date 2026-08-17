import React from 'react';
import { useSearchParams } from 'react-router-dom';

export function useDirectorySearchQuery() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlQuery = searchParams.get('q') ?? '';
  const [query, setQuery] = React.useState(urlQuery);
  const isComposing = React.useRef(false);
  const lastWrittenQuery = React.useRef(urlQuery);

  React.useEffect(() => {
    if (isComposing.current || urlQuery === lastWrittenQuery.current) return;
    lastWrittenQuery.current = urlQuery;
    setQuery(urlQuery);
  }, [urlQuery]);

  const writeQuery = React.useCallback((nextQuery: string) => {
    const serializedQuery = nextQuery.trim();
    lastWrittenQuery.current = serializedQuery;
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      if (serializedQuery) next.set('q', serializedQuery);
      else next.delete('q');
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  const onChange = React.useCallback<React.ChangeEventHandler<HTMLInputElement>>((event) => {
    const nextQuery = event.currentTarget.value;
    setQuery(nextQuery);
    if (!isComposing.current) writeQuery(nextQuery);
  }, [writeQuery]);

  const onCompositionStart = React.useCallback(() => {
    isComposing.current = true;
  }, []);

  const onCompositionEnd = React.useCallback<React.CompositionEventHandler<HTMLInputElement>>((event) => {
    const nextQuery = event.currentTarget.value;
    isComposing.current = false;
    setQuery(nextQuery);
    writeQuery(nextQuery);
  }, [writeQuery]);

  return {
    query,
    searchParams,
    setSearchParams,
    queryInputProps: {
      value: query,
      onChange,
      onCompositionStart,
      onCompositionEnd,
    },
  };
}
