import type { Relationship } from "@/types/types";

export const parseRelationship = (
  arr: Relationship[],
  table: string,
  relationship: string
) =>
  arr.find(
    (ship: Relationship) =>
      ship.table === table && ship.relationship === relationship
  )?.results || [];
