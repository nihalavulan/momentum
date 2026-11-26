import type { Arc } from './types.ts'

/**
 * Arcs for the signed-in person. Empty until creating Arcs is built (the sample
 * Arcs are gone); Arc chips, the picker and "Arcs in progress" hide themselves
 * while there are none. Swap this hook's internals for real data later.
 */
const NO_ARCS: Arc[] = []

export function useArcs() {
  return {
    arcs: NO_ARCS,
    getArc: (id: string | null | undefined): Arc | undefined => (id ? NO_ARCS.find((a) => a.id === id) : undefined),
  }
}
