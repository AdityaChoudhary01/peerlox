"use client";

import { useEffect, useRef } from "react";
import { incrementViewCount } from "@/actions/note.actions";

export default function ViewCounter({ noteId }) {
  const hasCounted = useRef(false);

  useEffect(() => {
    // Ensure we only count the view once per page load, 
    // protecting against React Strict Mode firing twice in development.
    if (!hasCounted.current) {
      incrementViewCount(noteId);
      hasCounted.current = true;
    }
  }, [noteId]);

  return null; // This component is invisible!
}