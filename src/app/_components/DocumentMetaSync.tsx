'use client';

import { useLayoutEffect } from 'react';

import { useDocumentMeta } from '@/app/_effects/useDocumentMeta';
import { useAppStore } from '@/app/_store/useAppStore';
import { DOCUMENT_META_KEY } from '@/lib/document-meta';

export function DocumentMetaSync() {
  const state = useAppStore((store) => store.state);

  useDocumentMeta(state.lang, state.theme);

  useLayoutEffect(() => {
    try {
      window.localStorage.setItem(
        DOCUMENT_META_KEY,
        JSON.stringify({ lang: state.lang, theme: state.theme })
      );
    } catch {
      // Keep DOM theme correct even if persistence is unavailable.
    }
  }, [state.lang, state.theme]);

  return null;
}
