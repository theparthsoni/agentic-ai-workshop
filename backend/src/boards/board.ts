/** A kanban board owned by a team. The top-level container for columns and cards. */
export interface Board {
  id: string;
  name: string;
  description: string | null;
  /** ISO-8601 timestamp. */
  createdAt: string;
  /** ISO-8601 timestamp, bumped on every update. */
  updatedAt: string;
}

/** Fields accepted when creating a board. */
export interface CreateBoardInput {
  name: string;
  description?: string | null;
}

/** Fields accepted when updating a board (all optional — partial update). */
export interface UpdateBoardInput {
  name?: string;
  description?: string | null;
}
